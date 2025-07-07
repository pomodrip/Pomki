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

    // 추가 통계 필드들 (기본값 설정)
    @Column(name = "total_study_days", nullable = false)
    @ColumnDefault("0")
    private Integer totalStudyDays = 0; // 총 학습 일수

    @Column(name = "current_streak", nullable = false)
    @ColumnDefault("0")
    private Integer currentStreak = 0; // 현재 연속 학습 일수

    @Column(name = "max_streak", nullable = false)
    @ColumnDefault("0")
    private Integer maxStreak = 0; // 최대 연속 학습 일수

    @Column(name = "total_cards_studied", nullable = false)
    @ColumnDefault("0")
    private Integer totalCardsStudied = 0; // 총 복습한 카드 수

    @Column(name = "total_notes_created", nullable = false)
    @ColumnDefault("0")
    private Integer totalNotesCreated = 0; // 총 생성한 노트 수

    @Builder
    public MemberStat(Member member) {
        this.member = member;
        this.totalStudyMinutes = 0;
        this.totalStudyDays = 0;
        this.currentStreak = 0;
        this.maxStreak = 0;
        this.totalCardsStudied = 0;
        this.totalNotesCreated = 0;
    }

    // 학습시간 누적 메서드 (null 안전)
    public void addStudyMinutes(Integer minutes) {
        if (minutes != null && minutes > 0) {
            this.totalStudyMinutes = (this.totalStudyMinutes != null ? this.totalStudyMinutes : 0) + minutes;
        }
    }

    // 학습 일수 증가
    public void incrementStudyDays() {
        this.totalStudyDays = (this.totalStudyDays != null ? this.totalStudyDays : 0) + 1;
    }

    // 연속 학습 일수 업데이트
    public void updateStreak(boolean isConsecutive) {
        if (isConsecutive) {
            this.currentStreak = (this.currentStreak != null ? this.currentStreak : 0) + 1;
            if (this.currentStreak > (this.maxStreak != null ? this.maxStreak : 0)) {
                this.maxStreak = this.currentStreak;
            }
        } else {
            this.currentStreak = 1; // 연속이 끊어지면 1로 리셋
        }
    }

    // 카드 복습 수 증가
    public void incrementCardsStudied(Integer count) {
        if (count != null && count > 0) {
            this.totalCardsStudied = (this.totalCardsStudied != null ? this.totalCardsStudied : 0) + count;
        }
    }

    // 노트 생성 수 증가
    public void incrementNotesCreated() {
        this.totalNotesCreated = (this.totalNotesCreated != null ? this.totalNotesCreated : 0) + 1;
    }

    // 헬퍼 메서드들
    public double getAverageStudyMinutesPerDay() {
        if (totalStudyDays == null || totalStudyDays == 0) return 0.0;
        return (double) (totalStudyMinutes != null ? totalStudyMinutes : 0) / totalStudyDays;
    }

    public double getTotalStudyHours() {
        return (totalStudyMinutes != null ? totalStudyMinutes : 0) / 60.0;
    }

    public boolean isActiveStudier() {
        return currentStreak != null && currentStreak >= 3;
    }

    public String getStudyLevel() {
        int totalHours = (totalStudyMinutes != null ? totalStudyMinutes : 0) / 60;
        if (totalHours < 10) return "초보자";
        else if (totalHours < 50) return "학습자";
        else if (totalHours < 100) return "숙련자";
        else return "전문가";
    }
} 