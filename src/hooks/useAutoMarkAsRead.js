// src/hooks/useAutoMarkAsRead.js
import { useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { notificationAPI } from '../api/notifications';
import useNotificationStore from '../stores/notificationStore';
import { notificationKeys } from './useNotifications';

/**
 * Production-ready auto mark-as-read hook with:
 * - Debounced batch API calls
 * - Optimistic UI updates
 * - Request queue management
 * - Retry logic
 * - Duplicate call prevention
 * - Touch support for mobile
 */
export const useAutoMarkAsRead = (options = {}) => {
  const {
    debounceMs = 800, // Debounce delay for batch processing
    batchSize = 5, // Max notifications per batch
    enableOptimistic = true, // Enable optimistic updates
    enableRetry = true, // Enable retry on failure
    maxRetries = 2, // Max retry attempts
    retryDelay = 1000 // Delay between retries
  } = options;

  const queryClient = useQueryClient();
  const { decrementUnreadCount, updateRecentNotification } = useNotificationStore();

  // Tracking refs
  const pendingQueue = useRef(new Set()); // Queue of IDs to mark as read
  const processingSet = useRef(new Set()); // IDs currently being processed
  const processedSet = useRef(new Set()); // IDs already processed (cache)
  const failedSet = useRef(new Map()); // Failed IDs with retry count: Map<id, retryCount>
  const timeoutRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Optimistic update helper
  const optimisticUpdate = useCallback((notificationIds) => {
    if (!enableOptimistic) return;

    notificationIds.forEach(id => {
      // Update all list queries in cache
      const queryCache = queryClient.getQueryCache();
      const listQueries = queryCache.findAll({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && 
                 key[0] === 'notifications' && 
                 key[1] === 'list';
        }
      });
      
      listQueries.forEach(query => {
        const data = query.state.data;
        if (data?.data?.notifications) {
          query.setData({
            ...data,
            data: {
              ...data.data,
              notifications: data.data.notifications.map(notif =>
                notificationIds.includes(notif._id)
                  ? { ...notif, read: true, readAt: new Date() }
                  : notif
              )
            }
          });
        }
      });

      // Update notification store
      updateRecentNotification(id, { read: true, readAt: new Date() });
      decrementUnreadCount();
    });
  }, [enableOptimistic, queryClient, updateRecentNotification, decrementUnreadCount]);

  // Batch mark as read API call
  const batchMarkAsRead = useCallback(async (notificationIds) => {
    if (!notificationIds.length || isProcessingRef.current) return;

    // Filter out already processed or currently processing
    const idsToProcess = notificationIds.filter(
      id => !processedSet.current.has(id) && !processingSet.current.has(id)
    );

    if (!idsToProcess.length) return;

    isProcessingRef.current = true;
    idsToProcess.forEach(id => processingSet.current.add(id));

    try {
      // Optimistic update
      optimisticUpdate(idsToProcess);

      // Process in batches to avoid overwhelming the API
      const batches = [];
      for (let i = 0; i < idsToProcess.length; i += batchSize) {
        batches.push(idsToProcess.slice(i, i + batchSize));
      }

          // Execute batches sequentially to avoid rate limiting
      const results = [];
      for (const batch of batches) {
        try {
          // Use Promise.allSettled to handle partial failures gracefully
          const batchResults = await Promise.allSettled(
            batch.map(id => notificationAPI.markAsRead(id))
          );

          // Track successful and failed operations
          batchResults.forEach((result, index) => {
            const id = batch[index];
            if (result.status === 'fulfilled') {
              processedSet.current.add(id);
              processingSet.current.delete(id);
              failedSet.current.delete(id);
              results.push({ id, success: true });
            } else {
              processingSet.current.delete(id);
              failedSet.current.set(id, (failedSet.current.get(id) || 0) + 1);
              results.push({ id, success: false, error: result.reason });
            }
          });
        } catch (error) {
          // If entire batch fails, mark all as failed
          batch.forEach(id => {
            processingSet.current.delete(id);
            failedSet.current.set(id, (failedSet.current.get(id) || 0) + 1);
          });
        }
      }

      // Retry failed requests if enabled
      if (enableRetry) {
        const toRetry = idsToProcess.filter(id => {
          const retryCount = failedSet.current.get(id) || 0;
          return retryCount > 0 && retryCount <= maxRetries;
        });

        if (toRetry.length > 0) {
          setTimeout(() => {
            batchMarkAsRead(toRetry);
          }, retryDelay);
        }
      }

      // Invalidate queries to sync with server
      queryClient.invalidateQueries(notificationKeys.unreadCount());
      queryClient.invalidateQueries(notificationKeys.recent());
      
      return results;
    } catch (error) {
      console.error('Batch mark as read error:', error);
      // Revert optimistic update on critical failure
      if (enableOptimistic) {
        queryClient.invalidateQueries(notificationKeys.lists());
      }
      throw error;
    } finally {
      isProcessingRef.current = false;
      pendingQueue.current.clear();
    }
  }, [
    batchSize,
    enableOptimistic,
    enableRetry,
    maxRetries,
    retryDelay,
    optimisticUpdate,
    queryClient
  ]);

  // Debounced batch processor
  const debouncedBatchProcessor = useCallback(
    debounce((ids) => {
      if (ids.length > 0) {
        batchMarkAsRead(Array.from(ids));
      }
    }, debounceMs),
    [debounceMs, batchMarkAsRead]
  );

  // Main function: mark notification as read on hover/touch
  const markAsReadOnHover = useCallback((notificationId, isRead) => {
    // Skip if already read, processed, or currently processing
    if (
      isRead ||
      processedSet.current.has(notificationId) ||
      processingSet.current.has(notificationId) ||
      pendingQueue.current.has(notificationId)
    ) {
      return;
    }

    // Add to pending queue
    pendingQueue.current.add(notificationId);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Schedule batch processing
    timeoutRef.current = setTimeout(() => {
      debouncedBatchProcessor(pendingQueue.current);
    }, debounceMs);
  }, [debounceMs, debouncedBatchProcessor]);

  // Mark notification as read immediately (for click events)
  const markAsReadImmediate = useCallback((notificationId, isRead) => {
    if (isRead || processedSet.current.has(notificationId)) {
      return;
    }

    // Process immediately without debounce
    batchMarkAsRead([notificationId]);
  }, [batchMarkAsRead]);

  // Mark multiple notifications as read (for viewport-based marking)
  const markMultipleAsRead = useCallback((notificationIds) => {
    const unreadIds = notificationIds.filter(
      id => !processedSet.current.has(id) && !processingSet.current.has(id)
    );

    if (unreadIds.length === 0) return;

    unreadIds.forEach(id => pendingQueue.current.add(id));
    debouncedBatchProcessor(pendingQueue.current);
  }, [debouncedBatchProcessor]);

  // Clear cache and reset state
  const clearViewedCache = useCallback(() => {
    pendingQueue.current.clear();
    processingSet.current.clear();
    // Optionally clear processed cache to allow re-processing
    // processedSet.current.clear();
    failedSet.current.clear();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Process any remaining items in queue before component unmounts
  useEffect(() => {
    return () => {
      if (pendingQueue.current.size > 0) {
        debouncedBatchProcessor(pendingQueue.current);
      }
    };
  }, [debouncedBatchProcessor]);

  return {
    markAsReadOnHover, // For hover/touch events (debounced batch processing)
    markAsReadImmediate, // For click events (immediate processing)
    markMultipleAsRead, // For batch viewport-based marking
    clearViewedCache, // Clear tracking cache
    isProcessing: isProcessingRef.current, // Processing state
    pendingCount: pendingQueue.current.size, // Pending items count
    processedCount: processedSet.current.size // Processed items count
  };
};

export default useAutoMarkAsRead;
