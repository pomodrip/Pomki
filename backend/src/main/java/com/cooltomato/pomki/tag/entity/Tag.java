package com.cooltomato.pomki.tag.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.OneToMany;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "tag")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tagId;

    private Long memberId; // 태그 소유자

    private String tagName;

    // 연관관계 매핑 (양방향)
    @OneToMany(mappedBy = "tag", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TagCard> cardTags = new ArrayList<>();
}
