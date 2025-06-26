package com.cooltomato.pomki.bookmark.entity;

import java.time.LocalDateTime;

import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.note.entity.Note;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bookmark_note")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(BookmarkId.class)
public class Bookmark {
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id")
    private Note note;

} 