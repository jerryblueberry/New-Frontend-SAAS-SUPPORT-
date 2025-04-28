// src/stores/useOnboardingStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  QueryClient
} from '@tanstack/react-query';
import api from '../api/axios';
import{daysOfWeek} from  '../utils/constants'
// Create QueryClient to be exported and used in your App provider
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dgsphdhns';
const CLOUDINARY_UPLOAD_PRESET = 'Certificate(Saas)';
const CLOUDINARY_FOLDER = 'SAAS(Support Worker)';
const API_URL = '/onboarding';

// API functions that can be used both internally and externally
export const onboardingApi = {
  fetchOnboardingProgress: async () => {
    const response = await api.get(`${API_URL}/resume`);
    return response.data;
  },
  
  saveProfileStep: async (profileData) => {
    const response = await api.post(`${API_URL}/step/profile`, profileData);
    return response.data;
  },
  
  saveAvailabilityStep: async (availabilityData) => {
    const response = await api.post(`${API_URL}/step/availability`, availabilityData);
    return response.data;
  },
  
  saveCertificationsStep: async (certificationsData) => {
    const response = await api.post(`${API_URL}/step/certifications`, certificationsData);
    return response.data;
  },
  
  saveWorkHistoryStep: async (workHistoryData) => {
    try {
      const response = await api.post(`${API_URL}/step/work-history`, workHistoryData);
      return response.data;
    } catch (error) {
      // Extract meaningful error message from response
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Failed to save Profile , Please check your data.';
      throw new Error(errorMessage);
    }
  },
  
  completeOnboarding: async () => {
    try {
      const response = await api.post(`${API_URL}/complete`);
    return response.data;
    } catch (error) {
            // Extract meaningful error message from response
            const errorMessage = error.response?.data?.message || 
            error.response?.data?.error ||
            'Failed to save work history. Please check your data.';
throw new Error(errorMessage);

    }
    
  }
};

// Initial state object for reuse
const initialState = {
  // Current step state
  currentStep: 1,
  
  // Form data sections
  profile: {
    biography: '',
    skillTags: [],
    expectedHourlyRate: 0,
  },
  
  availability: {
    weeklySchedule: [
      { day: 'Monday', slots: [] },
      { day: 'Tuesday', slots: [] },
      { day: 'Wednesday', slots: [] },
      { day: 'Thursday', slots: [] },
      { day: 'Friday', slots: [] },
      { day: 'Saturday', slots: [] },
      { day: 'Sunday', slots: [] },
    ],
    customTimeSlots: [],
    notes: '',
  },
  
  certifications: [],
  
  workHistory: {
    jobs: [],
    noWorkHistory: false,
    hasReferences: 'no',
    references: [],
  },
  
  // Profile completeness
  profileCompleteness: {
    percentage: 0,
    completedSections: {
      basicInfo: false,
      availability: false,
      certifications: false,
      workHistory: false,
    },
  },
};

// Create store with Zustand
const useOnboardingStore = create(
  persist(
    (set, get) => ({
      ...initialState,
      isLoading: false,
      error: null,
      
      // Navigation actions
      nextStep: () => {
        const currentStep = get().currentStep;
        if (currentStep < 4) {
          set({ currentStep: currentStep + 1 });
          window.scrollTo(0, 0);
        }
      },
      
      prevStep: () => {
        const currentStep = get().currentStep;
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
          window.scrollTo(0, 0);
        }
      },
      
      setStep: (step) => {
        if (step >= 1 && step <= 4) {
          set({ currentStep: step });
          window.scrollTo(0, 0);
        }
      },
      
      // Update form data sections
      updateProfile: (profileData) => {
        set((state) => ({
          profile: { ...state.profile, ...profileData },
        }));
      },
      checkPersistence: async () => {
        const { fetchOnboardingProgress, hydrateFromApi, resetStore } = get();
        try {
          const data = await fetchOnboardingProgress();
          if (data.success && data.data) {
            hydrateFromApi(data.data);
          } else {
            resetStore();
          }
        } catch (error) {
          console.error('Failed to check persistence:', error);
          resetStore();
        }
      },
      availability: {
        weeklySchedule: daysOfWeek.map(day => ({
          day,
          slots: []
        })),
        customTimeSlots: [],
        notes: ''
      },
      updateAvailability: (availabilityData) => {
        set((state) => ({
          availability: { ...state.availability, ...availabilityData },
        }));
      },
      
      toggleTimeSlot: (dayIndex, slotValue) => {
        set((state) => {
          const updatedSchedule = [...state.availability.weeklySchedule];
          const daySlots = updatedSchedule[dayIndex].slots;
          
          if (daySlots.includes(slotValue)) {
            updatedSchedule[dayIndex].slots = daySlots.filter(slot => slot !== slotValue);
          } else {
            updatedSchedule[dayIndex].slots = [...daySlots, slotValue];
          }
          
          return {
            availability: {
              ...state.availability,
              weeklySchedule: updatedSchedule
            }
          };
        });
      },
      

      //  Add Custom Timeslot
      addCustomTimeSlot: (slot) => {
        set(state => ({
          availability: {
            ...state.availability,
            customTimeSlots: [...state.availability.customTimeSlots, slot]
          }
        }));
      },

      removeCustomTimeSlot: (index) => {
        set(state => {
          const newSlots = [...state.availability.customTimeSlots];
          newSlots.splice(index, 1);
          return {
            availability: {
              ...state.availability,
              customTimeSlots: newSlots
            }
          };
        });
      }, 
      
      updateCertifications: (certificationsData) => {
        set({ certifications: certificationsData });
      },
      
      addCertification: (certification) => {
        set((state) => ({
          certifications: [...state.certifications, certification]
        }));
      },
      
      removeCertification: async (index) => {
        const state = get();
        const certToRemove = state.certifications[index];

        try {
          // Delete all associated documents from Cloudinary
          if (certToRemove.documents?.length > 0) {
            await Promise.all(
              certToRemove.documents.map((doc) =>
                cloudinaryService.deleteFile(doc.publicId)
              )
            );
          }

          // Update local state
          set((state) => ({
            certifications: state.certifications.filter((_, i) => i !== index),
          }));

          toast.success('Certification removed');
          return true;
        } catch (error) {
          toast.error('Failed to remove certification');
          console.error('Error removing certification:', error);
          return false;
        }
      },
      

      removeCertificationDocument: (certIndex, docIndex) => {
        set((state) => {
          const cert = state.certifications[certIndex];
          if (!cert?.documents) return state;
      
          const updatedDocuments = cert.documents.filter((_, i) => i !== docIndex);
          const updatedCertifications = [...state.certifications];
          updatedCertifications[certIndex] = { 
            ...updatedCertifications[certIndex], 
            documents: updatedDocuments 
          };
          
          return { certifications: updatedCertifications };
        });
      },


      // Update the certification
      updateCertificationAtIndex: (index, field, value) => {
        set((state) => {
          const updatedCerts = [...state.certifications];
          updatedCerts[index] = { ...updatedCerts[index], [field]: value };
          return { certifications: updatedCerts };
        });
      },
      
      updateWorkHistory: (workHistoryData) => {
        set((state) => ({
          workHistory: { ...state.workHistory, ...workHistoryData },
        }));
      },
      
      addJob: (job) => {
        set((state) => ({
          workHistory: {
            ...state.workHistory,
            jobs: [...state.workHistory.jobs, job],
          },
        }));
      },
      
      removeJob: (index) => {
        set((state) => ({
          workHistory: {
            ...state.workHistory,
            jobs: state.workHistory.jobs.filter((_, i) => i !== index),
          },
        }));
      },
      
      // States for handling API operations
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      updateProfileCompleteness: (data) => {
        if (data?.profileCompletion) {
          set({ 
            profileCompleteness: data.profileCompletion
          });
        }
      },
      
      // Data hydration from API
      hydrateFromApi: (data) => {
        if (!data) return;
        
        const { profile, profileCompletion, currentStep } = data;
        
        set({
          currentStep: currentStep || 1,
          profile: {
            biography: profile?.biography || '',
            skillTags: profile?.skillTags || [],
            expectedHourlyRate: profile?.expectedHourlyRate || 0,
          },
          availability: {
            weeklySchedule: profile?.availability?.weeklySchedule || get().availability.weeklySchedule,
            customTimeSlots: profile?.availability?.customTimeSlots || [],
            notes: profile?.availability?.notes || '',
          },
          certifications: profile?.certifications || [],
          workHistory: {
            jobs: profile?.workHistory || [],
            noWorkHistory: profile?.noWorkHistory || false,
            hasReferences: profile?.references?.length > 0 ? 'yes' : 'no',
            references: profile?.references || [],
          },
          profileCompleteness: profileCompletion || get().profileCompleteness,
        });
      },
      
      // Reset store to initial state
      resetStore: () => {
        set(initialState);
      },
      
      // Legacy methods that integrate with TanStack Query
      // These methods remain for backward compatibility but now use queryClient internally
      fetchOnboardingProgress: async () => {
        try {
          set({ isLoading: true, error: null });
          const data = await onboardingApi.fetchOnboardingProgress();
          
          if (data.success) {
            get().hydrateFromApi(data.data);
          }
          return data;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to fetch onboarding progress' });
          console.error(error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      saveProfileStep: async () => {
        try {
          set({ isLoading: true, error: null });
          const { biography, skillTags, expectedHourlyRate } = get().profile;
          
          const data = await onboardingApi.saveProfileStep({
            biography,
            skillTags,
            expectedHourlyRate
          });
          
          if (data.success) {
            get().updateProfileCompleteness(data.data);
            queryClient.invalidateQueries({ queryKey: ['onboarding'] });
            get().nextStep();
          }
          return data;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to save profile data' });
          console.error(error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      saveAvailabilityStep: async () => {
        try {
          set({ isLoading: true, error: null });
          const { weeklySchedule, customTimeSlots, notes } = get().availability;
          
          const data = await onboardingApi.saveAvailabilityStep({
            availability: {
              weeklySchedule,
              customTimeSlots,
            },
            availabilityNotes: notes
          });
          
          if (data.success) {
            get().updateProfileCompleteness(data.data);
            queryClient.invalidateQueries({ queryKey: ['onboarding'] });
            get().nextStep();
          }
          return data;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to save availability data' });
          console.error(error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      saveCertificationsStep: async () => {
        try {
          set({ isLoading: true, error: null });
          const certifications = get().certifications;
          
          const data = await onboardingApi.saveCertificationsStep({
            certifications
          });
          
          if (data.success) {
            get().updateProfileCompleteness(data.data);
            queryClient.invalidateQueries({ queryKey: ['onboarding'] });
            get().nextStep();
          }
          return data;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to save certifications data' });
          console.error(error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      saveWorkHistoryStep: async () => {
        try {
          set({ isLoading: true, error: null });
          const { jobs, noWorkHistory, hasReferences, references } = get().workHistory;
          
          const data = await onboardingApi.saveWorkHistoryStep({
            workHistory: jobs,
            noWorkHistory,
            hasReferences,
            references: hasReferences === 'yes' ? references : []
          });
          
          if (data.success) {
            get().updateProfileCompleteness(data.data);
            queryClient.invalidateQueries({ queryKey: ['onboarding'] });
            return data;
          }
          return data;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to save work history data' });
          console.error(error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      completeOnboarding: async () => {
        try {
          set({ isLoading: true, error: null });
          const data = await onboardingApi.completeOnboarding();
          
          if (data.success) {
            // Clear the persisted state after successful completion
            queryClient.invalidateQueries({ queryKey: ['onboarding'] });
            get().resetStore();
          }
          return data;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to complete onboarding' });
          console.error(error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => localStorage), // Use localStorage for security
      partialize: (state) => ({
        currentStep: state.currentStep,
        profile: state.profile,
        availability: state.availability,
        certifications: state.certifications,
        workHistory: state.workHistory,
        profileCompleteness: state.profileCompleteness,
      }),
    }
  )
);

// Custom hooks to use with TanStack Query
// Updated implementation of useOnboardingQuery function in useOnboardingStore.js
export const useOnboardingQuery = () => {
  return useQuery({
    queryKey: ['onboarding'],
    queryFn: async () => {
      try {
        const response = await onboardingApi.fetchOnboardingProgress();
        if (!response.success && response.message === 'Worker profile not found') {
          return { success: true, data: null, isNewUser: true };
        }
        return response;
      } catch (error) {
        if (error.response?.status === 404) {
          return { success: true, data: null, isNewUser: true };
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data?.success && data.data) {
        const store = useOnboardingStore.getState();
        store.hydrateFromApi(data.data);
      }
    },
    retry: false, // Disable retries to prevent loops
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};

// Custom mutation hooks for form submissions
export const useProfileMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (profileData) => {
      // Get state directly when needed, don't use a hook
      const { profile } = useOnboardingStore.getState();
      return onboardingApi.saveProfileStep(profileData || profile);
    },
    onSuccess: (data) => {
      if (data.success) {
        // Get state and actions directly to avoid render loops
        const { updateProfileCompleteness, nextStep } = useOnboardingStore.getState();
        updateProfileCompleteness(data.data);
        queryClient.invalidateQueries({ queryKey: ['onboarding'] });
        nextStep();
      }
    },
  });
};


export const useAvailabilityMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (availabilityData) => {
      // Direct state access
      const { availability } = useOnboardingStore.getState();
      const { weeklySchedule, customTimeSlots, notes } = availabilityData || availability;
      
      return onboardingApi.saveAvailabilityStep({
        availability: {
          weeklySchedule,
          customTimeSlots,
        },
        availabilityNotes: notes
      });
    },
    onSuccess: (data) => {
      if (data.success) {
        // Direct access to actions
        const { updateProfileCompleteness, nextStep } = useOnboardingStore.getState();
        updateProfileCompleteness(data.data);
        queryClient.invalidateQueries({ queryKey: ['onboarding'] });
        nextStep();
      }
    },
  });
};

export const useCertificationsMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (certifications) => {
      try {
        const { certifications: storeCertifications } = useOnboardingStore.getState();
        const certsToSave = certifications || storeCertifications;
        
        const response = await onboardingApi.saveCertificationsStep({
          certifications: certsToSave.map(cert => ({
            ...cert,
            documents: cert.documents || [] // Ensure documents array exists
          }))
        });

        if (!response.success) {
          throw new Error(response.message || "Failed to save certifications");
        }
        return response;
      } catch (error) {
        throw new Error(error.message || "Failed to save certifications");
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        const { updateProfileCompleteness, nextStep } = useOnboardingStore.getState();
        updateProfileCompleteness(data.data);
        queryClient.invalidateQueries({ queryKey: ['onboarding'] });
        nextStep();
      }
    },
    onError: (error) => {
      toast.error(error.message, {
        position: 'top-right',
        duration: 4000
      });
    }
  });
};

export const useWorkHistoryMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (workHistoryData) => {
      try {
        const { workHistory } = useOnboardingStore.getState();
        const dataToUse = workHistoryData || workHistory;
        
        const response = await onboardingApi.saveWorkHistoryStep({
          workHistory: dataToUse.jobs || dataToUse.workHistory || [],
          noWorkHistory: dataToUse.noWorkHistory || false,
          hasReferences: dataToUse.hasReferences || 'no',
          references: formatReferences(dataToUse)
        });

        if (!response.success) {
          throw new Error(response.message || "Profile is not complete yet");
        }
        return response;
      } catch (error) {
        throw new Error(error.message || "Failed to save work history");
      }
    },
    onSuccess: (data) => {
      const { updateProfileCompleteness } = useOnboardingStore.getState();
      updateProfileCompleteness(data.data);
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
    },
    onError: (error) => {
      toast.error(error.message, {
        position: 'top-right',
        duration: 4000
      });
    }
  });
};
// Helper function to format references from form data
function formatReferences(formData) {
  if (formData.hasReferences !== 'yes') return [];
  
  const references = [];
  
  // Add reference 1 if it has a name
  if (formData.reference1Name) {
    references.push({
      name: formData.reference1Name,
      company: formData.reference1Company || '',
      phone: formData.reference1Phone || '',
      email: formData.reference1Email || ''
    });
  }
  
  // Add reference 2 if it has a name
  if (formData.reference2Name) {
    references.push({
      name: formData.reference2Name,
      company: formData.reference2Company || '',
      phone: formData.reference2Phone || '',
      email: formData.reference2Email || ''
    });
  }
  
  return references;
}

export const useCompleteOnboardingMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: onboardingApi.completeOnboarding,
    onSuccess: (data) => {
      if (data.success) {
        const { resetStore } = useOnboardingStore.getState();
        queryClient.invalidateQueries({ queryKey: ['onboarding'] });
        // Don't reset the store right away, wait for redirect
        useOnboardingStore.setState({ onboardingCompleted: true });
      } else {
        // Throw the error to trigger onError handler
        throw new Error(data.message || "Profile is not complete yet");
      }
    },
    onError: (error) => {
      // This will show the toast for both network errors and our business logic errors
      toast.error(error.message, {
        duration: 4000,
        position: 'top-right',
      });
    }
  });
};
export default useOnboardingStore;