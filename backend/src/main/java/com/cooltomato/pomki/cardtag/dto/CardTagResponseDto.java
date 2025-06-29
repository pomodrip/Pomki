package com.cooltomato.pomki.cardtag.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CardTagResponseDto {
    private Long cardId;
    private String tagName;
    private Long memberId;
}
