package com.cooltomato.pomki.bookmark.repository;

import com.cooltomato.pomki.bookmark.entity.BookmarkCard;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookmarkCardRepository extends JpaRepository<BookmarkCard, Long> {
} 