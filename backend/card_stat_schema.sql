-- CARD_STAT 테이블 생성 (복습 알고리즘 핵심)
CREATE TABLE CARD_STAT (
    card_stat_id BIGINT NOT NULL AUTO_INCREMENT,
    card_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    
    -- SM-2 알고리즘 핵심 필드들
    repetitions INT NOT NULL DEFAULT 0,           -- 연속 정답 횟수
    ease_factor DECIMAL(4,2) NOT NULL DEFAULT 2.50, -- 용이성 지수 (1.30~2.50+)
    interval_days INT NOT NULL DEFAULT 1,        -- 다음 복습까지 간격(일)
    
    -- 스케줄링 관련
    due_at TIMESTAMP NOT NULL,                   -- 다음 복습 예정일
    last_reviewed_at TIMESTAMP NULL,             -- 마지막 복습 시점
    
    -- 품질 추적
    last_quality INT NULL,                       -- 마지막 응답 품질 (0-5)
    total_reviews INT NOT NULL DEFAULT 0,        -- 총 복습 횟수
    
    -- 메타데이터
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (card_stat_id),
    
    -- 외래키 제약조건
    FOREIGN KEY (card_id) REFERENCES CARD(card_id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES MEMBER(member_id) ON DELETE CASCADE,
    
    -- 복합 유니크 인덱스 (한 사용자-카드 조합당 하나의 통계만)
    UNIQUE KEY uk_member_card (member_id, card_id),
    
    -- 성능 최적화 인덱스들
    INDEX idx_due_member (member_id, due_at),     -- "오늘 복습할 카드" 쿼리용
    INDEX idx_card_member (card_id, member_id)    -- 카드별 통계 조회용
);

-- 오늘 복습할 카드 조회 쿼리 (성능 최적화됨)
SELECT c.card_id, c.card_front, c.card_back, cs.ease_factor, cs.repetitions
FROM CARD c
INNER JOIN CARD_STAT cs ON c.card_id = cs.card_id
WHERE cs.member_id = ? 
  AND cs.due_at <= NOW()
ORDER BY cs.due_at ASC
LIMIT 50;

-- 카드 학습 후 통계 업데이트 쿼리
UPDATE CARD_STAT 
SET repetitions = ?,
    ease_factor = ?,
    interval_days = ?,
    due_at = DATE_ADD(NOW(), INTERVAL ? DAY),
    last_reviewed_at = NOW(),
    last_quality = ?,
    total_reviews = total_reviews + 1
WHERE card_id = ? AND member_id = ?; 