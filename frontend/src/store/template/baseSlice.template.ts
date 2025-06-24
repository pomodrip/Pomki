import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { extractApiErrorMessage } from '../../utils/stateUtils';

// 1. 상태 인터페이스 정의 (필수)
interface ExampleState {
  // 데이터 배열 (목록이 있는 경우)
  items: ExampleItem[];
  
  // 선택된 단일 항목 (상세 보기가 있는 경우)
  selectedItem: ExampleItem | null;
  
  // 로딩 상태 관리
  loading: boolean;
  
  // 에러 상태 관리
  error: string | null;
  
  // 필터/검색 관련 상태 (필요한경우)
  filters: {
    searchQuery: string;
    category: string;
    // 추가 필터들...
  };
}

// 2. 타입 정의 (types 폴더에서 가져오기)
interface ExampleItem {
  id: string;
  name: string;
  // 추가 필드들...
}

interface CreateExampleRequest {
  name: string;
  // 추가 필드들...
}

interface UpdateExampleRequest {
  name?: string;
  // 추가 필드들...
}

// 3. 초기 상태 정의
const initialState: ExampleState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
  filters: {
    searchQuery: '',
    category: '',
  },
};

// 4. Async Thunk 액션들 (API 호출)
// 목록 조회
export const fetchExampleItems = createAsyncThunk<
  ExampleItem[],           // 반환 타입
  void,                   // 매개변수 타입 (없으면 void)
  { 
    state: RootState;      // store 상태 타입
    rejectValue: string;   // 에러 타입
  }
>('example/fetchItems', async (_, { rejectWithValue }) => {
  try {
    // API 호출 예시 (실제 API로 교체)
    // const response = await exampleApi.getItems();
    // return response.data;
    
    // 임시 목 데이터
    return [];
  } catch (error: unknown) {
    return rejectWithValue(
      extractApiErrorMessage(error)
    );
  }
});

// 단일 항목 조회
export const fetchExampleItem = createAsyncThunk<
  ExampleItem,
  string,                 // ID 매개변수
  { 
    state: RootState;
    rejectValue: string;
  }
>('example/fetchItem', async (id, { rejectWithValue }) => {
  try {
    // const response = await exampleApi.getItem(id);
    // return response.data;
    
    // 임시 목 데이터
    return { id, name: 'Example Item' };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || '항목을 불러오는데 실패했습니다.'
    );
  }
});

// 생성
export const createExampleItem = createAsyncThunk<
  ExampleItem,
  CreateExampleRequest,
  { 
    state: RootState;
    rejectValue: string;
  }
>('example/createItem', async (data, { rejectWithValue }) => {
  try {
    // const response = await exampleApi.createItem(data);
    // return response.data;
    
    // 임시 목 데이터
    return { id: Date.now().toString(), ...data };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || '항목 생성에 실패했습니다.'
    );
  }
});

// 수정
export const updateExampleItem = createAsyncThunk<
  ExampleItem,
  { id: string; data: UpdateExampleRequest },
  { 
    state: RootState;
    rejectValue: string;
  }
>('example/updateItem', async ({ id, data }, { rejectWithValue }) => {
  try {
    // const response = await exampleApi.updateItem(id, data);
    // return response.data;
    
    // 임시 목 데이터
    return { id, name: data.name || 'Updated Item' };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || '항목 수정에 실패했습니다.'
    );
  }
});

// 삭제
export const deleteExampleItem = createAsyncThunk<
  string,                 // 삭제된 ID 반환
  string,                 // 삭제할 ID
  { 
    state: RootState;
    rejectValue: string;
  }
>('example/deleteItem', async (id, { rejectWithValue }) => {
  try {
    // await exampleApi.deleteItem(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || '항목 삭제에 실패했습니다.'
    );
  }
});

// 5. Slice 정의
const exampleSlice = createSlice({
  name: 'example',
  initialState,
  reducers: {
    // 동기 액션들 (즉시 상태 변경)
    
    // 에러 클리어
    clearError: (state) => {
      state.error = null;
    },
    
    // 선택된 항목 설정
    setSelectedItem: (state, action: PayloadAction<ExampleItem | null>) => {
      state.selectedItem = action.payload;
    },
    
    // 필터 설정
    setFilters: (state, action: PayloadAction<Partial<ExampleState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // 필터 초기화
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // 로딩 상태 수동 설정 (필요한 경우)
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  
  // 6. extraReducers - 비동기 액션 처리
  extraReducers: (builder) => {
    builder
      // 목록 조회
      .addCase(fetchExampleItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExampleItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchExampleItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '알 수 없는 오류가 발생했습니다.';
      })
      
      // 단일 항목 조회
      .addCase(fetchExampleItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExampleItem.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
        state.error = null;
      })
      .addCase(fetchExampleItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '항목을 불러오는데 실패했습니다.';
      })
      
      // 생성
      .addCase(createExampleItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExampleItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload); // 새 항목을 맨 앞에 추가
        state.error = null;
      })
      .addCase(createExampleItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '항목 생성에 실패했습니다.';
      })
      
      // 수정
      .addCase(updateExampleItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExampleItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        // 선택된 항목도 업데이트
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
        state.error = null;
      })
      .addCase(updateExampleItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '항목 수정에 실패했습니다.';
      })
      
      // 삭제
      .addCase(deleteExampleItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExampleItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        // 선택된 항목이 삭제된 경우 초기화
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
        state.error = null;
      })
      .addCase(deleteExampleItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '항목 삭제에 실패했습니다.';
      });
  },
});

// 7. 액션과 리듀서 내보내기
export const { 
  clearError, 
  setSelectedItem, 
  setFilters, 
  clearFilters, 
  setLoading 
} = exampleSlice.actions;

export default exampleSlice.reducer;

// 8. Selector 함수들 (컴포넌트에서 상태 접근용)
export const selectExampleItems = (state: RootState) => state.example.items;
export const selectSelectedExampleItem = (state: RootState) => state.example.selectedItem;
export const selectExampleLoading = (state: RootState) => state.example.loading;
export const selectExampleError = (state: RootState) => state.example.error;
export const selectExampleFilters = (state: RootState) => state.example.filters;

// 파생 상태 selector들 (메모이제이션됨)
export const selectFilteredExampleItems = (state: RootState) => {
  const items = selectExampleItems(state);
  const filters = selectExampleFilters(state);
  
  return items.filter(item => {
    // 검색어 필터링
    if (filters.searchQuery && !item.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
      return false;
    }
    
    // 추가 필터링 로직...
    
    return true;
  });
}; 