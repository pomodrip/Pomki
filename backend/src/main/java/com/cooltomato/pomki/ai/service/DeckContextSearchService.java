package com.cooltomato.pomki.ai.service;

import com.cooltomato.pomki.ai.dto.DeckContextSearchRequestDto;
import com.cooltomato.pomki.ai.dto.DeckContextSearchResponseDto;
import com.cooltomato.pomki.ai.dto.RelatedCardDto;
import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.card.entity.Card;
import com.cooltomato.pomki.card.repository.CardRepository;
import com.cooltomato.pomki.deck.entity.Deck;
import com.cooltomato.pomki.deck.repository.DeckRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.ResourceUtils;

import java.io.File;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeckContextSearchService {

    private final AILLMService aillmService;
    private final DeckRepository deckRepository;
    private final CardRepository cardRepository;
    private final ObjectMapper objectMapper;

    /**
     * 덱 내 카드들을 컨텍스트로 하여 AI 기반 질문 답변
     */
    public DeckContextSearchResponseDto searchWithContext(PrincipalMember principal, DeckContextSearchRequestDto requestDto) {
        try {
            // 덱 존재 여부 및 권한 확인
            Deck deck = deckRepository.findByMemberIdAndDeckIdAndIsDeletedFalse(principal.getMemberId(), requestDto.getDeckId())
                    .orElseThrow(() -> new IllegalArgumentException("해당 덱을 찾을 수 없거나 접근 권한이 없습니다."));

            // 덱 내 모든 카드 조회
            List<Card> cards = cardRepository.findByDeckDeckIdAndIsDeletedFalse(deck.getDeckId());
            
            if (cards.isEmpty()) {
                return DeckContextSearchResponseDto.failure(
                    requestDto.getDeckId(), 
                    requestDto.getQuestion(), 
                    "덱에 카드가 없어 검색할 수 없습니다."
                );
            }

            // 프롬프트 템플릿 로드
            String promptTemplate = loadPrompt("classpath:prompts/DeckContextSearch.txt");

            // 카드 내용을 컨텍스트로 구성
            String cardContents = buildCardContents(cards);

            // 프롬프트 생성
            String prompt = promptTemplate
                    .replace("{deckName}", deck.getDeckName())
                    .replace("{cardCount}", String.valueOf(cards.size()))
                    .replace("{cardContents}", cardContents)
                    .replace("{userQuestion}", requestDto.getQuestion());

            log.info("AI 덱 컨텍스트 검색 요청 - 덱 ID: {}, 카드 수: {}", requestDto.getDeckId(), cards.size());

            // AI 호출
            String jsonResponse = aillmService.generateContent(prompt);
            jsonResponse = cleanJsonResponse(jsonResponse);

            // JSON 응답 파싱
            JsonNode responseNode = objectMapper.readTree(jsonResponse);

            String answer = responseNode.has("answer") ? responseNode.get("answer").asText() : "답변을 생성할 수 없습니다.";
            String confidence = responseNode.has("confidence") ? responseNode.get("confidence").asText() : "보통";

            // 관련 카드 파싱
            List<RelatedCardDto> relatedCards = parseRelatedCards(responseNode.get("relatedCards"));

            // 제안 사항 파싱
            List<String> suggestions = parseSuggestions(responseNode.get("suggestions"));

            log.info("AI 덱 컨텍스트 검색 성공 - 덱 ID: {}, 관련 카드 수: {}", requestDto.getDeckId(), relatedCards.size());

            return DeckContextSearchResponseDto.success(
                    requestDto.getDeckId(),
                    deck.getDeckName(),
                    requestDto.getQuestion(),
                    answer,
                    relatedCards,
                    suggestions,
                    confidence,
                    cards.size()
            );

        } catch (Exception e) {
            log.error("AI 덱 컨텍스트 검색 중 오류 발생 - 덱 ID: {}", requestDto.getDeckId(), e);
            return DeckContextSearchResponseDto.failure(
                    requestDto.getDeckId(),
                    requestDto.getQuestion(),
                    "검색 중 오류가 발생했습니다: " + e.getMessage()
            );
        }
    }

    /**
     * 간단한 덱 내 카드 검색 (키워드 매칭 + AI 요약)
     */
    public DeckContextSearchResponseDto simpleSearch(PrincipalMember principal, String deckId, String keyword) {
        try {
            // 기존 키워드 검색 결과 가져오기
            Deck deck = deckRepository.findByMemberIdAndDeckIdAndIsDeletedFalse(principal.getMemberId(), deckId)
                    .orElseThrow(() -> new IllegalArgumentException("해당 덱을 찾을 수 없거나 접근 권한이 없습니다."));

            List<Card> allCards = cardRepository.findByDeckDeckIdAndIsDeletedFalse(deckId);
            List<Card> matchedCards = allCards.stream()
                    .filter(card -> (card.getContent() != null && card.getContent().toLowerCase().contains(keyword.toLowerCase())) ||
                                   (card.getAnswer() != null && card.getAnswer().toLowerCase().contains(keyword.toLowerCase())))
                    .collect(Collectors.toList());

            if (matchedCards.isEmpty()) {
                return DeckContextSearchResponseDto.failure(deckId, keyword, "검색 키워드와 일치하는 카드가 없습니다.");
            }

            // 매칭된 카드들을 RelatedCardDto로 변환
            List<RelatedCardDto> relatedCards = matchedCards.stream()
                    .map(card -> RelatedCardDto.builder()
                            .cardId(card.getCardId())
                            .content(card.getContent())
                            .answer(card.getAnswer())
                            .relevance("키워드 '" + keyword + "'와 일치")
                            .relevanceScore(1.0)
                            .build())
                    .collect(Collectors.toList());

            String answer = String.format("'%s' 키워드로 %d개의 카드를 찾았습니다.", keyword, matchedCards.size());

            return DeckContextSearchResponseDto.success(
                    deckId,
                    deck.getDeckName(),
                    keyword,
                    answer,
                    relatedCards,
                    List.of("더 구체적인 질문을 해보세요", "관련 개념에 대해 추가로 질문해보세요"),
                    "높음",
                    allCards.size()
            );

        } catch (Exception e) {
            log.error("간단 검색 중 오류 발생 - 덱 ID: {}", deckId, e);
            return DeckContextSearchResponseDto.failure(deckId, keyword, "검색 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    private String buildCardContents(List<Card> cards) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < cards.size(); i++) {
            Card card = cards.get(i);
            sb.append(String.format("카드 %d (ID: %d):\n", i + 1, card.getCardId()));
            sb.append(String.format("질문: %s\n", card.getContent()));
            sb.append(String.format("답변: %s\n", card.getAnswer()));
            sb.append("\n");
        }
        return sb.toString();
    }

    private List<RelatedCardDto> parseRelatedCards(JsonNode relatedCardsNode) {
        List<RelatedCardDto> relatedCards = new ArrayList<>();
        if (relatedCardsNode != null && relatedCardsNode.isArray()) {
            relatedCardsNode.forEach(cardNode -> {
                RelatedCardDto relatedCard = RelatedCardDto.builder()
                        .cardId(cardNode.has("cardId") ? cardNode.get("cardId").asLong() : null)
                        .relevance(cardNode.has("relevance") ? cardNode.get("relevance").asText() : "")
                        .content(cardNode.has("content") ? cardNode.get("content").asText() : "")
                        .answer(cardNode.has("answer") ? cardNode.get("answer").asText() : "")
                        .relevanceScore(0.8) // 기본 점수
                        .build();
                relatedCards.add(relatedCard);
            });
        }
        return relatedCards;
    }

    private List<String> parseSuggestions(JsonNode suggestionsNode) {
        List<String> suggestions = new ArrayList<>();
        if (suggestionsNode != null && suggestionsNode.isArray()) {
            suggestionsNode.forEach(suggestionNode -> suggestions.add(suggestionNode.asText()));
        }
        return suggestions;
    }

    private String loadPrompt(String path) {
        try {
            File file = ResourceUtils.getFile(path);
            return new String(Files.readAllBytes(file.toPath()));
        } catch (Exception e) {
            log.error("프롬프트 파일을 불러오는 데 실패했습니다: {}", path, e);
            throw new RuntimeException("필요한 프롬프트 파일을 불러올 수 없습니다.", e);
        }
    }

    private String cleanJsonResponse(String jsonResponse) {
        return jsonResponse.replace("```json", "").replace("```", "").trim();
    }
} 