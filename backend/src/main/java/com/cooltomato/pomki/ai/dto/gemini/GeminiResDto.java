package com.cooltomato.pomki.ai.dto.gemini;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeminiResDto {
    private List<Candidate> candidates;

    // 테스트용 간단한 생성자 추가
    public GeminiResDto(String description) {
        // 실제 description을 담을 수 있는 구조로 생성
        Candidate candidate = new Candidate();
        Content content = new Content();
        Parts parts = new Parts();
        parts.setText(description);
        content.setParts(List.of(parts));
        candidate.setContent(content);
        candidate.setFinishReason("STOP");
        this.candidates = List.of(candidate);
    }

    @Data
    @NoArgsConstructor
    public static class Candidate {
        private Content content;
        private String finishReason;
    }

    @Data
    @NoArgsConstructor
    public static class Content {
        private List<Parts> parts;
        private String role;

    }

    @Data
    @NoArgsConstructor
    public static class Parts {
        private String text;
    }
}