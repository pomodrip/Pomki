import { Note, CreateNoteRequest, UpdateNoteRequest } from '../types/note';
import { ApiResponse } from '../types/api';

const API_BASE_URL = '/api';

export const getNotes = async (): Promise<ApiResponse<Note[]>> => {
  const response = await fetch(`${API_BASE_URL}/notes`);
  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }
  return response.json();
};

export const getNoteById = async (id: string): Promise<ApiResponse<Note>> => {
  const response = await fetch(`${API_BASE_URL}/notes/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch note');
  }
  return response.json();
};

export const createNote = async (data: CreateNoteRequest): Promise<ApiResponse<Note>> => {
  const response = await fetch(`${API_BASE_URL}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create note');
  }
  return response.json();
};

export const updateNote = async (data: UpdateNoteRequest): Promise<ApiResponse<Note>> => {
  const response = await fetch(`${API_BASE_URL}/notes/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update note');
  }
  return response.json();
};

export const deleteNote = async (id: string): Promise<ApiResponse<null>> => {
  const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete note');
  }
  return response.json();
};
