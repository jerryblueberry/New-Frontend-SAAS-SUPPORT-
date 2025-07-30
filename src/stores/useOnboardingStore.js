/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// src/stores/useOnboardingStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from '@tanstack/react-query';
import api from '../api/axios';
import { daysOfWeek } from '../utils/constants';
import { toast } from 'react-hot-toast';
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
    const response = await api.post(
      `${API_URL}/step/availability`,
      availabilityData
    );
    return response.data;
  },

  saveCertificationsStep: async (certificationsData) => {
    // Updated to match the controller requirements
    const response = await api.post(
      `${API_URL}/step/certifications`,
      certificationsData
    );
    return response.data;
  },

  //  save for the health Info
  // In your onboardingApi object
  // In your onboardingApi object
  saveHealthInfoStep: async (healthData) => {
    const response = await api.post(`${API_URL}/step/health-info`, healthData);
    return response.data;
  },
  saveWorkHistoryStep: async (workHistoryData) => {
    try {
      const response = await api.post(
        `${API_URL}/step/work-history`,
        workHistoryData
      );
      return response.data;
    } catch (error) {
      // Extract meaningful error message from response
      const errorMessage =
        error.response?.data?.message ||
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
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to save work history. Please check your data.';
      throw new Error(errorMessage);
    }
  },

  fetchUserUpcomingHolidays: async () => {
    const response = await api.get(`/upcoming-holidays/my`);
    return response.data;
  },

  createUserUpcomingHoliday: async (holidayData) => {
    const response = await api.post(`/upcoming-holidays/create`, holidayData);
    return response.data;
  },
};

// Initial state object for reuse
const initialState = {
  // Current step state
  currentStep: 1,
  completedSteps: [],

  // Form data sections
  profile: {
    biography: '',
    skillTags: [],
    expectedHourlyRate: 0,
    languages: [],
  },

  availability: {
    // weeklySchedule: [
    //   { day: 'Monday', slots: [] },
    //   { day: 'Tuesday', slots: [] },
    //   { day: 'Wednesday', slots: [] },
    //   { day: 'Thursday', slots: [] },
    //   { day: 'Friday', slots: [] },
    //   { day: 'Saturday', slots: [] },
    //   { day: 'Sunday', slots: [] },
    // ],
    customTimeSlots: [],
    // notes: '',
    kmWillingToTravel: 20,
    suburb: '',
    holidaySelections: {},
  },

  certifications: [],
  // Add otherCertifications for additional certificates
  otherCertifications: [],

  // Added nationality and residencyStatus fields for certifications
  // nationality: '',
  residencyStatus: '',

  healthInformation: {
    hasWorkersCompensation: false,
    workersCompensationDetails: null,
    hasMedicalConditions: false,
    medicalConditionsDescription: null,
    conditionsAffectingWork: null,
    covidVaccinated: false,
    fluVaccinated: false,
    otherVaccinations: [],
    hasHealthClearance: false,
    healthClearanceDate: null,
    clearanceNotes: null,
    canLiftPatients: true,
    requiresSpecialAccommodation: false,
  },

  workHistory: {
    jobs: [],
    references: [],
    CV: '',
  },

  // Profile completeness
  profileCompleteness: {
    percentage: 0,
    completedSections: {
      basicInfo: false,
      availability: false,
      certifications: false,
      healthInformation: false,
      workHistory: false,
    },
  },
  upcomingHolidays: [], // Add this for holidays
};

// Add document tracking functionality to the store
const useOnboardingStore = create(
  persist(
    (set, get) => ({
      ...initialState,
      isLoading: false,
      error: null,

      // Document tracking state
      documentTracking: {
        trackedDocuments: {},
        lastSync: null,
        isSyncing: false
      },

      // Document tracking actions
      addTrackedDocument: async (publicId, documentData = {}) => {
        try {
          const state = get();
          const updatedTracking = {
            ...state.documentTracking.trackedDocuments,
            [publicId]: {
              publicId,
              trackedAt: new Date().toISOString(),
              ...documentData
            }
          };

          // Update local state immediately
          set((state) => ({
            documentTracking: {
              ...state.documentTracking,
              trackedDocuments: updatedTracking
            }
          }));

          // Sync to database in background
          get().syncDocumentTrackingToDatabase();
          
          return true;
        } catch (error) {
          console.error('Error adding tracked document:', error);
          return false;
        }
      },

      removeTrackedDocument: async (publicId) => {
        try {
          const state = get();
          const updatedTracking = { ...state.documentTracking.trackedDocuments };
          delete updatedTracking[publicId];

          // Update local state immediately
          set((state) => ({
            documentTracking: {
              ...state.documentTracking,
              trackedDocuments: updatedTracking
            }
          }));

          // Sync to database in background
          get().syncDocumentTrackingToDatabase();
          
          return true;
        } catch (error) {
          console.error('Error removing tracked document:', error);
          return false;
        }
      },

      getTrackedDocuments: () => {
        const state = get();
        return state.documentTracking.trackedDocuments;
      },

      isDocumentTracked: (publicId) => {
        const state = get();
        return state.documentTracking.trackedDocuments.hasOwnProperty(publicId);
      },

      // Sync document tracking with database
      syncDocumentTrackingToDatabase: async () => {
        try {
          const state = get();
          if (state.documentTracking.isSyncing) return; // Prevent concurrent syncs

          set((state) => ({
            documentTracking: {
              ...state.documentTracking,
              isSyncing: true
            }
          }));

          const trackedDocs = state.documentTracking.trackedDocuments;
          const documents = Object.values(trackedDocs).map(doc => ({
            documentName: doc.documentName || `Document ${doc.publicId}`,
            documentType: doc.documentType || 'Support Worker',
            documentUrl: doc.publicId,
            publicId: doc.publicId,
            fileName: doc.fileName || '',
            fileType: doc.fileType || '',
            uploadDate: doc.trackedAt || new Date(),
            isVerified: false,
            additionalInfo: doc.additionalInfo || {}
          }));

          if (documents.length > 0) {
            await api.post('/documents-tracking/save', { documents });
          }

          set((state) => ({
            documentTracking: {
              ...state.documentTracking,
              lastSync: new Date().toISOString(),
              isSyncing: false
            }
          }));

          console.log('Document tracking synced to database');
        } catch (error) {
          console.error('Error syncing document tracking to database:', error);
          set((state) => ({
            documentTracking: {
              ...state.documentTracking,
              isSyncing: false
            }
          }));
        }
      },

      // Load document tracking from database
      loadDocumentTrackingFromDatabase: async () => {
        try {
          const response = await api.get('/documents-tracking/user');
          if (response.data.success && response.data.data) {
            const documents = response.data.data.overAlldocuments || [];
            const trackedDocs = {};
            
            documents.forEach(doc => {
              if (doc.documentUrl) {
                trackedDocs[doc.documentUrl] = {
                  publicId: doc.documentUrl,
                  documentName: doc.documentName,
                  documentType: doc.documentType,
                  fileName: doc.fileName,
                  fileType: doc.fileType,
                  trackedAt: doc.uploadDate,
                  additionalInfo: doc.additionalInfo || {}
                };
              }
            });

            set((state) => ({
              documentTracking: {
                ...state.documentTracking,
                trackedDocuments: trackedDocs,
                lastSync: new Date().toISOString()
              }
            }));

            console.log('Document tracking loaded from database');
          }
        } catch (error) {
          console.error('Error loading document tracking from database:', error);
        }
      },

      // Cleanup orphaned documents
      cleanupOrphanedDocuments: async () => {
        try {
          const state = get();
          const trackedDocs = state.documentTracking.trackedDocuments;
          const currentDocs = state.certifications.flatMap(cert => 
            cert.documents?.map(doc => doc.publicId).filter(Boolean) || []
          );

          // Find orphaned documents
          const orphanedDocs = Object.keys(trackedDocs).filter(
            publicId => !currentDocs.includes(publicId)
          );

          // Remove orphaned documents
          for (const publicId of orphanedDocs) {
            await get().removeTrackedDocument(publicId);
          }

          if (orphanedDocs.length > 0) {
            console.log(`Cleaned up ${orphanedDocs.length} orphaned documents`);
          }
        } catch (error) {
          console.error('Error cleaning up orphaned documents:', error);
        }
      },

      // Get document tracking statistics
      getDocumentTrackingStats: () => {
        const state = get();
        const trackedDocs = state.documentTracking.trackedDocuments;
        const publicIds = Object.keys(trackedDocs);

        return {
          totalTracked: publicIds.length,
          publicIds: publicIds,
          lastSync: state.documentTracking.lastSync,
          isSyncing: state.documentTracking.isSyncing
        };
      },

      // Clear all document tracking
      clearAllDocumentTracking: async () => {
        try {
          set((state) => ({
            documentTracking: {
              trackedDocuments: {},
              lastSync: null,
              isSyncing: false
            }
          }));

          // Also clear from database
          await api.delete('/documents-tracking/clear');
          console.log('All document tracking cleared');
        } catch (error) {
          console.error('Error clearing document tracking:', error);
        }
      },

      // Navigation actions
      nextStep: () => {
        const currentStep = get().currentStep;
        if (currentStep < 5) {
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
        if (step >= 1 && step <= 5) {
          set({ currentStep: step });
          window.scrollTo(0, 0);
        }
      },

      //  Helper function to store the langugage
      // Update the language-related actions in the store:

      // Add language with proper structure
      addLanguage: (languageObj) =>
        set((state) => ({
          profile: {
            ...state.profile,
            languages: [
              ...(state.profile.languages || []),
              {
                language: { language: languageObj.language }, // Nested structure
                proficiency: languageObj.proficiency,
              },
            ],
          },
        })),

      // Remove language
      removeLanguage: (languageToRemove) => {
        set((state) => ({
          profile: {
            ...state.profile,
            languages: state.profile.languages.filter(
              (lang) =>
                lang.language.language !== languageToRemove.language.language
            ),
          },
        }));
      },

      // Update language proficiency
      updateLanguageProficiency: (languageName, proficiency) => {
        set((state) => {
          const updatedLanguages = state.profile.languages.map((lang) => {
            if (lang.language.language === languageName) {
              return { ...lang, proficiency };
            }
            return lang;
          });
          return {
            profile: {
              ...state.profile,
              languages: updatedLanguages,
            },
          };
        });
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

      updateAvailability: (availabilityData) => {
        set((state) => ({
          availability: { ...state.availability, ...availabilityData },
        }));
      },

      setHolidaySelections: (holidaySelections) => {
        set((state) => ({
          availability: {
            ...state.availability,
            holidaySelections,
          },
        }));
      },

      // toggleTimeSlot: (dayIndex, slotValue) => {
      //   set((state) => {
      //     const updatedSchedule = [...state.availability.weeklySchedule];
      //     const daySlots = updatedSchedule[dayIndex].slots;

      //     if (daySlots.includes(slotValue)) {
      //       updatedSchedule[dayIndex].slots = daySlots.filter(
      //         (slot) => slot !== slotValue
      //       );
      //     } else {
      //       updatedSchedule[dayIndex].slots = [...daySlots, slotValue];
      //     }

      //     return {
      //       availability: {
      //         ...state.availability,
      //         weeklySchedule: updatedSchedule,
      //       },
      //     };
      //   });
      // },

      
  // Adding the suburb liek the customTimeSlot
  
      // Add Custom Timeslot
      addCustomTimeSlot: (slot) => {
        set((state) => ({
          availability: {
            ...state.availability,
            customTimeSlots: [...state.availability.customTimeSlots, slot],
          },
        }));
      },

      removeCustomTimeSlot: (index) => {
        set((state) => {
          const newSlots = [...state.availability.customTimeSlots];
          newSlots.splice(index, 1);
          return {
            availability: {
              ...state.availability,
              customTimeSlots: newSlots,
            },
          };
        });
      },

      // Updated certification methods
      updateCertifications: (certificationsData) => {
        set({ certifications: certificationsData });
      },

      // Update nationality and residency status
      // updateNationality: (nationality) => {
      //   set({ nationality });
      // },

      updateResidencyStatus: (residencyStatus) => {
        set({ residencyStatus });
      },

      addCertification: (certification) => {
        set((state) => ({
          certifications: [...state.certifications, certification],
        }));
      },

      removeCertification: async (index) => {
        const state = get();
        const certToRemove = state.certifications[index];

        try {
          // Delete all associated documents from Cloudinary
          // if (certToRemove.documents?.length > 0) {
          //   await Promise.all(
          //     certToRemove.documents.map((doc) =>
          //       cloudinaryService.deleteFile(doc.publicId)
          //     )
          //   );
          // }

          // Update local state
          set((state) => ({
            certifications: state.certifications.filter((_, i) => i !== index),
          }));

          // toast.success('Certification removed');
          return true;
        } catch (error) {
          // toast.error('Failed to remove certification');
          console.error('Error removing certification:', error);
          return false;
        }
      },

      removeCertificationDocument: (certIndex, docIndex) => {
        set((state) => {
          const cert = state.certifications[certIndex];
          if (!cert?.documents) return state;

          const updatedDocuments = cert.documents.filter(
            (_, i) => i !== docIndex
          );
          const updatedCertifications = [...state.certifications];
          updatedCertifications[certIndex] = {
            ...updatedCertifications[certIndex],
            documents: updatedDocuments,
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

      //  FOr the health Information
      addVaccination: (vaccination) => {
        set((state) => ({
          healthInformation: {
            ...state.healthInformation,
            otherVaccinations: [
              ...(state.healthInformation?.otherVaccinations || []),
              vaccination,
            ],
          },
        }));
      },

      removeVaccination: (index) => {
        set((state) => {
          const newVaccinations = [
            ...(state.healthInformation?.otherVaccinations || []),
          ];
          newVaccinations.splice(index, 1);
          return {
            healthInformation: {
              ...state.healthInformation,
              otherVaccinations: newVaccinations,
            },
          };
        });
      },

      updateHealthInformation: (data) => {
        set((state) => ({
          healthInformation: {
            ...state.healthInformation,
            ...data,
          },
        }));
      },

      updateWorkHistory: (workHistoryData) => {
        console.log('Updating work history:', workHistoryData); // Debug log
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

      addReference: () => {
        set((state) => {
          const currentRefs = state.workHistory.references || [];
          if (currentRefs.length >= 2) {
            console.warn('Maximum 2 references allowed');
            return state; // Don't add more than 2 references
          }

          const newReference = {
            name: '',
            position: '',
            company: '',
            phone: '',
            email: '',
          };

          return {
            workHistory: {
              ...state.workHistory,
              references: [...currentRefs, newReference],
            },
          };
        });
      },

      removeReference: (index) => {
        set((state) => {
          const currentRefs = state.workHistory.references || [];
          const updatedRefs = currentRefs.filter((_, i) => i !== index);

          return {
            workHistory: {
              ...state.workHistory,
              references: updatedRefs,
            },
          };
        });
      },

      updateReference: (index, referenceData) => {
        set((state) => {
          const currentRefs = [...(state.workHistory.references || [])];
          if (currentRefs[index]) {
            currentRefs[index] = { ...currentRefs[index], ...referenceData };
          }

          return {
            workHistory: {
              ...state.workHistory,
              references: currentRefs,
            },
          };
        });
      },

      // Add this new method
      updateCV: (cvUrl) => {
        console.log('Updating CV in store:', cvUrl);
        set((state) => ({
          workHistory: {
            ...state.workHistory,
            CV: cvUrl,
          },
        }));
      },

      // States for handling API operations
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      updateProfileCompleteness: (data) => {
        if (data?.profileCompletion) {
          set({
            profileCompleteness: data.profileCompletion,
          });
        }
      },

      // Data hydration from API
      hydrateFromApi: (data) => {
        if (!data) return;

        const { profile, profileCompletion, currentStep } = data;
        // Determine completed steps based on profileCompletion
        const completedSteps = [];
        if (profileCompletion?.completedSections?.basicInfo)
          completedSteps.push(1);
        if (profileCompletion?.completedSections?.workHistory)
          completedSteps.push(2);
        if (profileCompletion?.completedSections?.availability)
          completedSteps.push(3);
        if (profileCompletion?.completedSections?.certifications)
          completedSteps.push(4);
        if (profileCompletion?.completedSections?.healthInformation)
          completedSteps.push(5);
        set({
          currentStep: currentStep || 1,
          completedSteps,
          profile: {
            biography: profile?.biography || '',
            skillTags: profile?.skillTags || [],
            expectedHourlyRate: profile?.expectedHourlyRate || 0,
            languages:
              data.profile?.languages?.map((lang) => ({
                language: { language: lang.language },
                proficiency: lang.proficiency,
              })) || [],
          },
          availability: {
            customTimeSlots: profile?.availability?.customTimeSlots || get().availability.customTimeSlots,
            kmWillingToTravel: profile?.availability?.kmWillingToTravel || 20,
            suburb: profile?.availability?.suburb || '',
            holidaySelections: Array.isArray(profile?.availability?.holidaySelections)
              ? Object.fromEntries(
                  profile.availability.holidaySelections.map(sel => [
                    sel.holidayId,
                    { selected: sel.selected, note: sel.note }
                  ])
                )
              : {},
          },
          certifications: profile?.certifications || [],
          otherCertifications: profile?.otherCertifications || [], // Hydrate otherCertifications
          residencyStatus: profile?.residencyStatus || '',
          healthInformation: profile?.healthInformation || get().healthInformation,
          workHistory: {
            jobs: profile?.workHistory || [],
            references: profile?.references || [],
            CV: profile?.CV || null,
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
          set({
            error:
              error.response?.data?.message ||
              'Failed to fetch onboarding progress',
          });
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
            expectedHourlyRate,
            languages,
          });

          if (data.success) {
            get().updateProfileCompleteness(data.data);
            queryClient.invalidateQueries({ queryKey: ['onboarding'] });
            get().nextStep();
          }
          return data;
        } catch (error) {
          set({
            error:
              error.response?.data?.message || 'Failed to save profile data',
          });
          console.error(error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      saveAvailabilityStep: async () => {
        try {
          set({ isLoading: true, error: null });
          const { customTimeSlots, kmWillingToTravel, suburb, holidaySelections } = get().availability;

          // Local validation
          if (!customTimeSlots || customTimeSlots.length === 0) {
            throw new Error('At least one custom time slot is required');
          }
          if (
            typeof kmWillingToTravel !== 'number' ||
            kmWillingToTravel < 1 ||
            kmWillingToTravel > 100
          ) {
            throw new Error('Travel distance must be between 1 and 100 km');
          }
          if (!suburb || !suburb.trim()) {
            throw new Error('Suburb is required');
          }

          const data = await onboardingApi.saveAvailabilityStep({
            availability: {
              customTimeSlots,
              kmWillingToTravel,
              suburb: suburb.trim(),
              holidaySelections: holidaySelections || {},
            },
          });

          if (data.success) {
            get().updateProfileCompleteness(data.data);
            queryClient.invalidateQueries({ queryKey: ['onboarding'] });
            get().nextStep();
          }
          return data;
        } catch (error) {
          set({
            error: error.message || 'Failed to save availability data',
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Updated to match the controller requirements
      saveCertificationsStep: async () => {
        try {
          set({ isLoading: true, error: null });
          const certifications = get().certifications;
          // const nationality = get().nationality;
          const residencyStatus = get().residencyStatus;

          // Validate required fields before sending to API
          if (
            // !nationality
            // ||
            !residencyStatus
          ) {
            throw new Error('Nationality and residency status are required');
          }

          const data = await onboardingApi.saveCertificationsStep({
            certifications,
            // nationality,
            residencyStatus,
          });

          if (data.success) {
            get().updateProfileCompleteness(data.data);
            queryClient.invalidateQueries({ queryKey: ['onboarding'] });
           
            get().nextStep();
          }
          return data;
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              'Failed to save certifications data',
          });
          console.error(error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // saveHealthInfoStep Action
      saveHealthInfoStep: async () => {
        try {
          set({ isLoading: true, error: null });
          const healthInfo = get().healthInformation;

          // Ensure all required boolean fields have explicit values
          const sanitizedHealthInfo = {
            hasWorkersCompensation: healthInfo.hasWorkersCompensation ?? false,
            workersCompensationDetails:
              healthInfo.workersCompensationDetails || null,
            hasMedicalConditions: healthInfo.hasMedicalConditions ?? false,
            medicalConditionsDescription:
              healthInfo.medicalConditionsDescription || null,
            conditionsAffectingWork: healthInfo.conditionsAffectingWork || null,
            covidVaccinated: healthInfo.covidVaccinated ?? false,
            fluVaccinated: healthInfo.fluVaccinated ?? false,
            otherVaccinations: healthInfo.otherVaccinations || [],
            hasHealthClearance: healthInfo.hasHealthClearance ?? false,
            healthClearanceDate: healthInfo.healthClearanceDate || null,
            clearanceNotes: healthInfo.clearanceNotes || null,
            canLiftPatients: healthInfo.canLiftPatients ?? true,

            requiresSpecialAccommodation:
              healthInfo.requiresSpecialAccommodation ?? false,

          };

          const data =
            await onboardingApi.saveHealthInfoStep(sanitizedHealthInfo);

          if (data.success) {
            get().updateProfileCompleteness(data.data);
            queryClient.invalidateQueries({ queryKey: ['onboarding'] });
            get().nextStep();
          }
          return data;
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              'Failed to save health information',
          });
          throw error; // Re-throw to let mutation handle it
        } finally {
          set({ isLoading: false });
        }
      },

      saveWorkHistoryStep: async () => {
        try {
          set({ isLoading: true, error: null });
          const { jobs, references, CV } = get().workHistory;

          const data = await onboardingApi.saveWorkHistoryStep({
            workHistory: jobs,
            references: references || [],
            CV: CV || null,
          });

          if (data.success) {
            // Update the store with the returned data including CV
            set((state) => ({
              workHistory: {
                ...state.workHistory,
                CV: data.data.CV || CV, // Use returned CV or keep existing
              },
            }));
            get().updateProfileCompleteness(data.data);
            queryClient.invalidateQueries({ queryKey: ['onboarding'] });
            return data;
          }
          return data;
        } catch (error) {
          set({
            error:
              error.response?.data?.message ||
              'Failed to save work history data',
          });
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
          set({
            error:
              error.response?.data?.message || 'Failed to complete onboarding',
          });
          console.error(error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Other Certifications actions
      addOtherCertificate: (cert) => set((state) => ({
        otherCertifications: [...state.otherCertifications, cert],
      })),
      removeOtherCertificate: (index) => set((state) => ({
        otherCertifications: state.otherCertifications.filter((_, i) => i !== index),
      })),
      updateOtherCertificates: (certs) => set({ otherCertifications: certs }),

      // --- Upcoming Holidays Actions ---
      fetchAndSetUpcomingHolidays: async () => {
        try {
          const holidays = await onboardingApi.fetchUserUpcomingHolidays();
          holidays.sort((a, b) => new Date(a.startDate) - new Date(b.startDate) || new Date(a.endDate) - new Date(b.endDate));
          set({ upcomingHolidays: holidays });
        } catch (error) {
          set({ upcomingHolidays: [] });
        }
      },
      addUpcomingHoliday: async (holidayData) => {
        const newHoliday = await onboardingApi.createUserUpcomingHoliday(holidayData);
        set((state) => ({
          upcomingHolidays: [...state.upcomingHolidays, newHoliday].sort(
            (a, b) => new Date(a.startDate) - new Date(b.startDate) || new Date(a.endDate) - new Date(b.endDate)
          ),
        }));
      },
      // --- End Upcoming Holidays Actions ---
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => localStorage), // Use localStorage for security
      partialize: (state) => ({
        currentStep: state.currentStep,
        profile: state.profile,
        availability: state.availability,
        certifications: state.certifications,
        otherCertifications: state.otherCertifications, // persist otherCertifications
        healthInformation: state.healthInformation,
        // nationality: state.nationality,
        residencyStatus: state.residencyStatus,
        workHistory: state.workHistory,
        profileCompleteness: state.profileCompleteness,
        upcomingHolidays: state.upcomingHolidays,
        documentTracking: state.documentTracking, // persist document tracking
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
        if (
          !response.success &&
          response.message === 'Worker profile not found'
        ) {
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
      const { profile } = useOnboardingStore.getState();
      const dataToSend = profileData || profile;
      return onboardingApi.saveProfileStep({
        biography: dataToSend.biography,
        skillTags: dataToSend.skillTags,
        expectedHourlyRate: dataToSend.expectedHourlyRate,
        languages: dataToSend.languages.map((lang) => ({
          language: lang.language.language, // Send just the string
          proficiency: lang.proficiency,
        })),
      });
    },
    onSuccess: (data) => {
      if (data.success) {
        const { updateProfileCompleteness, nextStep } =
          useOnboardingStore.getState();
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
      const { customTimeSlots, kmWillingToTravel, suburb, holidaySelections } = availabilityData || availability;

      // Local validation
      if (!customTimeSlots || customTimeSlots.length === 0) {
        throw new Error('At least one custom time slot is required');
      }
      if (
        typeof kmWillingToTravel !== 'number' ||
        kmWillingToTravel < 1 ||
        kmWillingToTravel > 100
      ) {
        throw new Error('Travel distance must be between 1 and 100 km');
      }
      if (!suburb || !suburb.trim()) {
        throw new Error('Suburb is required');
      }

      return onboardingApi.saveAvailabilityStep({
        availability: {
          customTimeSlots,
          kmWillingToTravel,
          suburb: suburb.trim(),
          holidaySelections: holidaySelections || {},       
        },
      });
    },
    onSuccess: (data) => {
      if (data.success) {
        // Direct access to actions
        const { updateProfileCompleteness, nextStep } =
          useOnboardingStore.getState();
        updateProfileCompleteness(data.data);
        queryClient.invalidateQueries({ queryKey: ['onboarding'] });
        nextStep();
      }
    },
  });
};

// Updated to match controller requirements
export const useCertificationsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      try {
        const {
          certifications: storeCertifications,
          residencyStatus,
        } = useOnboardingStore.getState();

        // Use provided data or get from state
        const certsToSave = data?.certifications || storeCertifications;
        const residencyStatusToSave = data?.residencyStatus || residencyStatus;
        const allCertTypes = data?.allCertificationTypes; // NEW: Accept allCertificationTypes

        // Check required fields
        if (!residencyStatusToSave) {
          throw new Error('Residency status is required');
        }

        // Ensure all certifications have certificationType and required fields
        for (const cert of certsToSave) {
          if (!cert.certificationType) {
            throw new Error('All certifications must have a certificationType');
          }

          // Find certification type details from the provided allCertTypes
          if (allCertTypes) {
            const certType = allCertTypes.find(t => t._id === cert.certificationType);
            if (!certType) {
              throw new Error(`Certification type not found for ID: ${cert.certificationType}`);
            }

            // Validate education-specific fields
            if (certType.isEducation) {
              if (!Array.isArray(cert.degree) || cert.degree.length === 0) {
                throw new Error(`At least one degree is required for ${certType.name}`);
              }
              // Validate that all degrees are non-empty strings
              if (!cert.degree.every(deg => deg && typeof deg === 'string' && deg.trim().length > 0)) {
                throw new Error(`All degrees must be valid non-empty strings for ${certType.name}`);
              }
              // Optional: Check against predefined options if they exist, but don't require it
              if (
                certType.educationSetting?.degreeOptions &&
                certType.educationSetting.degreeOptions.length > 0
              ) {
                // Log a warning for degrees not in predefined list, but don't block submission
                const invalidDegrees = cert.degree.filter(d => !certType.educationSetting.degreeOptions.includes(d));
                if (invalidDegrees.length > 0) {
                  console.warn(`Custom degrees detected for ${certType.name}:`, invalidDegrees);
                }
              }
            }

            // Validate other required fields
            if (certType.requiredFields) {
              for (const field of certType.requiredFields) {
                if (!cert[field]) {
                  throw new Error(`Missing required field '${field}' for ${certType.name}`);
                }
              }
            }
          }
        }

        const response = await onboardingApi.saveCertificationsStep({
          certifications: certsToSave.map((cert) => ({
            ...cert,
            documents: cert.documents || [], // Ensure documents array exists
          })),
          residencyStatus: residencyStatusToSave,
        });

        if (!response.success) {
          throw new Error(response.message || 'Failed to save certifications');
        }
        return response;
      } catch (error) {
        throw new Error(error.message || 'Failed to save certifications');
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        // Robustly extract profileCompleteness from backend response
        const profileCompleteness = data.data?.profileCompletion || data.data?.profileCompleteness;
        if (profileCompleteness) {
          useOnboardingStore.getState().updateProfileCompleteness({ profileCompletion: profileCompleteness });
        }
        // Always invalidate and refetch onboarding query
        queryClient.invalidateQueries({ queryKey: ['onboarding'] });
        useOnboardingStore.getState().nextStep();
      }
    },
    onError: (error) => {
      toast.error(error.message, {
        position: 'top-right',
        duration: 4000,
      });
    },
  });
};

//  for the health information

// Add this mutation hook after the useCertificationsMutation function in your useOnboardingStore.js file

export const useHealthInfoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (healthData) => {
      try {
        // Create a properly formatted payload
        const payload = {
          healthInformation: {
            hasWorkersCompensation:
              healthData.hasWorkersCompensation !== undefined
                ? healthData.hasWorkersCompensation
                : false,
            workersCompensationDetails: healthData.hasWorkersCompensation
              ? healthData.workersCompensationDetails
              : null,
            hasMedicalConditions:
              healthData.hasMedicalConditions !== undefined
                ? healthData.hasMedicalConditions
                : false,
            medicalConditionsDescription: healthData.hasMedicalConditions
              ? healthData.medicalConditionsDescription
              : null,
            conditionsAffectingWork: healthData.requiresSpecialAccommodation
              ? healthData.conditionsAffectingWork
              : null,
            covidVaccinated:
              healthData.covidVaccinated !== undefined
                ? healthData.covidVaccinated
                : false,
            fluVaccinated:
              healthData.fluVaccinated !== undefined
                ? healthData.fluVaccinated
                : false,
            otherVaccinations: healthData.otherVaccinations || [],
            hasHealthClearance:
              healthData.hasHealthClearance !== undefined
                ? healthData.hasHealthClearance
                : false,
            healthClearanceDate: healthData.hasHealthClearance
              ? healthData.healthClearanceDate
              : null,
            clearanceNotes: healthData.clearanceNotes || null,
            canLiftPatients:
              healthData.canLiftPatients !== undefined
                ? healthData.canLiftPatients
                : true,

            requiresSpecialAccommodation:
              healthData.requiresSpecialAccommodation !== undefined
                ? healthData.requiresSpecialAccommodation
                : false,

          },
        };

        const response = await onboardingApi.saveHealthInfoStep(payload);

        if (!response.success) {
          throw new Error(
            response.message || 'Failed to save health information'
          );
        }
        return response;
      } catch (error) {
        let errorMessage = 'Failed to save health information';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        const { updateProfileCompleteness, nextStep } =
          useOnboardingStore.getState();
        updateProfileCompleteness(data.data);
        queryClient.invalidateQueries({ queryKey: ['onboarding'] });
        nextStep();
      }
    },
    onError: (error) => {
      toast.error(error.message, {
        position: 'top-right',
        duration: 4000,
      });
    },
  });
};

export const useWorkHistoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workHistoryData) => {
      try {
        const { workHistory } = useOnboardingStore.getState();
        const dataToUse = workHistoryData || workHistory;

        // Enhanced validation and formatting
        const formattedPayload = {
          workHistory: dataToUse.jobs || [],
          references: dataToUse.references || [],
          CV: dataToUse.CV || null,
        };

        console.log('Sending payload:', formattedPayload); // Debug log

        // Additional validation before sending
        if (formattedPayload.workHistory.length === 0) {
          throw new Error('At least one work experience is required');
        }

        const response =
          await onboardingApi.saveWorkHistoryStep(formattedPayload);

        if (!response.success) {
          throw new Error(response.message || 'Failed to save work history');
        }
        return response;
      } catch (error) {
        console.error('Work history mutation error:', error);
        throw new Error(error.message || 'Failed to save work history');
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
        duration: 4000,
      });
    },
  });
};

// Helper function to format references from form data
function formatReferences(formData) {
  console.log('Formatting references from:', formData); // Debug log

  if (formData.hasReferences !== 'yes') {
    return [];
  }

  const references = [];

  // Handle references array directly if it exists
  if (formData.references && Array.isArray(formData.references)) {
    formData.references.forEach((ref, index) => {
      if (ref.name && ref.name.trim()) {
        // Only add if name exists
        references.push({
          name: ref.name.trim(),
          company: ref.company ? ref.company.trim() : '',
          position: ref.position ? ref.position.trim() : '',
          phone: ref.phone ? ref.phone.trim() : '',
          email: ref.email ? ref.email.trim().toLowerCase() : '',
        });
      }
    });
  }

  // Fallback: Handle individual reference fields (reference1Name, reference2Name, etc.)
  if (references.length === 0) {
    // Add reference 1 if it has a name
    if (formData.reference1Name && formData.reference1Name.trim()) {
      references.push({
        name: formData.reference1Name.trim(),
        company: formData.reference1Company
          ? formData.reference1Company.trim()
          : '',
        position: formData.reference1Position
          ? formData.reference1Position.trim()
          : '',
        phone: formData.reference1Phone ? formData.reference1Phone.trim() : '',
        email: formData.reference1Email
          ? formData.reference1Email.trim().toLowerCase()
          : '',
      });
    }

    // Add reference 2 if it has a name
    if (formData.reference2Name && formData.reference2Name.trim()) {
      references.push({
        name: formData.reference2Name.trim(),
        company: formData.reference2Company
          ? formData.reference2Company.trim()
          : '',
        position: formData.reference2Position
          ? formData.reference2Position.trim()
          : '',
        phone: formData.reference2Phone ? formData.reference2Phone.trim() : '',
        email: formData.reference2Email
          ? formData.reference2Email.trim().toLowerCase()
          : '',
      });
    }
  }

  console.log('Formatted references:', references); // Debug log
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
        throw new Error(data.message || 'Profile is not complete yet');
      }
    },
    onError: (error) => {
      // This will show the toast for both network errors and our business logic errors
      toast.error(error.message, {
        duration: 4000,
        position: 'top-right',
      });
    },
  });
};

// Mutation hook for saving other certificates
export const useOtherCertificatesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/onboarding/other-certifications', data);
      if (!response.data.success) throw new Error(response.data.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
    },
  });
};
export default useOnboardingStore;
