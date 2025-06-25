// package com.cooltomato.pomki.ai.entity;

// import jakarta.persistence.*;
// import lombok.Data;
// import java.time.LocalDateTime;

// @Entity
// @Table(name = "AI_PROMPT")
// @Data
// public class AIPrompt {
//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long promptId;

//     @Column(nullable = false)
//     private String promptName;

//     @Column(nullable = false, columnDefinition = "TEXT")
//     private String promptContent;

//     @Column(nullable = false)
//     private String modelProvider;

//     @Column(nullable = false)
//     private String modelName;

//     @Column(nullable = false)
//     private String version;

//     @Column(columnDefinition = "TEXT")
//     private String description;
    
//     // createdAt, updatedAt 등 타임스탬프 필드 추가
// }

package com.cooltomato.pomki.ai.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "AI_PROMPT")
@Getter
@Setter
@NoArgsConstructor
public class AIPrompt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prompt_id")
    private Long promptId;

    @Column(name = "prompt_name", nullable = false, length = 255)
    private String promptName;

    @Lob
    @Column(name = "prompt_content", nullable = false, columnDefinition = "TEXT")
    private String promptContent;

    @Column(name = "version", nullable = false, length = 20)
    private String version = "1.0";

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "prompt_type", length = 50)
    private String promptType; // POLISHING, QUIZ_GENERATION 등

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    public AIPrompt(String promptName, String promptContent, String version, 
                   boolean isActive, String promptType) {
        this.promptName = promptName;
        this.promptContent = promptContent;
        this.version = version != null ? version : "1.0";
        this.isActive = isActive;
        this.promptType = promptType;
    }
} 