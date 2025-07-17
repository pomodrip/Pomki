import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { StudyFilters } from '../../types/study';
import type { RootState } from '../store';

interface StudyState {
  loading: boolean;
  error: string | null;
  filters: StudyFilters;
}

const initialState: StudyState = {
  loading: false,
  error: null,
  filters: {
    searchQuery: '',
    selectedTags: [],
    showBookmarked: false,
  },
};

const studySlice = createSlice({
  name: 'study',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<StudyFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        searchQuery: '',
        selectedTags: [],
        showBookmarked: false,
      };
    },
  },
});

export const {
  setFilters,
  clearFilters,
} = studySlice.actions;

// ==========================================
// Selector 함수들
// ==========================================

// 기본 selector들
export const selectStudy = (state: RootState) => state.study;
export const selectStudyLoading = (state: RootState) => state.study.loading;
export const selectStudyError = (state: RootState) => state.study.error;
export const selectStudyFilters = (state: RootState) => state.study.filters;

// 파생 상태 selector들 - createSelector로 메모이제이션
export const selectHasActiveFilters = createSelector(
  [selectStudyFilters],
  (filters) => {
    return (
      filters.searchQuery.trim() !== '' ||
      filters.selectedTags.length > 0 ||
      filters.showBookmarked
    );
  }
);

export const selectFilterSummary = createSelector(
  [selectStudyFilters],
  (filters) => ({
    hasSearch: filters.searchQuery.trim() !== '',
    searchQuery: filters.searchQuery,
    tagCount: filters.selectedTags.length,
    selectedTags: filters.selectedTags,
    showBookmarked: filters.showBookmarked,
    totalActiveFilters: [
      filters.searchQuery.trim() !== '',
      filters.selectedTags.length > 0,
      filters.showBookmarked
    ].filter(Boolean).length,
  })
);

export default studySlice.reducer;
