package com.cooltomato.pomki.tag.entity;
import lombok.*;
import com.cooltomato.pomki.note.entity.Note;

import jakarta.persistence.*;

@Entity
@Table(name = "note_tag")
@Data
@IdClass(NoteTagId.class)
public class NoteTag {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id")
    private Tag tag;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id")
    private Note note;
}