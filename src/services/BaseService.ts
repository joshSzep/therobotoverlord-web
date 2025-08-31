/**
 * Base service class for API interactions
 * Provides common functionality for all service classes
 */

import { apiClient } from '@/lib/api-client';
import { ApiResponse, PaginatedResponse } from '@/types/api';

export abstract class BaseService {
  protected readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic GET request
   */
  protected async get<T>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.get(`${this.baseUrl}${endpoint}`, { params }) as any;
    return response.data;
  }

  /**
   * Generic POST request
   */
  protected async post<T>(
    endpoint: string,
    data?: unknown,
    config?: any
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.post(`${this.baseUrl}${endpoint}`, data, config) as any;
    return response.data;
  }

  /**
   * Generic PUT request
   */
  protected async put<T>(
    endpoint: string,
    data?: unknown,
    config?: any
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.put(`${this.baseUrl}${endpoint}`, data, config) as any;
    return response.data;
  }

  /**
   * Generic PATCH request
   */
  protected async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: any
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.patch(`${this.baseUrl}${endpoint}`, data, config) as any;
    return response.data;
  }

  /**
   * Generic DELETE request
   */
  protected async delete<T>(
    endpoint: string,
    config?: any
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.delete(`${this.baseUrl}${endpoint}`, config) as any;
    return response.data;
  }

  /**
   * Handle paginated requests
   */
  protected async getPaginated<T>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<PaginatedResponse<T>> {
    const response = await this.get<T[]>(endpoint, params);
    
    // Extract pagination info from headers or response
    const totalCount = response.metadata?.totalCount || 0;
    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || 10;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: response.data || [],
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      metadata: response.metadata,
    };
  }

  /**
   * Build query parameters for API requests
   */
  protected buildParams(params: any): Record<string, string> {
    const cleanParams: Record<string, string> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          cleanParams[key] = value.join(',');
        } else {
          cleanParams[key] = String(value);
        }
      }
    });

    return cleanParams;
  }

  /**
   * Handle file uploads
   */
  protected async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const response = await apiClient.post(`${this.baseUrl}${endpoint}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }) as any;

    return response.data;
  }

  /**
   * Handle batch operations
   */
  protected async batch<T>(
    endpoint: string,
    operations: Array<{ method: string; data?: unknown; id?: string }>
  ): Promise<ApiResponse<T[]>> {
    const response = await apiClient.post(`${this.baseUrl}${endpoint}/batch`, {
      operations,
    }) as any;

    return response.data;
  }
}
