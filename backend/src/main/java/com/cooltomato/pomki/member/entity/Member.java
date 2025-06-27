package com.cooltomato.pomki.member.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.cooltomato.pomki.global.constant.AuthType;
import com.cooltomato.pomki.global.constant.Role;
// import com.cooltomato.pomki.tag.entity.Tag;

@Entity
@Table(name = "MEMBER", uniqueConstraints = {
        @UniqueConstraint(columnNames = "member_email"),
        @UniqueConstraint(columnNames = { "social_provider_user_id", "social_provider" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long memberId;

    @Column(nullable = false, unique = true)
    private String memberEmail;

    @Column(nullable = false)
    private String currentEmail;

    @Column(nullable = false, length = 100)
    private String memberNickname;

    @Column(name = "social_provider_user_id")
    private String providerUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "social_provider")
    private AuthType provider;

    @Column(length = 512)
    private String memberPassword;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 400)
    private Role memberRoles;

    @Column(nullable = false)
    private boolean emailVerified = false;

    @Column(nullable = false)
    private boolean isSocialLogin;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private boolean isDeleted = false;

    private LocalDateTime deletedAt;

    // @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    // @Builder.Default
    // private List<Tag> tags = new ArrayList<>();

    @Builder
    public Member(String memberEmail, String currentEmail, String memberNickname,
                 String memberPassword, Role memberRoles, boolean emailVerified,
                 boolean isSocialLogin, boolean isDeleted, String providerUserId, AuthType provider) {
        this.memberEmail = memberEmail;
        this.currentEmail = currentEmail;
        this.memberNickname = memberNickname;
        this.providerUserId = providerUserId;
        this.provider = provider;
        this.memberPassword = memberPassword;
        this.memberRoles = memberRoles;
        this.emailVerified = emailVerified;
        this.isSocialLogin = isSocialLogin;
        this.isDeleted = isDeleted;
    }
}