package com.cooltomato.pomki.tag.entity;

import lombok.*;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import java.io.Serializable;

@Entity
@Table(name = "tag")
@IdClass(TagId.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Tag implements Serializable {
    @Id
    @Column(name = "tag_name", nullable = false, length = 50)
    private String tagName;

    @Id
    @Column(name = "member_id", nullable = false)
    private Long memberId;
}
