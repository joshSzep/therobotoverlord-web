/**
 * Common API response and request types for The Robot Overlord
 * Shared interfaces for API communication
 */

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: ApiError[];
  metadata?: ResponseMetadata;
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
  metadata?: ResponseMetadata;
}

// Response metadata
export interface ResponseMetadata {
  timestamp: string;
  requestId: string;
  version: string;
  totalCount?: number;
  processingTime?: number;
  rateLimit?: {
    limit: number;
    remaining: number;
    resetAt: string;
  };
  warnings?: string[];
}

// Pagination information
export interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  prevCursor?: string;
}

// Error response structure
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  field?: string;
  type: 'validation' | 'authentication' | 'authorization' | 'not_found' | 'server_error' | 'rate_limit' | 'business_logic';
  timestamp: string;
}

// Bulk operation response
export interface BulkOperationResponse<T> {
  success: T[];
  failed: Array<{
    item: T;
    error: ApiError;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// Search response
export interface SearchResponse<T> {
  results: T[];
  query: string;
  filters?: Record<string, unknown>;
  facets?: Record<string, Array<{
    value: string;
    count: number;
  }>>;
  suggestions?: string[];
  totalResults: number;
  searchTime: number;
  pagination: PaginationInfo;
}

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: string;
  id?: string;
  userId?: string;
  sessionId?: string;
}

// Real-time event types
export interface RealtimeEvent {
  type: 'post_created' | 'post_updated' | 'post_deleted' | 'post_voted' | 
        'topic_created' | 'topic_updated' | 'user_joined' | 'user_left' | 
        'notification' | 'moderation_action' | 'badge_awarded' | 'leaderboard_updated';
  data: unknown;
  userId?: string;
  topicId?: string;
  postId?: string;
  targetUsers?: string[];
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// File upload response
export interface FileUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    checksum: string;
  };
  uploadedAt: string;
  expiresAt?: string;
}

// Batch request wrapper
export interface BatchRequest<T> {
  operations: Array<{
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    body?: T;
    id?: string;
  }>;
  atomic?: boolean;
}

// Batch response wrapper
export interface BatchResponse<T> {
  responses: Array<{
    id?: string;
    status: number;
    data?: T;
    error?: ApiError;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// Health check response
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: Record<string, {
    status: 'up' | 'down' | 'degraded';
    responseTime?: number;
    lastCheck: string;
  }>;
  metrics?: {
    memoryUsage: number;
    cpuUsage: number;
    activeConnections: number;
  };
}

// Analytics response
export interface AnalyticsResponse {
  metrics: Record<string, number>;
  trends: Array<{
    date: string;
    value: number;
    change?: number;
  }>;
  breakdown: Record<string, Record<string, number>>;
  summary: {
    total: number;
    average: number;
    peak: number;
    growth: number;
  };
  period: {
    start: string;
    end: string;
    granularity: 'hour' | 'day' | 'week' | 'month';
  };
}

// Export response for data downloads
export interface ExportResponse {
  id: string;
  format: 'json' | 'csv' | 'xlsx' | 'pdf';
  downloadUrl: string;
  filename: string;
  size: number;
  recordCount: number;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
}
