package com.cooltomato.pomki.stats.service;

import com.cooltomato.pomki.global.exception.NotFoundException;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import com.cooltomato.pomki.stats.dto.DashboardStatsResponseDto;
import com.cooltomato.pomki.stats.dto.TodayStatsDto;
import com.cooltomato.pomki.stats.entity.StudyLog;
import com.cooltomato.pomki.stats.repository.StudyLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StudyLogService {

    private final StudyLogRepository studyLogRepository;
    private final MemberRepository memberRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    @SneakyThrows // For objectMapper.writeValueAsString
    public void recordActivity(Long memberId, String activityType, Map<String, Object> details) {
        Member member = memberRepository.findById(memberId)
              .orElseThrow(() -> new NotFoundException("Member not found with id: " + memberId));

        String detailsJson = (details!= null)? objectMapper.writeValueAsString(details) : null;

        StudyLog log = StudyLog.builder()
              .member(member)
              .activityType(activityType)
              .activityDetails(detailsJson)
              .build();
        studyLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponseDto getDashboardStats(Long memberId, int year, int month) {
        // 1. 오늘의 통계 조회
        TodayStatsDto todayStats = studyLogRepository.getTodayStats(memberId, LocalDate.now().atStartOfDay());

        // 2. 캘린더 출석일 조회
        YearMonth yearMonth = YearMonth.of(year, month);
        List<LocalDate> attendanceDates = studyLogRepository.findDistinctActivityDatesByMemberAndPeriod(
                memberId,
                yearMonth.atDay(1).atStartOfDay(),
                yearMonth.atEndOfMonth().atTime(23, 59, 59)
        );

        return new DashboardStatsResponseDto(todayStats, attendanceDates);
    }
}