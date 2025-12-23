/**
 * Worker Profile Store
 * 
 * Manages state for Step 1 of worker onboarding (Profile)
 * Includes: biography, skillTags, expectedHourlyRate, languages, CV
 * 
 * Best Practices:
 * - Single responsibility: Only profile-related state
 * - Immutable updates: Always return new state objects
 * - Type-safe actions: Clear action names and parameters
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Initial profile state
const initialProfileState = {
  biography: '',
  skillTags: [],
  expectedHourlyRate: 0,
  languages: [],
  CV: null, // CV is mandatory, object with {url, publicId, fileName, fileType, fileSize, uploadedAt}
};

/**
 * Worker Profile Store
 * 
 * Manages all state related to worker profile (Step 1)
 */
export const useWorkerProfileStore = create(
  persist(
    (set, get) => ({
      // State
      ...initialProfileState,

      // Actions: Profile Updates
      /**
       * Update profile fields (partial update)
       * @param {Object} profileData - Partial profile data to update
       */
      updateProfile: (profileData) => {
        set((state) => {
          // Deep merge for nested objects like languages
          const updatedState = { ...state };
          
          // Handle each field individually for proper merging
          if (profileData.biography !== undefined) {
            updatedState.biography = profileData.biography;
          }
          if (profileData.skillTags !== undefined) {
            updatedState.skillTags = profileData.skillTags;
          }
          if (profileData.expectedHourlyRate !== undefined) {
            updatedState.expectedHourlyRate = profileData.expectedHourlyRate;
          }
          if (profileData.languages !== undefined) {
            updatedState.languages = profileData.languages;
          }
          if (profileData.CV !== undefined) {
            updatedState.CV = profileData.CV;
          }
          
          return updatedState;
        });
      },

      /**
       * Reset profile to initial state
       */
      resetProfile: () => {
        set(initialProfileState);
      },

      // Actions: CV Management
      /**
       * Update CV
       * @param {Object|null} cvData - CV object with {url, publicId, fileName, fileType, fileSize, uploadedAt} or null
       */
      updateCV: (cvData) => {
        set({ CV: cvData });
      },

      /**
       * Clear CV
       */
      clearCV: () => {
        set({ CV: null });
      },

      // Actions: Skills Management
      /**
       * Add a skill tag
       * @param {string} skill - Skill name to add
       */
      addSkill: (skill) => {
        const trimmedSkill = skill.trim();
        set((state) => {
          const currentSkills = state.skillTags || [];
          if (currentSkills.includes(trimmedSkill)) {
            return state; // Don't add duplicates
          }
          return {
            skillTags: [...currentSkills, trimmedSkill],
          };
        });
      },

      /**
       * Remove a skill tag
       * @param {string} skill - Skill name to remove
       */
      removeSkill: (skill) => {
        set((state) => ({
          skillTags: (state.skillTags || []).filter((s) => s !== skill),
        }));
      },

      /**
       * Update skill tags array
       * @param {string[]} skills - New skills array
       */
      setSkills: (skills) => {
        set({ skillTags: skills || [] });
      },

      // Actions: Languages Management
      /**
       * Add a language with proficiency
       * @param {Object} languageObj - {language: string, proficiency: string}
       */
      addLanguage: (languageObj) => {
        set((state) => {
          const currentLanguages = state.languages || [];
          const languageName = languageObj.language;

          // Check for duplicates
          const exists = currentLanguages.some((lang) => {
            const existingName =
              typeof lang.language === 'string'
                ? lang.language
                : lang.language?.language;
            return existingName === languageName;
          });

          if (exists) {
            return state; // Don't add duplicates
          }

          return {
            languages: [
              ...currentLanguages,
              {
                language: { language: languageName },
                proficiency: languageObj.proficiency || 'fluent',
              },
            ],
          };
        });
      },

      /**
       * Remove a language
       * @param {Object} languageToRemove - Language object to remove
       */
      removeLanguage: (languageToRemove) => {
        set((state) => {
          const currentLanguages = state.languages || [];
          const languageName =
            typeof languageToRemove.language === 'string'
              ? languageToRemove.language
              : languageToRemove.language?.language;

          return {
            languages: currentLanguages.filter((lang) => {
              const existingName =
                typeof lang.language === 'string'
                  ? lang.language
                  : lang.language?.language;
              return existingName !== languageName;
            }),
          };
        });
      },

      /**
       * Update language proficiency
       * @param {string} languageName - Name of the language
       * @param {string} proficiency - New proficiency level
       */
      updateLanguageProficiency: (languageName, proficiency) => {
        set((state) => {
          const updatedLanguages = (state.languages || []).map((lang) => {
            const existingName =
              typeof lang.language === 'string'
                ? lang.language
                : lang.language?.language;

            if (existingName === languageName) {
              return { ...lang, proficiency };
            }
            return lang;
          });

          return { languages: updatedLanguages };
        });
      },

      /**
       * Update languages array
       * @param {Array} languages - New languages array
       */
      setLanguages: (languages) => {
        set({ languages: languages || [] });
      },

      // Getters: Computed values
      /**
       * Get profile data for API submission
       * @returns {Object} Formatted profile data
       */
      getProfileForSubmission: () => {
        const state = get();
        return {
          biography: state.biography?.trim() || '',
          skillTags: state.skillTags || [],
          expectedHourlyRate: state.expectedHourlyRate || 0,
          languages: (state.languages || []).map((lang) => ({
            language:
              typeof lang.language === 'string'
                ? lang.language
                : lang.language?.language,
            proficiency: lang.proficiency,
          })),
          CV: state.CV,
        };
      },

      /**
       * Check if profile has required fields
       * @returns {boolean} True if profile is valid
       */
      isProfileValid: () => {
        const state = get();
        return (
          state.expectedHourlyRate > 0 &&
          (state.skillTags || []).length > 0 &&
          (state.languages || []).length > 0 &&
          state.CV !== null &&
          state.CV !== undefined
        );
      },
    }),
    {
      name: 'worker-profile-storage',
      storage: createJSONStorage(() => localStorage),
      // Best Practice: Don't persist biography - fetch from backend only
      // Only persist temporary edits for other fields (CV, skills, etc.)
      partialize: (state) => ({
        // Don't persist biography - always fetch from backend
        // biography: state.biography, // Removed - backend is source of truth
        skillTags: state.skillTags,
        expectedHourlyRate: state.expectedHourlyRate,
        languages: state.languages,
        CV: state.CV,
      }),
    }
  )
);

// Selectors for optimized re-renders
export const profileSelectors = {
  biography: (state) => state.biography,
  skillTags: (state) => state.skillTags,
  expectedHourlyRate: (state) => state.expectedHourlyRate,
  languages: (state) => state.languages,
  CV: (state) => state.CV,
  profile: (state) => ({
    biography: state.biography,
    skillTags: state.skillTags,
    expectedHourlyRate: state.expectedHourlyRate,
    languages: state.languages,
    CV: state.CV,
  }),
};

