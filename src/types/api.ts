/**
 * API type definitions for The Robot Overlord
 * Common API response and request types
 */

// Generic API response wrapper
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp?: string;
}

// Paginated response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
  total_pages: number;
}

// API error response
export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Request metadata
export interface RequestMetadata {
  request_id: string;
  timestamp: string;
  user_id?: string;
}

// File upload response
export interface FileUploadResponse {
  file_id: string;
  filename: string;
  url: string;
  size: number;
  content_type: string;
  uploaded_at: string;
}

// Health check response
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  services: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    websocket: 'up' | 'down';
  };
}

// WebSocket message types
export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  metadata?: {
    message_id: string;
    timestamp: string;
    user_id?: string;
  };
}

// Common filter and sort options
export interface FilterOptions {
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
}

// Bulk operation response
export interface BulkOperationResponse {
  success_count: number;
  error_count: number;
  errors?: Array<{
    item_id: string;
    error: string;
  }>;
}
