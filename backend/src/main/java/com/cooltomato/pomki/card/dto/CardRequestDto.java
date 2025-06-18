package com.cooltomato.pomki.card.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class CardRequestDto {
    // 테스트를 위해 임시로 추가. 실제에서는 사용자로부터 입력받지 않음.
    private String deckId;
    private String content;
    private String answer;
}
