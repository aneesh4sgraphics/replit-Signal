import { queryClient } from './queryClient';

export const forceLogout = () => {
  // Clear all React Query cache
  queryClient.clear();
  
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Force redirect to logout endpoint
  window.location.href = '/api/logout';
};

export const refreshAuth = () => {
  // Invalidate the user query to force a fresh fetch
  queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
};