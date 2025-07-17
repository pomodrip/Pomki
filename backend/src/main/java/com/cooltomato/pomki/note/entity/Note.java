package com.cooltomato.pomki.note.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

import com.cooltomato.pomki.bookmark.entity.Bookmark;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.noteimage.entity.NoteImage;
import com.cooltomato.pomki.notetag.entity.NoteTag;
import com.cooltomato.pomki.trash.entity.TrashNote;

@Entity
@Table(name = "note")
@Data
public class Note {
    @Id
    @Column(name = "note_id", length = 50, nullable = false)
    private String noteId;

    // FK: member_id → member 테이블
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @Column(name = "note_title", length = 255)
    private String noteTitle;

    @Column(name = "note_content", columnDefinition = "LONGTEXT", nullable = false)
    private String noteContent;

    @Column(name = "ai_enhanced")
    private Boolean aiEnhanced;

    @Column(name = "original_content", columnDefinition = "LONGTEXT")
    private String originalContent;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted")
    private Boolean isDeleted;

    // 연관관계: NOTE_IMAGE(1:N)
    @OneToMany(mappedBy = "note", cascade = CascadeType.ALL)
    private List<NoteImage> noteImages;

    // 연관관계: BOOKMARK_NOTE(1:N)
    @OneToMany(mappedBy = "note", cascade = CascadeType.ALL)
    private List<Bookmark> bookmarkNotes;

    // 연관관계: NOTE_TAG(1:N)
    @OneToMany(mappedBy = "note", cascade = CascadeType.ALL)
    private List<NoteTag> noteTags;

    // 연관관계: TRASH_NOTE(1:N)
    @OneToMany(mappedBy = "note", cascade = CascadeType.ALL)
    private List<TrashNote> trashNotes;
} 