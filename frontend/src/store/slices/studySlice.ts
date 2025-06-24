import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StudyFilters } from '../../types/study';

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

export default studySlice.reducer;
