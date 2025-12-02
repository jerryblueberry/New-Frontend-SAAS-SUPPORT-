import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Container,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Work,
  Business,
  CalendarToday,
  LocationOn,
  Description,
  CheckCircle,
  AccessTime,
  TrendingUp,
  Edit
} from '@mui/icons-material';
import { formatDisplayDate, calculateDuration } from './utils/workHistoryUtils';

/**
 * Premium WorkExperience Component
 * Production-ready with refined typography, colors, and responsive design
 */
const WorkExperience = ({ workHistory = [], isLoading = false, onEditClick, onItemEdit }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const workHistoryList = useMemo(() => {
    return Array.isArray(workHistory) ? workHistory : [];
  }, [workHistory]);

  // Premium color palette
  const colors = {
    primary: '#0A66C2', // LinkedIn blue - professional
    secondary: '#5B21B6', // Deep purple - sophisticated
    accent: '#059669', // Emerald green - success
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      600: '#525252',
      700: '#404040',
      900: '#171717'
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          Loading work experience...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        mx: { xs: 0, sm: 'auto' },
        borderRadius: { xs: 3, md: 4 },
        bgcolor: '#FFFFFF',
        border: `1px solid ${colors.neutral[200]}`,
        boxShadow: `0 1px 3px ${alpha('#000', 0.08)}, 0 1px 2px ${alpha('#000', 0.06)}`,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: `0 4px 12px ${alpha('#000', 0.1)}, 0 2px 4px ${alpha('#000', 0.06)}`,
        }
      }}
    >
      {/* Premium gradient accent bar */}
      <Box
        sx={{
          height: 4,
          background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        }}
      />

      <Box sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
        {/* Header Section */}
        <Stack 
          direction="row" 
          alignItems="center" 
          justifyContent="space-between"
          spacing={{ xs: 2, md: 2.5 }}
          sx={{ mb: { xs: 3, md: 4 } }}
        >
          <Stack 
            direction="row" 
            alignItems="center" 
            spacing={{ xs: 2, md: 2.5 }}
            sx={{ flex: 1, minWidth: 0 }}
          >
            <Box
              sx={{
                width: { xs: 48, md: 56 },
                height: { xs: 48, md: 56 },
                borderRadius: 2.5,
                background: `linear-gradient(135deg, ${alpha(colors.primary, 0.1)} 0%, ${alpha(colors.secondary, 0.1)} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Work sx={{ 
                color: colors.primary,
                fontSize: { xs: 24, md: 28 }
              }} />
            </Box>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.25rem', sm: '1.375rem', md: '1.5rem' },
                  lineHeight: 1.3,
                  color: colors.neutral[900],
                  mb: 0.5,
                  letterSpacing: '-0.01em'
                }}
              >
                Work Experience
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <TrendingUp sx={{ 
                  fontSize: { xs: 16, md: 18 }, 
                  color: colors.accent 
                }} />
                <Typography 
                  variant="body2"
                  sx={{
                    color: colors.neutral[600],
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', md: '0.9375rem' },
                    letterSpacing: '0.01em'
                  }}
                >
                  {workHistoryList.length} position{workHistoryList.length !== 1 ? 's' : ''}
                </Typography>
              </Stack>
            </Box>
          </Stack>
          
          {/* Edit Button */}
          {onEditClick && (
            <Tooltip title="Edit Work Experience" arrow placement="top">
              <IconButton
                onClick={onEditClick}
                sx={{
                  width: { xs: 36, md: 40 },
                  height: { xs: 36, md: 40 },
                  bgcolor: alpha(colors.primary, 0.1),
                  color: colors.primary,
                  border: `1px solid ${alpha(colors.primary, 0.2)}`,
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  '&:hover': {
                    bgcolor: alpha(colors.primary, 0.15),
                    borderColor: alpha(colors.primary, 0.3),
                    transform: 'scale(1.05)',
                    boxShadow: `0 4px 12px ${alpha(colors.primary, 0.2)}`
                  },
                  '&:active': {
                    transform: 'scale(0.95)'
                  }
                }}
              >
                <Edit sx={{ fontSize: { xs: 16, md: 18 } }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {/* Work History List */}
        {workHistoryList.length > 0 ? (
          <Stack spacing={{ xs: 2, md: 2.5 }}>
            {workHistoryList.map((history, index) => (
              <Fade 
                in 
                timeout={400 + (index * 100)} 
                key={history.id || history._id || index}
              >
                <Box
                  sx={{
                    position: 'relative',
                    p: { xs: 1.5, sm: 2.5, md: 3 },
                    borderRadius: 2.5,
                    bgcolor: history.current ? alpha(colors.accent, 0.04) : colors.neutral[50],
                    border: `1.5px solid ${history.current ? alpha(colors.accent, 0.2) : colors.neutral[200]}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      background: history.current 
                        ? colors.accent
                        : `linear-gradient(180deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                      opacity: history.current ? 1 : 0.8
                    },
                    '&:hover': {
                      bgcolor: history.current ? alpha(colors.accent, 0.06) : '#FFFFFF',
                      borderColor: history.current ? alpha(colors.accent, 0.3) : alpha(colors.primary, 0.3),
                      boxShadow: `0 4px 12px ${alpha(history.current ? colors.accent : colors.primary, 0.12)}`,
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  {/* Title and Company */}
                  <Stack 
                    direction={{ xs: 'row', sm: 'row' }}
                    alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
                    justifyContent="space-between"
                    spacing={{ xs: 1.5, sm: 2 }}
                    sx={{ mb: 2.5, pl: { xs: 1.5, md: 2 } }}
                  >
                    <Box 
                      sx={{ 
                        flex: 1, 
                        minWidth: 0,
                        cursor: onItemEdit ? 'pointer' : 'default',
                        '&:hover': onItemEdit ? {
                          '& .edit-indicator': {
                            opacity: 1
                          }
                        } : {}
                      }}
                      onClick={onItemEdit ? () => onItemEdit(history) : undefined}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography 
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: '1rem', sm: '1.0625rem', md: '1.125rem' },
                            lineHeight: 1.4,
                            color: colors.neutral[900],
                            mb: 1,
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {history.title || 'Untitled Position'}
                        </Typography>
                        {onItemEdit && (
                          <Edit 
                            className="edit-indicator"
                            sx={{ 
                              fontSize: 16, 
                              color: colors.primary,
                              opacity: 0,
                              transition: 'opacity 0.2s ease',
                              mb: 1
                            }} 
                          />
                        )}
                      </Stack>
                      
                      {history.company && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Business 
                            sx={{ 
                              color: colors.primary,
                              fontSize: { xs: 16, md: 18 }
                            }} 
                          />
                          <Typography 
                            variant="body1"
                            sx={{
                              color: colors.neutral[700],
                              fontWeight: 600,
                              fontSize: { xs: '0.9375rem', md: '1rem' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              letterSpacing: '0.005em'
                            }}
                          >
                            {history.company}
                          </Typography>
                        </Stack>
                      )}
                    </Box>

                    {history.current && (
                      <Chip
                        icon={<CheckCircle sx={{ fontSize: 14 }} />}
                        label="Current"
                        size="small"
                        sx={{
                          bgcolor: alpha(colors.accent, 0.12),
                          color: colors.accent,
                          border: `1.5px solid ${alpha(colors.accent, 0.3)}`,
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          height: 26,
                          px: 1,
                          letterSpacing: '0.02em',
                          '& .MuiChip-icon': {
                            color: colors.accent,
                            fontSize: 14
                          }
                        }}
                      />
                    )}
                  </Stack>
                  
                  {/* Details Section */}
                  <Stack spacing={1.5} sx={{ pl: { xs: 1.5, md: 2 } }}>
                    {/* Date and Duration */}
                    <Stack 
                      direction={{ xs: 'row', sm: 'row' }}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      spacing={{ xs: 1, sm: 1.5 }}
                      flexWrap="wrap"
                      sx={{ gap: { xs: 1, sm: 1.5 } }}
                    >
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 1,
                          px: {xs: 1, sm: 1.5},
                          py: {xs: 0.5, sm: 0.75},
                          borderRadius: 1.5,
                          bgcolor: alpha(colors.secondary, 0.08),
                          border: `1px solid ${alpha(colors.secondary, 0.2)}`
                        }}
                      >
                        <CalendarToday 
                          sx={{ 
                            color: colors.secondary,
                            fontSize: { xs: 12, md: 16 }
                          }} 
                        />
                        <Typography 
                          variant="body2"
                          sx={{
                            color: colors.neutral[700],
                            fontWeight: 600,
                            fontSize: { xs: '0.7125rem', md: '0.875rem' },
                            letterSpacing: '0.01em'
                          }}
                        >
                          {formatDisplayDate(history.startDate)} – {formatDisplayDate(history.endDate)}
                        </Typography>
                      </Box>

                      <Chip
                        icon={<AccessTime sx={{ fontSize: 14 }} />}
                        label={calculateDuration(history.startDate, history.endDate)}
                        size="small"
                        sx={{
                          bgcolor: alpha(colors.primary, 0.08),
                          color: colors.primary,
                          border: `1px solid ${alpha(colors.primary, 0.2)}`,
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          height: 26,
                          '& .MuiChip-icon': {
                            color: colors.primary,
                            fontSize: 14
                          }
                        }}
                      />
                       {/* Location */}
                    {history.location && (
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 1,
                          px: {xs: 1, sm: 1.5},
                          py: {xs: 0.5, sm: 0.75},
                          borderRadius: 1.5,
                          bgcolor: alpha(colors.accent, 0.08),
                          border: `1px solid ${alpha(colors.accent, 0.2)}`,
                          width: 'fit-content'
                        }}
                      >
                        <LocationOn 
                          sx={{ 
                            color: colors.accent,
                            fontSize: { xs: 14, md: 16 }
                          }} 
                        />
                        <Typography 
                          variant="body2"
                          sx={{
                            color: colors.neutral[700],
                            fontWeight: 600,
                            fontSize: { xs: '0.7125rem', md: '0.875rem' },
                            letterSpacing: '0.001em'
                          }}
                        >
                          {history.location}
                        </Typography>
                      </Box>
                    )}
                    </Stack>

                   

                    {/* Description */}
                    {history.description && (
                      <Box
                        sx={{
                          mt: 0.5,
                          p: { xs: 1.5, md: 2 },
                          borderRadius: 2,
                          bgcolor: '#FFFFFF',
                          border: `1px solid ${colors.neutral[200]}`
                        }}
                      >
                        <Stack direction="row" alignItems="flex-start" spacing={1}>
                      
                          <Typography 
                            variant="body2"
                            sx={{
                              color: colors.neutral[700],
                              lineHeight:isMobile ? 1.5 : 1.7,
                              fontSize: { xs: '0.9275rem', md: '0.95rem' },
                              letterSpacing: '0.0045em'
                            }}
                          >
                            {history.description}
                          </Typography>
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </Box>
              </Fade>
            ))}
          </Stack>
        ) : (
          <Box 
            sx={{ 
              textAlign: 'center',
              py: { xs: 8, md: 12 },
              px: 2
            }}
          >
            <Box
              sx={{
                width: { xs: 80, md: 96 },
                height: { xs: 80, md: 96 },
                borderRadius: '50%',
                bgcolor: colors.neutral[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2.5
              }}
            >
              <Work sx={{ 
                fontSize: { xs: 40, md: 48 },
                color: colors.neutral[300]
              }} />
            </Box>
            <Typography 
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.125rem', md: '1.25rem' },
                color: colors.neutral[900],
                mb: 1,
                letterSpacing: '-0.01em'
              }}
            >
              No Work Experience
            </Typography>
            <Typography 
              variant="body1"
              sx={{
                color: colors.neutral[600],
                fontSize: { xs: '0.9375rem', md: '1rem' },
                lineHeight: 1.6,
                maxWidth: 440,
                mx: 'auto',
                letterSpacing: '0.005em'
              }}
            >
              Add your work experience to showcase your professional background and strengthen your profile
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default WorkExperience;