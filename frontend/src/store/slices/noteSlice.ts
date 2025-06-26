import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import { getNotes, getNote, createNote, updateNote, deleteNote } from '../../api/noteApi';
import type {
  Note,
  NoteState,
  NoteCreateRequest,
  NoteUpdateRequest,
  NoteListItem,
} from '../../types/note';

interface ErrorResponse {
  message: string;
}

const initialState: NoteState = {
  notes: [],
  currentNote: null,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchNotes = createAsyncThunk('note/fetchNotes', async () => {
  const response = await getNotes();
  return response;
});

export const fetchNote = createAsyncThunk('note/fetchNote', async (noteId: string) => {
  const response = await getNote(noteId);
  return response;
});

export const createNoteAsync = createAsyncThunk(
  'note/createNote',
  async (data: NoteCreateRequest, { rejectWithValue }) => {
    try {
      const response = await createNote(data);
      return response;
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      return rejectWithValue(err.response?.data.message || err.message || 'Failed to create note');
    }
  },
);

export const updateNoteAsync = createAsyncThunk(
  'note/updateNote',
  async ({ noteId, data }: { noteId: string; data: NoteUpdateRequest }, { rejectWithValue }) => {
    try {
      const response = await updateNote(noteId, data);
      return response;
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      return rejectWithValue(err.response?.data.message || err.message || 'Failed to update note');
    }
  },
);

export const deleteNoteAsync = createAsyncThunk(
  'note/deleteNote',
  async (noteId: string, { rejectWithValue }) => {
    try {
      await deleteNote(noteId);
      return noteId;
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      return rejectWithValue(err.response?.data.message || err.message || 'Failed to delete note');
    }
  },
);

const noteSlice = createSlice({
  name: 'note',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearCurrentNote: state => {
      state.currentNote = null;
    },
    setCurrentNote: (state, action: PayloadAction<Note | null>) => {
      state.currentNote = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch Notes
      .addCase(fetchNotes.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action: PayloadAction<NoteListItem[]>) => {
        state.loading = false;
        state.notes = action.payload;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch notes.';
      })

      // Fetch Note by ID
      .addCase(fetchNote.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNote.fulfilled, (state, action: PayloadAction<Note>) => {
        state.loading = false;
        state.currentNote = action.payload;
      })
      .addCase(fetchNote.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch note details.';
      })

      // Create Note
      .addCase(createNoteAsync.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNoteAsync.fulfilled, (state, action: PayloadAction<Note>) => {
        state.loading = false;
        const newNote: NoteListItem = {
          noteId: action.payload.noteId,
          noteTitle: action.payload.noteTitle,
          aiEnhanced: action.payload.aiEnhanced,
          createdAt: action.payload.createdAt,
          updatedAt: action.payload.updatedAt,
        };
        state.notes.unshift(newNote);
      })
      .addCase(createNoteAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to create note.';
      })

      // Update Note
      .addCase(updateNoteAsync.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNoteAsync.fulfilled, (state, action: PayloadAction<Note>) => {
        state.loading = false;
        const index = state.notes.findIndex(note => note.noteId === action.payload.noteId);
        if (index !== -1) {
          state.notes[index] = {
            ...state.notes[index],
            noteTitle: action.payload.noteTitle,
            aiEnhanced: action.payload.aiEnhanced,
            updatedAt: action.payload.updatedAt,
          };
        }
        if (state.currentNote?.noteId === action.payload.noteId) {
          state.currentNote = action.payload;
        }
      })
      .addCase(updateNoteAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to update note.';
      })

      // Delete Note
      .addCase(deleteNoteAsync.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNoteAsync.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.notes = state.notes.filter(note => note.noteId !== action.payload);
      })
      .addCase(deleteNoteAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to delete note.';
      });
  },
});

export const { clearError, clearCurrentNote, setCurrentNote } = noteSlice.actions;
export default noteSlice.reducer;
