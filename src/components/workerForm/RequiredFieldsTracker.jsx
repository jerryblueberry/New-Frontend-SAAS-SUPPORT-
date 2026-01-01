import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  alpha,
  Chip,
  Collapse,
  IconButton,
  Stack,
} from '@mui/material';
import { CheckCircle2, X, AlertCircle, ChevronDown, ChevronUp, Info, Lock } from 'lucide-react';

const RequiredFieldsTracker = ({
  fields = [],
  validationErrors = {},
  onFieldClick,
  showDetails = true,
  compact = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [expanded, setExpanded] = React.useState(true); // Always initially opened

  // Calculate completion stats
  const stats = useMemo(() => {
    const total = fields.length;
    const completed = fields.filter((field) => {
      if (validationErrors[field.key]) return false;
      return field.isCompleted;
    }).length;
    const required = fields.filter((f) => f.required).length;
    const completedRequired = fields.filter((f) => f.required && f.isCompleted && !validationErrors[f.key]).length;
    
    return {
      total,
      completed,
      required,
      completedRequired,
      progress: total > 0 ? (completed / total) * 100 : 0,
      requiredProgress: required > 0 ? (completedRequired / required) * 100 : 0,
    };
  }, [fields, validationErrors]);

  const hasErrors = Object.keys(validationErrors).length > 0;
  const allRequiredCompleted = stats.completedRequired === stats.required && stats.required > 0;

  // Compact row layout for sidebar
  if (compact) {
    return (
      <Box
        sx={{
          width: '100%',
          borderRadius: '14px',
          bgcolor: '#ffffff',
          border: `1.5px solid ${hasErrors ? alpha(theme.palette.error.main, 0.2) : allRequiredCompleted ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.divider, 0.12)}`,
          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'sticky',
          top: { xs: 16, sm: 24 },
          maxHeight: { xs: 'calc(100vh - 32px)', sm: 'calc(100vh - 48px)' },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Compact Header */}
        <Box
          sx={{
            p: { xs: 1.5, sm: 1.75 },
            bgcolor: hasErrors
              ? alpha(theme.palette.error.main, 0.04)
              : allRequiredCompleted
              ? alpha(theme.palette.success.main, 0.04)
              : alpha(theme.palette.primary.main, 0.03),
            borderBottom: expanded && showDetails ? `1px solid ${alpha(theme.palette.divider, 0.08)}` : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  borderRadius: '10px',
                  bgcolor: hasErrors
                    ? alpha(theme.palette.error.main, 0.15)
                    : allRequiredCompleted
                    ? alpha(theme.palette.success.main, 0.15)
                    : alpha(theme.palette.primary.main, 0.12),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${hasErrors ? alpha(theme.palette.error.main, 0.25) : allRequiredCompleted ? alpha(theme.palette.success.main, 0.25) : alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                {hasErrors ? (
                  <AlertCircle size={isMobile ? 16 : 18} color={theme.palette.error.main} strokeWidth={2.5} />
                ) : allRequiredCompleted ? (
                  <CheckCircle2 size={isMobile ? 16 : 18} color={theme.palette.success.main} strokeWidth={2.5} />
                ) : (
                  <Info size={isMobile ? 16 : 18} color={theme.palette.primary.main} strokeWidth={2.5} />
                )}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    fontWeight: 700,
                    color: 'text.primary',
                    lineHeight: 1.3,
                  }}
                >
                  Progress
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: '0.6875rem', sm: '0.75rem' },
                    color: 'text.secondary',
                    lineHeight: 1.3,
                  }}
                >
                  {stats.completedRequired}/{stats.required} Required
                </Typography>
              </Box>
            </Box>
            {showDetails && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                sx={{
                  width: { xs: 28, sm: 32 },
                  height: { xs: 28, sm: 32 },
                  borderRadius: '8px',
                  bgcolor: alpha(theme.palette.grey[200], 0.6),
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.grey[300], 0.8),
                    transform: 'scale(1.08)',
                    boxShadow: `0 2px 6px ${alpha(theme.palette.common.black, 0.1)}`,
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                }}
              >
                {expanded ? (
                  <ChevronUp size={16} color={theme.palette.text.secondary} strokeWidth={2.5} />
                ) : (
                  <ChevronDown size={16} color={theme.palette.text.secondary} strokeWidth={2.5} />
                )}
              </IconButton>
            )}
          </Box>

          {/* Compact Progress Bar */}
          <Box sx={{ mt: 1 }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: { xs: 5, sm: 6 },
                bgcolor: alpha(theme.palette.grey[200], 0.4),
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${stats.requiredProgress}%`,
                  background: allRequiredCompleted
                    ? `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light || theme.palette.success.main} 100%)`
                    : hasErrors
                    ? `linear-gradient(90deg, ${theme.palette.error.main} 0%, ${alpha(theme.palette.error.main, 0.8)} 100%)`
                    : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
                  borderRadius: '8px',
                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: `0 2px 6px ${alpha(allRequiredCompleted ? theme.palette.success.main : hasErrors ? theme.palette.error.main : theme.palette.primary.main, 0.3)}`,
                }}
              />
            </Box>
            <Typography
              sx={{
                fontSize: { xs: '0.625rem', sm: '0.6875rem' },
                color: 'text.secondary',
                mt: 0.5,
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              {Math.round(stats.requiredProgress)}% Complete
            </Typography>
          </Box>
        </Box>

        {/* Compact Fields List */}
        <Collapse in={expanded && showDetails} timeout={300}>
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              px: { xs: 1.5, sm: 1.75 },
              py: { xs: 1.25, sm: 1.5 },
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: alpha(theme.palette.grey[400], 0.3),
                borderRadius: 2,
                '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.4) },
              },
            }}
          >
            <Stack spacing={0.75}>
              {fields.map((field, index) => {
                const hasError = !!validationErrors[field.key];
                const isCompleted = field.isCompleted && !hasError;
                const isRequired = field.required;

                return (
                  <Box
                    key={field.key || index}
                    onClick={() => onFieldClick && onFieldClick(field.key)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: { xs: 0.75, sm: 1 },
                      p: { xs: 0.875, sm: 1 },
                      borderRadius: '10px',
                      bgcolor: hasError
                        ? alpha(theme.palette.error.main, 0.04)
                        : isCompleted
                        ? alpha(theme.palette.success.main, 0.04)
                        : 'transparent',
                      border: `1px solid ${hasError ? alpha(theme.palette.error.main, 0.15) : isCompleted ? alpha(theme.palette.success.main, 0.15) : alpha(theme.palette.grey[300], 0.1)}`,
                      cursor: onFieldClick ? 'pointer' : 'default',
                      transition: 'all 0.2s ease',
                      '&:hover': onFieldClick
                        ? {
                            bgcolor: hasError
                              ? alpha(theme.palette.error.main, 0.08)
                              : isCompleted
                              ? alpha(theme.palette.success.main, 0.08)
                              : alpha(theme.palette.primary.main, 0.04),
                            transform: 'translateX(2px)',
                          }
                        : {},
                    }}
                  >
                    {/* Compact Status Icon */}
                    <Box
                      sx={{
                        width: { xs: 24, sm: 28 },
                        height: { xs: 24, sm: 28 },
                        borderRadius: '8px',
                        bgcolor: hasError
                          ? alpha(theme.palette.error.main, 0.15)
                          : isCompleted
                          ? alpha(theme.palette.success.main, 0.15)
                          : alpha(theme.palette.grey[200], 0.6),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: `1.5px solid ${hasError ? alpha(theme.palette.error.main, 0.25) : isCompleted ? alpha(theme.palette.success.main, 0.25) : alpha(theme.palette.grey[300], 0.2)}`,
                      }}
                    >
                      {hasError ? (
                        <X size={isMobile ? 12 : 14} color={theme.palette.error.main} strokeWidth={2.5} />
                      ) : isCompleted ? (
                        <CheckCircle2 size={isMobile ? 12 : 14} color={theme.palette.success.main} strokeWidth={2.5} />
                      ) : (
                        <Box
                          sx={{
                            width: { xs: 6, sm: 8 },
                            height: { xs: 6, sm: 8 },
                            borderRadius: '50%',
                            bgcolor: theme.palette.grey[400],
                          }}
                        />
                      )}
                    </Box>

                    {/* Compact Field Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                        <Typography
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                            fontWeight: 600,
                            color: hasError
                              ? theme.palette.error.dark
                              : isCompleted
                              ? theme.palette.success.dark
                              : 'text.primary',
                            lineHeight: 1.3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {field.label}
                        </Typography>
                        {isRequired && (
                          <Box
                            component="span"
                            sx={{
                              width: 4,
                              height: 4,
                              borderRadius: '50%',
                              bgcolor: theme.palette.error.main,
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Box>
                      {hasError && validationErrors[field.key] && (
                        <Typography
                          sx={{
                            fontSize: { xs: '0.625rem', sm: '0.6875rem' },
                            color: theme.palette.error.main,
                            lineHeight: 1.3,
                            fontWeight: 500,
                            mt: 0.25,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {validationErrors[field.key]}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Collapse>

        {/* Compact Trust Footer */}
        <Box
          sx={{
            px: { xs: 1.5, sm: 1.75 },
            py: { xs: 1, sm: 1.25 },
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            borderTop: expanded && showDetails ? `1px solid ${alpha(theme.palette.divider, 0.08)}` : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
            <Lock size={isMobile ? 14 : 16} color={theme.palette.primary.main} strokeWidth={2} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: { xs: '0.6875rem', sm: '0.75rem' },
                  fontWeight: 600,
                  color: 'text.primary',
                  lineHeight: 1.3,
                  mb: 0.25,
                }}
              >
                Secure & Encrypted
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: '0.625rem', sm: '0.6875rem' },
                  color: 'text.secondary',
                  lineHeight: 1.4,
                }}
              >
                Your data is protected
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // Full-width layout (original design for mobile)
  return (
    <Box
      sx={{
        width: '100%',
        mb: { xs: 3, sm: 3.5 },
        borderRadius: '16px',
        bgcolor: '#ffffff',
        border: `1.5px solid ${hasErrors ? alpha(theme.palette.error.main, 0.2) : allRequiredCompleted ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.divider, 0.12)}`,
        boxShadow: hasErrors
          ? `0 4px 16px ${alpha(theme.palette.error.main, 0.08)}, 0 2px 4px ${alpha(theme.palette.common.black, 0.04)}`
          : allRequiredCompleted
          ? `0 4px 16px ${alpha(theme.palette.success.main, 0.08)}, 0 2px 4px ${alpha(theme.palette.common.black, 0.04)}`
          : `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: hasErrors
            ? `0 6px 20px ${alpha(theme.palette.error.main, 0.12)}, 0 2px 6px ${alpha(theme.palette.common.black, 0.06)}`
            : allRequiredCompleted
            ? `0 6px 20px ${alpha(theme.palette.success.main, 0.12)}, 0 2px 6px ${alpha(theme.palette.common.black, 0.06)}`
            : `0 4px 12px ${alpha(theme.palette.common.black, 0.06)}`,
        },
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: { xs: 1.75, sm: 2 },
          bgcolor: hasErrors
            ? alpha(theme.palette.error.main, 0.04)
            : allRequiredCompleted
            ? alpha(theme.palette.success.main, 0.04)
            : alpha(theme.palette.primary.main, 0.03),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          cursor: showDetails ? 'pointer' : 'default',
        }}
        onClick={() => showDetails && setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, sm: 1.5 }, flex: 1, minWidth: 0 }}>
          {/* Status Icon */}
          <Box
            sx={{
              width: { xs: 40, sm: 44 },
              height: { xs: 40, sm: 44 },
              borderRadius: '12px',
              bgcolor: hasErrors
                ? alpha(theme.palette.error.main, 0.15)
                : allRequiredCompleted
                ? alpha(theme.palette.success.main, 0.15)
                : alpha(theme.palette.primary.main, 0.12),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: `2px solid ${hasErrors ? alpha(theme.palette.error.main, 0.25) : allRequiredCompleted ? alpha(theme.palette.success.main, 0.25) : alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            {hasErrors ? (
              <AlertCircle
                size={isMobile ? 20 : 22}
                color={theme.palette.error.main}
                strokeWidth={2.5}
              />
            ) : allRequiredCompleted ? (
              <CheckCircle2 size={isMobile ? 20 : 22} color={theme.palette.success.main} strokeWidth={2.5} />
            ) : (
              <Info size={isMobile ? 20 : 22} color={theme.palette.primary.main} strokeWidth={2.5} />
            )}
          </Box>

          {/* Title and Stats */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
              <Typography
                sx={{
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  fontWeight: 700,
                  color: 'text.primary',
                  lineHeight: 1.3,
                  letterSpacing: '-0.01em',
                }}
              >
                Profile Completion
              </Typography>
              <Chip
                label={allRequiredCompleted ? 'Ready to Continue' : `${stats.completedRequired}/${stats.required} Required`}
                size="small"
                sx={{
                  height: { xs: 22, sm: 24 },
                  fontSize: { xs: '0.6875rem', sm: '0.75rem' },
                  fontWeight: 600,
                  borderRadius: '6px',
                  bgcolor: allRequiredCompleted
                    ? alpha(theme.palette.success.main, 0.12)
                    : hasErrors
                    ? alpha(theme.palette.error.main, 0.12)
                    : alpha(theme.palette.primary.main, 0.12),
                  color: allRequiredCompleted
                    ? theme.palette.success.dark
                    : hasErrors
                    ? theme.palette.error.dark
                    : theme.palette.primary.dark,
                  border: `1px solid ${allRequiredCompleted ? alpha(theme.palette.success.main, 0.2) : hasErrors ? alpha(theme.palette.error.main, 0.2) : alpha(theme.palette.primary.main, 0.2)}`,
                }}
              />
            </Box>
            <Typography
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                color: 'text.secondary',
                lineHeight: 1.4,
              }}
            >
              {hasErrors
                ? `${Object.keys(validationErrors).length} field${Object.keys(validationErrors).length > 1 ? 's' : ''} need attention`
                : allRequiredCompleted
                ? 'All required fields completed. You can proceed!'
                : `Complete ${stats.required - stats.completedRequired} more required field${stats.required - stats.completedRequired > 1 ? 's' : ''} to continue`}
            </Typography>
          </Box>
        </Box>

        {/* Expand/Collapse Button */}
        {showDetails && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            sx={{
              width: { xs: 32, sm: 36 },
              height: { xs: 32, sm: 36 },
              borderRadius: '8px',
              bgcolor: alpha(theme.palette.grey[200], 0.6),
              ml: 1,
              flexShrink: 0,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: alpha(theme.palette.grey[300], 0.8),
                transform: 'scale(1.08)',
                boxShadow: `0 2px 6px ${alpha(theme.palette.common.black, 0.1)}`,
              },
              '&:active': {
                transform: 'scale(0.95)',
              },
            }}
          >
            {expanded ? (
              <ChevronUp size={isMobile ? 18 : 20} color={theme.palette.text.secondary} strokeWidth={2.5} />
            ) : (
              <ChevronDown size={isMobile ? 18 : 20} color={theme.palette.text.secondary} strokeWidth={2.5} />
            )}
          </IconButton>
        )}
      </Box>

      {/* Progress Bar */}
      <Box
        sx={{
          px: { xs: 1.75, sm: 2 },
          pb: { xs: 1.5, sm: 1.75 },
          pt: { xs: 1.25, sm: 1.5 },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: { xs: 6, sm: 8 },
            bgcolor: alpha(theme.palette.grey[200], 0.4),
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${stats.requiredProgress}%`,
              background: allRequiredCompleted
                ? `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light || theme.palette.success.main} 100%)`
                : hasErrors
                ? `linear-gradient(90deg, ${theme.palette.error.main} 0%, ${alpha(theme.palette.error.main, 0.8)} 100%)`
                : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
              borderRadius: '10px',
              transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: `0 2px 8px ${alpha(allRequiredCompleted ? theme.palette.success.main : hasErrors ? theme.palette.error.main : theme.palette.primary.main, 0.3)}`,
            }}
          />
        </Box>
        <Typography
          sx={{
            fontSize: { xs: '0.6875rem', sm: '0.75rem' },
            color: 'text.secondary',
            mt: 0.75,
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          {Math.round(stats.requiredProgress)}% Complete
        </Typography>
      </Box>

      {/* Fields List - Collapsible */}
      <Collapse in={expanded && showDetails} timeout={300}>
        <Box sx={{ px: { xs: 1.75, sm: 2 }, pb: { xs: 1.75, sm: 2 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0.75, sm: 1 } }}>
            {fields.map((field, index) => {
              const hasError = !!validationErrors[field.key];
              const isCompleted = field.isCompleted && !hasError;
              const isRequired = field.required;

              return (
                <Box
                  key={field.key || index}
                  onClick={() => onFieldClick && onFieldClick(field.key)}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: { xs: 1, sm: 1.25 },
                    p: { xs: 1.25, sm: 1.5 },
                    borderRadius: '12px',
                    bgcolor: hasError
                      ? alpha(theme.palette.error.main, 0.04)
                      : isCompleted
                      ? alpha(theme.palette.success.main, 0.04)
                      : alpha(theme.palette.grey[50], 0.6),
                    border: `1.5px solid ${hasError ? alpha(theme.palette.error.main, 0.2) : isCompleted ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.grey[300], 0.2)}`,
                    cursor: onFieldClick ? 'pointer' : 'default',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': onFieldClick
                      ? {
                          bgcolor: hasError
                            ? alpha(theme.palette.error.main, 0.08)
                            : isCompleted
                            ? alpha(theme.palette.success.main, 0.08)
                            : alpha(theme.palette.primary.main, 0.06),
                          transform: 'translateX(4px)',
                          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
                        }
                      : {},
                  }}
                >
                  {/* Status Icon */}
                  <Box
                    sx={{
                      width: { xs: 32, sm: 36 },
                      height: { xs: 32, sm: 36 },
                      borderRadius: '10px',
                      bgcolor: hasError
                        ? alpha(theme.palette.error.main, 0.15)
                        : isCompleted
                        ? alpha(theme.palette.success.main, 0.15)
                        : alpha(theme.palette.grey[200], 0.6),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: `2px solid ${hasError ? alpha(theme.palette.error.main, 0.25) : isCompleted ? alpha(theme.palette.success.main, 0.25) : alpha(theme.palette.grey[300], 0.3)}`,
                    }}
                  >
                    {hasError ? (
                      <X size={isMobile ? 16 : 18} color={theme.palette.error.main} strokeWidth={2.5} />
                    ) : isCompleted ? (
                      <CheckCircle2 size={isMobile ? 16 : 18} color={theme.palette.success.main} strokeWidth={2.5} />
                    ) : (
                      <Box
                        sx={{
                          width: { xs: 8, sm: 10 },
                          height: { xs: 8, sm: 10 },
                          borderRadius: '50%',
                          bgcolor: theme.palette.grey[400],
                        }}
                      />
                    )}
                  </Box>

                  {/* Field Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5, flexWrap: 'wrap' }}>
                      <Typography
                        sx={{
                          fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                          fontWeight: 600,
                          color: hasError
                            ? theme.palette.error.dark
                            : isCompleted
                            ? theme.palette.success.dark
                            : 'text.primary',
                          lineHeight: 1.3,
                        }}
                      >
                        {field.label}
                      </Typography>
                      {isRequired && (
                        <Chip
                          label="Required"
                          size="small"
                          sx={{
                            height: { xs: 18, sm: 20 },
                            fontSize: { xs: '0.625rem', sm: '0.6875rem' },
                            fontWeight: 700,
                            borderRadius: '4px',
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            color: theme.palette.error.main,
                            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                          }}
                        />
                      )}
                    </Box>
                    {field.description && (
                      <Typography
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                          color: 'text.secondary',
                          lineHeight: 1.5,
                          mb: hasError ? 0.5 : 0,
                        }}
                      >
                        {field.description}
                      </Typography>
                    )}
                    {hasError && validationErrors[field.key] && (
                      <Typography
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                          color: theme.palette.error.main,
                          lineHeight: 1.5,
                          fontWeight: 500,
                          mt: 0.5,
                        }}
                      >
                        {validationErrors[field.key]}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Collapse>

      {/* Trust & Security Footer */}
      <Box
        sx={{
          px: { xs: 1.75, sm: 2 },
          py: { xs: 1.25, sm: 1.5 },
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            sx={{
              width: { xs: 32, sm: 36 },
              height: { xs: 32, sm: 36 },
              borderRadius: '10px',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Lock size={isMobile ? 16 : 18} color={theme.palette.primary.main} strokeWidth={2} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                fontWeight: 600,
                color: 'text.primary',
                mb: 0.25,
                lineHeight: 1.4,
              }}
            >
              Your Information is Secure
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '0.6875rem', sm: '0.75rem' },
                color: 'text.secondary',
                lineHeight: 1.5,
              }}
            >
              All your personal and professional information is encrypted and securely stored. We only share relevant details with potential clients to help you find the right opportunities.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RequiredFieldsTracker;
