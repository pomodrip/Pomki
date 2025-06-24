import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

/**
 * 🔧 새로운 Slice 생성 가이드
 * 
 * 1. 이 파일을 복사하여 새로운 slice 파일 생성
 * 2. 'Example'을 실제 엔티티 이름으로 변경 (예: 'Todo', 'User', 'Product')
 * 3. 인터페이스와 타입을 실제 데이터에 맞게 수정
 * 4. API 호출 부분을 실제 API로 교체
 * 5. store.ts에 reducer 추가
 */

// ==========================================
// 1. 타입 정의
// ==========================================

interface ExampleItem {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateExampleRequest {
  name: string;
  description?: string;
}

interface UpdateExampleRequest {
  name?: string;
  description?: string;
}

// ==========================================
// 2. 상태 인터페이스
// ==========================================

interface ExampleState {
  // 데이터
  items: ExampleItem[];
  selectedItem: ExampleItem | null;
  
  // 상태
  loading: boolean;
  error: string | null;
  
  // 필터
  filters: {
    searchQuery: string;
    sortBy: 'name' | 'createdAt';
    sortOrder: 'asc' | 'desc';
  };
}

// ==========================================
// 3. 초기 상태
// ==========================================

const initialState: ExampleState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
  filters: {
    searchQuery: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
};

// ==========================================
// 4. 에러 처리 헬퍼
// ==========================================

const handleAsyncError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return '알 수 없는 오류가 발생했습니다.';
};

// ==========================================
// 5. Async Thunk 액션들
// ==========================================

// 목록 조회
export const fetchExampleItems = createAsyncThunk<
  ExampleItem[],
  void,
  { state: RootState; rejectValue: string }
>('example/fetchItems', async (_, { rejectWithValue }) => {
  try {
    // TODO: 실제 API 호출로 교체
    // const response = await exampleApi.getItems();
    // return response.data;
    
    // 임시 목 데이터
    await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
    return [
      {
        id: '1',
        name: '예시 항목 1',
        description: '첫 번째 예시 항목입니다.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  } catch (error) {
    return rejectWithValue(handleAsyncError(error));
  }
});

// 단일 항목 조회
export const fetchExampleItem = createAsyncThunk<
  ExampleItem,
  string,
  { state: RootState; rejectValue: string }
>('example/fetchItem', async (id, { rejectWithValue }) => {
  try {
    // TODO: 실제 API 호출로 교체
    // const response = await exampleApi.getItem(id);
    // return response.data;
    
    // 임시 목 데이터
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id,
      name: `예시 항목 ${id}`,
      description: `ID ${id}번 항목의 상세 정보입니다.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    return rejectWithValue(handleAsyncError(error));
  }
});

// 생성
export const createExampleItem = createAsyncThunk<
  ExampleItem,
  CreateExampleRequest,
  { state: RootState; rejectValue: string }
>('example/createItem', async (data, { rejectWithValue }) => {
  try {
    // TODO: 실제 API 호출로 교체
    // const response = await exampleApi.createItem(data);
    // return response.data;
    
    // 임시 목 데이터
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    return rejectWithValue(handleAsyncError(error));
  }
});

// 수정
export const updateExampleItem = createAsyncThunk<
  ExampleItem,
  { id: string; data: UpdateExampleRequest },
  { state: RootState; rejectValue: string }
>('example/updateItem', async ({ id, data }, { rejectWithValue }) => {
  try {
    // TODO: 실제 API 호출로 교체
    // const response = await exampleApi.updateItem(id, data);
    // return response.data;
    
    // 임시 목 데이터
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      id,
      name: data.name || `수정된 항목 ${id}`,
      description: data.description || '수정된 설명입니다.',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1일 전
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    return rejectWithValue(handleAsyncError(error));
  }
});

// 삭제
export const deleteExampleItem = createAsyncThunk<
  string,
  string,
  { state: RootState; rejectValue: string }
>('example/deleteItem', async (id, { rejectWithValue }) => {
  try {
    // TODO: 실제 API 호출로 교체
    // await exampleApi.deleteItem(id);
    
    // 임시 처리
    await new Promise(resolve => setTimeout(resolve, 500));
    return id;
  } catch (error) {
    return rejectWithValue(handleAsyncError(error));
  }
});

// ==========================================
// 6. Slice 정의
// ==========================================

const exampleSlice = createSlice({
  name: 'example',
  initialState,
  reducers: {
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
    
    // 로딩 상태 수동 설정
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  
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
        state.error = action.payload || '목록을 불러오는데 실패했습니다.';
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
      .addCase(updateExampleItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      
      // 삭제
      .addCase(deleteExampleItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
      });
  },
});

// ==========================================
// 7. 액션과 리듀서 내보내기
// ==========================================

export const { 
  clearError, 
  setSelectedItem, 
  setFilters, 
  clearFilters, 
  setLoading 
} = exampleSlice.actions;

export default exampleSlice.reducer;

// ==========================================
// 8. Selector 함수들 (실제 사용시 수정 필요)
// ==========================================

// 주의: 이 selector들은 템플릿 예시입니다.
// 실제 사용시에는 store.ts에 reducer를 추가한 후 올바른 state path를 사용하세요.

/* 실제 사용 예시:
export const selectExampleItems = (state: RootState) => state.example.items;
export const selectSelectedExampleItem = (state: RootState) => state.example.selectedItem;
export const selectExampleLoading = (state: RootState) => state.example.loading;
export const selectExampleError = (state: RootState) => state.example.error;
export const selectExampleFilters = (state: RootState) => state.example.filters;
*/

// 파생 상태 selector 예시
export const createFilteredItemsSelector = () => {
  return (items: ExampleItem[], filters: ExampleState['filters']) => {
    let filteredItems = [...items];
    
    // 검색 필터링
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    }
    
    // 정렬
    filteredItems.sort((a, b) => {
      const aValue = a[filters.sortBy];
      const bValue = b[filters.sortBy];
      
      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return filteredItems;
  };
}; 