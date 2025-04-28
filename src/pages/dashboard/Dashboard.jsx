import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '../../api/auth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../api/axios';
import { useOnboardingQuery } from '../../stores/useOnboardingStore';
import './css/Dashboard.css';
const Dashboard = () => {
  const { signOut, isAuthenticated, user: authUser } = useAuth();
  const navigate = useNavigate();
  const isGoogleUser = localStorage.getItem('auth_provider') === 'google';
  const [activeTab, setActiveTab] = useState('overview');
  const formatTimeTo12Hour = (time) => {
    const [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = ((hour + 11) % 12) + 1; // convert 24hr to 12hr format
    return `${formattedHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  const calculateTimeDifference = (start, end) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const diff = endMinutes - startMinutes;

    if (diff <= 0) return 'Invalid time';

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours > 0 ? `${hours}h` : ''} ${minutes > 0 ? `${minutes}m` : ''}`.trim();
  };

  // Authentication guard
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { from: location } });
    }
  }, [isAuthenticated, navigate]);

  // User data fetching
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    staleTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.response?.status === 401) {
        signOut();
        return false;
      }
      return failureCount < 2;
    },
  });

  // Worker profile status fetching
  const { data: profileStatus, isLoading: isProfileLoading } = useQuery({
    queryKey: ['workerProfileStatus'],
    queryFn: async () => {
      const response = await api.get('/onboarding/status');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: !!user,
  });

  const verificationStatus =
    typeof profileStatus?.verificationStatus === 'object'
      ? profileStatus?.verificationStatus?.overall
      : profileStatus?.verificationStatus;

  // Onboarding information
  const { data: onboardingData, isLoading: isOnboardingLoading } =
    useOnboardingQuery();

  const handleSignOut = async () => {
    await signOut(false, isGoogleUser);
    navigate('/login', { replace: true });
  };

  const isLoading = isUserLoading || isProfileLoading || isOnboardingLoading;

  // If we need to complete onboarding
  const needsOnboarding =
    !profileStatus || // If profileStatus is null/undefined
    (profileStatus && !profileStatus.profileCompleteness) || // Or if profileCompleteness is missing
    profileStatus?.profileCompleteness?.percentage < 100; // Or if percentage is less than 100

  console.log('Profile status:', profileStatus);
  console.log('Needs onboarding:', needsOnboarding);

  console.log('Needs onboarding:', needsOnboarding);

  // Determine next step
  const getNextOnboardingStep = () => {
    if (!profileStatus || !profileStatus.profileCompleteness) return 1;

    const { completedSections } = profileStatus.profileCompleteness;

    if (!completedSections.basicInfo) return 1;
    if (!completedSections.availability) return 2;
    if (!completedSections.certifications) return 3;
    if (!completedSections.workHistory) return 4;

    return null;
  };

  const OnboardingPrompt = ({ percentage, nextStep }) => {
    const steps = [
      { id: 1, title: 'Basic Info', description: 'Tell us about yourself' },
      { id: 2, title: 'Availability', description: 'Set your work schedule' },
      {
        id: 3,
        title: 'Certifications',
        description: 'Add your qualifications',
      },
      { id: 4, title: 'Work History', description: 'Share your experience' },
    ];

    return (
      <div className="wrk-onboarding-prominent-prompt">
        <div className="wrk-onboarding-header">
          <h2>Let's Get You Started!</h2>
          <p>Complete your profile to unlock job opportunities</p>
        </div>

        <div className="wrk-progress-container">
          <div className="wrk-progress-bar">
            <div
              className="wrk-progress-fill"
              style={{ width: `${percentage || 0}%` }}
            ></div>
          </div>
          <span className="wrk-progress-text">{percentage || 0}% Complete</span>
        </div>

        <div className="wrk-onboarding-steps">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`wrk-onboarding-step ${nextStep === step.id ? 'wrk-current-step' : ''} ${(percentage || 0) >= step.id * 25 ? 'wrk-completed-step' : ''}`}
            >
              <div className="wrk-step-number">{step.id}</div>
              <div className="wrk-step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              {nextStep === step.id && (
                <button
                  onClick={continueOnboarding}
                  className="wrk-start-step-button"
                >
                  Start Now
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={continueOnboarding}
          className="wrk-complete-profile-button"
        >
          Complete My Profile
        </button>
      </div>
    );
  };

  const continueOnboarding = () => {
    navigate('/onboarding');
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="wrk-dashboard-container">
      {/* Top Navigation */}
      <header className="wrk-dashboard-header">
        <div className="wrk-dashboard-header-content">
          <div className="wrk-dashboard-logo-wrapper">
            <h1 className="wrk-dashboard-logo">WorkerApp</h1>
          </div>

          <div className="wrk-dashboard-user-actions">
            <div className="wrk-dashboard-user-info">
              <span className="wrk-dashboard-user-name">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
            <div className="wrk-dashboard-user-menu">
              <button
                className="wrk-dashboard-user-menu-button"
                aria-label="User menu"
              >
                <div className="wrk-dashboard-user-avatar">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="wrk-dashboard-main">
        {/* Sidebar */}
        <aside className="wrk-dashboard-sidebar">
          {needsOnboarding && (
            <div className="wrk-dashboard-sidebar-progress">
              <div className="wrk-dashboard-sidebar-progress-header">
                <span>Profile Completion</span>
                <span>
                  {profileStatus?.profileCompleteness?.percentage || 0}%
                </span>
              </div>
              <div className="wrk-dashboard-sidebar-progress-track">
                <div
                  className="wrk-dashboard-sidebar-progress-bar"
                  style={{
                    width: `${profileStatus?.profileCompleteness?.percentage || 0}%`,
                  }}
                ></div>
              </div>
              <button
                onClick={continueOnboarding}
                className="wrk-dashboard-sidebar-progress-button"
              >
                Complete Now
              </button>
            </div>
          )}
          <nav className="wrk-dashboard-nav">
            <button
              onClick={() => setActiveTab('overview')}
              className={`wrk-dashboard-nav-item ${activeTab === 'overview' ? 'wrk-dashboard-nav-item-active' : ''}`}
            >
              <span className="wrk-dashboard-nav-icon">◉</span>
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`wrk-dashboard-nav-item ${activeTab === 'profile' ? 'wrk-dashboard-nav-item-active' : ''}`}
            >
              <span className="wrk-dashboard-nav-icon">◉</span>
              <span>My Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`wrk-dashboard-nav-item ${activeTab === 'jobs' ? 'wrk-dashboard-nav-item-active' : ''}`}
            >
              <span className="wrk-dashboard-nav-icon">◉</span>
              <span>Available Jobs</span>
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`wrk-dashboard-nav-item ${activeTab === 'schedule' ? 'wrk-dashboard-nav-item-active' : ''}`}
            >
              <span className="wrk-dashboard-nav-icon">◉</span>
              <span>My Schedule</span>
            </button>
            <button
              onClick={() => setActiveTab('certifications')}
              className={`wrk-dashboard-nav-item ${activeTab === 'certifications' ? 'wrk-dashboard-nav-item-active' : ''}`}
            >
              <span className="wrk-dashboard-nav-icon">◉</span>
              <span>Certifications</span>
            </button>
            <button
              onClick={handleSignOut}
              className="wrk-dashboard-nav-item wrk-dashboard-nav-item-signout"
            >
              <span className="wrk-dashboard-nav-icon">◉</span>
              <span>Sign Out</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="wrk-dashboard-content">
          {needsOnboarding && (
            <>
              <OnboardingPrompt
                percentage={profileStatus?.profileCompleteness?.percentage || 0}
                nextStep={getNextOnboardingStep()}
              />

              {/* <button
                onClick={continueOnboarding}
                className="wrk-fab-onboarding"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"
                    fill="white"
                  />
                </svg>
                <span className="wrk-fab-text">Complete Profile</span>
              </button> */}
            </>
          )}

          {activeTab === 'overview' && (
            <div className="wrk-dashboard-overview">
              <h1 className="wrk-dashboard-section-title">
                Dashboard Overview
              </h1>

              <div className="wrk-dashboard-cards-grid">
                <DashboardCard
                  title="Profile Status"
                  value={verificationStatus || 'Pending'}
                  icon="◉"
                  color={verificationStatus === 'Verified' ? 'green' : 'amber'}
                />
                <DashboardCard
                  title="Hourly Rate"
                  value={`$${onboardingData?.data?.profile?.expectedHourlyRate || 0}/hr`}
                  icon="◉"
                  color="blue"
                />
                <DashboardCard
                  title="Last Active"
                  value={
                    profileStatus?.lastActiveDate
                      ? new Date(
                          profileStatus.lastActiveDate
                        ).toLocaleDateString()
                      : 'Today'
                  }
                  icon="◉"
                  color="purple"
                />
              </div>

              <div className="wrk-dashboard-overview-grid">
                <div className="wrk-dashboard-skills-card">
                  <h2 className="wrk-dashboard-card-title">My Skills</h2>
                  <div className="wrk-dashboard-skills-list">
                    {onboardingData?.data?.profile?.skillTags?.map(
                      (skill, index) => (
                        <span key={index} className="wrk-dashboard-skill-tag">
                          {skill}
                        </span>
                      )
                    ) || (
                      <p className="wrk-dashboard-empty-state">
                        No skills added yet
                      </p>
                    )}
                  </div>
                </div>

                <div className="wrk-dashboard-certifications-card">
                  <h2 className="wrk-dashboard-card-title">
                    My Certifications
                  </h2>
                  <div className="wrk-dashboard-certifications-list">
                    {onboardingData?.data?.profile?.certifications
                      ?.slice(0, 3)
                      .map((cert, index) => (
                        <div
                          key={index}
                          className="wrk-dashboard-certification-item"
                        >
                          <div>
                            <p className="wrk-dashboard-certification-name">
                              {cert.type}
                            </p>
                            <p className="wrk-dashboard-certification-meta">
                              Expires:{' '}
                              {cert.expiryDate
                                ? new Date(cert.expiryDate).toLocaleDateString()
                                : 'N/A'}
                            </p>
                          </div>
                          <span
                            className={`wrk-dashboard-certification-status wrk-dashboard-certification-status-${cert.verificationStatus.toLowerCase()}`}
                          >
                            {cert.verificationStatus}
                          </span>
                        </div>
                      )) || (
                      <p className="wrk-dashboard-empty-state">
                        No certifications added yet
                      </p>
                    )}
                    {onboardingData?.data?.profile?.certifications?.length >
                      3 && (
                      <button
                        onClick={() => setActiveTab('certifications')}
                        className="wrk-dashboard-view-all-button"
                      >
                        View all certifications
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="wrk-dashboard-profile">
              <h1 className="wrk-dashboard-section-title">My Profile</h1>

              <div className="wrk-dashboard-profile-card">
                <div className="wrk-dashboard-profile-content">
                  <div className="wrk-dashboard-profile-avatar-wrapper">
                    <div className="wrk-dashboard-profile-avatar">
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </div>
                  </div>

                  <div className="wrk-dashboard-profile-details">
                    <h2 className="wrk-dashboard-profile-name">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="wrk-dashboard-profile-email">{user?.email}</p>

                    <div className="wrk-dashboard-profile-grid">
                      <div>
                        <p className="wrk-dashboard-profile-label">
                          Phone Number
                        </p>
                        <p className="wrk-dashboard-profile-value">
                          {user?.phone || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="wrk-dashboard-profile-label">Joined On</p>
                        <p className="wrk-dashboard-profile-value">
                          {user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="wrk-dashboard-profile-label">
                          Expected Rate
                        </p>
                        <p className="wrk-dashboard-profile-value">
                          $
                          {onboardingData?.data?.profile?.expectedHourlyRate ||
                            0}
                          /hr
                        </p>
                      </div>
                      <div>
                        <p className="wrk-dashboard-profile-label">
                          Profile Status
                        </p>

                        <p
                          className={`wrk-dashboard-profile-value wrk-dashboard-profile-status-${verificationStatus?.toLowerCase() || 'pending'}`}
                        >
                          {verificationStatus || 'Pending'}
                        </p>
                      </div>
                    </div>

                    <h3 className="wrk-dashboard-profile-subtitle">
                      Biography
                    </h3>
                    <p className="wrk-dashboard-profile-bio">
                      {onboardingData?.data?.profile?.biography ||
                        'No biography provided yet.'}
                    </p>

                    <button
                      onClick={() => navigate('/profile/edit')}
                      className="wrk-dashboard-edit-button"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="wrk-dashboard-jobs">
              <h1 className="wrk-dashboard-section-title">Available Jobs</h1>

              {needsOnboarding ? (
                <div className="wrk-dashboard-warning-alert">
                  <p className="wrk-dashboard-warning-text">
                    Complete your profile to start seeing available job matches.
                  </p>
                </div>
              ) : (
                <div className="wrk-dashboard-empty-card">
                  <p className="wrk-dashboard-empty-text">
                    No jobs available at the moment. Check back later!
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="wrk-dashboard-schedule">
              <h1 className="wrk-dashboard-section-title">My Schedule</h1>

              <div className="wrk-dashboard-schedule-card">
                <h2 className="wrk-dashboard-card-title">
                  Weekly Availability
                </h2>

                <div className="wrk-dashboard-availability-grid">
                  {onboardingData?.data?.profile?.availability?.weeklySchedule?.map(
                    (day, index) => (
                      <div
                        key={index}
                        className="wrk-dashboard-availability-day"
                      >
                        <p className="wrk-dashboard-availability-day-name">
                          {day.day}
                        </p>

                        <div className="wrk-dashboard-availability-slots">
                          {day.slots.length > 0 ? (
                            day.slots.map((slot, slotIndex) => (
                              <div
                                key={slotIndex}
                                className="wrk-dashboard-availability-slot"
                              >
                                {slot.charAt(0).toUpperCase() + slot.slice(1)}
                              </div>
                            ))
                          ) : (
                            <p className="wrk-dashboard-availability-empty">
                              Not Available
                            </p>
                          )}
                        </div>

                        {/* ✅ Show custom time slots for the current day */}
                        {onboardingData?.data?.profile?.availability?.customTimeSlots
                          ?.filter((slot) => slot.dayOfWeek === day.day)
                          .map((customSlot, customIndex) => {
                            const formattedStart = formatTimeTo12Hour(
                              customSlot.startTime
                            );
                            const formattedEnd = formatTimeTo12Hour(
                              customSlot.endTime
                            );
                            const duration = calculateTimeDifference(
                              customSlot.startTime,
                              customSlot.endTime
                            );

                            return (
                              <div
                                key={`custom-${customIndex}`}
                                className="wrk-dashboard-availability-slot wrk-dashboard-custom-slot"
                              >
                                🕒 {formattedStart} - {formattedEnd}{' '}
                                <span className="wrk-dashboard-slot-duration">
                                  ({duration})
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    )
                  ) || (
                    <p className="wrk-dashboard-empty-state wrk-dashboard-availability-empty-state">
                      No availability information found
                    </p>
                  )}
                </div>

                {onboardingData?.data?.profile?.availability?.notes && (
                  <div className="wrk-dashboard-availability-notes">
                    <h3 className="wrk-dashboard-availability-notes-title">
                      Notes:
                    </h3>
                    <p className="wrk-dashboard-availability-notes-content">
                      {onboardingData.data.profile.availability.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'certifications' && (
            <div className="wrk-dashboard-certifications-page">
              <h1 className="wrk-dashboard-section-title">My Certifications</h1>

              <div className="wrk-dashboard-certifications-container">
                {onboardingData?.data?.profile?.certifications?.length > 0 ? (
                  <div className="wrk-dashboard-certifications-list-detailed">
                    {onboardingData.data.profile.certifications.map(
                      (cert, index) => (
                        <div
                          key={index}
                          className="wrk-dashboard-certification-item-detailed"
                        >
                          <div className="wrk-dashboard-certification-header">
                            <div>
                              <h3 className="wrk-dashboard-certification-name-detailed">
                                {cert.type}
                              </h3>
                              <p className="wrk-dashboard-certification-number">
                                Number: {cert.number}
                              </p>
                            </div>
                            <div>
                              <span
                                className={`wrk-dashboard-certification-status-detailed wrk-dashboard-certification-status-${cert.verificationStatus.toLowerCase()}`}
                              >
                                {cert.verificationStatus}
                              </span>
                            </div>
                          </div>

                          <div className="wrk-dashboard-certification-details">
                            <div>
                              <p className="wrk-dashboard-certification-label">
                                Issued Date
                              </p>
                              <p className="wrk-dashboard-certification-value">
                                {new Date(cert.issuedDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="wrk-dashboard-certification-label">
                                Expiry Date
                              </p>
                              <p className="wrk-dashboard-certification-value">
                                {cert.expiryDate
                                  ? new Date(
                                      cert.expiryDate
                                    ).toLocaleDateString()
                                  : 'N/A'}
                              </p>
                            </div>
                          </div>

                          {cert.documents && cert.documents.length > 0 && (
                            <div className="wrk-dashboard-certification-documents">
                              <p className="wrk-dashboard-certification-documents-label">
                                Documents:
                              </p>
                              <div className="wrk-dashboard-certification-documents-list">
                                {cert.documents.map((doc, docIndex) => (
                                  <a
                                    key={docIndex}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="wrk-dashboard-certification-document"
                                  >
                                    <span className="wrk-dashboard-certification-document-icon">
                                      ◉
                                    </span>{' '}
                                    {doc.fileName || `Document ${docIndex + 1}`}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="wrk-dashboard-empty-state">
                    No certifications added yet
                  </p>
                )}

                <div className="wrk-dashboard-certifications-actions">
                  <button
                    onClick={() => navigate('/onboarding/certifications')}
                    className="wrk-dashboard-certifications-action-button"
                  >
                    {onboardingData?.data?.profile?.certifications?.length > 0
                      ? 'Update Certifications'
                      : 'Add Certifications'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Helper components
const ProgressStep = ({ title, completed, current, step }) => {
  return (
    <div
      className={`wrk-dashboard-progress-step ${completed ? 'wrk-dashboard-progress-step-completed' : ''} ${current ? 'wrk-dashboard-progress-step-current' : ''}`}
    >
      <div className="wrk-dashboard-progress-step-content">
        <div
          className={`wrk-dashboard-progress-step-icon ${completed ? 'wrk-dashboard-progress-step-icon-completed' : ''} ${current ? 'wrk-dashboard-progress-step-icon-current' : ''}`}
        >
          {completed ? '✓' : step}
        </div>
        <span className="wrk-dashboard-progress-step-title">{title}</span>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value, icon, color }) => {
  return (
    <div className={`wrk-dashboard-stat-card wrk-dashboard-stat-card-${color}`}>
      <div className="wrk-dashboard-stat-card-content">
        <div
          className={`wrk-dashboard-stat-card-icon wrk-dashboard-stat-card-icon-${color}`}
        >
          {icon}
        </div>
        <div>
          <h3 className="wrk-dashboard-stat-card-title">{title}</h3>
          <p
            className={`wrk-dashboard-stat-card-value wrk-dashboard-stat-card-value-${color}`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
