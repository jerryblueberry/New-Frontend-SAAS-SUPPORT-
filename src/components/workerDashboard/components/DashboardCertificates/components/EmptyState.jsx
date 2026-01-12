import React from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  Typography,
  Button,
  Avatar,
  Box,
  Fade,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import { 
  WorkspacePremium, 
  School, 
  Add, 
  Schedule, 
  Cancel 
} from '@mui/icons-material';

/**
 * Empty State Component
 * Displays when no certifications are available
 */
const EmptyState = ({ type, onAdd }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Get icon, title, and message based on type
  const getEmptyStateContent = () => {
    switch (type) {
      case 'professional':
        return {
          icon: <WorkspacePremium fontSize="large" color="primary" />,
          title: 'No Professional Certifications',
          message: 'Complete your onboarding to add professional certifications and enhance your profile.',
          avatarColor: alpha(theme.palette.primary.main, 0.1),
          borderColor: alpha(theme.palette.primary.main, 0.2)
        };
      case 'other':
        return {
          icon: <School fontSize="large" color="primary" />,
          title: 'No Other Certifications',
          message: 'Add additional certifications to showcase your diverse skills and qualifications.',
          avatarColor: alpha(theme.palette.primary.main, 0.1),
          borderColor: alpha(theme.palette.primary.main, 0.2)
        };
      case 'expiring soon':
        return {
          icon: <Schedule fontSize="large" color="warning" />,
          title: 'No Expiring Certifications',
          message: 'Great news! You don\'t have any certifications expiring in the next 90 days. Keep up the good work maintaining your credentials.',
          avatarColor: alpha(theme.palette.warning.main, 0.1),
          borderColor: alpha(theme.palette.warning.main, 0.2)
        };
      case 'rejected':
        return {
          icon: <Cancel fontSize="large" color="error" />,
          title: 'No Rejected Certifications',
          message: 'Excellent! All your certifications have been approved. Continue to maintain your professional credentials.',
          avatarColor: alpha(theme.palette.error.main, 0.1),
          borderColor: alpha(theme.palette.error.main, 0.2)
        };
      default:
        return {
          icon: <WorkspacePremium fontSize="large" color="primary" />,
          title: 'No Certifications',
          message: 'No certifications found.',
          avatarColor: alpha(theme.palette.primary.main, 0.1),
          borderColor: alpha(theme.palette.primary.main, 0.2)
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <Fade in timeout={1000}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 6 },
          textAlign: 'center',
          border: `2px dashed ${theme.palette.divider}`,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 100,
            height: 100,
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
          }
        }}
      >
        <Avatar
          sx={{
            bgcolor: content.avatarColor,
            width: { xs: 60, md: 80 },
            height: { xs: 60, md: 80 },
            mx: 'auto',
            mb: 3,
            border: `3px solid ${content.borderColor}`,
          }}
        >
          {content.icon}
        </Avatar>

        <Typography
          variant={isMobile ? "h6" : "h5"}
          fontWeight="600"
          color="text.primary"
          sx={{ mb: 2 }}
        >
          {content.title}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: '400px', mx: 'auto', lineHeight: 1.6 }}
        >
          {content.message}
        </Typography>

        {onAdd && (
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={onAdd}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: theme.shadows[4],
              '&:hover': {
                boxShadow: theme.shadows[8],
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            Complete Onboarding
          </Button>
        )}
      </Paper>
    </Fade>
  );
};

EmptyState.propTypes = {
  type: PropTypes.oneOf(['professional', 'other', 'expiring soon', 'rejected']).isRequired,
  onAdd: PropTypes.func
};

export default EmptyState;
