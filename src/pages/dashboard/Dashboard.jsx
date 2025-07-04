import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '../../api/auth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../api/axios';
import { useOnboardingQuery } from '../../stores/useOnboardingStore';
import DocumentPreview from '../../components/workerForm/Modals/DocumentPreview';
import './css/Dashboard.css';
import OnboardingPrompt from '../../components/workerDashboard/components/OnboardingPrompt/OnboardingPrompt';
import WorkerProfileComponent from '../../components/workerDashboard/components/WorkerProfile/WorkerProfileComponent';
import { Box, Paper, Typography, Button } from '@mui/material';
import DashboardSidebar from '../../components/workerDashboard/components/DashboardSidebar/DashboardSidebar';
import WorkerNavbar from '../../components/Navbar/WorkerNavbar';
import DashboardAvailability from '../../components/workerDashboard/components/WorkerDashboardAvailability/DashboardAvailability';

const Dashboard = () => {
  const { signOut, isAuthenticated, user: authUser } = useAuth();
  const navigate = useNavigate();
  const isGoogleUser = localStorage.getItem('auth_provider') === 'google';
  const [activeTab, setActiveTab] = useState('overview');
  const [previewDocument, setPreviewDocument] = useState(null);
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
console.log("USer",user);


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

  // GET DATA
  console.log('ONBORDING DATA', onboardingData?.data?.profile);
  console.log('ONBORDING DATA 2', onboardingData?.data?.profile);
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

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return '';
    if (
      typeof dateValue === 'string' &&
      dateValue.match(/^\d{4}-\d{2}-\d{2}$/)
    ) {
      return dateValue;
    }
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  };

  // Determine next step
  const getNextOnboardingStep = () => {
    if (!profileStatus || !profileStatus.profileCompleteness) return 1;

    const { completedSections } = profileStatus.profileCompleteness;

    if (!completedSections.basicInfo) return 1;
    if (!completedSections.workHistory) return 2;
    if (!completedSections.availability) return 3;
    if (!completedSections.certifications) return 4;
    if (!completedSections.healthInformation) return 5;

    return null;
  };

  const continueOnboarding = () => {
    navigate('/onboarding'

    );
  };

  // Handle document preview
  const handleDocumentPreviewClick = (doc) => {
    setPreviewDocument(doc);
  };

  // Close document preview
  const closeDocumentPreview = () => {
    setPreviewDocument(null);
  };

  // Helper to get missing sections
  const getMissingSections = () => {
    const completed = profileStatus?.profileCompleteness?.completedSections || {};
    const sectionNames = {
      basicInfo: 'Basic Information',
      workHistory: 'Work History',
      availability: 'Availability',
      certifications: 'Certifications',
      healthInformation: 'Health Information',
    
    };
    return Object.entries(completed)
      .filter(([_, done]) => !done)
      .map(([key]) => sectionNames[key]);
  };

  // Helper to format 24-hour time to 12-hour with AM/PM
  const formatTo12Hour = (time24) => {
    if (!time24) return '';
    const [hourStr, minute] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  // Helper to calculate duration between two 24-hour times
  const calculateDuration = (start, end) => {
    if (!start || !end) return '';
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    let diff = endMinutes - startMinutes;
    if (diff <= 0) return 'Invalid time';
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours > 0 ? `${hours}h` : ''}${hours > 0 && minutes > 0 ? ' ' : ''}${minutes > 0 ? `${minutes}m` : ''}`.trim();
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <LoadingSpinner
        size="lg"
        showLogo={true}
        text="Loading dashboard..."
        fullPage={true}
        variant="light"
      />
    </div>
  );

  return (
    <div className="wrk-dashboard-container">
      <WorkerNavbar />
      <div className="wrk-dashboard-main">
        <DashboardSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleSignOut={handleSignOut}
          needsOnboarding={needsOnboarding}
          profileStatus={profileStatus}
        />
        <main className="wrk-dashboard-content">
          {needsOnboarding && (
            <>
              <OnboardingPrompt
                percentage={profileStatus?.profileCompleteness?.percentage || 0}
                nextStep={getNextOnboardingStep()}
                onContinue={continueOnboarding}
              />
            </>
          )}

          {activeTab === 'overview' && (
            verificationStatus === 'Unverified' ? (
              <Box
                sx={{
                  mt: { xs: 6, sm: 8 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: { xs: 400, sm: 500 },
                  width: '100%',
                  px: { xs: 2, sm: 0 },
                }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: { xs: 3, sm: 5 },
                    borderRadius: 4,
                    maxWidth: 480,
                    width: '100%',
                    textAlign: 'center',
                    bgcolor: 'background.paper',
                    boxShadow: '0 8px 32px rgba(80,80,120,0.08)',
                    mb: 4,
                  }}
                >
                  {/* Animated SVG Illustration */}
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                    <Box
                      sx={{
                        width: { xs: 180, sm: 220 },
                        height: { xs: 120, sm: 140 },
                        mx: 'auto',
                        mb: 2,
                        animation: 'float 2.5s ease-in-out infinite',
                        '@keyframes float': {
                          '0%': { transform: 'translateY(0px)' },
                          '50%': { transform: 'translateY(-16px)' },
                          '100%': { transform: 'translateY(0px)' },
                        },
                      }}
                    >
                      {/* Simple SVG illustration (can be replaced with a more complex one) */}
                      <svg width="100%" height="100%" viewBox="0 0 220 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="110" cy="120" rx="80" ry="15" fill="#ede7f6"/>
                        <rect x="60" y="40" width="100" height="60" rx="16" fill="#b39ddb"/>
                        <rect x="75" y="55" width="70" height="30" rx="8" fill="#fff"/>
                        <rect x="90" y="65" width="40" height="10" rx="5" fill="#d1c4e9"/>
                        <circle cx="110" cy="55" r="8" fill="#7e57c2"/>
                        <rect x="100" y="90" width="20" height="8" rx="4" fill="#9575cd"/>
                      </svg>
                    </Box>
                  </Box>
                  <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
                    Thank you for applying!
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    Your profile is currently <b>under review</b> by our team. We appreciate your interest and the time you've invested in completing your application.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    We will notify you via email as soon as your profile has been successfully verified and you are ready to begin your journey with us. In the meantime, feel free to explore your dashboard or update your information if needed.
                  </Typography>
                  {/* Show missing sections if any */}
                  {getMissingSections().length > 0 && (
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <Typography variant="subtitle1" color="error" fontWeight={600}>
                        Missing Sections:
                      </Typography>
                      <ul style={{ textAlign: 'left', margin: '0 auto', maxWidth: 300 }}>
                        {getMissingSections().map((section) => (
                          <li key={section} style={{ color: '#d32f2f', fontWeight: 500 }}>{section}</li>
                        ))}
                      </ul>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={() => setActiveTab('profile')}
                      sx={{ borderRadius: 2, fontWeight: 600, px: 4, boxShadow: 2 }}
                    >
                      View My Profile
                    </Button>
                  </Box>
                </Paper>
              </Box>
            ) : verificationStatus === 'Partially Verified' ? (
              <Box
                sx={{
                  mt: { xs: 6, sm: 8 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: { xs: 400, sm: 500 },
                  width: '100%',
                  px: { xs: 2, sm: 0 },
                }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: { xs: 3, sm: 5 },
                    borderRadius: 4,
                    maxWidth: 480,
                    width: '100%',
                    textAlign: 'center',
                    bgcolor: '#fffde7',
                    boxShadow: '0 8px 32px rgba(255, 193, 7, 0.08)',
                    mb: 4,
                  }}
                >
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                    <Box
                      sx={{
                        width: { xs: 180, sm: 220 },
                        height: { xs: 120, sm: 140 },
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      {/* Partially verified SVG */}
                      <svg width="100%" height="100%" viewBox="0 0 220 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="110" cy="120" rx="80" ry="15" fill="#fffde7"/>
                        <rect x="60" y="40" width="100" height="60" rx="16" fill="#ffe082"/>
                        <rect x="75" y="55" width="70" height="30" rx="8" fill="#fffde7"/>
                        <rect x="90" y="65" width="40" height="10" rx="5" fill="#ffe082"/>
                        <circle cx="110" cy="55" r="8" fill="#ffd54f"/>
                        <rect x="100" y="90" width="20" height="8" rx="4" fill="#ffb300"/>
                      </svg>
                    </Box>
                  </Box>
                  <Typography variant="h5" fontWeight={700} color="warning.main" gutterBottom>
                    Profile Partially Verified
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    Some sections of your profile are verified, but a few are still pending. Please complete the missing sections below to get fully verified.
                  </Typography>
                  {/* Show missing sections if any */}
                  {getMissingSections().length > 0 && (
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <Typography variant="subtitle1" color="error" fontWeight={600}>
                        Missing Sections:
                      </Typography>
                      <ul style={{ textAlign: 'left', margin: '0 auto', maxWidth: 300 }}>
                        {getMissingSections().map((section) => (
                          <li key={section} style={{ color: '#d32f2f', fontWeight: 500 }}>{section}</li>
                        ))}
                      </ul>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="warning"
                      size="large"
                      onClick={() => navigate('/onboarding')}
                      sx={{ borderRadius: 2, fontWeight: 600, px: 4, boxShadow: 2 }}
                    >
                      Complete My Profile
                    </Button>
                  </Box>
                </Paper>
              </Box>
            ) : (
              // Only show if fully verified AND profile is 100% complete
              profileStatus?.profileCompleteness?.percentage === 100 ? (
                <Box sx={{ mt: 8, textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="60" cy="60" r="56" fill="#e8f5e9" stroke="#43a047" strokeWidth="4"/>
                      <path d="M40 65l15 15 25-35" stroke="#43a047" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </Box>
                  <Typography variant="h4" color="success.main" fontWeight={700}>
                    Congratulations! 🎉
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                    Your profile is <b>fully verified</b>. You now have access to all dashboard features and can start applying for jobs!
                  </Typography>
                </Box>
              ) : (
                // If not 100% complete, show a prompt to complete profile
                null
              )
            )
          )}

          {activeTab === 'profile' && (
            <WorkerProfileComponent
              user={user}
              onboardingData={onboardingData}
              verificationStatus={verificationStatus}
              navigate={navigate}
            />
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
            <DashboardAvailability onboardingData={onboardingData} />
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
                                {cert.certificationType.name}
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

          {activeTab === 'workHistory' && (
            <div className="wrk-dashboard-wrk-history">
              {/* Work History Section */}
              <h2>Work History</h2>
              

              <div className="work-section">
                {/* CV Section */}
                {onboardingData?.data?.profile?.CV && (
                  <div className="cv-section">
                    <h3>CV/Resume</h3>
                    <div className="cv-preview-card">
                      <div className="cv-preview-content">
                        <div 
                          className="cv-preview-icon"
                          onClick={() => handleDocumentPreviewClick({
                            url: onboardingData.data.profile.CV,
                            fileName: 'CV/Resume',
                            fileType: onboardingData.data.profile.CV.endsWith('.pdf') ? 'application/pdf' : 'image'
                          })}
                        >
                          {onboardingData.data.profile.CV.endsWith('.pdf') ? (
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <path d="M10 9H8v6h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2z"></path>
                              <line x1="16" y1="13" x2="16" y2="15"></line>
                            </svg>
                          ) : (
                            <img 
                              src={onboardingData.data.profile.CV} 
                              alt="CV Preview" 
                              className="cv-thumbnail"
                            />
                          )}
                          <span>View CV/Resume</span>
                        </div>
                        <a
                          href={onboardingData.data.profile.CV}
                          download
                          className="cv-download-btn"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Work History List */}
                {onboardingData?.data?.profile?.workHistory?.length > 0 ? (
                  onboardingData?.data?.profile?.workHistory?.map(
                    (history, index) => (
                      <div className="work-card" key={index}>
                        <div className="work-item">
                          <p className="label">Company</p>
                          <p className="value">{history.company}</p>
                        </div>
                        <div className="work-item">
                          <p className="label">Title</p>
                          <p className="value">{history.title}</p>
                        </div>
                        <div className="work-item">
                          <p className="label">Start Date</p>
                          <p className="value">
                            {formatDateForInput(history.startDate)}
                          </p>
                        </div>
                        <div className="work-item">
                          <p className="label">End Date</p>
                          <p className="value">
                            {formatDateForInput(history.endDate)}
                          </p>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <p>No work history found</p>
                )}
              </div>

              {/* References Section */}
              <div className="reference-section">
                {onboardingData?.data?.profile?.references?.length > 0 ? (
                  onboardingData?.data?.profile?.references?.map(
                    (reference, index) => (
                      <div className="reference-card" key={index}>
                        <h2>References {index+1}</h2>
                        <div className="reference-item">
                          <p className="label">Name</p>
                          <p className="value">{reference.name}</p>
                        </div>
                        <div className="reference-item">
                          <p className="label">Company</p>
                          <p className="value">{reference.company}</p>
                        </div>
                        <div className="reference-item">
                          <p className="label">Position</p>
                          <p className="value">{reference.position}</p>
                        </div>
                        <div className="reference-item">
                          <p className="label">Email</p>
                          <p className="value">{reference.email}</p>
                        </div>
                        <div className="reference-item">
                          <p className="label">Phone</p>
                          <p className="value">{reference.phone}</p>
                        </div>
                        <div className="reference-item">
                          <p className="label">Verified</p>
                          <p className="value">
                            {reference.verified === 'true' ? 'Yes' : 'No'}
                          </p>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <p>No references found</p>
                )}
              </div>
            </div>
          )}

          {/* Document Preview Modal */}
          {previewDocument && (
            <DocumentPreview
              document={previewDocument}
              onClose={closeDocumentPreview}
            />
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
