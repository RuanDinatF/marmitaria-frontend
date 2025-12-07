import { ApiError } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      // Try to get error message from response body
      let errorMessage = response.statusText;
      try {
        const errorText = await response.text();
        console.log('[API Client] Error response text:', errorText);
        if (errorText) {
          // Try to parse as JSON first (backend returns ErrorResponse)
          try {
            const errorJson = JSON.parse(errorText);
            console.log('[API Client] Parsed error JSON:', errorJson);
            // Backend returns { status: number, message: string }
            if (errorJson.message) {
              errorMessage = errorJson.message;
            } else if (errorJson.error) {
              errorMessage = errorJson.error;
            } else {
              errorMessage = errorText;
            }
          } catch (parseError) {
            // If not JSON, use the text as is
            console.log('[API Client] Not JSON, using text as is');
            errorMessage = errorText;
          }
        }
      } catch (e) {
        // If we can't read the body, use statusText
        console.error('[API Client] Error reading response body:', e);
      }
      
      console.log('[API Client] Final error message:', errorMessage);
      throw new ApiError(response.status, response.statusText, errorMessage);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    // Check if response has content
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    // If no content or content-length is 0, return undefined
    if (contentLength === '0' || !contentType) {
      return undefined as T;
    }
    
    // If content-type is JSON, parse it
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    // For other content types (like text/plain), return as text
    // This handles the case where backend returns "Produto deletado."
    const text = await response.text();
    
    // If the text is empty, return undefined
    if (!text || text.trim() === '') {
      return undefined as T;
    }
    
    // Try to parse as JSON anyway (in case content-type is wrong)
    try {
      return JSON.parse(text);
    } catch {
      // If it's not JSON, return undefined for DELETE operations
      // or the text itself for other operations
      return undefined as T;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
