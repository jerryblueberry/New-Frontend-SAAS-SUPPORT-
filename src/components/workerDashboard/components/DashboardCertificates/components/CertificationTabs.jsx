import React from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  Tabs,
  Tab,
  Stack,
  Typography,
  Chip
} from '@mui/material';
import {
  BusinessCenter,
  School,
  Event,
  Schedule,
  Cancel
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

/**
 * Certification Tabs Component
 * Navigation tabs for filtering certifications
 */
const CertificationTabs = ({
  activeTab,
  onTabChange,
  certificationsCount,
  otherCertificationsCount,
  expiredCount,
  expiringSoonCount,
  rejectedCount
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        mb: { xs: 2, md: 4 },
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Tabs
        value={activeTab}
        onChange={onTabChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: { xs: '0.9rem', sm: '1rem' },
            py: { xs: 1.2, sm: 1.5, md: 2 },
            minHeight: 'auto',
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        }}
      >
        <Tab
          label={
            <Stack direction="row" alignItems="center" spacing={1}>
              <BusinessCenter fontSize="small" />
              <Typography sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
                Certifications
              </Typography>
              {certificationsCount > 0 && (
                <Chip
                  label={certificationsCount}
                  size="small"
                  color="primary"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              )}
            </Stack>
          }
        />
        <Tab
          label={
            <Stack direction="row" alignItems="center" spacing={1}>
              <School fontSize="small" />
              <Typography sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
                Other Certifications
              </Typography>
              {otherCertificationsCount > 0 && (
                <Chip
                  label={otherCertificationsCount}
                  size="small"
                  color="secondary"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              )}
            </Stack>
          }
        />
        <Tab
          label={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Event fontSize="small" />
              <Typography sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
                Expired Certifications
              </Typography>
              {expiredCount > 0 && (
                <Chip
                  label={expiredCount}
                  size="small"
                  color="warning"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              )}
            </Stack>
          }
        />
        <Tab
          label={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Schedule fontSize="small" />
              <Typography sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
                Expiring Soon
              </Typography>
              {expiringSoonCount > 0 && (
                <Chip
                  label={expiringSoonCount}
                  size="small"
                  color="warning"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              )}
            </Stack>
          }
        />
        <Tab
          label={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Cancel fontSize="small" />
              <Typography sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
                Rejected Certifications
              </Typography>
              {rejectedCount > 0 && (
                <Chip
                  label={rejectedCount}
                  size="small"
                  color="error"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              )}
            </Stack>
          }
        />
      </Tabs>
    </Paper>
  );
};

CertificationTabs.propTypes = {
  activeTab: PropTypes.number.isRequired,
  onTabChange: PropTypes.func.isRequired,
  certificationsCount: PropTypes.number.isRequired,
  otherCertificationsCount: PropTypes.number.isRequired,
  expiredCount: PropTypes.number.isRequired,
  expiringSoonCount: PropTypes.number.isRequired,
  rejectedCount: PropTypes.number.isRequired
};

export default CertificationTabs;
