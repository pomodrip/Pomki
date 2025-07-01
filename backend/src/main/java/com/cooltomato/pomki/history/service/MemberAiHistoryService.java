package com.cooltomato.pomki.history.service;

import com.cooltomato.pomki.ai.entity.MemberAIHistory;
import com.cooltomato.pomki.ai.repository.MemberAIHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberAiHistoryService {

    private final MemberAIHistoryRepository memberAIHistoryRepository;

    public void saveHistory(MemberAIHistory history) {
        memberAIHistoryRepository.save(history);
    }
}
