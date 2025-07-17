import type { AxiosResponse } from 'axios';
import axios from 'axios';
import api from './index';
import { store } from '../store/store';
import { selectAccessToken } from '../store/slices/authSlice';

// 이미지 업로드 전용 axios 인스턴스 (기본 API 설정에 영향받지 않음)
const imageApi = axios.create({
  baseURL: api.defaults.baseURL,
  timeout: 30000,
  // Content-Type을 설정하지 않음 - 브라우저가 FormData 감지하여 자동 설정
});

// 인증 토큰 인터셉터 추가 - 리덕스에서 토큰 가져오기
imageApi.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = selectAccessToken(state);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 이미지 업로드 응답 타입
export interface ImageUploadResponse {
  imageId: number;
  noteId: string;
  imageUrl: string;
  imageName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  oriFileName: string;
  resizeImageUrl: string;
}

// 이미지 목록 조회 응답 타입
export type ImageListResponse = ImageUploadResponse[];

/**
 * 이미지를 업로드합니다.
 * @param imageFile - 업로드할 이미지 파일
 * @param onProgress - 업로드 진행률 콜백 (옵션)
 * @returns 업로드된 이미지 정보
 */
export const uploadImage = async (
  imageFile: File,
  onProgress?: (progress: number) => void
): Promise<ImageUploadResponse> => {
  console.log('=== 이미지 업로드 요청 시작 ===');
  console.log('File:', imageFile.name, imageFile.size, imageFile.type);

  const formData = new FormData();
  formData.append('imageFile', imageFile);

  // FormData 내용 확인
  console.log('FormData entries:');
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  const url = '/api/images/upload';
  console.log('Request URL:', url);

  try {
    // 이미지 업로드 전용 axios 인스턴스 사용
    // Content-Type 헤더를 설정하지 않아서 브라우저가 자동으로 multipart/form-data로 설정
    console.log('Sending request with imageApi...');
    
    const response: AxiosResponse<ImageUploadResponse> = await imageApi.post(url, formData, {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      },
    });

    console.log('=== 이미지 업로드 성공 ===');
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=== 이미지 업로드 실패 ===');
    console.error('Error details:', error);
    
    // axios 실패 시 fetch API로 재시도
    console.log('=== axios 실패, fetch API로 재시도 ===');
    try {
      const state = store.getState();
      const token = selectAccessToken(state);
      const fetchResponse = await fetch(`${imageApi.defaults.baseURL}${url}`, {
        method: 'POST',
        body: formData, // fetch는 FormData를 자동으로 multipart/form-data로 처리
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Content-Type은 의도적으로 설정하지 않음
        },
      });

      if (!fetchResponse.ok) {
        throw new Error(`HTTP error! status: ${fetchResponse.status}`);
      }

      const data = await fetchResponse.json();
      console.log('=== fetch API로 이미지 업로드 성공 ===');
      console.log('Response:', data);
      return data;
    } catch (fetchError) {
      console.error('=== fetch API도 실패 ===');
      console.error(fetchError);
      throw error; // 원래 axios 에러를 던짐
    }
  }
};

/**
 * 특정 노트의 모든 이미지를 조회합니다.
 * @param noteId - 노트 ID
 * @returns 이미지 목록
 */
export const getNoteImages = async (noteId: string): Promise<ImageListResponse> => {
  console.log('=== 노트 이미지 목록 조회 시작 ===');
  console.log('Note ID:', noteId);

  try {
    const response: AxiosResponse<ImageListResponse> = await api.get(
      `/api/images/note/${noteId}`
    );

    console.log('=== 노트 이미지 목록 조회 성공 ===');
    console.log('Images count:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('=== 노트 이미지 목록 조회 실패 ===');
    console.error(error);
    throw error;
  }
};

/**
 * 이미지 파일의 유효성을 검사합니다.
 * @param file - 검사할 파일
 * @returns 유효성 검사 결과
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // 파일 타입 검사
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: '지원하지 않는 이미지 형식입니다. (JPG, PNG, GIF, WebP만 지원)',
    };
  }

  // 파일 크기 검사 (10MB 제한)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: '이미지 파일 크기는 10MB 이하여야 합니다.',
    };
  }

  return { valid: true };
};

/**
 * 클립보드에서 이미지를 추출합니다.
 * @param clipboardData - 클립보드 데이터
 * @returns 이미지 파일 또는 null
 */
export const extractImageFromClipboard = (clipboardData: DataTransfer): File | null => {
  const items = clipboardData.items;
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile();
      if (file) {
        // 클립보드 이미지에 이름 지정
        const timestamp = new Date().getTime();
        const extension = file.type.split('/')[1] || 'png';
        const fileName = `clipboard-image-${timestamp}.${extension}`;
        
        return new File([file], fileName, { type: file.type });
      }
    }
  }
  
  return null;
};

/**
 * 드래그 앤 드롭에서 이미지 파일들을 추출합니다.
 * @param dataTransfer - 드롭 데이터
 * @returns 이미지 파일 배열
 */
export const extractImagesFromDrop = (dataTransfer: DataTransfer): File[] => {
  const files: File[] = [];
  const items = dataTransfer.files;
  
  for (let i = 0; i < items.length; i++) {
    const file = items[i];
    if (file.type.startsWith('image/')) {
      files.push(file);
    }
  }
  
  return files;
}; 