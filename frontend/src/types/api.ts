export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
  }
  
  export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  export interface ErrorResponse {
    success: false;
    message: string;
    code?: string;
  }
  