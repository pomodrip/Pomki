package com.cooltomato.pomki.ai.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "MEMBER_AI_HISTORY")
@Getter
@Setter
@NoArgsConstructor
public class MemberAIHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long historyId;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "service_type", nullable = false, length = 50)
    private String serviceType; // POLISHING, QUIZEGEN 등

    @Column(name = "input_token", nullable = false)
    private Integer inputToken = 0;

    @Column(name = "output_token", nullable = false)
    private Integer outputToken = 0;

    @Column(name = "prompt_name", length = 255)
    private String promptName;

    @Column(name = "status", length = 20)
    private String status = "COMPLETED"; // PENDING, PROCESSING, COMPLETED, FAILED

    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Builder
    public MemberAIHistory(Long memberId, String serviceType, Integer inputToken, 
                          Integer outputToken, String promptName, String status, String errorMessage) {
        this.memberId = memberId;
        this.serviceType = serviceType;
        this.inputToken = inputToken != null ? inputToken : 0;
        this.outputToken = outputToken != null ? outputToken : 0;
        this.promptName = promptName;
        this.status = status != null ? status : "COMPLETED";
        this.errorMessage = errorMessage;
    }
} 