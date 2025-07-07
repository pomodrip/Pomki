package com.cooltomato.pomki.stats.repository;

import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.stats.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    boolean existsByMemberAndAttendanceDate(Member member, LocalDate attendanceDate);

    Optional<Attendance> findByMemberAndAttendanceDate(Member member, LocalDate attendanceDate);
} 