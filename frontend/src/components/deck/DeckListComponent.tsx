import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { usePagination } from '../../hooks/usePagination';
import { useFormState } from '../../hooks/useFormState';
import {
  fetchDecks,
  createDeck,
  deleteDeck,
  selectFilteredDecks,
  selectDeckLoading,
  selectDeckError,
  selectDeckFilters,
  selectDeckPagination,
  selectDeckStats,
  setFilters,
  clearFilters,
  clearError,
  setCurrentPage,
} from '../../store/slices/deckSlice';
import type { CreateDeckRequest } from '../../types/card';

/**
 * 🃏 DeckListComponent - 덱 목록 컴포넌트
 * 
 * deckSlice 사용 예시:
 * - 목록 조회/생성/삭제
 * - 검색 및 필터링
 * - 페이지네이션
 * - 폼 상태 관리
 */

const DeckListComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Redux 상태 조회
  const decks = useAppSelector(selectFilteredDecks);
  const loading = useAppSelector(selectDeckLoading);
  const error = useAppSelector(selectDeckError);
  const filters = useAppSelector(selectDeckFilters);
  const pagination = useAppSelector(selectDeckPagination);
  const stats = useAppSelector(selectDeckStats);

  // 페이지네이션 훅
  const {
    currentPage,
    pageSize,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    getPageRange,
    setTotalElements,
  } = usePagination({
    initialPage: pagination.currentPage,
    initialPageSize: pagination.pageSize,
  });

  // 덱 생성 폼 상태
  const {
    values: createValues,
    errors: createErrors,
    isValid: isCreateValid,
    isSubmitting: isCreating,
    getFieldProps: getCreateFieldProps,
    setSubmitting: setCreateSubmitting,
    resetForm: resetCreateForm,
  } = useFormState<CreateDeckRequest>(
    { deckName: '' },
    (values) => {
      const errors: Partial<Record<keyof CreateDeckRequest, string>> = {};
      if (!values.deckName.trim()) {
        errors.deckName = '덱 이름을 입력해주세요.';
      }
      if (values.deckName.trim().length < 2) {
        errors.deckName = '덱 이름은 2글자 이상 입력해주세요.';
      }
      return errors;
    }
  );

  // 컴포넌트 마운트 시 덱 목록 조회
  useEffect(() => {
    dispatch(fetchDecks());
  }, [dispatch, currentPage, pageSize, filters.searchQuery]);

  // 페이지네이션 정보 동기화
  useEffect(() => {
    setTotalElements(pagination.totalElements);
  }, [pagination.totalElements, setTotalElements]);

  // 덱 생성 핸들러
  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isCreateValid) return;

    setCreateSubmitting(true);
    try {
      await dispatch(createDeck(createValues)).unwrap();
      resetCreateForm();
      // 성공 시 첫 페이지로 이동하여 새 덱 확인
      dispatch(setCurrentPage(0));
    } catch (error) {
      console.error('덱 생성 실패:', error);
    } finally {
      setCreateSubmitting(false);
    }
  };

  // 덱 삭제 핸들러
  const handleDeleteDeck = async (deckId: string, deckName: string) => {
    if (window.confirm(`"${deckName}" 덱을 정말 삭제하시겠습니까?`)) {
      try {
        await dispatch(deleteDeck(deckId)).unwrap();
      } catch (error) {
        console.error('덱 삭제 실패:', error);
      }
    }
  };

  // 검색 핸들러
  const handleSearchChange = (query: string) => {
    dispatch(setFilters({ searchQuery: query }));
    dispatch(setCurrentPage(0)); // 검색 시 첫 페이지로
  };

  // 필터 변경 핸들러
  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    dispatch(setFilters(newFilters));
    dispatch(setCurrentPage(0)); // 필터 변경 시 첫 페이지로
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    goToPage(page);
    dispatch(setCurrentPage(page));
  };

  // 에러 클리어 핸들러
  const handleClearError = () => {
    dispatch(clearError());
  };

  return (
    <div className="deck-list-container">
      <h1>📚 내 덱 목록</h1>
      
      {/* 통계 정보 */}
      <div className="stats-section">
        <div className="stat-item">
          <span>총 덱 수: {stats.totalDecks}</span>
        </div>
        <div className="stat-item">
          <span>총 카드 수: {stats.totalCards}</span>
        </div>
      </div>

      {/* 덱 생성 폼 */}
      <section className="create-deck-section">
        <h2>새 덱 만들기</h2>
        <form onSubmit={handleCreateDeck}>
          <div className="form-field">
            <input
              type="text"
              placeholder="덱 이름을 입력하세요"
              value={createValues.deckName}
              onChange={(e) => {
                const fieldProps = getCreateFieldProps('deckName');
                fieldProps.onChange(e.target.value);
              }}
              onBlur={() => {
                const fieldProps = getCreateFieldProps('deckName');
                fieldProps.onBlur();
              }}
            />
            {createErrors.deckName && (
              <span className="error">{createErrors.deckName}</span>
            )}
          </div>
          <button 
            type="submit" 
            disabled={!isCreateValid || isCreating}
          >
            {isCreating ? '생성 중...' : '덱 만들기'}
          </button>
        </form>
      </section>

      {/* 검색 및 필터 */}
      <section className="filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="덱 검색..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <label>
            <input
              type="checkbox"
              checked={filters.showBookmarked}
              onChange={(e) => handleFilterChange({ showBookmarked: e.target.checked })}
            />
            북마크된 덱만 보기
          </label>
          
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange({ 
              sortBy: e.target.value as typeof filters.sortBy 
            })}
          >
            <option value="createdAt">생성일순</option>
            <option value="deckName">이름순</option>
            <option value="cardCnt">카드 수순</option>
          </select>
          
          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange({ 
              sortOrder: e.target.value as typeof filters.sortOrder 
            })}
          >
            <option value="desc">내림차순</option>
            <option value="asc">오름차순</option>
          </select>
          
          <button onClick={() => dispatch(clearFilters())}>
            필터 초기화
          </button>
        </div>
      </section>

      {/* 에러 표시 */}
      {error && (
        <div className="error-banner">
          <span>에러: {error}</span>
          <button onClick={handleClearError}>✕</button>
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <div className="loading-spinner">
          덱 목록을 불러오는 중...
        </div>
      )}

      {/* 덱 목록 */}
      <section className="deck-list">
        {!loading && decks.length === 0 ? (
          <div className="empty-state">
            {filters.searchQuery ? 
              '검색 결과가 없습니다.' : 
              '아직 생성된 덱이 없습니다. 첫 덱을 만들어보세요!'
            }
          </div>
        ) : (
          <div className="deck-grid">
            {decks.map((deck) => (
              <div key={deck.deckId} className="deck-card">
                <div className="deck-header">
                  <h3>{deck.deckName}</h3>
                  <div className="deck-actions">
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteDeck(deck.deckId, deck.deckName)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="deck-info">
                  <span>카드 수: {deck.cardCnt}</span>
                  <span>생성일: {new Date(deck.createdAt).toLocaleDateString()}</span>
                </div>
                
                {!deck.isDeleted && (
                  <div className="deck-actions">
                    <button className="study-btn">
                      학습하기
                    </button>
                    <button className="edit-btn">
                      편집하기
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 페이지네이션 */}
      {pagination.totalPages > 1 && (
        <section className="pagination">
          <button 
            onClick={goToPreviousPage}
            disabled={currentPage === 0}
          >
            이전
          </button>
          
          {getPageRange().map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={currentPage === page ? 'active' : ''}
            >
              {page + 1}
            </button>
          ))}
          
          <button 
            onClick={goToNextPage}
            disabled={currentPage >= pagination.totalPages - 1}
          >
            다음
          </button>
          
          <span className="page-info">
            {pagination.currentPage + 1} / {pagination.totalPages} 페이지
            (총 {pagination.totalElements}개)
          </span>
        </section>
      )}
    </div>
  );
};

export default DeckListComponent; 