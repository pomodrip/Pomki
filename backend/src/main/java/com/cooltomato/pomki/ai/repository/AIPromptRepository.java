package com.cooltomato.pomki.ai.repository;

import com.cooltomato.pomki.ai.entity.AIPrompt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AIPromptRepository extends JpaRepository<AIPrompt, Long> {
    
    // 프롬프트 이름으로 조회
    Optional<AIPrompt> findByPromptName(String promptName);
    
    // 프롬프트 이름과 버전으로 조회
    Optional<AIPrompt> findByPromptNameAndVersion(String promptName, String version);
    
    // 특정 프롬프트 이름의 모든 버전 조회 (최신순)
    List<AIPrompt> findByPromptNameOrderByVersionDesc(String promptName);
    
    // 모든 프롬프트 이름 목록 조회 (중복 제거)
    @Query("SELECT DISTINCT p.promptName FROM AIPrompt p")
    List<String> findDistinctPromptNames();
    
    // 프롬프트 ID로 조회
    Optional<AIPrompt> findByPromptId(Long promptId);
} 