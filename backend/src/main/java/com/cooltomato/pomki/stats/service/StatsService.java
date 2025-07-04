package com.cooltomato.pomki.stats.service;

import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import com.cooltomato.pomki.stats.entity.Attendance;
import com.cooltomato.pomki.stats.entity.MemberStat;
import com.cooltomato.pomki.stats.repository.AttendanceRepository;
import com.cooltomato.pomki.stats.repository.MemberStatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

// 출석 기록 및 학습 시간 누적 서비스
@Service
@RequiredArgsConstructor
@Slf4j
public class StatsService {

    private final MemberStatRepository memberStatRepository;
    private final AttendanceRepository attendanceRepository;
    private final MemberRepository memberRepository;
    private final StudyLogService studyLogService;

    /**
     * 출석 기록 - 중복 방지 + 연속 출석 관리
     */
    @Transactional
    public boolean recordAttendance(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        
        LocalDate today = LocalDate.now();
        
        // 이미 출석했는지 확인
        Optional<Attendance> existingAttendance = attendanceRepository.findByMemberAndAttendanceDate(member, today);
        if (existingAttendance.isPresent()) {
            log.info("이미 출석 기록이 있습니다: memberId={}, date={}", member.getMemberId(), today);
            return false; // 이미 출석함
        }
        
        // 출석 기록 저장
        Attendance attendance = Attendance.builder()
                .member(member)
                .build();
        attendanceRepository.save(attendance);
        
        // StudyLog에도 출석 기록
        studyLogService.logAttendance(member);
        
        // MemberStat 업데이트 - 학습 일수 및 연속 출석 관리
        updateAttendanceStats(member, today);
        
        log.info("출석 기록 완료: memberId={}, date={}", member.getMemberId(), today);
        return true; // 새로운 출석 기록
    }

    /**
     * 오늘 출석 여부 확인
     */
    @Transactional(readOnly = true)
    public boolean isAttendedToday(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        
        LocalDate today = LocalDate.now();
        return attendanceRepository.findByMemberAndAttendanceDate(member, today).isPresent();
    }

    /**
     * 학습시간 누적 (기존 방식 유지 + 통계 연동)
     */
    @Transactional
    public void addStudyTime(Long memberId, int minutes) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        
        MemberStat memberStat = memberStatRepository.findByMember(member)
                .orElseGet(() -> {
                    MemberStat newStat = MemberStat.builder()
                            .member(member)
                            .build();
                    return memberStatRepository.save(newStat);
                });

        memberStat.addStudyMinutes(minutes);
        memberStatRepository.save(memberStat);
        
        log.info("학습시간 누적: memberId={}, 추가={}분, 총={}분", 
                member.getMemberId(), minutes, memberStat.getTotalStudyMinutes());
    }

    /**
     * 총 학습시간 조회
     */
    @Transactional(readOnly = true)
    public int getTotalStudyMinutes(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        
        return memberStatRepository.findByMember(member)
                .map(MemberStat::getTotalStudyMinutes)
                .orElse(0);
    }

    /**
     * 종합 통계 조회
     */
    @Transactional(readOnly = true)
    public MemberStatsSummary getMemberStatsSummary(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        
        MemberStat memberStat = memberStatRepository.findByMember(member)
                .orElse(null);
        
        if (memberStat == null) {
            return MemberStatsSummary.empty();
        }
        
        return MemberStatsSummary.builder()
                .totalStudyMinutes(memberStat.getTotalStudyMinutes())
                .totalStudyHours(memberStat.getTotalStudyHours())
                .totalStudyDays(memberStat.getTotalStudyDays())
                .currentStreak(memberStat.getCurrentStreak())
                .maxStreak(memberStat.getMaxStreak())
                .totalCardsStudied(memberStat.getTotalCardsStudied())
                .totalNotesCreated(memberStat.getTotalNotesCreated())
                .averageStudyMinutesPerDay(memberStat.getAverageStudyMinutesPerDay())
                .studyLevel(memberStat.getStudyLevel())
                .isActiveStudier(memberStat.isActiveStudier())
                .build();
    }

    /**
     * 출석 통계 업데이트 헬퍼 메서드
     */
    private void updateAttendanceStats(Member member, LocalDate today) {
        MemberStat memberStat = memberStatRepository.findByMember(member)
                .orElseGet(() -> {
                    MemberStat newStat = MemberStat.builder()
                            .member(member)
                            .build();
                    return memberStatRepository.save(newStat);
                });
        
        // 학습 일수 증가
        memberStat.incrementStudyDays();
        
        // 연속 출석 확인 및 업데이트
        LocalDate yesterday = today.minusDays(1);
        boolean wasAttendedYesterday = attendanceRepository.findByMemberAndAttendanceDate(member, yesterday).isPresent();
        memberStat.updateStreak(wasAttendedYesterday);
        
        memberStatRepository.save(memberStat);
        
        log.info("출석 통계 업데이트: memberId={}, 총학습일수={}, 연속출석={}", 
                member.getMemberId(), memberStat.getTotalStudyDays(), memberStat.getCurrentStreak());
    }

    /**
     * 통계 요약 DTO
     */
    public static class MemberStatsSummary {
        private final Integer totalStudyMinutes;
        private final Double totalStudyHours;
        private final Integer totalStudyDays;
        private final Integer currentStreak;
        private final Integer maxStreak;
        private final Integer totalCardsStudied;
        private final Integer totalNotesCreated;
        private final Double averageStudyMinutesPerDay;
        private final String studyLevel;
        private final Boolean isActiveStudier;

        @lombok.Builder
        public MemberStatsSummary(Integer totalStudyMinutes, Double totalStudyHours, 
                                Integer totalStudyDays, Integer currentStreak, Integer maxStreak,
                                Integer totalCardsStudied, Integer totalNotesCreated,
                                Double averageStudyMinutesPerDay, String studyLevel, Boolean isActiveStudier) {
            this.totalStudyMinutes = totalStudyMinutes != null ? totalStudyMinutes : 0;
            this.totalStudyHours = totalStudyHours != null ? totalStudyHours : 0.0;
            this.totalStudyDays = totalStudyDays != null ? totalStudyDays : 0;
            this.currentStreak = currentStreak != null ? currentStreak : 0;
            this.maxStreak = maxStreak != null ? maxStreak : 0;
            this.totalCardsStudied = totalCardsStudied != null ? totalCardsStudied : 0;
            this.totalNotesCreated = totalNotesCreated != null ? totalNotesCreated : 0;
            this.averageStudyMinutesPerDay = averageStudyMinutesPerDay != null ? averageStudyMinutesPerDay : 0.0;
            this.studyLevel = studyLevel != null ? studyLevel : "초보자";
            this.isActiveStudier = isActiveStudier != null ? isActiveStudier : false;
        }

        public static MemberStatsSummary empty() {
            return MemberStatsSummary.builder().build();
        }

        // Getters
        public Integer getTotalStudyMinutes() { return totalStudyMinutes; }
        public Double getTotalStudyHours() { return totalStudyHours; }
        public Integer getTotalStudyDays() { return totalStudyDays; }
        public Integer getCurrentStreak() { return currentStreak; }
        public Integer getMaxStreak() { return maxStreak; }
        public Integer getTotalCardsStudied() { return totalCardsStudied; }
        public Integer getTotalNotesCreated() { return totalNotesCreated; }
        public Double getAverageStudyMinutesPerDay() { return averageStudyMinutesPerDay; }
        public String getStudyLevel() { return studyLevel; }
        public Boolean getIsActiveStudier() { return isActiveStudier; }
    }
} 