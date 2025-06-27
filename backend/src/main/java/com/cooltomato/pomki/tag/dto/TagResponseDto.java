package com.cooltomato.pomki.tag.dto;

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

public class TagResponseDto {
    Long tagId;
    Long memberId;
    String tagName;
    
}
