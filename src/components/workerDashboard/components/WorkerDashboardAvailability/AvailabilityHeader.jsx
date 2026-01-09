import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Stack,
  Typography,
  Button,
  useMediaQuery,
  IconButton,
  Tooltip
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import NearMeOutlinedIcon from '@mui/icons-material/NearMeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';

/**
 * AvailabilityHeader Component
 * 
 * A production-ready React component for displaying availability header section
 * with location information and action buttons (view mode toggle and edit).
 * 
 * Features:
 * - Responsive design for mobile/tablet/desktop
 * - Location and travel radius display
 * - View mode toggle (Calendar/List)
 * - Edit button with drawer trigger
 * - Memoized for optimal performance
 * - Accessibility compliant
 * 
 * @version 1.0.0
 * @author Aecus Care Development Team
 */
const AvailabilityHeader = React.memo(function AvailabilityHeader({
  availability,
  viewMode,
  onViewModeChange,
  onEditOpen,
  statsVisible,
  onStatsToggle
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Memoized event handlers
  const handleCalendarClick = useCallback(() => {
    onViewModeChange('calendar');
  }, [onViewModeChange]);

  const handleListClick = useCallback(() => {
    onViewModeChange('list');
  }, [onViewModeChange]);

  const handleEditClick = useCallback(() => {
    onEditOpen();
  }, [onEditOpen]);

  const handleStatsToggle = useCallback(() => {
    onStatsToggle?.();
  }, [onStatsToggle]);

  return (
    <Box
      sx={{
        mb: { xs: 1.75, sm: 2, md: 2.25 },
        px: { xs: 0, sm: 0 },
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 1.5, sm: 1.75 }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
      >
        {/* Location Info Section - Modern Design */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1, sm: 2, md: 3 }}
          flex={1}
          sx={{ 
            minWidth: 0,
          }}
        >
          {/* Location Card */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 1.25 },
              px: { xs: 2, sm: 2.5 },
              py: { xs: 1.25, sm: 1.5 },
              borderRadius: { xs: 2, sm: 2.5 },
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
              minWidth: 0,
              flex: 1,
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                borderColor: alpha(theme.palette.primary.main, 0.15),
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
              }
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                borderRadius: { xs: 1.5, sm: 2 },
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                flexShrink: 0,
              }}
            >
              <LocationOnOutlinedIcon
                sx={{
                  color: 'primary.main',
                  fontSize: { xs: 18, sm: 20 },
                }}
              />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: { xs: '0.65rem', sm: '0.7rem' },
                  fontWeight: 600,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  lineHeight: 1.2,
                  display: 'block',
                }}
              >
                Location
              </Typography>
              <Typography
                variant="body1"
                fontWeight={700}
                sx={{
                  fontSize: { xs: '0.85rem', sm: '0.95rem' },
                  color: 'primary.main',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.3,
                  mt: 0.25,
                }}
              >
                {availability?.suburb || 'Not set'}
              </Typography>
            </Box>
          </Box>

          {/* Travel Radius Card */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 1.25 },
              px: { xs: 2, sm: 2.5 },
              py: { xs: 1.25, sm: 1.5 },
              borderRadius: { xs: 2, sm: 2.5 },
              bgcolor: alpha(theme.palette.info.main, 0.04),
              border: `1px solid ${alpha(theme.palette.info.main, 0.08)}`,
              minWidth: { xs: 'auto', sm: 200 },
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: alpha(theme.palette.info.main, 0.06),
                borderColor: alpha(theme.palette.info.main, 0.15),
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.08)}`,
              }
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                borderRadius: { xs: 1.5, sm: 2 },
                bgcolor: alpha(theme.palette.info.main, 0.1),
                flexShrink: 0,
              }}
            >
              <NearMeOutlinedIcon
                sx={{
                  color: 'info.main',
                  fontSize: { xs: 18, sm: 20 },
                }}
              />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: { xs: '0.65rem', sm: '0.7rem' },
                  fontWeight: 600,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  lineHeight: 1.2,
                  display: 'block',
                }}
              >
                Travel Radius
              </Typography>
              <Typography
                variant="body1"
                fontWeight={700}
                sx={{
                  fontSize: { xs: '0.85rem', sm: '0.95rem' },
                  color: 'info.main',
                  lineHeight: 1.3,
                  mt: 0.25,
                }}
              >
                {availability?.kmWillingToTravel ? `${availability.kmWillingToTravel} km` : 'Not set'}
              </Typography>
            </Box>
          </Box>
        </Stack>

        {/* Action Buttons Section - Modern Design */}
        <Stack
          direction="row"
          spacing={{ xs: 0.75, sm: 1 }}
          sx={{
            flexShrink: 0,
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          {/* View Toggle Group */}
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              p: 0.5,
              bgcolor: alpha(theme.palette.divider, 0.04),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              flex: { xs: 1, sm: 0 },
            }}
          >
            <Button
              variant={viewMode === 'calendar' ? 'contained' : 'text'}
              size="small"
              startIcon={
                <CalendarMonthOutlinedIcon
                  sx={{
                    fontSize: { xs: 16, sm: 18 }
                  }}
                />
              }
              onClick={handleCalendarClick}
              sx={{
                borderRadius: 1.5,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                px: { xs: 1.25, sm: 1.5 },
                py: { xs: 0.75, sm: 0.875 },
                minWidth: { xs: 'auto', sm: 90 },
                flex: { xs: 1, sm: 0 },
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: viewMode === 'calendar' ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}` : 'none',
                bgcolor: viewMode === 'calendar' ? 'primary.main' : 'transparent',
                color: viewMode === 'calendar' ? 'primary.contrastText' : 'text.secondary',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '& .MuiButton-startIcon': {
                  marginLeft: 0,
                  marginRight: { xs: 0.5, sm: 0.75 }
                },
                '&:hover': {
                  bgcolor: viewMode === 'calendar' ? 'primary.dark' : alpha(theme.palette.action.hover, 0.08),
                  transform: viewMode === 'calendar' ? 'translateY(-1px)' : 'none',
                  boxShadow: viewMode === 'calendar' ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
                }
              }}
              aria-label="Switch to calendar view"
            >
              {!isMobile && 'Calendar'}
            </Button>

            <Button
              variant={viewMode === 'list' ? 'contained' : 'text'}
              size="small"
              startIcon={
                <ViewAgendaOutlinedIcon
                  sx={{
                    fontSize: { xs: 16, sm: 18 }
                  }}
                />
              }
              onClick={handleListClick}
              sx={{
                borderRadius: 1.5,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                px: { xs: 1.25, sm: 1.5 },
                py: { xs: 0.75, sm: 0.875 },
                minWidth: { xs: 'auto', sm: 80 },
                flex: { xs: 1, sm: 0 },
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: viewMode === 'list' ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}` : 'none',
                bgcolor: viewMode === 'list' ? 'primary.main' : 'transparent',
                color: viewMode === 'list' ? 'primary.contrastText' : 'text.secondary',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '& .MuiButton-startIcon': {
                  marginLeft: 0,
                  marginRight: { xs: 0.5, sm: 0.75 }
                },
                '&:hover': {
                  bgcolor: viewMode === 'list' ? 'primary.dark' : alpha(theme.palette.action.hover, 0.08),
                  transform: viewMode === 'list' ? 'translateY(-1px)' : 'none',
                  boxShadow: viewMode === 'list' ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
                }
              }}
              aria-label="Switch to list view"
            >
              {!isMobile && 'List'}
            </Button>
          </Box>

          {/* Edit Button */}
          <Button
            variant="contained"
            size="small"
            startIcon={
              <EditOutlinedIcon
                sx={{
                  fontSize: { xs: 16, sm: 18 }
                }}
              />
            }
            onClick={handleEditClick}
            sx={{
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              borderRadius: 2,
              fontWeight: 600,
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.75, sm: 0.875 },
              minWidth: { xs: 'auto', sm: 90 },
              textTransform: 'none',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}`,
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              '& .MuiButton-startIcon': {
                marginLeft: 0,
                marginRight: { xs: 0.5, sm: 0.75 }
              },
              '&:hover': {
                bgcolor: 'primary.dark',
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                transform: 'translateY(-2px)',
              }
            }}
            aria-label="Edit availability"
          >
            {!isMobile && 'Edit'}
          </Button>

          {/* Stats Toggle Button - Modern Design */}
          {onStatsToggle && (
            <Tooltip 
              title={statsVisible ? 'Hide insights' : 'Show insights'} 
              arrow 
              placement="top"
              enterDelay={300}
              leaveDelay={200}
            >
              {isMobile ? (
                // Mobile: Icon Button
                <IconButton
                  onClick={handleStatsToggle}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    bgcolor: statsVisible 
                      ? alpha(theme.palette.success.main, 0.1)
                      : alpha(theme.palette.divider, 0.04),
                    border: `1px solid ${statsVisible 
                      ? alpha(theme.palette.success.main, 0.2)
                      : alpha(theme.palette.divider, 0.08)}`,
                    color: statsVisible ? 'success.main' : 'text.secondary',
                    width: 38,
                    height: 38,
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: statsVisible 
                        ? alpha(theme.palette.success.main, 0.15)
                        : alpha(theme.palette.divider, 0.08),
                      borderColor: statsVisible 
                        ? alpha(theme.palette.success.main, 0.3)
                        : alpha(theme.palette.divider, 0.15),
                      transform: 'translateY(-1px)',
                      boxShadow: `0 2px 8px ${alpha(statsVisible ? theme.palette.success.main : theme.palette.common.black, 0.1)}`,
                    },
                    '&:active': {
                      transform: 'scale(0.96)',
                    }
                  }}
                  aria-label={statsVisible ? 'Hide statistics' : 'Show statistics'}
                >
                  {statsVisible ? (
                    <KeyboardArrowUpIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <InsightsOutlinedIcon sx={{ fontSize: 20 }} />
                  )}
                </IconButton>
              ) : (
                // Desktop/Tablet: Button with Text
                <Button
                  variant={statsVisible ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={statsVisible ? <KeyboardArrowUpIcon /> : <InsightsOutlinedIcon />}
                  onClick={handleStatsToggle}
                  sx={{
                    fontSize: { sm: '0.7rem', md: '0.75rem' },
                    borderRadius: 2,
                    fontWeight: 600,
                    px: { sm: 1.75, md: 2 },
                    py: { sm: 0.75, md: 0.875 },
                    minWidth: { sm: 100, md: 110 },
                    textTransform: 'none',
                    bgcolor: statsVisible 
                      ? 'success.main'
                      : 'transparent',
                    borderColor: statsVisible 
                      ? 'success.main'
                      : alpha(theme.palette.divider, 0.08),
                    color: statsVisible ? 'success.contrastText' : 'text.secondary',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: statsVisible 
                      ? `0 2px 8px ${alpha(theme.palette.success.main, 0.25)}`
                      : 'none',
                    '& .MuiButton-startIcon': {
                      marginRight: 0.75,
                      marginLeft: 0,
                    },
                    '&:hover': {
                      bgcolor: statsVisible 
                        ? 'success.dark'
                        : alpha(theme.palette.divider, 0.06),
                      borderColor: statsVisible 
                        ? 'success.dark'
                        : alpha(theme.palette.divider, 0.15),
                      boxShadow: statsVisible
                        ? `0 4px 14px ${alpha(theme.palette.success.main, 0.35)}`
                        : `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    }
                  }}
                  aria-label={statsVisible ? 'Hide statistics' : 'Show statistics'}
                  aria-expanded={statsVisible}
                >
                  {statsVisible ? 'Hide Insights' : 'Show Insights'}
                </Button>
              )}
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo optimization
  return (
    prevProps.availability?.suburb === nextProps.availability?.suburb &&
    prevProps.availability?.kmWillingToTravel === nextProps.availability?.kmWillingToTravel &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.statsVisible === nextProps.statsVisible &&
    prevProps.onViewModeChange === nextProps.onViewModeChange &&
    prevProps.onEditOpen === nextProps.onEditOpen &&
    prevProps.onStatsToggle === nextProps.onStatsToggle
  );
});

AvailabilityHeader.propTypes = {
  availability: PropTypes.shape({
    suburb: PropTypes.string,
    kmWillingToTravel: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  viewMode: PropTypes.oneOf(['calendar', 'list']).isRequired,
  onViewModeChange: PropTypes.func.isRequired,
  onEditOpen: PropTypes.func.isRequired,
  statsVisible: PropTypes.bool,
  onStatsToggle: PropTypes.func,
};

AvailabilityHeader.defaultProps = {
  availability: {},
  statsVisible: true,
  onStatsToggle: null,
};

export default AvailabilityHeader;

