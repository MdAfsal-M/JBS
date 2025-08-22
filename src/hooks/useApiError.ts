import { useCallback } from 'react';
import { toast } from 'sonner';

export const useApiError = () => {
  const handleError = useCallback((error: any, fallbackMessage?: string) => {
    const message = error?.message || fallbackMessage || 'An error occurred';
    
    if (error?.response?.status === 401) {
      toast.error('Session expired. Please login again.');
      // Redirect to login or refresh token
    } else if (error?.response?.status === 403) {
      toast.error('Access denied. You don\'t have permission for this action.');
    } else if (error?.response?.status === 404) {
      toast.error('Resource not found.');
    } else if (error?.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(message);
    }
  }, []);

  return { handleError };
};
