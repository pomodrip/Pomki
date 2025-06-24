import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { extractApiErrorMessage } from '../../utils/stateUtils';
import * as adApi from '../../api/adApi';

// 1. 상태 인터페이스 정의
interface AdState {
  // 활성 광고 목록
  activeAds: adApi.Ad[];
  
  // 위치별 광고 목록
  adsByPosition: Record<string, adApi.Ad[]>;
  
  // 사용자 광고 설정
  preferences: adApi.AdPreferences | null;
  
  // 차단된 광고 목록
  blockedAds: string[];
  
  // 로딩 상태
  loading: {
    ads: boolean;
    preferences: boolean;
    blocking: boolean;
  };
  
  // 에러 상태
  error: string | null;
  
  // 광고 상호작용 추적
  interactions: {
    clicks: Record<string, number>;
    impressions: Record<string, number>;
  };
}

// 2. 초기 상태 정의
const initialState: AdState = {
  activeAds: [],
  adsByPosition: {},
  preferences: null,
  blockedAds: [],
  loading: {
    ads: false,
    preferences: false,
    blocking: false,
  },
  error: null,
  interactions: {
    clicks: {},
    impressions: {},
  },
};

// 3. Async Thunk 액션들

// 활성 광고 조회
export const fetchActiveAds = createAsyncThunk<
  adApi.Ad[],
  string | undefined, // position 파라미터
  {
    state: RootState;
    rejectValue: string;
  }
>('ad/fetchActiveAds', async (position, { rejectWithValue }) => {
  try {
    const ads = await adApi.getActiveAds(position);
    return ads;
  } catch (error: unknown) {
    return rejectWithValue(extractApiErrorMessage(error));
  }
});

// 특정 위치의 광고 조회
export const fetchAdsByPosition = createAsyncThunk<
  { position: string; ads: adApi.Ad[] },
  string, // position
  {
    state: RootState;
    rejectValue: string;
  }
>('ad/fetchAdsByPosition', async (position, { rejectWithValue }) => {
  try {
    const ads = await adApi.getAdsByPosition(position);
    return { position, ads };
  } catch (error: unknown) {
    return rejectWithValue(extractApiErrorMessage(error));
  }
});

// 광고 클릭 기록
export const recordClick = createAsyncThunk<
  { adId: string },
  { adId: string; data: Omit<adApi.AdClickEvent, 'adId'> },
  {
    state: RootState;
    rejectValue: string;
  }
>('ad/recordClick', async ({ adId, data }, { rejectWithValue }) => {
  try {
    await adApi.recordAdClick(adId, data);
    return { adId };
  } catch (error: unknown) {
    return rejectWithValue(extractApiErrorMessage(error));
  }
});

// 광고 노출 기록
export const recordImpression = createAsyncThunk<
  { adId: string },
  { adId: string; data: Omit<adApi.AdImpressionEvent, 'adId'> },
  {
    state: RootState;
    rejectValue: string;
  }
>('ad/recordImpression', async ({ adId, data }, { rejectWithValue }) => {
  try {
    await adApi.recordAdImpression(adId, data);
    return { adId };
  } catch (error: unknown) {
    return rejectWithValue(extractApiErrorMessage(error));
  }
});

// 광고 설정 조회
export const fetchAdPreferences = createAsyncThunk<
  adApi.AdPreferences,
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>('ad/fetchPreferences', async (_, { rejectWithValue }) => {
  try {
    const preferences = await adApi.getAdPreferences();
    return preferences;
  } catch (error: unknown) {
    return rejectWithValue(extractApiErrorMessage(error));
  }
});

// 광고 설정 수정
export const updateAdPreferences = createAsyncThunk<
  adApi.AdPreferences,
  Partial<adApi.AdPreferences>,
  {
    state: RootState;
    rejectValue: string;
  }
>('ad/updatePreferences', async (preferences, { rejectWithValue }) => {
  try {
    const updatedPreferences = await adApi.updateAdPreferences(preferences);
    return updatedPreferences;
  } catch (error: unknown) {
    return rejectWithValue(extractApiErrorMessage(error));
  }
});

// 광고 차단
export const blockAd = createAsyncThunk<
  string,
  string, // adId
  {
    state: RootState;
    rejectValue: string;
  }
>('ad/blockAd', async (adId, { rejectWithValue }) => {
  try {
    await adApi.blockAd(adId);
    return adId;
  } catch (error: unknown) {
    return rejectWithValue(extractApiErrorMessage(error));
  }
});

// 광고 차단 해제
export const unblockAd = createAsyncThunk<
  string,
  string, // adId
  {
    state: RootState;
    rejectValue: string;
  }
>('ad/unblockAd', async (adId, { rejectWithValue }) => {
  try {
    await adApi.unblockAd(adId);
    return adId;
  } catch (error: unknown) {
    return rejectWithValue(extractApiErrorMessage(error));
  }
});

// 차단된 광고 목록 조회
export const fetchBlockedAds = createAsyncThunk<
  string[],
  void,
  {
    state: RootState;
    rejectValue: string;
  }
>('ad/fetchBlockedAds', async (_, { rejectWithValue }) => {
  try {
    const blockedAds = await adApi.getBlockedAds();
    return blockedAds;
  } catch (error: unknown) {
    return rejectWithValue(extractApiErrorMessage(error));
  }
});

// 4. Slice 정의
const adSlice = createSlice({
  name: 'ad',
  initialState,
  reducers: {
    // 에러 클리어
    clearError: (state) => {
      state.error = null;
    },
    
    // 특정 위치의 광고 캐시 클리어
    clearAdsByPosition: (state, action: PayloadAction<string>) => {
      delete state.adsByPosition[action.payload];
    },
    
    // 모든 광고 캐시 클리어
    clearAllAds: (state) => {
      state.activeAds = [];
      state.adsByPosition = {};
    },
    
    // 광고 상호작용 카운터 증가 (로컬 추적용)
    incrementClickCount: (state, action: PayloadAction<string>) => {
      const adId = action.payload;
      state.interactions.clicks[adId] = (state.interactions.clicks[adId] || 0) + 1;
    },
    
    incrementImpressionCount: (state, action: PayloadAction<string>) => {
      const adId = action.payload;
      state.interactions.impressions[adId] = (state.interactions.impressions[adId] || 0) + 1;
    },
    
    // 상호작용 데이터 리셋
    resetInteractions: (state) => {
      state.interactions = {
        clicks: {},
        impressions: {},
      };
    },
  },
  
  // 5. extraReducers - 비동기 액션 처리
  extraReducers: (builder) => {
    builder
      // 활성 광고 조회
      .addCase(fetchActiveAds.pending, (state) => {
        state.loading.ads = true;
        state.error = null;
      })
      .addCase(fetchActiveAds.fulfilled, (state, action) => {
        state.loading.ads = false;
        state.activeAds = action.payload;
        state.error = null;
      })
      .addCase(fetchActiveAds.rejected, (state, action) => {
        state.loading.ads = false;
        state.error = action.payload || '광고를 불러오는데 실패했습니다.';
      })
      
      // 위치별 광고 조회
      .addCase(fetchAdsByPosition.pending, (state) => {
        state.loading.ads = true;
        state.error = null;
      })
      .addCase(fetchAdsByPosition.fulfilled, (state, action) => {
        state.loading.ads = false;
        const { position, ads } = action.payload;
        state.adsByPosition[position] = ads;
        state.error = null;
      })
      .addCase(fetchAdsByPosition.rejected, (state, action) => {
        state.loading.ads = false;
        state.error = action.payload || '위치별 광고를 불러오는데 실패했습니다.';
      })
      
      // 광고 클릭 기록
      .addCase(recordClick.fulfilled, (state, action) => {
        const { adId } = action.payload;
        state.interactions.clicks[adId] = (state.interactions.clicks[adId] || 0) + 1;
      })
      .addCase(recordClick.rejected, (state, action) => {
        state.error = action.payload || '광고 클릭 기록에 실패했습니다.';
      })
      
      // 광고 노출 기록
      .addCase(recordImpression.fulfilled, (state, action) => {
        const { adId } = action.payload;
        state.interactions.impressions[adId] = (state.interactions.impressions[adId] || 0) + 1;
      })
      .addCase(recordImpression.rejected, (state, action) => {
        state.error = action.payload || '광고 노출 기록에 실패했습니다.';
      })
      
      // 광고 설정 조회
      .addCase(fetchAdPreferences.pending, (state) => {
        state.loading.preferences = true;
        state.error = null;
      })
      .addCase(fetchAdPreferences.fulfilled, (state, action) => {
        state.loading.preferences = false;
        state.preferences = action.payload;
        state.error = null;
      })
      .addCase(fetchAdPreferences.rejected, (state, action) => {
        state.loading.preferences = false;
        state.error = action.payload || '광고 설정을 불러오는데 실패했습니다.';
      })
      
      // 광고 설정 수정
      .addCase(updateAdPreferences.pending, (state) => {
        state.loading.preferences = true;
        state.error = null;
      })
      .addCase(updateAdPreferences.fulfilled, (state, action) => {
        state.loading.preferences = false;
        state.preferences = action.payload;
        state.error = null;
      })
      .addCase(updateAdPreferences.rejected, (state, action) => {
        state.loading.preferences = false;
        state.error = action.payload || '광고 설정 수정에 실패했습니다.';
      })
      
      // 광고 차단
      .addCase(blockAd.pending, (state) => {
        state.loading.blocking = true;
        state.error = null;
      })
      .addCase(blockAd.fulfilled, (state, action) => {
        state.loading.blocking = false;
        const adId = action.payload;
        if (!state.blockedAds.includes(adId)) {
          state.blockedAds.push(adId);
        }
        // 차단된 광고를 활성 광고 목록에서 제거
        state.activeAds = state.activeAds.filter(ad => ad.adId !== adId);
        // 위치별 광고에서도 제거
        Object.keys(state.adsByPosition).forEach(position => {
          state.adsByPosition[position] = state.adsByPosition[position].filter(ad => ad.adId !== adId);
        });
        state.error = null;
      })
      .addCase(blockAd.rejected, (state, action) => {
        state.loading.blocking = false;
        state.error = action.payload || '광고 차단에 실패했습니다.';
      })
      
      // 광고 차단 해제
      .addCase(unblockAd.pending, (state) => {
        state.loading.blocking = true;
        state.error = null;
      })
      .addCase(unblockAd.fulfilled, (state, action) => {
        state.loading.blocking = false;
        const adId = action.payload;
        state.blockedAds = state.blockedAds.filter(id => id !== adId);
        state.error = null;
      })
      .addCase(unblockAd.rejected, (state, action) => {
        state.loading.blocking = false;
        state.error = action.payload || '광고 차단 해제에 실패했습니다.';
      })
      
      // 차단된 광고 목록 조회
      .addCase(fetchBlockedAds.pending, (state) => {
        state.loading.blocking = true;
        state.error = null;
      })
      .addCase(fetchBlockedAds.fulfilled, (state, action) => {
        state.loading.blocking = false;
        state.blockedAds = action.payload;
        state.error = null;
      })
      .addCase(fetchBlockedAds.rejected, (state, action) => {
        state.loading.blocking = false;
        state.error = action.payload || '차단된 광고 목록을 불러오는데 실패했습니다.';
      });
  },
});

// 6. 액션 내보내기
export const {
  clearError,
  clearAdsByPosition,
  clearAllAds,
  incrementClickCount,
  incrementImpressionCount,
  resetInteractions,
} = adSlice.actions;

// 7. 리듀서 내보내기
export default adSlice.reducer;

// 8. 셀렉터 함수들
export const selectAd = (state: RootState) => state.ad;
export const selectActiveAds = (state: RootState) => state.ad.activeAds;
export const selectAdsByPosition = (state: RootState) => state.ad.adsByPosition;
export const selectAdPreferences = (state: RootState) => state.ad.preferences;
export const selectBlockedAds = (state: RootState) => state.ad.blockedAds;
export const selectAdLoading = (state: RootState) => state.ad.loading;
export const selectAdError = (state: RootState) => state.ad.error;
export const selectAdInteractions = (state: RootState) => state.ad.interactions;

// 특정 위치의 광고 셀렉터
export const selectAdsBySpecificPosition = (position: string) => (state: RootState) =>
  state.ad.adsByPosition[position] || [];

// 필터링된 광고 셀렉터 (차단되지 않은 광고만)
export const selectNonBlockedActiveAds = (state: RootState) =>
  state.ad.activeAds.filter(ad => !state.ad.blockedAds.includes(ad.adId));

// 특정 위치의 필터링된 광고 셀렉터
export const selectNonBlockedAdsByPosition = (position: string) => (state: RootState) => {
  const ads = state.ad.adsByPosition[position] || [];
  return ads.filter(ad => !state.ad.blockedAds.includes(ad.adId));
};

// 로딩 상태 확인 셀렉터들
export const selectIsAdsLoading = (state: RootState) => state.ad.loading.ads;
export const selectIsPreferencesLoading = (state: RootState) => state.ad.loading.preferences;
export const selectIsBlockingLoading = (state: RootState) => state.ad.loading.blocking;
export const selectIsAnyAdLoading = (state: RootState) => 
  state.ad.loading.ads || state.ad.loading.preferences || state.ad.loading.blocking;
