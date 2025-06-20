import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Note, CreateNoteRequest, UpdateNoteRequest, NoteFilters } from '../../types/note';
import * as noteApi from '../../api/noteApi';

interface NoteState {
  notes: Note[];
  loading: boolean;
  error: string | null;
  filters: NoteFilters;
  selectedNote: Note | null;
}

// Mock 데이터
const mockNotes: Note[] = [
  {
    id: '1',
    title: 'React 이해도',
    content: '1. React란?\n• React는 Facebook에서 개발한 JavaScript 라이브러리....',
    tags: ['#코딩'],
    isBookmarked: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: '손익계산서',
    content: '1. 정의: 일정 기간 동안 기업의 수익 비용을 보여주는 재무제표\n2. 목적: 기업의 경영성과(이익 또는 손실)를 평가...',
    tags: ['#회계원리론', '#정보처리기사', '#데이터분석ㅇㅇㅇㅇㅇㅇ'],
    isBookmarked: true,
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T09:00:00Z',
  },
  {
    id: '3',
    title: '시스템 개발 생명주기(SDLC)',
    content: '1. 시스템 개발 생명주기(SDLC)\n알기 쉽게 개발→설→구→테→운 (개발주기)...',
    tags: ['#정보처리기사'],
    isBookmarked: false,
    createdAt: '2024-01-13T14:30:00Z',
    updatedAt: '2024-01-13T14:30:00Z',
  },
];

const initialState: NoteState = {
  notes: mockNotes,
  loading: false,
  error: null,
  filters: {
    searchQuery: '',
    selectedTags: [],
    showBookmarked: false,
  },
  selectedNote: null,
};

// 비동기 액션들
export const fetchNotes = createAsyncThunk(
  'note/fetchNotes',
  async () => {
    const response = await noteApi.getNotes();
    return response.data;
  }
);

export const createNote = createAsyncThunk(
  'note/createNote',
  async (noteData: CreateNoteRequest) => {
    const response = await noteApi.createNote(noteData);
    return response.data;
  }
);

export const updateNote = createAsyncThunk(
  'note/updateNote',
  async (noteData: UpdateNoteRequest) => {
    const response = await noteApi.updateNote(noteData);
    return response.data;
  }
);

export const deleteNote = createAsyncThunk(
  'note/deleteNote',
  async (noteId: string) => {
    await noteApi.deleteNote(noteId);
    return noteId;
  }
);

const noteSlice = createSlice({
  name: 'note',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<NoteFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedNote: (state, action: PayloadAction<Note | null>) => {
      state.selectedNote = action.payload;
    },
    toggleBookmark: (state, action: PayloadAction<string>) => {
      const note = state.notes.find(n => n.id === action.payload);
      if (note) {
        note.isBookmarked = !note.isBookmarked;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchNotes
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.payload;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '노트를 불러오는데 실패했습니다.';
      })
      // createNote
      .addCase(createNote.fulfilled, (state, action) => {
        state.notes.unshift(action.payload);
      })
      // updateNote
      .addCase(updateNote.fulfilled, (state, action) => {
        const index = state.notes.findIndex(n => n.id === action.payload.id);
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
      })
      // deleteNote
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter(n => n.id !== action.payload);
      });
  },
});

export const { setFilters, clearFilters, setSelectedNote, toggleBookmark } = noteSlice.actions;
export default noteSlice.reducer;
