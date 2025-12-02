import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  Avatar,
  Alert,
  Button,
  Skeleton,
  useTheme,
  useMediaQuery,
  alpha,
  Grow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Person,
  Business,
  Email,
  Phone,
  Visibility,
  CheckCircle,
  MarkEmailRead,
  Edit
} from '@mui/icons-material';
import { 
  getStatusIcon, 
  getStatusColor, 
  getStatusLabel 
} from './utils/workHistoryUtils';

/**
 * ProfessionalReferences Component
 * Displays professional references with status tracking, progress, and email tracking
 */
const ProfessionalReferences = ({ 
  references = [], 
  isLoading = false, 
  isError = false, 
  error = null,
  onRetry = null,
  onEditClick = null,
  onItemEdit = null
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const displayReferences = useMemo(() => {
    return Array.isArray(references) ? references : [];
  }, [references]);

  // Modern, visible status configuration with better contrast
  const statusConfig = useMemo(() => ({
    success: { 
      bg: alpha('#10B981', 0.15), 
      color: '#059669', 
      border: '#10B981',
      icon: '#10B981',
      textColor: '#065F46'
    },
    info: { 
      bg: alpha('#3B82F6', 0.15), 
      color: '#2563EB', 
      border: '#3B82F6',
      icon: '#3B82F6',
      textColor: '#1E40AF'
    },
    warning: { 
      bg: alpha('#F59E0B', 0.15), 
      color: '#D97706', 
      border: '#F59E0B',
      icon: '#F59E0B',
      textColor: '#92400E'
    },
    error: { 
      bg: alpha('#EF4444', 0.15), 
      color: '#DC2626', 
      border: '#EF4444',
      icon: '#EF4444',
      textColor: '#991B1B'
    }
  }), []);

  return (
      <Box
        sx={{
          position: 'relative',
          mt: { xs: 2.5, md: 3 },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, #3B82F6 0%, #00BCD4 50%, #3B82F6 100%)`,
            borderRadius: '4px 4px 0 0',
            zIndex: 1
          }
        }}
      >
        <Box
          sx={{
            p: { xs: 1.5 ,md: 2.5 },
            borderRadius: { xs: 2.5, md: 3 },
            bgcolor: '#FFFFFF',
            border: `1px solid ${alpha('#E5E7EB', 0.8)}`,
            boxShadow: `0 1px 3px ${alpha('#000', 0.05)}, 0 4px 12px ${alpha('#000', 0.03)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: `0 4px 16px ${alpha('#3B82F6', 0.1)}, 0 8px 24px ${alpha('#000', 0.05)}`,
              borderColor: alpha('#3B82F6', 0.2),
            }
          }}
        >
        {/* Header */}
        <Stack 
          direction="row" 
          alignItems="center" 
          justifyContent="space-between"
          spacing={2} 
          sx={{ mb: 2.5 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
            <Box
              sx={{
                width: { xs: 44, md: 48 },
                height: { xs: 44, md: 48 },
                borderRadius: 2,
                background: `linear-gradient(135deg, #3B82F6 0%, #00BCD4 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 2px 8px ${alpha('#3B82F6', 0.25)}`
              }}
            >
              <Person sx={{ 
                color: '#FFFFFF', 
                fontSize: { xs: 22, md: 24 } 
              }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant={isMobile ? 'subtitle1' : 'h6'} 
                fontWeight={700}
                sx={{
                  color: '#1F2937',
                  letterSpacing: '-0.01em',
                  fontSize: { xs: '1.125rem', md: '1.25rem' },
                  mb: 0.5,
                  lineHeight: 1.2
                }}
              >
                Professional References
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#6B7280',
                    fontWeight: 600,
                    fontSize: '0.8125rem'
                  }}
                >
                  {isLoading && displayReferences.length === 0 
                    ? 'Loading...' 
                    : `${displayReferences.length || 0} reference${displayReferences.length !== 1 ? 's' : ''}`
                  }
                </Typography>
              </Stack>
            </Box>
          </Stack>
          {/* Edit Button */}
          {onEditClick && (
            <Tooltip title="Edit Professional References" arrow placement="top">
              <IconButton
                onClick={onEditClick}
                sx={{
                  width: { xs: 36, md: 40 },
                  height: { xs: 36, md: 40 },
                  bgcolor: alpha('#3B82F6', 0.1),
                  color: '#3B82F6',
                  border: `1px solid ${alpha('#3B82F6', 0.2)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha('#3B82F6', 0.15),
                    borderColor: alpha('#3B82F6', 0.3),
                    transform: 'scale(1.05)',
                    boxShadow: `0 4px 12px ${alpha('#3B82F6', 0.2)}`
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

        {/* Error State */}
        {isError && !displayReferences.length && (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 2,
              borderRadius: 2,
              bgcolor: alpha('#FEF3C7', 0.5),
              border: `1px solid ${alpha('#F59E0B', 0.3)}`,
              '& .MuiAlert-icon': {
                color: '#F59E0B'
              },
              '& .MuiAlert-message': {
                color: '#92400E',
                fontWeight: 500
              }
            }}
            action={
              onRetry && (
                <Button 
                  size="small" 
                  onClick={onRetry}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 1.5,
                    fontSize: '0.8125rem',
                    py: 0.5,
                    color: '#F59E0B',
                    '&:hover': {
                      bgcolor: alpha('#F59E0B', 0.1)
                    }
                  }}
                >
                  Retry
                </Button>
              )
            }
          >
            {error?.response?.data?.message || 'Failed to load reference data. Showing profile references only.'}
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && displayReferences.length === 0 ? (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
            gap: 1.5 
          }}>
            {[1, 2].map((i) => (
              <Box 
                key={i} 
                sx={{ 
                  border: `1px solid ${alpha(theme.palette.divider, 0.4)}`, 
                  borderRadius: 2.5, 
                  p: 2,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" spacing={1.25}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="70%" height={20} />
                      <Skeleton variant="text" width="50%" height={14} sx={{ mt: 0.5 }} />
                    </Box>
                    <Skeleton variant="rounded" width={80} height={24} />
                  </Stack>
                  <Box sx={{ borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`, pt: 1.5 }} />
                  <Skeleton variant="text" width="85%" height={14} />
                  <Skeleton variant="text" width="75%" height={14} />
                </Stack>
              </Box>
            ))}
          </Box>
        ) : displayReferences.length > 0 ? (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr', md: '1fr 1fr' },
            gap: { xs: 1.5, md: 2 }
          }}>
            {displayReferences.map((reference, index) => {
              const StatusIconComponent = getStatusIcon(reference.status);
              const statusColor = getStatusColor(reference.status);
              const config = statusConfig[statusColor] || statusConfig.warning;

              return (
                <Grow in timeout={800 + (index * 100)} key={reference._id || index}>
                  <Box
                    sx={{
                      position: 'relative',
                      p: { xs: 2, md: 2.25 },
                      borderRadius: 2,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      bgcolor: '#FFFFFF',
                      border: `1.5px solid ${alpha(config.border, 0.2)}`,
                      boxShadow: `0 1px 3px ${alpha('#000', 0.05)}, 0 2px 8px ${alpha('#000', 0.03)}`,
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        background: config.border,
                        borderRadius: '0 2px 2px 0'
                      },
                      '&:hover': {
                        borderColor: config.border,
                        boxShadow: `0 4px 16px ${alpha(config.border, 0.2)}, 0 2px 8px ${alpha('#000', 0.05)}`,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    {/* Reference Header */}
                    <Stack 
                      direction="row" 
                      alignItems="flex-start" 
                      justifyContent="space-between" 
                      spacing={1.5} 
                      sx={{ mb: 1.5, pl: 1.5 }}
                    >
                      <Stack 
                        direction="row" 
                        alignItems="center" 
                        spacing={1.5} 
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
                        onClick={onItemEdit ? () => onItemEdit(reference) : undefined}
                      >
                        <Avatar 
                          sx={{
                            bgcolor: config.bg,
                            color: config.color,
                            width: { xs: 44, md: 48 },
                            height: { xs: 44, md: 48 },
                            fontSize: { xs: '1rem', md: '1.125rem' },
                            fontWeight: 700,
                            border: `2px solid ${alpha(config.border, 0.3)}`
                          }}
                        >
                          {(reference.name || 'R').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography 
                              variant={isMobile ? 'body2' : 'subtitle1'} 
                              fontWeight={700} 
                              noWrap
                              sx={{ 
                                mb: 0.25,
                                fontSize: { xs: '0.9375rem', md: '1rem' },
                                color: '#111827',
                                lineHeight: 1.3
                              }}
                            >
                              {reference.name}
                            </Typography>
                            {onItemEdit && (
                              <Edit 
                                className="edit-indicator"
                                sx={{ 
                                  fontSize: 14, 
                                  color: '#3B82F6',
                                  opacity: 0,
                                  transition: 'opacity 0.2s ease',
                                  mb: 0.25
                                }} 
                              />
                            )}
                          </Stack>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#6B7280',
                              fontWeight: 500,
                              fontSize: '0.75rem'
                            }}
                          >
                            Reference #{index + 1}
                          </Typography>
                        </Box>
                      </Stack>
                      
                      <Chip
                        icon={StatusIconComponent}
                        label={getStatusLabel(reference.status)}
                        size="small"
                        sx={{
                          bgcolor: config.bg,
                          color: config.textColor || config.color,
                          border: `1.5px solid ${alpha(config.border, 0.4)}`,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 28,
                          px: 1,
                          '& .MuiChip-icon': {
                            color: config.icon,
                            fontSize: 16
                          },
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: alpha(config.border, 0.2),
                            transform: 'scale(1.02)'
                          }
                        }}
                      />
                    </Stack>

                    {/* Reference Details */}
                    <Stack spacing={{xs: 0.75, sm: 1.5}} sx={{ mt: 1.5 }}>
                      {/* Company & Position */}
                      <Box
                        sx={{
                          p: {xs: 0.5, sm: 0.85},
                          borderRadius: 1.5,
                          bgcolor: alpha('#3B82F6', 0.08),
                          border: `1px solid ${alpha('#3B82F6', 0.2)}`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: alpha('#3B82F6', 0.12),
                            borderColor: alpha('#3B82F6', 0.3)
                          }
                        }}
                      >
                        <Stack direction="row" alignItems="flex-start" spacing={1.25}>
                          <Box
                            sx={{
                              width: {xs: 30, sm: 36},
                              height: {xs: 30, sm: 36},
                              borderRadius: 1.5,
                              bgcolor: '#3B82F6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <Business 
                              sx={{ 
                                color: '#FFFFFF', 
                                fontSize: {xs: 16, sm: 18}
                              }} 
                            />
                          </Box>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography 
                              variant="body2" 
                              fontWeight={600} 
                              noWrap 
                              sx={{ 
                                mb: {xs: 0, sm: 0.25},
                                fontSize: { xs: '0.775rem', md: '0.9375rem' },
                                color: '#111827'
                              }}
                            >
                              {reference.company || 'N/A'}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: '#6B7280',
                                fontWeight: 500,
                                fontSize: { xs: '0.7125rem', md: '0.875rem' }
                              }}
                              noWrap
                            >
                              {reference.position || 'N/A'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>

                      {/* Email */}
                      {reference.email && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.25,
                            px: {xs: 1, sm: 1.5},
                            py: {xs: 0.5, sm: 1},
                            borderRadius: 1.5,
                            bgcolor: alpha('#8B5CF6', 0.08),
                            border: `1px solid ${alpha('#8B5CF6', 0.2)}`,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: alpha('#8B5CF6', 0.12),
                              borderColor: alpha('#8B5CF6', 0.3)
                            }
                          }}
                        >
                          <Box
                            sx={{
                              width: {xs: 30, sm: 36},
                              height: {xs: 30, sm: 36},
                              borderRadius: 1.5,
                              bgcolor: '#8B5CF6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <Email 
                              sx={{ 
                                color: '#FFFFFF', 
                                fontSize: {xs: 14, sm: 18}
                              }} 
                            />
                          </Box>
                          <Typography 
                            variant="body2" 
                            noWrap
                            sx={{ 
                              flex: 1,
                              fontSize: { xs: '0.825rem', md: '0.9375rem' },
                              color: '#111827',
                              fontWeight: 500
                            }}
                          >
                            {reference.email}
                          </Typography>
                        </Box>
                      )}

                      {/* Phone */}
                      {reference.phone && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.25,
                            px: {xs: 1, sm: 1.5},
                            py: {xs: 0.5, sm: 1},
                            borderRadius: 1.5,
                            bgcolor: alpha('#10B981', 0.08),
                            border: `1px solid ${alpha('#10B981', 0.2)}`,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: alpha('#10B981', 0.12),
                              borderColor: alpha('#10B981', 0.3)
                            }
                          }}
                        >
                          <Box
                            sx={{
                              width: {xs: 30, sm: 36},
                              height: {xs: 30, sm: 36},
                              borderRadius: 1.5,
                              bgcolor: '#10B981',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <Phone 
                              sx={{ 
                                color: '#FFFFFF', 
                                fontSize: {xs: 14, sm: 18}
                              }} 
                            />
                          </Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: { xs: '0.825rem', md: '0.9375rem' },
                              color: '#111827',
                              fontWeight: 500
                            }}
                          >
                            {reference.phone}
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                    {/* Email Tracking */}
                    {reference.emailTracking && (
                      <Box 
                        sx={{ 
                          mt: {xs: 0.75, sm: 1.5}, 
                          pt: {xs: 0.5, sm: 1.5},
                          borderTop: `1px solid ${alpha('#E5E7EB', 0.8)}`
                        }}
                      >
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            mb: 1, 
                            display: 'block', 
                            fontSize: '0.75rem',
                            color: '#6B7280',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          Email Tracking
                        </Typography>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ gap: 0.75 }}>
                          {reference.emailTracking.opened && (
                            <Chip
                              icon={<Visibility sx={{ fontSize: 14 }} />}
                              label="Opened"
                              size="small"
                              sx={{
                                bgcolor: alpha('#3B82F6', 0.1),
                                color: '#2563EB',
                                border: `1px solid ${alpha('#3B82F6', 0.3)}`,
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                height: 24,
                                '& .MuiChip-icon': {
                                  color: '#3B82F6',
                                  fontSize: 14
                                }
                              }}
                            />
                          )}
                          {reference.emailTracking.clicked && (
                            <Chip
                              icon={<CheckCircle sx={{ fontSize: 14 }} />}
                              label="Clicked"
                              size="small"
                              sx={{
                                bgcolor: alpha('#10B981', 0.1),
                                color: '#059669',
                                border: `1px solid ${alpha('#10B981', 0.3)}`,
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                height: 24,
                                '& .MuiChip-icon': {
                                  color: '#10B981',
                                  fontSize: 14
                                }
                              }}
                            />
                          )}
                          {reference.emailTracking.emailsSent > 0 && (
                            <Chip
                              icon={<MarkEmailRead sx={{ fontSize: 14 }} />}
                              label={`${reference.emailTracking.emailsSent} sent`}
                              size="small"
                              sx={{
                                bgcolor: alpha('#8B5CF6', 0.1),
                                color: '#7C3AED',
                                border: `1px solid ${alpha('#8B5CF6', 0.3)}`,
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                height: 24,
                                '& .MuiChip-icon': {
                                  color: '#8B5CF6',
                                  fontSize: 14
                                }
                              }}
                            />
                          )}
                        </Stack>
                      </Box>
                    )}

                    {/* Progress Bar */}
                    {reference.progress && 
                     typeof reference.progress.totalQuestions === 'number' && 
                     reference.progress.totalQuestions > 0 && (
                      <Box 
                        sx={{ 
                          mt: 1.5, 
                          pt: 1.5,
                          pl: 1.5,
                          pr: 1.5,
                          pb: 1.5,
                          borderRadius: 2,
                          borderTop: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                          background: `linear-gradient(135deg, ${alpha('#1565C0', 0.06)} 0%, ${alpha('#1565C0', 0.03)} 100%)`,
                          border: `1px solid ${alpha('#1565C0', 0.15)}`
                        }}
                      >
                        <Stack 
                          direction="row" 
                          justifyContent="space-between" 
                          alignItems="center" 
                          sx={{ mb: 1.25 }}
                        >
                          <Stack direction="row" alignItems="center" spacing={0.75}>
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: '#1565C0',
                                boxShadow: `0 0 6px ${alpha('#1565C0', 0.6)}`
                              }}
                            />
                            <Typography 
                              variant="body2" 
                              color="text.primary" 
                              fontWeight={700}
                              sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}
                            >
                              Questionnaire Progress
                            </Typography>
                          </Stack>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'baseline',
                              gap: 0.5,
                              px: 1.25,
                              py: 0.5,
                              borderRadius: 1.5,
                              background: `linear-gradient(135deg, ${alpha('#1565C0', 0.12)} 0%, ${alpha('#1565C0', 0.06)} 100%)`,
                              border: `1px solid ${alpha('#1565C0', 0.2)}`
                            }}
                          >
                            <Typography 
                              variant="h6" 
                              fontWeight={800} 
                              sx={{ 
                                color: '#1565C0',
                                fontSize: { xs: '0.9375rem', md: '1rem' },
                                lineHeight: 1.2
                              }}
                            >
                              {reference.progress.answeredQuestions || 0}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: theme.palette.text.secondary,
                                fontWeight: 600,
                                opacity: 0.7,
                                fontSize: { xs: '0.75rem', md: '0.8125rem' }
                              }}
                            >
                              /{reference.progress.totalQuestions}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                ml: 0.25,
                                color: '#1565C0',
                                fontWeight: 700,
                                fontSize: '0.6875rem'
                              }}
                            >
                              ({reference.progress.percentageComplete || 0}%)
                            </Typography>
                          </Box>
                        </Stack>
                      
                        {/* Progress Bar */}
                        <Box 
                          sx={{
                            height: 8,
                            bgcolor: alpha(theme.palette.grey[300], 0.3),
                            borderRadius: 2,
                            overflow: 'hidden',
                            position: 'relative',
                            boxShadow: `inset 0 1px 2px ${alpha(theme.palette.common.black, 0.05)}`
                          }}
                        >
                          <Box 
                            sx={{
                              height: '100%',
                              width: `${Math.min(Math.max(reference.progress.percentageComplete || 0, 0), 100)}%`,
                              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                              borderRadius: 2,
                              position: 'relative',
                              background: reference.progress.percentageComplete >= 100
                                ? `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 50%, ${theme.palette.success.main} 100%)`
                                : reference.progress.percentageComplete >= 75
                                ? `linear-gradient(90deg, ${theme.palette.info.main} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.info.main} 100%)`
                                : reference.progress.percentageComplete >= 50
                                ? `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 50%, ${theme.palette.primary.main} 100%)`
                                : `linear-gradient(90deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.light} 50%, ${theme.palette.warning.main} 100%)`,
                              boxShadow: `0 1px 4px ${alpha(
                                reference.progress.percentageComplete >= 100
                                  ? theme.palette.success.main
                                  : reference.progress.percentageComplete >= 50
                                  ? theme.palette.primary.main
                                  : theme.palette.warning.main,
                                0.3
                              )}`,
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: `linear-gradient(90deg, transparent 0%, ${alpha('#fff', 0.3)} 50%, transparent 100%)`,
                                borderRadius: 2,
                                animation: 'shimmer 2.5s ease-in-out infinite'
                              }
                            }} 
                          />
                        </Box>
                        
                        {/* Progress Status */}
                        <Stack 
                          direction="row" 
                          justifyContent="space-between" 
                          alignItems="center"
                          sx={{ mt: 1 }}
                        >
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            fontWeight={600}
                            sx={{ fontSize: '0.75rem' }}
                          >
                            {reference.progress.totalQuestions - (reference.progress.answeredQuestions || 0)} remaining
                          </Typography>
                          <Chip
                            label={
                              reference.progress.percentageComplete >= 100
                                ? 'Completed'
                                : reference.progress.percentageComplete >= 75
                                ? 'Almost Done'
                                : reference.progress.percentageComplete >= 50
                                ? 'Halfway'
                                : 'Getting Started'
                            }
                            size="small"
                            sx={{
                              background: reference.progress.percentageComplete >= 100
                                ? `linear-gradient(135deg, ${alpha('#26A69A', 0.12)} 0%, ${alpha('#26A69A', 0.06)} 100%)`
                                : reference.progress.percentageComplete >= 75
                                ? `linear-gradient(135deg, ${alpha('#1565C0', 0.12)} 0%, ${alpha('#1565C0', 0.06)} 100%)`
                                : reference.progress.percentageComplete >= 50
                                ? `linear-gradient(135deg, ${alpha('#7E57C2', 0.12)} 0%, ${alpha('#7E57C2', 0.06)} 100%)`
                                : `linear-gradient(135deg, ${alpha('#7E57C2', 0.12)} 0%, ${alpha('#7E57C2', 0.06)} 100%)`,
                              color: reference.progress.percentageComplete >= 100
                                ? '#26A69A'
                                : reference.progress.percentageComplete >= 75
                                ? '#1565C0'
                                : reference.progress.percentageComplete >= 50
                                ? '#7E57C2'
                                : '#7E57C2',
                              border: `1px solid ${
                                reference.progress.percentageComplete >= 100
                                  ? alpha('#26A69A', 0.25)
                                  : reference.progress.percentageComplete >= 75
                                  ? alpha('#1565C0', 0.25)
                                  : reference.progress.percentageComplete >= 50
                                  ? alpha('#7E57C2', 0.25)
                                  : alpha('#7E57C2', 0.25)
                              }`,
                              fontWeight: 700,
                              fontSize: '0.6875rem',
                              height: 22
                            }}
                          />
                        </Stack>
                      </Box>
                    )}
                  </Box>
                </Grow>
              );
            })}
          </Box>
        ) : (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: { xs: 6, md: 8 },
              px: 2
            }}
          >
            <Box
              sx={{
                width: { xs: 80, md: 96 },
                height: { xs: 80, md: 96 },
                borderRadius: '50%',
                bgcolor: alpha('#3B82F6', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                border: `2px solid ${alpha('#3B82F6', 0.2)}`
              }}
            >
              <Person sx={{ fontSize: { xs: 40, md: 48 }, color: '#3B82F6' }} />
            </Box>
            <Typography 
              variant="h6" 
              fontWeight={700} 
              gutterBottom 
              sx={{
                color: '#111827',
                fontSize: { xs: '1.125rem', md: '1.25rem' },
                mb: 1
              }}
            >
              No References Added
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                maxWidth: 400, 
                mx: 'auto',
                fontSize: { xs: '0.875rem', md: '0.9375rem' },
                color: '#6B7280',
                lineHeight: 1.6
              }}
            >
              Add professional references to strengthen your profile and showcase your professional network
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProfessionalReferences;

