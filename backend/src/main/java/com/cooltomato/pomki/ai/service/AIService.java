package com.cooltomato.pomki.ai.service;

import com.cooltomato.pomki.ai.entity.AIPrompt;
import com.cooltomato.pomki.ai.repository.AIPromptRepository;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import com.cooltomato.pomki.history.service.MemberAiHistoryService; // 비용 로깅 서비스
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AIService {

    private final AIPromptRepository aiPromptRepository;
    private final MemberRepository memberRepository;
    private final MemberAiHistoryService memberAiHistoryService; // 비용 로깅 서비스 주입
    private final Map<String, LLMService> llmServices;

    // 생성자에서 provider 이름으로 서비스를 맵핑
    public AIService(AIPromptRepository aiPromptRepository, MemberRepository memberRepository, MemberAiHistoryService memberAiHistoryService, List<LLMService> services) {
        this.aiPromptRepository = aiPromptRepository;
        this.memberRepository = memberRepository;
        this.memberAiHistoryService = memberAiHistoryService;
        this.llmServices = services.stream()
             .collect(Collectors.toMap(LLMService::getProviderName, Function.identity()));
    }

    public Mono<String> execute(String promptName, Map<String, String> variables, Long memberId) {
        // 1. DB에서 프롬프트 조회
        AIPrompt prompt = aiPromptRepository.findByPromptNameAndVersion(promptName, "1.0") // 버전 관리
             .orElseThrow(() -> new RuntimeException("Prompt not found: " + promptName));

        // 2. 변수를 프롬프트에 주입
        String finalPrompt = substituteVariables(prompt.getPromptContent(), variables);

        // 3. 적절한 LLM 서비스 선택
        LLMService llmService = llmServices.get(prompt.getModelProvider());
        if (llmService == null) {
            throw new RuntimeException("LLM provider not found: " + prompt.getModelProvider());
        }

        // 4. AI 호출 실행 및 비용/성능 로깅
        // 참고: 정확한 토큰 계산을 위해서는 tiktoken-java 같은 라이브러리 사용을 권장합니다.
        int inputTokens = finalPrompt.length() / 2; // 한글 등을 고려한 보수적인 근사치

        return llmService.generate(finalPrompt, prompt.getModelName())
              .doOnSuccess(response -> {
                    int outputTokens = response.length() / 2; // 한글 등을 고려한 보수적인 근사치
                    Member member = memberRepository.findById(memberId).orElse(null);
                    if (member!= null) {
                        memberAiHistoryService.recordHistory(member, promptName, inputTokens, outputTokens);
                    }
                });
    }

    private String substituteVariables(String template, Map<String, String> variables) {
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            template = template.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return template;
    }
}

// package com.cooltomato.pomki.ai.service;

// import com.cooltomato.pomki.ai.entity.AiPrompt;
// import com.cooltomato.pomki.ai.repository.AiPromptRepository;
// import lombok.RequiredArgsConstructor;
// import org.springframework.stereotype.Service;
// import reactor.core.publisher.Mono;
// import java.util.List;
// import java.util.Map;
// import java.util.function.Function;
// import java.util.stream.Collectors;

// @Service
// @RequiredArgsConstructor
// public class AIService {

//     private final AiPromptRepository aiPromptRepository;
//     private final Map<String, LLMService> llmServices; // Spring이 모든 LLMService 구현체를 주입

//     // 생성자에서 provider 이름으로 서비스를 맵핑
//     public AIService(AiPromptRepository aiPromptRepository, List<LLMService> services) {
//         this.aiPromptRepository = aiPromptRepository;
//         this.llmServices = services.stream()
//                .collect(Collectors.toMap(LLMService::getProviderName, Function.identity()));
//     }

//     public Mono<String> execute(String promptName, Map<String, String> variables) {
//         // 1. DB에서 프롬프트 조회
//         AiPrompt prompt = aiPromptRepository.findByPromptNameAndVersion(promptName, "1.0") // 버전 관리
//                .orElseThrow(() -> new RuntimeException("Prompt not found: " + promptName));

//         // 2. 변수를 프롬프트에 주입
//         String finalPrompt = substituteVariables(prompt.getPromptContent(), variables);

//         // 3. 적절한 LLM 서비스 선택
//         LLMService llmService = llmServices.get(prompt.getModelProvider());
//         if (llmService == null) {
//             throw new RuntimeException("LLM provider not found: " + prompt.getModelProvider());
//         }

//         // 4. AI 호출 실행 및 비용/성능 로깅 (MEMBER_AI_HISTORY)
//         // TODO: 호출 전후로 토큰 수 계산 및 DB 로깅 로직 추가
//         return llmService.generate(finalPrompt, prompt.getModelName());
//     }

//     private String substituteVariables(String template, Map<String, String> variables) {
//         for (Map.Entry<String, String> entry : variables.entrySet()) {
//             template = template.replace("{{" + entry.getKey() + "}}", entry.getValue());
//         }
//         return template;
//     }
// }