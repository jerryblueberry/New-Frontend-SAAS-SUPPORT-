import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Stack,
  Chip,
  useTheme,
  alpha,
  useMediaQuery,
} from '@mui/material';
import {
  Edit as EditIcon,
  VerifiedUser as VerifiedIcon,
} from '@mui/icons-material';
import ProfileStats from './ProfileStats';

/**
 * ProfileHeader Component with Integrated Stats
 * 
 * Clean, responsive header with profile info and stats in one section.
 * Perfect alignment and compact design for better space utilization.
 * Production-ready with proper flex alignment.
 */
const ProfileHeader = ({ user, verificationStatus, onEditClick, onboardingData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const statusColorMap = {
    verified: 'success',
    approved: 'success',
    pending: 'warning',
    rejected: 'error',
    incomplete: 'info',
  };

  const statusColor =
    statusColorMap[verificationStatus?.toLowerCase()] || 'default';

  return (
    <Box
      sx={{
        px: { xs: 2.5, sm: 3, md: 3.5 },
        py: { xs: 3, sm: 3.5, md: 4 },
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
      }}
    >
      {/* Top Section: Avatar, Name, Edit */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 2.5, sm: 3 }}
        alignItems={{ xs: 'center', sm: 'flex-start' }}
        sx={{ mb: { xs: 3, sm: 3.5 } }}
      >
        {/* Avatar */}
        <Avatar
          src={user?.profilePicture || undefined}
          alt={user?.firstName}
          sx={{
            width: { xs: 80, sm: 88, md: 96 },
            height: { xs: 80, sm: 88, md: 96 },
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
            fontWeight: 600,
            bgcolor: theme.palette.primary.main,
            flexShrink: 0,
          }}
        >
          {!user?.profilePicture &&
            `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`}
        </Avatar>

        {/* Info Section */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            width: '100%',
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          <Stack
            direction="row"
            alignItems={{ xs: 'center', sm: 'flex-start' }}
            justifyContent={{ xs: 'center', sm: 'space-between' }}
            flexWrap="wrap"
            gap={1.5}
          >
            <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 0 } }}>
              <Typography
                variant={isMobile ? 'h6' : 'h5'}
                fontWeight={600}
                sx={{
                  lineHeight: 1.2,
                  mb: 1,
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                }}
              >
                {user?.firstName} {user?.lastName}
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent={{ xs: 'center', sm: 'flex-start' }}
              >
                <Chip
                  icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
                  label={verificationStatus || 'Pending'}
                  color={statusColor}
                  size="small"
                  sx={{
                    fontWeight: 500,
                    textTransform: 'capitalize',
                    fontSize: '0.75rem',
                  }}
                />
              </Stack>
            </Box>

            <Tooltip title="Edit profile">
              <IconButton
                onClick={onEditClick}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  flexShrink: 0,
                }}
              >
                <EditIcon fontSize={isMobile ? 'small' : 'medium'} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Stack>

      {/* Stats Section - Imported Component */}
      <Box
        sx={{
          pt: { xs: 2.5, sm: 3 },
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          display: 'flex',
          alignItems: 'stretch',
          width: '100%',
        }}
      >
        <ProfileStats user={user} onboardingData={onboardingData} />
      </Box>
    </Box>
  );
};

export default ProfileHeader;
