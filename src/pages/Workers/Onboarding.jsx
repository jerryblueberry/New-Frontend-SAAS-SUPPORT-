import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkerProfileForm from '../../components/workerForm/WorkerProfileForm';
import AvailabilityForm from '../../components/workerForm/AvailabilityForm';
import CertificationsForm from '../../components/workerForm/CertificationsForm';
import WorkHistoryForm from '../../components/workerForm/WorkHistoryForm';
import ProgressBar from '../../components/ui/ProgressBar';
import useOnboardingStore, { 
  useOnboardingQuery,
  useCompleteOnboardingMutation
} from '../../stores/useOnboardingStore';
import { shallow } from 'zustand/shallow';
import { Toaster, toast } from 'react-hot-toast';

const Onboarding = () => {
  const navigate = useNavigate();
  

   // Get state directly to avoid re-renders
   const currentStep = useOnboardingStore(state => state.currentStep);
   const profileCompleteness = useOnboardingStore(state => state.profileCompleteness);
   const resetStore = useOnboardingStore(state => state.resetStore);

  // Use TanStack Query for initial data fetching
  const { 
    data: onboardingData,
    isLoading: isQueryLoading, 
    error: queryError,
    // refetch: refetchOnboarding
  } = useOnboardingQuery();

  useEffect(() => {
    const store = useOnboardingStore.getState();
    store.checkPersistence();
  }, []);

  // Error 
  const handleWorkHistoryError = useCallback((msg) => {
    toast.error(msg || "Failed to save work history. Please check your data and try again.", {
      duration: 5000,
      position: 'top-right',
    });
  }, []);

  // Completion mutation
  const { 
    mutate: completeOnboarding, 
    isPending: isCompleting
  } = useCompleteOnboardingMutation();
  
  // Handle completion
  const handleSubmitProfile = useCallback(() => {
    completeOnboarding(undefined, {
      onSuccess: () => navigate('/dashboard'),
      onError: (error) => handleWorkHistoryError(error.message)
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

const stepComponents = React.useMemo(() => ({
  1: <WorkerProfileForm />,
  2: <AvailabilityForm />,
  3: <CertificationsForm />,
  4: <WorkHistoryForm 
        onComplete={handleSubmitProfile}
        onError={handleWorkHistoryError}
     />
}), [handleSubmitProfile, handleWorkHistoryError]);

  // Get the component for the current step
  const currentStepComponent = stepComponents[currentStep] || <div>Unknown Step</div>;
  
  // Optional loading state
  if (isQueryLoading) {
    return <div className="loading-container">Loading your profile...</div>;
  }

  // Optional error handling
  if (queryError && !isQueryLoading) {
    return (
      <div className="error-container">
        <h3>Error loading profile</h3>
        <p>{queryError.response?.data?.message || "Failed to load your profile"}</p>
        {/* <button onClick={}>Try Again</button> */}
      </div>
    );
  }
  
  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <h1>Complete Your Worker Profile</h1>
        <p>Tell us about yourself so we can help you find the right jobs.</p>
        <ProgressBar
          currentStep={currentStep}
          totalSteps={4}
          steps={[
            { label: "Profile", completed: profileCompleteness.completedSections.basicInfo },
            { label: "Availability", completed: profileCompleteness.completedSections.availability },
            { label: "Certifications", completed: profileCompleteness.completedSections.certifications },
            { label: "Work History", completed: profileCompleteness.completedSections.workHistory }
          ]}
          variant="primary"
          animated={true}
        />
      </div>
      <div className="onboarding-content">
        {currentStepComponent}
      </div>
    </div>
  );
};

export default React.memo(Onboarding);