package com.cooltomato.pomki.notetag.entity;

import lombok.*;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.MapsId;

import java.io.Serializable;
import com.cooltomato.pomki.note.entity.Note;

@Entity
@Table(name = "note_tag")
@IdClass(NoteTagId.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id", referencedColumnName = "note_id", insertable = false, updatable = false)
    private Note note;
}
