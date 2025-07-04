package com.cooltomato.pomki.stats.entity;

import com.cooltomato.pomki.member.entity.Member;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "MEMBER_STAT")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MemberStat {

    @Id
    private Long memberId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "member_id")
    private Member member;

    @Column(nullable = false)
    @ColumnDefault("0")
    private Integer totalStudyMinutes = 0;

    @Builder
    public MemberStat(Member member) {
        this.member = member;
        this.totalStudyMinutes = 0;
    }

    public void addStudyMinutes(Integer minutes) {
        if (minutes != null && minutes > 0) {
            this.totalStudyMinutes += minutes;
        }
    }
} 