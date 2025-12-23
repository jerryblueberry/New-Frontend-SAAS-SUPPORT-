/**
 * Worker Profile Hooks
 * 
 * TanStack Query hooks for worker profile (Step 1) API operations
 * 
 * Best Practices:
 * - Separation of concerns: API logic separate from state management
 * - Error handling: Consistent error handling and user feedback
 * - Optimistic updates: Better UX with immediate feedback
 * - Query invalidation: Proper cache management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { useWorkerProfileStore } from '../../stores/workerOnboardingStores/profileStore';

const API_URL = '/onboarding';

/**
 * API functions for worker profile
 */
export const profileApi = {
  /**
   * Fetch onboarding progress (includes profile data)
   * @returns {Promise} API response
   */
  fetchOnboardingProgress: async () => {
    const response = await api.get(`${API_URL}/resume`);
    return response.data;
  },

  /**
   * Save profile step
   * @param {Object} profileData - Profile data to save
   * @returns {Promise} API response
   */
  saveProfileStep: async (profileData) => {
    const response = await api.post(`${API_URL}/step/profile`, profileData);
    return response.data;
  },
};

/**
 * Hook for saving worker profile
 * 
 * Features:
 * - Automatic validation
 * - Error handling with toast notifications
 * - Query invalidation on success
 * - Progress tracking
 * 
 * @returns {Object} Mutation object with {mutate, isPending, error, etc.}
 */
/**
 * Hook for saving worker profile
 * 
 * @param {Object} options - Mutation options
 * @param {Function} options.onSuccess - Callback called on successful save (receives response data)
 * @returns {Object} Mutation object with {mutate, isPending, error, etc.}
 */
export const useProfileMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const { getProfileForSubmission, updateProfile } = useWorkerProfileStore();
  const { onSuccess: customOnSuccess } = options;

  return useMutation({
    mutationFn: async (profileData) => {
      // CRITICAL: Always get latest CV from store to ensure we have the most up-to-date value
      // This prevents stale CV data from being submitted
      const latestStoreData = getProfileForSubmission();
      
      // Use provided data or get from store, but always prefer latest CV from store
      const dataToSend = profileData 
        ? { ...profileData, CV: profileData.CV || latestStoreData.CV }
        : latestStoreData;

      // Validate CV is present
      if (!dataToSend.CV) {
        throw new Error('CV is required. Please upload your resume.');
      }

      // Validate CV structure if it's an object
      if (typeof dataToSend.CV === 'object') {
        const requiredFields = ['url', 'publicId', 'fileName', 'fileType'];
        const missingFields = requiredFields.filter(
          (field) => !dataToSend.CV[field]
        );

        if (missingFields.length > 0) {
          throw new Error(
            `CV is missing required fields: ${missingFields.join(', ')}`
          );
        }
      }

      // Validate expected hourly rate
      if (!dataToSend.expectedHourlyRate || dataToSend.expectedHourlyRate < 20) {
        throw new Error('Expected hourly rate must be at least $20');
      }

      // Validate skills
      if (!dataToSend.skillTags || dataToSend.skillTags.length === 0) {
        throw new Error('Please add at least one skill');
      }

      // Validate languages
      if (!dataToSend.languages || dataToSend.languages.length === 0) {
        throw new Error('Please add at least one language');
      }

      // Format languages for API (ensure consistent structure)
      const formattedData = {
        ...dataToSend,
        languages: (dataToSend.languages || []).map((lang) => {
          // Handle both possible structures
          const languageName =
            typeof lang.language === 'string'
              ? lang.language
              : lang.language?.language || lang.language;

          return {
            language: languageName,
            proficiency: lang.proficiency || 'fluent',
          };
        }),
      };

      return await profileApi.saveProfileStep(formattedData);
    },
    onMutate: async (profileData) => {
      // Optimistic update: Update store immediately
      if (profileData) {
        updateProfile(profileData);
      }

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['onboarding'] });
      
      // Return context for onSuccess callback
      return { onSuccess: customOnSuccess };
    },
    onSuccess: (data, variables, context) => {
      if (data.success) {
        // CRITICAL: Sync CV from response back to store if provided
        // This ensures store has the latest CV data from backend
        if (data.data?.CV) {
          const { updateCV } = useWorkerProfileStore.getState();
          updateCV(data.data.CV);
        }

        // Invalidate queries - OnboardingPrompt component will handle refetch via mutation subscription
        queryClient.invalidateQueries({ queryKey: ['onboarding', 'status'] });
        queryClient.invalidateQueries({ queryKey: ['onboarding'] });

        // Show success message
        toast.success('Profile saved successfully!', {
          position: 'top-right',
          duration: 3000,
        });

        // Call custom onSuccess callback if provided (for navigation)
        if (context?.onSuccess) {
          context.onSuccess(data);
        }
      } else {
        throw new Error(data.message || 'Failed to save profile');
      }
    },
    onError: (error) => {
      // Extract error message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to save profile. Please try again.';

      // Show error toast
      toast.error(errorMessage, {
        position: 'top-right',
        duration: 4000,
      });

      console.error('Profile mutation error:', error);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
    },
  });
};

/**
 * Hook for fetching onboarding progress
 * 
 * This is a shared hook that can be used across all onboarding steps
 * For profile-specific usage, use the main onboarding query hook
 * 
 * @returns {Object} Query object with {data, isLoading, error, etc.}
 */
export const useOnboardingProgressQuery = () => {
  const { updateProfile } = useWorkerProfileStore();

  return useQuery({
    queryKey: ['onboarding'],
    queryFn: async () => {
      try {
        const response = await profileApi.fetchOnboardingProgress();
        
        if (!response.success && response.message === 'Worker profile not found') {
          return { success: true, data: null, isNewUser: true };
        }

        // Hydrate profile store if data exists
        if (response.success && response.data?.profile) {
          const profile = response.data.profile;
          updateProfile({
            biography: profile.biography || '',
            skillTags: profile.skillTags || [],
            expectedHourlyRate: profile.expectedHourlyRate || 0,
            languages:
              profile.languages?.map((lang) => ({
                language: { language: lang.language },
                proficiency: lang.proficiency,
              })) || [],
            CV: profile.CV || null,
          });
        }

        return response;
      } catch (error) {
        if (error.response?.status === 404) {
          return { success: true, data: null, isNewUser: true };
        }
        throw error;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

