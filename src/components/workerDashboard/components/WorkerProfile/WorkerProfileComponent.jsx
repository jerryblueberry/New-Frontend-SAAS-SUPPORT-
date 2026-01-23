import React, { useState, memo } from 'react';
import { Box, Card, Grid, useTheme, alpha } from '@mui/material';
import EditWorkerProfileComponent from './EditWorkerProfileComponent';
import ProfileHeader from './components/ProfileHeader';
import ContactInfo from './components/ContactInfo';
import SkillsSection from './components/SkillsSection';
import BiographySection from './components/BiographySection';
import ProfileSkeleton from './components/ProfileSkeleton';
import { sanitizeHTML } from './utils/sanitizeHTML';

/**
 * Main Worker Profile Component
 * 
 * Displays worker profile information in a clean, organized layout.
 * Split into smaller, focused components for better maintainability.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - User data from User model
 * @param {Object} props.onboardingData - Worker profile data from WorkerProfile model
 * @param {string} props.verificationStatus - Current verification status
 * @param {Function} props.setModalOpen - Callback to control sidebar modal state
 * @param {boolean} props.isLoading - Loading state flag
 */
const WorkerProfileComponent = memo(
  ({
    user,
    onboardingData,
    verificationStatus,
    setModalOpen,
    isLoading = false,
  }) => {
    const theme = useTheme();

    // Modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Event handlers
    const handleProfileUpdateSuccess = () => {
      window.location.reload();
    };

    const handleEditModalOpen = () => {
      setIsEditModalOpen(true);
      setModalOpen(true);
    };

    const handleEditModalClose = () => {
      setIsEditModalOpen(false);
      setModalOpen(false);
    };

    // Show skeleton while loading
    if (isLoading || !user) {
      return <ProfileSkeleton />;
    }

    const skills = onboardingData?.data?.profile?.skillTags || [];
    const biography = onboardingData?.data?.profile?.biography;

    return (
      <Box
        sx={{
          py: { xs: 2, sm: 2.5 },
          px: { xs: 2, sm: 3 },
          maxWidth: 1200,
          mx: 'auto',
        }}
      >
        {/* Main Profile Card */}
        <Card
          elevation={0}
          sx={{
            mb: 2.5,
            borderRadius: 3,
            background: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            overflow: 'hidden',
            boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.04)}`,
          }}
        >
          {/* Profile Header Section with Integrated Stats */}
          <ProfileHeader
            user={user}
            verificationStatus={verificationStatus}
            onEditClick={handleEditModalOpen}
            onboardingData={onboardingData}
          />

          {/* Contact & Skills Section */}
          <Box
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              background: alpha(theme.palette.background.default, 0.5),
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ContactInfo user={user} />
              </Grid>
              <Grid item xs={12} md={6}>
                <SkillsSection skills={skills} />
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Biography Section */}
        {biography && (
          <BiographySection
            biography={biography}
            sanitizeHTML={sanitizeHTML}
          />
        )}

        {/* Edit Profile Modal */}
        <EditWorkerProfileComponent
          open={isEditModalOpen}
          onClose={handleEditModalClose}
          user={user}
          onboardingData={onboardingData}
          onSuccess={handleProfileUpdateSuccess}
        />
      </Box>
    );
  }
);

WorkerProfileComponent.displayName = 'WorkerProfileComponent';

export default WorkerProfileComponent;