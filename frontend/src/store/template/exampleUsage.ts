// ============================================
// 📝 실제 Slice 작성 예시
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { extractApiErrorMessage } from '../../utils/stateUtils';
// import * as todoApi from '../../api/todoApi'; // 실제 API import

// 1. 타입 정의 (types 폴더에서 import하는 것이 좋음)
interface Todo {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateTodoRequest {
  title: string;
  content: string;
}

interface UpdateTodoRequest {
  title?: string;
  content?: string;
  completed?: boolean;
}

// 2. 상태 인터페이스
interface TodoState {
  items: Todo[];
  selectedItem: Todo | null;
  loading: boolean;
  error: string | null;
  filters: {
    searchQuery: string;
    showCompleted: boolean;
  };
}

// 3. 초기 상태
const initialState: TodoState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
  filters: {
    searchQuery: '',
    showCompleted: true,
  },
};

// 4. Async Thunk 액션들
export const fetchTodos = createAsyncThunk<
  Todo[],
  void,
  { state: RootState; rejectValue: string }
>('todo/fetchTodos', async (_, { rejectWithValue }) => {
  try {
    // const response = await todoApi.getTodos();
    // return response.data;
    
    // 목 데이터 (실제로는 API 호출)
    return [
      {
        id: '1',
        title: '상태관리 구현하기',
        content: 'Redux Toolkit으로 상태관리 로직 작성',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  } catch (error) {
    return rejectWithValue(extractApiErrorMessage(error));
  }
});

export const createTodo = createAsyncThunk<
  Todo,
  CreateTodoRequest,
  { state: RootState; rejectValue: string }
>('todo/createTodo', async (data, { rejectWithValue }) => {
  try {
    // const response = await todoApi.createTodo(data);
    // return response.data;
    
    // 목 데이터
    return {
      id: Date.now().toString(),
      ...data,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    return rejectWithValue(extractApiErrorMessage(error));
  }
});

// 5. Slice 정의
const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    setSelectedTodo: (state, action) => {
      state.selectedItem = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    toggleTodoComplete: (state, action) => {
      const todo = state.items.find(item => item.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
        todo.updatedAt = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '할 일을 불러오는데 실패했습니다.';
      })
      .addCase(createTodo.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  },
});

// 6. 액션과 리듀서 내보내기
export const { setSelectedTodo, setFilters, clearError, toggleTodoComplete } = todoSlice.actions;
export default todoSlice.reducer;

// 7. Selector 함수들
export const selectTodos = (state: RootState) => state.todo.items;
export const selectSelectedTodo = (state: RootState) => state.todo.selectedItem;
export const selectTodoLoading = (state: RootState) => state.todo.loading;
export const selectTodoError = (state: RootState) => state.todo.error;
export const selectTodoFilters = (state: RootState) => state.todo.filters;

// 파생 상태 selector
export const selectFilteredTodos = (state: RootState) => {
  const todos = selectTodos(state);
  const filters = selectTodoFilters(state);
  
  return todos.filter(todo => {
    if (!filters.showCompleted && todo.completed) {
      return false;
    }
    
    if (filters.searchQuery && !todo.title.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
};

// ============================================
// 🎣 Hook 사용 예시
// ============================================

/*
// 컴포넌트에서 사용 예시

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { useListSlice } from '../hooks/useSlice';
import { 
  fetchTodos, 
  createTodo,
  selectFilteredTodos,
  selectTodoLoading,
  selectTodoError,
  selectTodoFilters,
  setFilters,
  clearError
} from '../store/slices/todoSlice';

// 1. 기본 Redux Hook 사용
const TodoListBasic = () => {
  const dispatch = useAppDispatch();
  const todos = useAppSelector(selectFilteredTodos);
  const loading = useAppSelector(selectTodoLoading);
  const error = useAppSelector(selectTodoError);
  
  useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch]);
  
  const handleCreateTodo = (data: CreateTodoRequest) => {
    dispatch(createTodo(data));
  };
  
  return (
    <div>
      {loading && <div>로딩 중...</div>}
      {error && <div>에러: {error}</div>}
      {todos.map(todo => (
        <div key={todo.id}>{todo.title}</div>
      ))}
    </div>
  );
};

// 2. 공통 Hook 사용 (더 간단함)
const TodoListWithHook = () => {
  const dispatch = useAppDispatch();
  
  const {
    items: todos,
    loading,
    error,
    filters,
    setFilters: updateFilters,
    clearError: clearTodoError
  } = useListSlice(
    selectFilteredTodos,
    selectTodoLoading,
    selectTodoError,
    selectTodoFilters,
    { setFilters, clearFilters: () => setFilters({ searchQuery: '', showCompleted: true }), clearError }
  );
  
  useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch]);
  
  return (
    <div>
      <input 
        type="text"
        value={filters.searchQuery}
        onChange={(e) => updateFilters({ searchQuery: e.target.value })}
        placeholder="할 일 검색"
      />
      
      {loading && <div>로딩 중...</div>}
      {error && (
        <div>
          에러: {error}
          <button onClick={clearTodoError}>에러 무시</button>
        </div>
      )}
      
      {todos.map(todo => (
        <div key={todo.id}>
          <h3>{todo.title}</h3>
          <p>{todo.content}</p>
          <span>{todo.completed ? '완료' : '미완료'}</span>
        </div>
      ))}
    </div>
  );
};

// 3. 폼 상태 관리와 함께 사용
import { useFormState } from '../hooks/useFormState';

const TodoCreateForm = () => {
  const dispatch = useAppDispatch();
  
  const {
    values,
    errors,
    isValid,
    isSubmitting,
    getFieldProps,
    setSubmitting,
    resetForm
  } = useFormState(
    { title: '', content: '' },
    (values) => {
      const errors: any = {};
      if (!values.title.trim()) {
        errors.title = '제목을 입력해주세요.';
      }
      if (!values.content.trim()) {
        errors.content = '내용을 입력해주세요.';
      }
      return errors;
    }
  );
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) return;
    
    setSubmitting(true);
    try {
      await dispatch(createTodo(values)).unwrap();
      resetForm();
    } catch (error) {
      console.error('할 일 생성 실패:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          placeholder="할 일 제목"
          {...getFieldProps('title')}
        />
        {errors.title && <span>{errors.title}</span>}
      </div>
      
      <div>
        <textarea
          placeholder="할 일 내용"
          {...getFieldProps('content')}
        />
        {errors.content && <span>{errors.content}</span>}
      </div>
      
      <button 
        type="submit" 
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? '생성 중...' : '할 일 만들기'}
      </button>
    </form>
  );
};

*/ 