package com.cooltomato.pomki.notetag.entity;

import lombok.*;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import java.io.Serializable;

@Entity
@Table(name = "note_tag")
@IdClass(NoteTagId.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class NoteTag implements Serializable {
    @Id
    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Id
    @Column(name = "tag_name", nullable = false, length = 50)
    private String tagName;

    @Id
    @Column(name = "note_id", nullable = false, length = 50)
    private String noteId;
}
