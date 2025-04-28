// src/hooks/useRefreshToken.js
import { useMutation } from '@tanstack/react-query';
import { refreshAuthToken } from '../api/auth';
import { useAuth } from './useAuth';

export const useRefreshToken = () => {
  const { signOut } = useAuth();
  
  return useMutation({
    mutationFn: refreshAuthToken,
    onError: (error) => {
      console.error('Token refresh failed:', error);
      signOut(); // Automatically logout on refresh failure
    }
  });
};