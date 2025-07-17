package com.cooltomato.pomki.ai.repository;

import com.cooltomato.pomki.ai.entity.AIPrompt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AIPromptRepository extends JpaRepository<AIPrompt, Long> {
    
    // 활성화된 프롬프트 중 특정 이름으로 조회
    Optional<AIPrompt> findByPromptNameAndIsActiveTrue(String promptName);
    
    // 특정 타입의 활성화된 프롬프트들 조회
    List<AIPrompt> findByPromptTypeAndIsActiveTrueOrderByVersionDesc(String promptType);
    
    // 최신 버전의 활성화된 프롬프트 조회
    @Query("SELECT p FROM AIPrompt p WHERE p.promptName = :promptName AND p.isActive = true " +
           "ORDER BY p.version DESC LIMIT 1")
    Optional<AIPrompt> findLatestActivePrompt(@Param("promptName") String promptName);
    
    // 모든 프롬프트 이름 목록 조회 (중복 제거)
    @Query("SELECT DISTINCT p.promptName FROM AIPrompt p WHERE p.isActive = true")
    List<String> findDistinctActivePromptNames();
} 