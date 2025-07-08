import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { askAI } from '../../api';
import type { AskAIRequest, AskAIResponse } from '../../types/ai';
import type { RootState } from '../store';

interface AIState {
  data: AskAIResponse | null;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null | undefined;
}

const initialState: AIState = {
  data: null,
  loading: 'idle',
  error: null,
};

export const fetchAIAnswer = createAsyncThunk<
  AskAIResponse,
  AskAIRequest,
  { rejectValue: string }
>('ai/fetchAnswer', async (requestData, { rejectWithValue }) => {
  try {
    const response = await askAI(requestData);
    if (response.success) {
      return response;
    }
    return rejectWithValue(response.message || 'AI processing failed');
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || 'An unknown error occurred');
  }
});

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    resetAIState: (state) => {
      state.data = null;
      state.loading = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAIAnswer.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchAIAnswer.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchAIAnswer.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetAIState } = aiSlice.actions;

export const selectAIState = (state: RootState) => state.ai;

export default aiSlice.reducer; 