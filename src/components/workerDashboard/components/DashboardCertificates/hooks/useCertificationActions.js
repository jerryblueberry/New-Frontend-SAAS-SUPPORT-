import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { deleteOtherCertificationById } from '../../../../../api/axios';
import { onboardingApi } from '../../../../../stores/useOnboardingStore';

/**
 * Custom hook for certification actions (delete, prefetch, etc.)
 */
export const useCertificationActions = () => {
  const queryClient = useQueryClient();
  const lastPrefetchAtRef = useRef(0);

  // Prefetch onboarding data (throttled)
  const prefetchOnboarding = useCallback(() => {
    const now = Date.now();
    // throttle: at most once every 2s
    if (now - lastPrefetchAtRef.current < 2000) return;

    // condition: skip if cache is warm (updated within last 2 minutes)
    const state = queryClient.getQueryState(['onboarding']);
    if (state?.dataUpdatedAt && now - state.dataUpdatedAt < 2 * 60 * 1000) {
      return;
    }

    lastPrefetchAtRef.current = now;
    try {
      queryClient.prefetchQuery({
        queryKey: ['onboarding'],
        queryFn: onboardingApi.fetchOnboardingProgress,
        staleTime: 5 * 60 * 1000
      });
    } catch (_) {
      // Silently fail
    }
  }, [queryClient]);

  // Delete other certification
  const handleDeleteOtherCertification = useCallback(async (certId) => {
    if (!certId) return;
    
    const confirmed = window.confirm('This will permanently delete the certification and its documents. Continue?');
    if (!confirmed) return;
    
    try {
      const hide = message.loading('Deleting certification...', 0);
      const res = await deleteOtherCertificationById(certId);
      hide();
      message.success(res?.data?.message || 'Certification deleted');
      
      // Trigger refresh event
      const evt = typeof window.CustomEvent === 'function' 
        ? new CustomEvent('onboarding:refresh') 
        : (function(){ 
            const ev = document.createEvent('Event'); 
            ev.initEvent('onboarding:refresh', true, true); 
            return ev; 
          })();
      window.dispatchEvent(evt);
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to delete certification');
    }
  }, []);

  // Trigger refresh event
  const triggerRefresh = useCallback(() => {
    try {
      const evt = typeof window.CustomEvent === 'function'
        ? new CustomEvent('onboarding:refresh')
        : (function(){ 
            const e = document.createEvent('Event'); 
            e.initEvent('onboarding:refresh', true, true); 
            return e; 
          })();
      window.dispatchEvent(evt);
    } catch (_) {
      // Silently fail
    }
  }, []);

  return {
    prefetchOnboarding,
    handleDeleteOtherCertification,
    triggerRefresh
  };
};
