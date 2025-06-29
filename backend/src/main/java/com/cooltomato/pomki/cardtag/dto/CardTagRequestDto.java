package com.cooltomato.pomki.cardtag.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CardTagRequestDto {
    private String tagName;
    private Long cardId;
}
