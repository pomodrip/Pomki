export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  tags?: string[];
}

export interface UpdateNoteRequest {
  id: string;
  title?: string;
  content?: string;
  tags?: string[];
  isBookmarked?: boolean;
}

export interface NoteFilters {
  searchQuery: string;
  selectedTags: string[];
  showBookmarked: boolean;
}
