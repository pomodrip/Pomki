import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Note, CreateNoteRequest, UpdateNoteRequest, Tag } from '../../types/note';
import * as noteApi from '../../api/noteApi';

interface NoteState {
  notes: Note[];
  loading: boolean;
  error: string | null;
  filters: {
    searchQuery: string;
    selectedTags: string[];
    showBookmarked: boolean;
  };
  selectedNote: Note | null;
}

// Mock 데이터 (Note 타입 준수)
const mockTags: Tag[] = [
  { tagId: 1, tagName: '#코딩', memberId: 1 },
  { tagId: 2, tagName: '#회계원리론', memberId: 1 },
  { tagId: 3, tagName: '#정보처리기사', memberId: 1 },
  { tagId: 4, tagName: '#데이터분석', memberId: 1 },
];

const mockNotes: Note[] = [
  {
    noteId: '1',
    noteTitle: 'React 이해도',
    noteContent: '1. React란?\n• React는 Facebook에서 개발한 JavaScript 라이브러리....',
    tags: [mockTags[0]],
    isBookmarked: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    noteId: '2',
    noteTitle: '손익계산서',
    noteContent: '1. 정의: 일정 기간 동안 기업의 수익 비용을 보여주는 재무제표\n2. 목적: 기업의 경영성과(이익 또는 손실)를 평가...',
    tags: [mockTags[1], mockTags[2]],
    isBookmarked: true,
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T09:00:00Z',
  },
  {
    noteId: '3',
    noteTitle: '시스템 개발 생명주기(SDLC)',
    noteContent: '1. 시스템 개발 생명주기(SDLC)\n알기 쉽게 개발→설→구→테→운 (개발주기)...',
    tags: [mockTags[2]],
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
    return response.content;
  }
);

export const createNote = createAsyncThunk(
  'note/createNote',
  async (noteData: CreateNoteRequest) => {
    const response = await noteApi.createNote(noteData);
    return response;
  }
);

export const updateNote = createAsyncThunk(
  'note/updateNote',
  async ({ noteId, data }: { noteId: string, data: UpdateNoteRequest }) => {
    const response = await noteApi.updateNote(noteId, data);
    return response;
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
    setFilters: (state, action: PayloadAction<Partial<{ searchQuery: string; selectedTags: string[]; showBookmarked: boolean; }>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedNote: (state, action: PayloadAction<Note | null>) => {
      state.selectedNote = action.payload;
    },
    toggleBookmark: (state, action: PayloadAction<string>) => {
      const note = state.notes.find(n => n.noteId === action.payload);
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
        const index = state.notes.findIndex(n => n.noteId === action.payload.noteId);
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
      })
      // deleteNote
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter(n => n.noteId !== action.payload);
      });
  },
});

export const { setFilters, clearFilters, setSelectedNote, toggleBookmark } = noteSlice.actions;
export default noteSlice.reducer;
