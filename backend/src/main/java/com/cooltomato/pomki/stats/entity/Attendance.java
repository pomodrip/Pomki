package com.cooltomato.pomki.stats.entity;

import com.cooltomato.pomki.member.entity.Member;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;

@Entity
@Table(name = "ATTENDANCE", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"member_id", "attendance_date"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attendance_id")
    private Long attendanceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @CreatedDate
    @Column(name = "attendance_date", nullable = false, updatable = false)
    private LocalDate attendanceDate;

    @Builder
    public Attendance(Member member) {
        this.member = member;
    }
} 