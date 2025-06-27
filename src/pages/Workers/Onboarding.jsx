import React, { useEffect, useCallback, useMemo, useState } from 'react';
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
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getCurrentUser } from '../../api/auth';
import WorkerNavbar from '../../components/Navbar/WorkerNavbar'
const Onboarding = () => {
  const navigate = useNavigate();
  // Add state to prevent UI flash for admins
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await getCurrentUser();
        if (user.role === 'admin') {
          navigate('/admin-dashboard', { replace: true });
        }
      } catch (err) {
        // Optionally handle error (e.g., redirect to login)
      } finally {
        setCheckingRole(false);
      }
    };
    checkAdmin();
  }, [navigate]);

  // Get state from store
  const currentStep = useOnboardingStore((state) => state.currentStep);
  const profileCompleteness = useOnboardingStore((state) => state.profileCompleteness);
  const resetStore = useOnboardingStore((state) => state.resetStore);
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
  // Calculate completed steps and next available step
  const { completedSteps, nextAvailableStep } = useMemo(() => {
    const steps = [];
    let nextStep = 1;

    if (profileCompleteness.completedSections.basicInfo) {
      steps.push(1);
      nextStep = 2;
    }
    if (profileCompleteness.completedSections.availability) {
      steps.push(2);
      nextStep = 3;
    }
    if (profileCompleteness.completedSections.certifications) {
      steps.push(3);
      nextStep = 4;
    }
    if (profileCompleteness.completedSections.healthInformation) {
      steps.push(4);
      nextStep = 5;
    }
    if (profileCompleteness.completedSections.workHistory) {
      steps.push(5);
      nextStep = 6; // Profile is complete
    }

    return { completedSteps: steps, nextAvailableStep: nextStep };
  }, [profileCompleteness]);

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

  // Handle step click from progress bar
  const handleStepClick = useCallback((stepNumber) => {
    // Only allow navigation to:
    // 1. Completed steps
    // 2. Current step
    // 3. Next available step
    if (
      completedSteps.includes(stepNumber) ||
      stepNumber === currentStep ||
      stepNumber === nextAvailableStep
    ) {
      setStep(stepNumber);
    }
  }, [completedSteps, currentStep, nextAvailableStep, setStep]);

  // Define components once outside render
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

  // Optional loading state for admin check
  if (checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner
          size="lg"
          showLogo={true}
          text="Checking user role..."
          fullPage={true}
          variant="gradient"
        />
      </div>
    );
  }

  // Optional loading state
  if (isQueryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner
          size="lg"
          showLogo={true}
          text="Loading your profile..."
          fullPage={true}
          variant="gradient"
        />
      </div>
    );
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

  return (
    <div className="onboarding-container">
      <Toaster position="top-right" />
      <WorkerNavbar/>
      <div className="onboarding-header">
        <h1>Complete Your Worker Profile</h1>
        <p>Tell us about yourself so we can help you find the right jobs.</p>
        <ProgressBar 
        
          currentStep={currentStep}
          totalSteps={5}
          steps={[
            {
              label: 'Profile',
              completed: completedSteps.includes(1),
            },
            {
              label: 'Availability',
              completed: completedSteps.includes(2),
            },
            {
              label: 'Certifications',
              completed: completedSteps.includes(3),
            },
            {
              label: 'Health Info',
              completed: completedSteps.includes(4),
            },
            {
              label: 'Work History',
              completed: completedSteps.includes(5),
            },
          ]}
          variant="primary"
          animated={true}
          onStepClick={handleStepClick}
          completedSteps={completedSteps}
          nextAvailableStep={nextAvailableStep}
        />
      </div>
      <div className="onboarding-content">
        {stepComponents[currentStep] || <div>Unknown Step</div>}
      </div>
    </div>
  );
};

export default React.memo(Onboarding);
