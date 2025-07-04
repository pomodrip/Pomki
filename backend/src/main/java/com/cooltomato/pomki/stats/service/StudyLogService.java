package com.cooltomato.pomki.stats.service;

import com.cooltomato.pomki.global.exception.NotFoundException;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import com.cooltomato.pomki.stats.dto.DashboardStatsResponseDto;
import com.cooltomato.pomki.stats.dto.TodayStatsDto;
import com.cooltomato.pomki.stats.entity.StudyLog;
import com.cooltomato.pomki.stats.entity.MemberStat;
import com.cooltomato.pomki.stats.repository.StudyLogRepository;
import com.cooltomato.pomki.stats.repository.MemberStatRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudyLogService {

    private final StudyLogRepository studyLogRepository;
    private final MemberRepository memberRepository;
    private final MemberStatRepository memberStatRepository;
    private final ObjectMapper objectMapper;

    /**
     * 기존 방식 유지 (하위 호환성) - 내부적으로 새로운 방식 사용
     */
    @Transactional
    @SneakyThrows
    public void recordActivity(Long memberId, String activityType, Map<String, Object> details) {
        Member member = memberRepository.findById(memberId)
              .orElseThrow(() -> new NotFoundException("Member not found with id: " + memberId));

        String detailsJson = (details != null) ? objectMapper.writeValueAsString(details) : null;
        
        // 기존 방식을 새로운 구조화된 방식으로 변환
        String activityTitle = extractActivityTitle(details);
        Integer studyMinutes = extractStudyMinutes(details);
        Integer goalMinutes = extractGoalMinutes(details);
        Integer pomodoroCompleted = extractPomodoroCompleted(details);
        Integer pomodoroTotal = extractPomodoroTotal(details);

        // 새로운 구조화된 방식으로 저장
        StudyLog studyLog = StudyLog.builder()
                .member(member)
                .activityType(activityType)
                .activityTitle(activityTitle)
                .studyMinutes(studyMinutes)
                .goalMinutes(goalMinutes)
                .pomodoroCompleted(pomodoroCompleted)
                .pomodoroTotal(pomodoroTotal)
                .additionalMetadata(detailsJson)
                .build();

        studyLogRepository.save(studyLog);
        
        // MemberStat 업데이트
        updateMemberStatsFromActivity(member, activityType, studyMinutes, details);
        
        log.info("활동 기록 저장 (기존 방식): memberId={}, activityType={}", memberId, activityType);
    }

    /**
     * 대시보드 통계 조회 (기존 방식 유지)
     */
    @Transactional(readOnly = true)
    public DashboardStatsResponseDto getDashboardStats(Long memberId, int year, int month) {
        TodayStatsDto todayStats = studyLogRepository.getTodayStats(memberId, LocalDate.now().atStartOfDay());

        YearMonth yearMonth = YearMonth.of(year, month);
        List<LocalDate> attendanceDates = studyLogRepository.findDistinctActivityDatesByMemberAndPeriod(
                memberId,
                yearMonth.atDay(1).atStartOfDay(),
                yearMonth.atEndOfMonth().atTime(23, 59, 59)
        );

        return new DashboardStatsResponseDto(todayStats, attendanceDates);
    }

    /**
     * 기본 활동 기록 (새로운 방식 - 권장)
     */
    @Transactional
    public StudyLog logActivity(Member member, String activityType, String activityTitle) {
        StudyLog studyLog = StudyLog.builder()
                .member(member)
                .activityType(activityType)
                .activityTitle(activityTitle)
                .build();

        StudyLog savedLog = studyLogRepository.save(studyLog);
        log.info("기본 활동 기록 저장: memberId={}, activityType={}", member.getMemberId(), activityType);
        return savedLog;
    }

    /**
     * 학습시간 포함 활동 기록 + MemberStat 업데이트 (새로운 방식 - 권장)
     */
    @Transactional
    public StudyLog logStudyActivity(Member member, String activityType, String activityTitle, Integer studyMinutes) {
        StudyLog studyLog = StudyLog.builder()
                .member(member)
                .activityType(activityType)
                .activityTitle(activityTitle)
                .studyMinutes(studyMinutes)
                .build();

        StudyLog savedLog = studyLogRepository.save(studyLog);
        
        // MemberStat 업데이트 - 학습시간 누적
        if (studyMinutes != null && studyMinutes > 0) {
            updateMemberStats(member, studyMinutes, activityType);
        }
        
        log.info("학습시간 포함 활동 기록 저장: memberId={}, activityType={}, studyMinutes={}", 
                member.getMemberId(), activityType, studyMinutes);
        return savedLog;
    }

    /**
     * 포모도로 세션 기록 + MemberStat 업데이트 (새로운 방식 - 권장)
     */
    @Transactional
    public StudyLog logPomodoroSession(Member member, String activityTitle, 
                                     Integer studyMinutes, Integer goalMinutes,
                                     Integer pomodoroCompleted, Integer pomodoroTotal) {
        StudyLog studyLog = StudyLog.builder()
                .member(member)
                .activityType(StudyLog.ActivityType.POMODORO_SESSION_COMPLETED.name())
                .activityTitle(activityTitle)
                .studyMinutes(studyMinutes)
                .goalMinutes(goalMinutes)
                .pomodoroCompleted(pomodoroCompleted)
                .pomodoroTotal(pomodoroTotal)
                .build();

        StudyLog savedLog = studyLogRepository.save(studyLog);
        
        // MemberStat 업데이트 - 학습시간 누적
        if (studyMinutes != null && studyMinutes > 0) {
            updateMemberStats(member, studyMinutes, StudyLog.ActivityType.POMODORO_SESSION_COMPLETED.name());
        }
        
        log.info("포모도로 세션 기록 저장: memberId={}, studyMinutes={}, completed={}/{}", 
                member.getMemberId(), studyMinutes, pomodoroCompleted, pomodoroTotal);
        return savedLog;
    }

    /**
     * 출석 기록용 간단한 로그 (새로운 방식 - 권장)
     */
    @Transactional
    public StudyLog logAttendance(Member member) {
        return logActivity(member, StudyLog.ActivityType.ATTENDANCE_RECORDED.name(), "출석 기록");
    }

    /**
     * 노트 작성 기록 + MemberStat 업데이트 (새로운 방식 - 권장)
     */
    @Transactional
    public StudyLog logNoteCreation(Member member, String noteTitle) {
        StudyLog studyLog = logActivity(member, StudyLog.ActivityType.NOTE_CREATED.name(), noteTitle);
        
        // MemberStat 업데이트 - 노트 생성 수 증가
        MemberStat memberStat = getOrCreateMemberStat(member);
        memberStat.incrementNotesCreated();
        memberStatRepository.save(memberStat);
        
        return studyLog;
    }

    /**
     * 카드 복습 기록 + MemberStat 업데이트 (새로운 방식 - 권장)
     */
    @Transactional
    public StudyLog logCardStudy(Member member, String cardTitle, Integer studyMinutes) {
        StudyLog studyLog = logStudyActivity(member, StudyLog.ActivityType.CARD_STUDIED.name(), cardTitle, studyMinutes);
        
        // MemberStat 업데이트 - 카드 복습 수 증가
        MemberStat memberStat = getOrCreateMemberStat(member);
        memberStat.incrementCardsStudied(1);
        memberStatRepository.save(memberStat);
        
        return studyLog;
    }

    /**
     * 일괄 카드 복습 기록 (새로운 방식 - 권장)
     */
    @Transactional
    public StudyLog logBatchCardStudy(Member member, Integer cardCount, Integer totalStudyMinutes) {
        StudyLog studyLog = StudyLog.builder()
                .member(member)
                .activityType(StudyLog.ActivityType.CARD_STUDIED.name())
                .activityTitle(String.format("일괄 카드 복습 (%d개)", cardCount))
                .studyMinutes(totalStudyMinutes)
                .build();

        StudyLog savedLog = studyLogRepository.save(studyLog);
        
        // MemberStat 업데이트
        MemberStat memberStat = getOrCreateMemberStat(member);
        memberStat.incrementCardsStudied(cardCount);
        if (totalStudyMinutes != null && totalStudyMinutes > 0) {
            memberStat.addStudyMinutes(totalStudyMinutes);
        }
        memberStatRepository.save(memberStat);
        
        log.info("일괄 카드 복습 기록: memberId={}, cardCount={}, studyMinutes={}", 
                member.getMemberId(), cardCount, totalStudyMinutes);
        return savedLog;
    }

    // === 헬퍼 메서드들 ===

    /**
     * MemberStat 업데이트 헬퍼 메서드
     */
    private void updateMemberStats(Member member, Integer studyMinutes, String activityType) {
        MemberStat memberStat = getOrCreateMemberStat(member);
        memberStat.addStudyMinutes(studyMinutes);
        memberStatRepository.save(memberStat);
    }

    /**
     * MemberStat 조회 또는 생성
     */
    private MemberStat getOrCreateMemberStat(Member member) {
        return memberStatRepository.findByMember(member)
                .orElseGet(() -> {
                    MemberStat newStat = MemberStat.builder()
                            .member(member)
                            .build();
                    return memberStatRepository.save(newStat);
                });
    }

    /**
     * 기존 방식에서 MemberStat 업데이트 (하위 호환성)
     */
    private void updateMemberStatsFromActivity(Member member, String activityType, Integer studyMinutes, Map<String, Object> details) {
        MemberStat memberStat = getOrCreateMemberStat(member);
        
        // 활동 유형별 통계 업데이트
        switch (activityType) {
            case "NOTE_CREATED":
                memberStat.incrementNotesCreated();
                break;
            case "CARD_REVIEWED":
            case "CARD_STUDIED":
                Integer cardCount = extractCardCount(details);
                memberStat.incrementCardsStudied(cardCount != null ? cardCount : 1);
                break;
        }
        
        // 학습시간 누적
        if (studyMinutes != null && studyMinutes > 0) {
            memberStat.addStudyMinutes(studyMinutes);
        }
        
        memberStatRepository.save(memberStat);
    }

    // === Map에서 값 추출 헬퍼 메서드들 ===

    private String extractActivityTitle(Map<String, Object> details) {
        if (details == null) return null;
        Object title = details.get("note_title");
        if (title == null) title = details.get("title");
        return title != null ? title.toString() : null;
    }

    private Integer extractStudyMinutes(Map<String, Object> details) {
        if (details == null) return null;
        Object minutes = details.get("duration_minutes");
        if (minutes == null) minutes = details.get("study_minutes");
        return minutes instanceof Number ? ((Number) minutes).intValue() : null;
    }

    private Integer extractGoalMinutes(Map<String, Object> details) {
        if (details == null) return null;
        Object goal = details.get("goal_minutes");
        return goal instanceof Number ? ((Number) goal).intValue() : null;
    }

    private Integer extractPomodoroCompleted(Map<String, Object> details) {
        if (details == null) return null;
        Object completed = details.get("pomodoro_completed");
        return completed instanceof Number ? ((Number) completed).intValue() : null;
    }

    private Integer extractPomodoroTotal(Map<String, Object> details) {
        if (details == null) return null;
        Object total = details.get("pomodoro_total");
        return total instanceof Number ? ((Number) total).intValue() : null;
    }

    private Integer extractCardCount(Map<String, Object> details) {
        if (details == null) return null;
        Object count = details.get("card_count");
        if (count == null) count = details.get("reviewed_card_count");
        return count instanceof Number ? ((Number) count).intValue() : null;
    }
}