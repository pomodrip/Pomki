// 노트 기본 정보
export interface Note {
  noteId: string;
  memberId?: number;
  noteTitle: string;
  noteContent: string;
  aiEnhanced?: boolean;
  originalContent?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  tags?: Tag[];
  images?: NoteImage[];
  isBookmarked?: boolean;
}

// 노트 생성 요청
export interface CreateNoteRequest {
  noteTitle: string;
  noteContent: string;
  tagIds?: number[];
}

// 노트 업데이트 요청
export interface UpdateNoteRequest {
  noteTitle: string;
  noteContent: string;
  tagIds?: number[];
}

// 노트 리스트 조회 요청
export interface GetNotesRequest {
  page?: number;
  size?: number;
  search?: string;
  tagId?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortDirection?: 'asc' | 'desc';
}

// 태그
export interface Tag {
  tagId: number;
  memberId: number;
  tagName: string;
}

// 노트 이미지
export interface NoteImage {
  imageId: number;
  noteId: string;
  imageUrl: string;
  imageName?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
  oriFileName: string;
  resizeImageUrl?: string;
}

// 노트 AI 향상 요청
export interface EnhanceNoteRequest {
  noteId: string;
  enhancementType: 'POLISHING' | 'SUMMARY' | 'FORMATTING';
}
