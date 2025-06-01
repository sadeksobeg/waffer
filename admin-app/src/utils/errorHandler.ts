import { AxiosError } from 'axios';

/**
 * Extract error message from API error response
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    // Handle Axios error
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const data = error.response.data;
      
      if (data.message) {
        return data.message;
      }
      
      if (data.error) {
        return typeof data.error === 'string' ? data.error : 'An error occurred';
      }
      
      if (error.response.status === 401) {
        return 'Unauthorized: Please log in again';
      }
      
      if (error.response.status === 403) {
        return 'Forbidden: You do not have permission to perform this action';
      }
      
      if (error.response.status === 404) {
        return 'Resource not found';
      }
      
      if (error.response.status === 500) {
        return 'Server error: Please try again later';
      }
      
      return `Error ${error.response.status}: ${error.response.statusText}`;
    }
    
    if (error.request) {
      // The request was made but no response was received
      return 'No response from server. Please check your internet connection';
    }
    
    // Something happened in setting up the request that triggered an Error
    return error.message || 'An error occurred';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};

/**
 * Format validation errors from API response
 */
export const formatValidationErrors = (error: unknown): Record<string, string> => {
  if (error instanceof AxiosError && error.response?.data?.errors) {
    const { errors } = error.response.data;
    
    if (typeof errors === 'object' && errors !== null) {
      return Object.entries(errors).reduce((acc, [field, messages]) => {
        acc[field] = Array.isArray(messages) ? messages[0] : messages as string;
        return acc;
      }, {} as Record<string, string>);
    }
  }
  
  return {};
};

/**
 * Handle API errors in a consistent way
 */
export const handleApiError = (
  error: unknown, 
  setError?: (message: string) => void,
  setFieldErrors?: (errors: Record<string, string>) => void
): void => {
  console.error('API Error:', error);
  
  // Set field-specific errors if available
  if (setFieldErrors) {
    const validationErrors = formatValidationErrors(error);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
    }
  }
  
  // Set general error message
  if (setError) {
    setError(getErrorMessage(error));
  }
};
