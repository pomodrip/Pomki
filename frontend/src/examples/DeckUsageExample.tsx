import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import {
  fetchDecks,
  createDeck,
  selectDecks,
  selectDeckLoading,
  selectDeckError,
  clearError,
} from '../store/slices/deckSlice';

/**
 * 🎯 Deck Slice 사용 예시
 * 
 * 이 컴포넌트는 deckSlice를 어떻게 사용하는지 보여주는 예시입니다.
 * 실제 프로젝트에서는 더 복잡한 UI와 로직이 필요할 수 있습니다.
 */

const DeckUsageExample: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Redux 상태 조회
  const decks = useAppSelector(selectDecks);
  const loading = useAppSelector(selectDeckLoading);
  const error = useAppSelector(selectDeckError);

  // 컴포넌트 마운트 시 덱 목록 조회
  useEffect(() => {
    dispatch(fetchDecks({ page: 0, size: 10 }));
  }, [dispatch]);

  // 새 덱 생성 핸들러
  const handleCreateDeck = async () => {
    const deckName = prompt('새 덱 이름을 입력하세요:');
    if (deckName) {
      try {
        await dispatch(createDeck({ deckName })).unwrap();
        alert('덱이 성공적으로 생성되었습니다!');
      } catch {
        alert('덱 생성에 실패했습니다.');
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🃏 Deck 관리 예시</h1>
      
      {/* 에러 표시 */}
      {error && (
        <div style={{ 
          background: '#fee', 
          border: '1px solid #fcc', 
          padding: '10px', 
          marginBottom: '20px',
          borderRadius: '4px'
        }}>
          <strong>에러:</strong> {error}
          <button 
            onClick={() => dispatch(clearError())}
            style={{ marginLeft: '10px' }}
          >
            닫기
          </button>
        </div>
      )}

      {/* 덱 생성 버튼 */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleCreateDeck}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          새 덱 만들기
        </button>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <div>⏳ 덱 목록을 불러오는 중...</div>
        </div>
      )}

      {/* 덱 목록 */}
      <div>
        <h2>내 덱 목록 ({decks.length}개)</h2>
        
        {decks.length === 0 && !loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            background: '#f8f9fa',
            borderRadius: '4px'
          }}>
            아직 생성된 덱이 없습니다.<br />
            첫 번째 덱을 만들어보세요! 📚
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '15px'
          }}>
            {decks.map((deck) => (
              <div 
                key={deck.deckId}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  background: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                  {deck.deckName}
                </h3>
                
                <div style={{ fontSize: '14px', color: '#666' }}>
                  <div>📄 카드 수: {deck.cardCnt}개</div>
                  <div>📅 생성일: {new Date(deck.createdAt).toLocaleDateString()}</div>
                </div>
                
                <div style={{ marginTop: '10px' }}>
                  <button 
                    style={{
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '3px',
                      fontSize: '12px',
                      marginRight: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    학습하기
                  </button>
                  <button 
                    style={{
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '3px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    편집
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 사용법 안내 */}
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <h3>🎓 사용법 안내</h3>
        <ul style={{ marginBottom: 0 }}>
          <li><strong>덱 생성:</strong> "새 덱 만들기" 버튼을 클릭하여 새로운 카드 덱을 생성할 수 있습니다.</li>
          <li><strong>실시간 업데이트:</strong> 덱을 생성하면 목록이 자동으로 업데이트됩니다.</li>
          <li><strong>에러 처리:</strong> API 에러가 발생하면 상단에 에러 메시지가 표시됩니다.</li>
          <li><strong>로딩 상태:</strong> 데이터를 불러올 때 로딩 메시지가 표시됩니다.</li>
        </ul>
      </div>
    </div>
  );
};

export default DeckUsageExample; 