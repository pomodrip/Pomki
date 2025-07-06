package com.cooltomato.pomki.notification.repository;

import com.cooltomato.pomki.global.constant.FireBasePlatform;
import com.cooltomato.pomki.notification.entity.FireBaseToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FirebaseTokenRepository extends JpaRepository<FireBaseToken, String> {
    
    List<FireBaseToken> findByMember_MemberId(Long memberId);
    
    List<FireBaseToken> findByMember_MemberIdAndPlatform(Long memberId, FireBasePlatform platform);
    
    boolean existsByFirebaseToken(String firebaseToken);
    
    boolean existsByFirebaseTokenAndMember_MemberId(String firebaseToken, Long memberId);
    
    @Modifying
    @Query("DELETE FROM FireBaseToken f WHERE f.member.memberId = :memberId")
    void deleteByMemberId(@Param("memberId") Long memberId);
    
    void deleteByFirebaseToken(String firebaseToken);
    
    @Modifying
    @Query("DELETE FROM FireBaseToken f WHERE f.firebaseToken IN :tokens")
    void deleteByFirebaseTokenIn(@Param("tokens") List<String> tokens);
    
    List<FireBaseToken> findByPlatform(FireBasePlatform platform);
    
    @Query("SELECT f FROM FireBaseToken f WHERE f.member.isDeleted = false")
    List<FireBaseToken> findAllActiveTokens();
    
    List<FireBaseToken> findByMember_MemberIdIn(List<Long> memberIds);
    
    List<FireBaseToken> findByMember_MemberIdInAndPlatform(List<Long> memberIds, FireBasePlatform platform);
} 