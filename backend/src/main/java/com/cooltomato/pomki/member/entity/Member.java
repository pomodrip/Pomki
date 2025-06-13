package com.cooltomato.pomki.member.entity;

import java.time.LocalDateTime;
import java.util.List;

import com.cooltomato.pomki.bookmark.entity.Bookmark;
import com.cooltomato.pomki.note.entity.Note;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "member")
public class Member {
    @Id
    @Column(name = "member_id")
    private Long memberId;

    @Column(name = "member_email", nullable = false, length = 255)
    private String memberEmail;

    @Column(name = "current_email", nullable = false, length = 255)
    private String currentEmail;

    @Column(name = "member_name", nullable = false, length = 100)
    private String memberName;

    @Column(name = "member_password", length = 512)
    private String memberPassword;

    @Column(name = "is_social_login", nullable = false)
    private Boolean isSocialLogin;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // 연관관계: NOTE(1:N)
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL)
    private List<Note> notes;

    // 연관관계: BOOKMARK_NOTE(1:N)
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL)
    private List<Bookmark> bookmarkNotes;
} 