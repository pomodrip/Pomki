package com.cooltomato.pomki.trash.repository;

import com.cooltomato.pomki.trash.entity.TrashCard;
import com.cooltomato.pomki.trash.entity.TrashCardId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrashCardRepository extends JpaRepository<TrashCard, TrashCardId> {
    List<TrashCard> findByIdTrashId(String trashId);
    Optional<TrashCard> findByIdCardId(Long cardId);
    void deleteByIdTrashId(String trashId);
} 