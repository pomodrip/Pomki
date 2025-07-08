package com.cooltomato.pomki.notification.entity;

import com.cooltomato.pomki.global.constant.FireBasePlatform;
import com.cooltomato.pomki.member.entity.Member;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "FIREBASE_TOKEN", uniqueConstraints = @UniqueConstraint(columnNames = {"firebase_token","member_id"}))
@Getter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class FireBaseToken {

    @Id
    @Column(name = "firebase_token")
    private String firebaseToken;

    @ManyToOne
    @JoinColumn(name = "member_id")
    private Member member;

    @Column(name = "created_at")
    @CreatedDate
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "platform", columnDefinition = "VARCHAR(100)")
    private FireBasePlatform platform;


    @Builder
    public FireBaseToken(String firebaseToken, Member member, FireBasePlatform platform) {
        this.firebaseToken = firebaseToken;
        this.member = member;
        this.platform = platform;
    }
} 