/**
 * Utility functions for handling API responses
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

/**
 * Safely parse API response with proper error handling
 */
export async function parseApiResponse<T = any>(response: Response): Promise<ApiResponse<T>> {
  const status = response.status;
  
  if (response.ok) {
    try {
      const data = await response.json();
      return {
        success: true,
        data,
        status
      };
    } catch (parseError) {
      console.error('Error parsing success response:', parseError);
      return {
        success: true,
        data: null as T,
        status
      };
    }
  } else {
    // Handle error responses
    let errorMessage = `HTTP ${status}: ${response.statusText}`;
    
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } else {
        // If response is not JSON, try to get text
        const errorText = await response.text();
        if (errorText) {
          errorMessage = errorText;
        }
      }
    } catch (parseError) {
      console.error('Error parsing error response:', parseError);
      // Keep the default HTTP error message
    }
    
    return {
      success: false,
      error: errorMessage,
      status
    };
  }
}

/**
 * Make API request with proper error handling
 */
export async function apiRequest<T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    return await parseApiResponse<T>(response);
  } catch (networkError) {
    console.error('Network error:', networkError);
    return {
      success: false,
      error: networkError instanceof Error ? networkError.message : 'Network error occurred',
      status: 0
    };
  }
}

/**
 * Handle API response in UI components
 */
export function handleApiResponse<T>(
  response: ApiResponse<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    successMessage?: string;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
  } = {}
) {
  const {
    onSuccess,
    onError,
    successMessage,
    showSuccessToast = true,
    showErrorToast = true
  } = options;

  if (response.success) {
    if (successMessage && showSuccessToast) {
      // Note: Import toast from sonner in the component using this function
      console.log('Success:', successMessage);
    }
    if (onSuccess && response.data) {
      onSuccess(response.data);
    }
  } else {
    if (showErrorToast && response.error) {
      // Note: Import toast from sonner in the component using this function
      console.error('Error:', response.error);
    }
    if (onError && response.error) {
      onError(response.error);
    }
  }
  
  return response;
}