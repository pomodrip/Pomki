import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../store/store';
import {
  fetchActiveAds,
  fetchAdsByPosition,
  recordClick,
  recordImpression,
  blockAd,
  fetchAdPreferences,
  updateAdPreferences,
  selectActiveAds,
  selectAdsBySpecificPosition,
  selectNonBlockedActiveAds,
  selectAdPreferences,
  selectIsAdsLoading,
  selectAdError,
  clearError
} from '../store/slices/adSlice';

const AdUsageExample: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // 상태 선택
  const activeAds = useSelector(selectActiveAds);
  const topAds = useSelector(selectAdsBySpecificPosition('TOP'));
  const nonBlockedAds = useSelector(selectNonBlockedActiveAds);
  const preferences = useSelector(selectAdPreferences);
  const isLoading = useSelector(selectIsAdsLoading);
  const error = useSelector(selectAdError);

  // 컴포넌트 마운트 시 광고 데이터 로드
  useEffect(() => {
    dispatch(fetchActiveAds());
    dispatch(fetchAdsByPosition('TOP'));
    dispatch(fetchAdPreferences());
  }, [dispatch]);

  // 광고 클릭 처리
  const handleAdClick = async (adId: string, linkUrl: string) => {
    try {
      // 클릭 이벤트 기록
      await dispatch(recordClick({
        adId,
        data: {
          clickedAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer,
        }
      }));
      
      // 광고 링크로 이동
      window.open(linkUrl, '_blank');
    } catch (error) {
      console.error('광고 클릭 처리 실패:', error);
    }
  };

  // 광고 노출 처리
  const handleAdImpression = (adId: string, position: string) => {
    dispatch(recordImpression({
      adId,
      data: {
        viewedAt: new Date().toISOString(),
        position,
        duration: 0, // 실제로는 노출 시간을 측정해야 함
      }
    }));
  };

  // 광고 차단 처리
  const handleBlockAd = (adId: string) => {
    if (confirm('이 광고를 차단하시겠습니까?')) {
      dispatch(blockAd(adId));
    }
  };

  // 광고 설정 업데이트
  const handleUpdatePreferences = () => {
    dispatch(updateAdPreferences({
      showPersonalizedAds: !preferences?.showPersonalizedAds,
      allowVideoAds: preferences?.allowVideoAds ?? true,
      allowPopupAds: preferences?.allowPopupAds ?? true,
      interests: preferences?.interests ?? []
    }));
  };

  // 에러 처리
  const handleClearError = () => {
    dispatch(clearError());
  };

  if (isLoading) {
    return <div>광고를 불러오는 중...</div>;
  }

  if (error) {
    return (
      <div style={{ color: 'red' }}>
        에러: {error}
        <button onClick={handleClearError}>에러 지우기</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>광고 시스템 사용 예시</h2>
      
      {/* 광고 설정 */}
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd' }}>
        <h3>광고 설정</h3>
        {preferences && (
          <div>
            <p>개인화 광고: {preferences.showPersonalizedAds ? '허용' : '차단'}</p>
            <p>비디오 광고: {preferences.allowVideoAds ? '허용' : '차단'}</p>
            <p>팝업 광고: {preferences.allowPopupAds ? '허용' : '차단'}</p>
            <button onClick={handleUpdatePreferences}>
              개인화 광고 설정 토글
            </button>
          </div>
        )}
      </div>

      {/* 활성 광고 목록 */}
      <div style={{ marginBottom: '20px' }}>
        <h3>모든 활성 광고 ({activeAds.length}개)</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {activeAds.map((ad) => (
            <div 
              key={ad.adId} 
              style={{ 
                border: '1px solid #ccc', 
                padding: '10px',
                borderRadius: '4px'
              }}
              onMouseEnter={() => handleAdImpression(ad.adId, ad.position)}
            >
              <h4>{ad.title}</h4>
              <p>{ad.description}</p>
              <p>위치: {ad.position} | 타입: {ad.type}</p>
              {ad.imageUrl && (
                <img 
                  src={ad.imageUrl} 
                  alt={ad.title}
                  style={{ maxWidth: '200px', height: 'auto' }}
                />
              )}
              <div style={{ marginTop: '10px' }}>
                <button 
                  onClick={() => handleAdClick(ad.adId, ad.linkUrl)}
                  style={{ marginRight: '10px' }}
                >
                  광고 클릭
                </button>
                <button 
                  onClick={() => handleBlockAd(ad.adId)}
                  style={{ backgroundColor: '#ff4444', color: 'white' }}
                >
                  차단
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 상단 위치 광고 */}
      <div style={{ marginBottom: '20px' }}>
        <h3>상단 광고 ({topAds.length}개)</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {topAds.map((ad) => (
            <div 
              key={ad.adId}
              style={{ 
                border: '1px solid #007bff', 
                padding: '10px',
                borderRadius: '4px',
                maxWidth: '200px'
              }}
            >
              <strong>{ad.title}</strong>
              <p>{ad.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 차단되지 않은 광고 */}
      <div>
        <h3>차단되지 않은 광고 ({nonBlockedAds.length}개)</h3>
        <p>
          총 {activeAds.length}개 중 {nonBlockedAds.length}개가 표시됩니다.
        </p>
      </div>
    </div>
  );
};

export default AdUsageExample; 