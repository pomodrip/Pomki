package com.cooltomato.pomki.trash.entity;

import com.cooltomato.pomki.member.entity.Member;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "TRASH")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Trash {
    
    @Id
    @Column(name = "trash_id", length = 50, nullable = false)
    private String trashId;
    
    @Column(name = "member_id", nullable = false)
    private Long memberId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", insertable = false, updatable = false)
    private Member member;
    
    @CreationTimestamp
    @Column(name = "deleted_at", nullable = false, updatable = false)
    private LocalDateTime deletedAt;
    
    @PrePersist
    public void prePersist() {
        if (this.trashId == null) {
            this.trashId = java.util.UUID.randomUUID().toString();
        }
    }
} 