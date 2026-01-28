/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * COMPLETENESS SUGGESTIONS COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Production-ready component for displaying profile completeness suggestions.
 * Shows prioritized suggestions to help users improve their profile completeness.
 * 
 * Features:
 * - High/Medium/Low priority suggestions
 * - Next steps (top 3 actionable items)
 * - Section breakdown with progress indicators
 * - Clickable suggestions that navigate to relevant pages
 * 
 * @module components/ClientComponents/CompletenessSuggestions/CompletenessSuggestions
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Button,
  LinearProgress,
  alpha,
  useTheme,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Get section route based on section name
 */
const getSectionRoute = (section) => {
  const routeMap = {
    basicInformation: '/client/profile',
    documents: '/client/profile', // Documents managed in profile page
    subscription: '/client/billing/preferences',
    otherDetails: '/client/profile/communication',
  };
  return routeMap[section] || '/client/profile';
};

/**
 * Get section label
 */
const getSectionLabel = (section) => {
  const labelMap = {
    basicInformation: 'Basic Information',
    documents: 'Documents',
    subscription: 'Subscription',
    otherDetails: 'Communication Preferences',
  };
  return labelMap[section] || section;
};

/**
 * CompletenessSuggestions Component
 * 
 * @param {Object} props
 * @param {Object} props.completeness - Completeness data from useCompletenessDetails hook
 * @param {boolean} props.showSectionBreakdown - Show section-by-section breakdown
 * @param {boolean} props.compact - Compact mode for smaller displays
 * @param {Function} props.onSuggestionClick - Callback when suggestion is clicked
 * @param {Function} props.onDismiss - Callback to dismiss suggestions
 */
const CompletenessSuggestions = ({
  completeness,
  showSectionBreakdown = true,
  compact = false,
  onSuggestionClick,
  onDismiss,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  if (!completeness) {
    return null;
  }

  const { percentage, sectionDetails, suggestions } = completeness;

  // Don't show if 100% complete
  if (percentage === 100) {
    return (
      <Card elevation={0} sx={{ bgcolor: alpha(theme.palette.success.main, 0.08), border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CheckCircleIcon color="success" />
            <Typography variant="body1" fontWeight={600} color="success.main">
              Profile Complete! All sections are filled.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const handleSuggestionClick = (suggestion) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    } else {
      // Default: navigate to relevant section
      const route = getSectionRoute(suggestion.section);
      navigate(route);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
      }}
    >
      <CardContent>
        <Stack spacing={3}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Improve Your Profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Complete these steps to increase your profile completeness
              </Typography>
            </Box>
            {onDismiss && (
              <IconButton size="small" onClick={onDismiss} sx={{ mt: -1 }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>

          {/* Overall Progress */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Overall Progress
              </Typography>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                {Math.round(percentage)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                height: 8,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                },
              }}
            />
          </Box>

          {/* Next Steps (Top 3 Suggestions) */}
          {suggestions?.nextSteps && suggestions.nextSteps.length > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NavigateNextIcon fontSize="small" color="primary" />
                Next Steps
              </Typography>
              <List disablePadding>
                {suggestions.nextSteps.map((suggestion, index) => (
                  <ListItem
                    key={`${suggestion.field}-${index}`}
                    sx={{
                      px: 0,
                      py: 1.5,
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      },
                      cursor: 'pointer',
                    }}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Chip
                        label={index + 1}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 700, minWidth: 28 }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600}>
                          {suggestion.label}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {suggestion.description}
                        </Typography>
                      }
                    />
                    <ArrowForwardIcon fontSize="small" color="action" />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Section Breakdown */}
          {showSectionBreakdown && sectionDetails && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Section Breakdown
                </Typography>
                <Stack spacing={2}>
                  {Object.entries(sectionDetails).map(([sectionKey, section]) => (
                    <Box key={sectionKey}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="body2" fontWeight={600}>
                          {getSectionLabel(sectionKey)}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            {Math.round(section.contributionPercentage || 0)}%
                          </Typography>
                          {section.isComplete ? (
                            <CheckCircleIcon fontSize="small" color="success" />
                          ) : (
                            <WarningIcon fontSize="small" color="warning" />
                          )}
                        </Stack>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={section.contributionPercentage || 0}
                        sx={{
                          height: 4,
                          borderRadius: 1,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 1,
                            bgcolor: section.isComplete
                              ? theme.palette.success.main
                              : theme.palette.primary.main,
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Contributes {section.contribution?.toFixed(1)}% to overall completeness
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </>
          )}

          {/* High Priority Suggestions */}
          {!compact && suggestions?.highPriority && suggestions.highPriority.length > 0 && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon fontSize="small" color="error" />
                  High Priority
                </Typography>
                <List disablePadding>
                  {suggestions.highPriority.map((suggestion, index) => (
                    <ListItem
                      key={`high-${suggestion.field}-${index}`}
                      sx={{
                        px: 0,
                        py: 1,
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.error.main, 0.04),
                        },
                        cursor: 'pointer',
                      }}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={600}>
                            {suggestion.label}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {suggestion.description}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CompletenessSuggestions;
