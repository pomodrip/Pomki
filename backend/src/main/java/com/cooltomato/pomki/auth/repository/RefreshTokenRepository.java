package com.cooltomato.pomki.auth.repository;

import com.cooltomato.pomki.auth.entity.RefreshToken;
import org.springframework.data.repository.CrudRepository;
import java.util.List;

public interface RefreshTokenRepository extends CrudRepository<RefreshToken, String> {
    List<RefreshToken> findByMemberId(Long memberId);
} 