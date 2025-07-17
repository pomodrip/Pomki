package com.cooltomato.pomki.ai.service;

import com.cooltomato.pomki.ai.dto.TagRecommendationRequestDto;
import com.cooltomato.pomki.ai.dto.TagRecommendationResponseDto;
import com.cooltomato.pomki.card.entity.Card;
import com.cooltomato.pomki.card.repository.CardRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.ResourceUtils;

import java.io.File;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TagRecommendationService {

    private final AILLMService aillmService;
    private final CardRepository cardRepository;
    private final ObjectMapper objectMapper;

    /**
     * 카드 내용을 기반으로 AI 태그 추천
     */
    public TagRecommendationResponseDto recommendTags(TagRecommendationRequestDto requestDto) {
        try {
            // 카드 존재 여부 확인
            Card card = cardRepository.findById(requestDto.getCardId())
                    .orElseThrow(() -> new IllegalArgumentException("해당 카드를 찾을 수 없습니다."));

            // 프롬프트 템플릿 로드
            String promptTemplate = loadPrompt("prompts/TagRecommendation.txt");

            // 프롬프트 생성
            String prompt = promptTemplate
                    .replace("{cardContent}", requestDto.getCardContent())
                    .replace("{cardAnswer}", requestDto.getCardAnswer());

            log.info("AI 태그 추천 요청 - 카드 ID: {}", requestDto.getCardId());

            // AI 호출
            String jsonResponse = aillmService.generateContent(prompt);

            // JSON 응답 파싱
            jsonResponse = cleanJsonResponse(jsonResponse);
            JsonNode responseNode = objectMapper.readTree(jsonResponse);

            List<String> recommendedTags = new ArrayList<>();
            JsonNode tagsNode = responseNode.get("recommendedTags");
            if (tagsNode != null && tagsNode.isArray()) {
                tagsNode.forEach(tagNode -> recommendedTags.add(tagNode.asText()));
            }

            String reasoning = responseNode.has("reasoning") ? 
                    responseNode.get("reasoning").asText() : "AI가 카드 내용을 분석하여 추천했습니다.";

            log.info("AI 태그 추천 성공 - 카드 ID: {}, 추천 태그 수: {}", 
                    requestDto.getCardId(), recommendedTags.size());

            return TagRecommendationResponseDto.success(
                    requestDto.getCardId(), 
                    recommendedTags, 
                    reasoning
            );

        } catch (Exception e) {
            log.error("AI 태그 추천 중 오류 발생 - 카드 ID: {}", requestDto.getCardId(), e);
            return TagRecommendationResponseDto.failure(
                    requestDto.getCardId(), 
                    "태그 추천 중 오류가 발생했습니다: " + e.getMessage()
            );
        }
    }

    /**
     * 카드 ID로 직접 태그 추천 (카드 정보를 자동으로 가져옴)
     */
    public TagRecommendationResponseDto recommendTagsByCardId(Long cardId) {
        try {
            Card card = cardRepository.findById(cardId)
                    .orElseThrow(() -> new IllegalArgumentException("해당 카드를 찾을 수 없습니다."));

            TagRecommendationRequestDto requestDto = TagRecommendationRequestDto.builder()
                    .cardId(cardId)
                    .cardContent(card.getContent())
                    .cardAnswer(card.getAnswer())
                    .build();

            return recommendTags(requestDto);

        } catch (Exception e) {
            log.error("카드 ID로 태그 추천 중 오류 발생 - 카드 ID: {}", cardId, e);
            return TagRecommendationResponseDto.failure(
                    cardId, 
                    "카드 정보를 불러오는데 실패했습니다: " + e.getMessage()
            );
        }
    }

    private String loadPrompt(String path) {
        try {
            ClassPathResource resource = new ClassPathResource(path);
            try (InputStream inputStream = resource.getInputStream()) {
                return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            log.error("프롬프트 파일을 불러오는 데 실패했습니다: {}", path, e);
            throw new RuntimeException("필요한 프롬프트 파일을 불러올 수 없습니다.", e);
        }
    }

    private String cleanJsonResponse(String jsonResponse) {
        // AI 응답에서 마크다운 코드 블록 제거
        return jsonResponse.replace("```json", "").replace("```", "").trim();
    }
} 