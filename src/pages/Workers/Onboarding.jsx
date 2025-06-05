import React, { useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkerProfileForm from '../../components/workerForm/WorkerProfileForm';
import AvailabilityForm from '../../components/workerForm/AvailabilityForm';
import CertificationsForm from '../../components/workerForm/CertificationsForm';
import WorkHistoryForm from '../../components/workerForm/WorkHistoryForm';
import ProgressBar from '../../components/ui/ProgressBar';
import useOnboardingStore, {
  useOnboardingQuery,
  useCompleteOnboardingMutation,
} from '../../stores/useOnboardingStore';
import { Toaster, toast } from 'react-hot-toast';
import CertificateSecond from '../CertificateCheck/CertificateSecond';
import HealthInformation from '../../components/workerForm/HealthInformation';

const Onboarding = () => {
  const navigate = useNavigate();

  // Get state directly to avoid re-renders
  const currentStep = useOnboardingStore((state) => state.currentStep);
  const profileCompleteness = useOnboardingStore(
    (state) => state.profileCompleteness
  );
  const resetStore = useOnboardingStore((state) => state.resetStore);
  const nextStep = useOnboardingStore((state) => state.nextStep);
  const prevStep = useOnboardingStore((state) => state.prevStep);
  const setStep = useOnboardingStore((state) => state.setStep);

  // Use TanStack Query for initial data fetching
  const {
    data: onboardingData,
    isLoading: isQueryLoading,
    error: queryError,
  } = useOnboardingQuery();

  useEffect(() => {
    const store = useOnboardingStore.getState();
    store.checkPersistence();
  }, []);
  const isHealthInfoComplete = (healthInfo) => {
    if (!healthInfo) return false;

    const requiredFields = [
      'hasWorkersCompensation',
      'hasMedicalConditions',
      'covidVaccinated',
      'fluVaccinated',
      'hasHealthClearance',
      'canLiftPatients',
      'hasMobilityIssues',
      'requiresSpecialAccommodation',
      'hasMentalHealthConcerns',
    ];

    // Check all required fields are present and not null/undefined
    const hasAllFields = requiredFields.every(
      (field) => healthInfo[field] !== null && healthInfo[field] !== undefined
    );

    // Check conditional requirements
    const conditionsMet =
      (!healthInfo.hasWorkersCompensation ||
        healthInfo.workersCompensationDetails) &&
      (!healthInfo.hasMedicalConditions ||
        healthInfo.medicalConditionsDescription) &&
      (!healthInfo.requiresSpecialAccommodation ||
        healthInfo.conditionsAffectingWork) &&
      (!healthInfo.hasMentalHealthConcerns ||
        healthInfo.mentalHealthImpactOnWork) &&
      (!healthInfo.hasHealthClearance || healthInfo.healthClearanceDate);

    return hasAllFields && conditionsMet;
  };
  // Determine completed steps based on profile completeness
  const completedSteps = useMemo(() => {
    const steps = [];
    if (profileCompleteness.completedSections.basicInfo) steps.push(1);
    if (profileCompleteness.completedSections.availability) steps.push(2);
    if (profileCompleteness.completedSections.certifications) steps.push(3);

    // Only mark health info complete if we've reached that step or beyond
    if (
      currentStep >= 4 &&
      profileCompleteness.completedSections.healthInformation
    ) {
      steps.push(4);
    }

    if (currentStep >= 5 && profileCompleteness.completedSections.workHistory) {
      steps.push(5);
    }
    return steps;
  }, [profileCompleteness, currentStep]);

  // Error handling
  const handleWorkHistoryError = useCallback((msg) => {
    toast.error(
      msg ||
        'Failed to save work history. Please check your data and try again.',
      {
        duration: 5000,
        position: 'top-right',
      }
    );
  }, []);

  // Completion mutation
  const { mutate: completeOnboarding, isPending: isCompleting } =
    useCompleteOnboardingMutation();

  // Handle completion
  const handleSubmitProfile = useCallback(() => {
    completeOnboarding(undefined, {
      onSuccess: () => navigate('/dashboard'),
      onError: (error) => handleWorkHistoryError(error.message),
    });
  }, [completeOnboarding, navigate, handleWorkHistoryError]);

  // Auth redirect effect
  useEffect(() => {
    if (queryError?.response?.status === 401) {
      navigate('/login');
    }
  }, [queryError, navigate]);

  // Handle new user state - runs once
  useEffect(() => {
    if (!isQueryLoading && onboardingData?.isNewUser) {
      resetStore();
    }
  }, [isQueryLoading, onboardingData, resetStore]);

  // Define components once outside render to prevent recreation
  const stepComponents = useMemo(
    () => ({
      1: <WorkerProfileForm />,
      2: <AvailabilityForm />,
      3: <CertificateSecond />,
      4: <HealthInformation />,
      5: (
        <WorkHistoryForm
          onComplete={handleSubmitProfile}
          onError={handleWorkHistoryError}
        />
      ),
    }),
    [handleSubmitProfile, handleWorkHistoryError]
  );

  // Get the component for the current step
  const currentStepComponent = stepComponents[currentStep] || (
    <div>Unknown Step</div>
  );

  // Optional loading state
  if (isQueryLoading) {
    return <div className="loading-container">Loading your profile...</div>;
  }

  // Optional error handling
  if (queryError && !isQueryLoading) {
    return (
      <div className="error-container">
        <h3>Error loading profile</h3>
        <p>
          {queryError.response?.data?.message || 'Failed to load your profile'}
        </p>
      </div>
    );
  }

  // Handle step click from progress bar
  const handleStepClick = (stepNumber) => {
    // Only allow navigation to completed steps or the current step
    if (completedSteps.includes(stepNumber) || stepNumber === currentStep) {
      setStep(stepNumber);
    }
    // The modal for incomplete steps will be handled by the ProgressBar component
  };

  return (
    <div className="onboarding-container">
      <Toaster position="top-right" />
      <div className="onboarding-header">
        <h1>Complete Your Worker Profile</h1>
        <p>Tell us about yourself so we can help you find the right jobs.</p>
        <ProgressBar
          currentStep={currentStep}
          totalSteps={5}
          steps={[
            {
              label: 'Profile',
              completed:
                currentStep >= 1 &&
                profileCompleteness.completedSections.basicInfo,
            },
            {
              label: 'Availability',
              completed:
                currentStep >= 2 &&
                profileCompleteness.completedSections.availability,
            },
            {
              label: 'Certifications',
              completed:
                currentStep >= 3 &&
                profileCompleteness.completedSections.certifications,
            },
            {
              label: 'Health Info',
              completed:
                currentStep >= 4 &&
                profileCompleteness.completedSections.healthInformation,
            },
            {
              label: 'Work History',
              completed:
                currentStep >= 5 &&
                profileCompleteness.completedSections.workHistory,
            },
          ]}
          variant="primary"
          animated={true}
          onStepClick={handleStepClick}
          completedSteps={completedSteps}
        />
      </div>
      <div className="onboarding-content">{currentStepComponent}</div>
      {/* <div className="onboarding-navigation">
        {currentStep > 1 && (
          <button className="btn btn-secondary" onClick={prevStep}>
            Previous
          </button>
        )}
        {currentStep < 4 ? (
          <button className="btn btn-primary" onClick={nextStep}>
            Next
          </button>
        ) : (
          <button 
            className="btn btn-success" 
            onClick={handleSubmitProfile}
            disabled={isCompleting}
          >
            {isCompleting ? 'Completing...' : 'Complete Profile'}
          </button>
        )}
      </div> */}
    </div>
  );
};

export default React.memo(Onboarding);
