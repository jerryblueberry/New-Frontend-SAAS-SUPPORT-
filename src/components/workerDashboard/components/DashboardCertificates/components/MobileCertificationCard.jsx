import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  CardActionArea,
  Box,
  Typography,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  Divider,
  Paper,
  alpha,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CalendarToday,
  Event,
  Assignment,
  Edit,
  DeleteOutline,
  ExpandMore,
  ExpandLess,
  Cancel,
  Visibility
} from '@mui/icons-material';
import {
  getComputedStatus,
  formatDate,
  formatDegree,
  computeMissingFields,
  shouldShowEdit,
  isExpiringSoon
} from '../utils/certificationUtils';
import StatusChip from './StatusChip';
import DocumentIcon from './DocumentIcon';

/**
 * Mobile Certification Card Component
 * Premium, compact, mobile-optimized certification card with SaaS-level design
 */
const MobileCertificationCard = ({
  cert,
  index,
  type = 'professional',
  showRejectionDetails = false,
  onEdit,
  onDelete,
  onPreviewDocument,
  prefetchOnboarding
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expanded, setExpanded] = useState(false);
  const status = getComputedStatus(cert);
  const missingFields = computeMissingFields(cert);

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(cert, type);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (onDelete) {
      await onDelete(cert);
    }
  };

  const handlePreviewDocument = (e, doc) => {
    e.stopPropagation();
    if (onPreviewDocument) {
      onPreviewDocument(doc, cert);
    }
  };

  // Responsive typography and spacing
  const titleFontSize = isMobile ? '0.875rem' : '0.9375rem';
  const bodyFontSize = isMobile ? '0.75rem' : '0.8125rem';
  const captionFontSize = isMobile ? '0.6875rem' : '0.75rem';
  const cardPadding = isMobile ? 1.25 : 1.5;
  const cardSpacing = isMobile ? 1 : 1.5;

  // Get certification title
  const certificationTitle = type === 'professional' ? cert.certificationType?.name : cert.certificationTitle;

  // Minimal SaaS-level color palette - clean and professional
  const minimalPalette = {
    background: theme.palette.background.paper,
    backgroundHover: alpha(theme.palette.primary.main, 0.02),
    border: alpha(theme.palette.divider, 0.3),
    borderHover: alpha(theme.palette.primary.main, 0.2),
    text: theme.palette.text.primary,
    textSecondary: theme.palette.text.secondary,
    textMuted: alpha(theme.palette.text.secondary, 0.7),
    accent: theme.palette.primary.main,
    shadow: alpha(theme.palette.common.black, 0.04),
    shadowHover: alpha(theme.palette.common.black, 0.08),
  };

  return (
    <Card
      elevation={0}
      sx={{
        mb: isMobile ? 1.25 : 1.5,
        border: `1px solid ${minimalPalette.border}`,
        borderRadius: isMobile ? 2 : 2.5,
        overflow: 'hidden',
        background: minimalPalette.background,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        willChange: 'transform, box-shadow',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: status === 'verified' 
            ? `linear-gradient(90deg, ${theme.palette.success.main}, ${alpha(theme.palette.success.main, 0.5)})`
            : `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.4)}, ${alpha(theme.palette.primary.main, 0.1)})`,
          opacity: expanded ? 1 : 0.4,
          transition: 'opacity 0.2s ease',
        },
        '&:hover': {
          boxShadow: `0 2px 8px ${minimalPalette.shadowHover}`,
          borderColor: minimalPalette.borderHover,
          transform: 'translateY(-1px)',
          background: minimalPalette.backgroundHover,
          '&::before': {
            opacity: 1,
          }
        }
      }}
    >
      <CardActionArea 
        onClick={() => setExpanded(!expanded)}
        sx={{
          '&:hover': {
            backgroundColor: 'transparent',
          },
          '&:active': {
            backgroundColor: minimalPalette.backgroundHover,
          }
        }}
      >
        <CardContent sx={{ p: cardPadding, '&:last-child': { pb: cardPadding } }}>
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="flex-start" 
            spacing={isMobile ? 1 : 1.5}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {!expanded ? (
                <Tooltip 
                  title={certificationTitle || ''} 
                  arrow
                  placement="top"
                  enterDelay={300}
                  PopperProps={{
                    sx: {
                      '& .MuiTooltip-tooltip': {
                        fontSize: bodyFontSize,
                        maxWidth: '280px',
                        bgcolor: alpha(theme.palette.grey[900], 0.9),
                        padding: '6px 10px',
                      },
                      '& .MuiTooltip-arrow': {
                        color: alpha(theme.palette.grey[900], 0.9),
                      }
                    }
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      fontSize: titleFontSize,
                      lineHeight: 1.4,
                      mb: 0.75,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      color: minimalPalette.text,
                      letterSpacing: '-0.01em',
                      cursor: 'pointer',
                    }}
                  >
                    {certificationTitle}
                  </Typography>
                </Tooltip>
              ) : (
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    fontSize: titleFontSize,
                    lineHeight: 1.4,
                    mb: 0.75,
                    color: minimalPalette.text,
                    letterSpacing: '-0.01em',
                    wordBreak: 'break-word',
                  }}
                >
                  {certificationTitle}
                </Typography>
              )}
              <Stack 
                direction="row" 
                spacing={0.5} 
                flexWrap="wrap" 
                gap={0.5}
                sx={{ mt: 0.5 }}
              >
                <StatusChip
                  status={status}
                  size="small"
                  sx={{ 
                    fontSize: captionFontSize, 
                    height: isMobile ? '20px' : '22px',
                    '& .MuiChip-label': {
                      px: 0.75,
                      fontWeight: 500,
                    }
                  }}
                />
                {missingFields.length > 0 && (
                  <Tooltip title={`Missing: ${missingFields.join(', ')}`} arrow>
                    <Chip
                      label={`${missingFields.length} missing`}
                      color="error"
                      size="small"
                      variant="outlined"
                      sx={{ 
                        height: isMobile ? '20px' : '22px',
                        fontSize: captionFontSize,
                        borderWidth: '1px',
                        borderColor: alpha(theme.palette.error.main, 0.3),
                        '& .MuiChip-label': {
                          px: 0.75,
                          fontWeight: 500,
                        }
                      }}
                    />
                  </Tooltip>
                )}
                {cert.documents?.length > 0 && (
                  <Chip
                    icon={<Assignment sx={{ fontSize: '0.875rem !important' }} />}
                    label={`${cert.documents.length}`}
                    variant="outlined"
                    size="small"
                    sx={{ 
                      fontSize: captionFontSize, 
                      height: isMobile ? '20px' : '22px',
                      borderColor: minimalPalette.border,
                      color: minimalPalette.textSecondary,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      '& .MuiChip-label': {
                        px: 0.5,
                        fontWeight: 500,
                      },
                      '& .MuiChip-icon': {
                        marginLeft: 0.5,
                        marginRight: -0.25,
                        color: minimalPalette.textSecondary,
                      }
                    }}
                  />
                )}
              </Stack>
            </Box>
            <Stack 
              direction="row" 
              spacing={0.25} 
              alignItems="center"
              sx={{ flexShrink: 0 }}
            >
              {/* Edit button */}
              {(type === 'other' || shouldShowEdit(cert)) && (
                <Tooltip title="Edit" arrow>
                  <IconButton
                    size="small"
                    onMouseEnter={prefetchOnboarding}
                    onClick={handleEdit}
                    sx={{
                      width: isMobile ? 28 : 32,
                      height: isMobile ? 28 : 32,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: minimalPalette.accent,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': { 
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                        transform: 'scale(1.05)',
                        color: theme.palette.primary.dark,
                      },
                      '& .MuiSvgIcon-root': {
                        fontSize: isMobile ? '1rem' : '1.125rem',
                      }
                    }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
              )}
              {/* Delete button */}
              {type === 'other' && status !== 'verified' && (
                <Tooltip title="Delete" arrow>
                  <IconButton
                    size="small"
                    onClick={handleDelete}
                    sx={{
                      width: isMobile ? 28 : 32,
                      height: isMobile ? 28 : 32,
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main,
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': { 
                        bgcolor: alpha(theme.palette.error.main, 0.18),
                        transform: 'scale(1.08)',
                      },
                      '& .MuiSvgIcon-root': {
                        fontSize: isMobile ? '1rem' : '1.125rem',
                      }
                    }}
                  >
                    <DeleteOutline />
                  </IconButton>
                </Tooltip>
              )}
              <IconButton 
                size="small"
                sx={{
                  width: isMobile ? 28 : 32,
                  height: isMobile ? 28 : 32,
                  color: minimalPalette.textSecondary,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.action.hover, 0.5),
                    color: minimalPalette.text,
                  },
                  '& .MuiSvgIcon-root': {
                    fontSize: isMobile ? '1.125rem' : '1.25rem',
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }
                }}
              >
                <ExpandMore />
              </IconButton>
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>

      <Collapse 
        in={expanded} 
        timeout={{ enter: 400, exit: 300 }}
        easing={{ 
          enter: 'cubic-bezier(0.4, 0, 0.2, 1)', 
          exit: 'cubic-bezier(0.4, 0, 0.2, 1)' 
        }}
        sx={{
          '& .MuiCollapse-wrapper': {
            transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important',
          },
          '& .MuiCollapse-wrapperInner': {
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important',
          }
        }}
      >
        <Box 
          sx={{ 
            px: cardPadding, 
            pb: cardPadding,
          }}
        >
          <Divider 
            sx={{ 
              mb: cardSpacing,
              borderColor: minimalPalette.border,
            }} 
          />

          {/* Certificate Number */}
          {cert.number && (
            <Typography 
              variant="body2" 
              sx={{ 
                mb: cardSpacing, 
                fontFamily: 'monospace',
                fontSize: bodyFontSize,
                fontWeight: 500,
                letterSpacing: '0.02em',
                color: minimalPalette.textSecondary,
              }}
            >
              #{cert.number}
            </Typography>
          )}

          {/* Worker Screening ID */}
          {cert.workerScreeningId && (
            <Typography 
              variant="body2" 
              sx={{ 
                mb: cardSpacing, 
                fontFamily: 'monospace', 
                fontSize: bodyFontSize,
                fontWeight: 500,
                letterSpacing: '0.02em',
                color: minimalPalette.textSecondary,
              }}
            >
              Worker Screening ID: {cert.workerScreeningId}
            </Typography>
          )}

          {/* Degree Information */}
          {cert?.degree?.length > 0 && (
            <Box sx={{ mb: cardSpacing }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 0.75, 
                  fontWeight: 600, 
                  fontSize: bodyFontSize,
                  color: minimalPalette.text,
                  letterSpacing: '-0.01em',
                }}
              >
                Degrees
              </Typography>
              <Stack spacing={0.75}>
                {cert.degree.slice(0, 2).map((degree, idx) => {
                  const { isOther, value } = formatDegree(degree);
                  return (
                    <Stack 
                      key={idx} 
                      direction="row" 
                      alignItems="center" 
                      spacing={0.75} 
                      sx={{ flexWrap: 'wrap' }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: bodyFontSize, 
                          fontWeight: 500,
                          color: minimalPalette.textSecondary,
                        }}
                      >
                        {value}
                      </Typography>
                      {isOther && (
                        <Chip
                          label="Other"
                          color="secondary"
                          size="small"
                          sx={{ 
                            height: '18px', 
                            fontSize: captionFontSize, 
                            fontWeight: 600,
                            '& .MuiChip-label': {
                              px: 0.5,
                            }
                          }} 
                        />
                      )}
                    </Stack>
                  );
                })}
                {cert.degree.length > 2 && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary', 
                      fontSize: captionFontSize, 
                      fontStyle: 'italic',
                      mt: 0.25,
                    }}
                  >
                    +{cert.degree.length - 2} more degrees
                  </Typography>
                )}
              </Stack>
            </Box>
          )}

          {/* Dates */}
          {type === 'professional' && (cert.issuedDate || cert.expiryDate) && (
            <Stack spacing={0.75} sx={{ mb: cardSpacing }}>
              {cert.issuedDate && (
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <CalendarToday 
                    sx={{ 
                      fontSize: isMobile ? '0.875rem' : '1rem',
                      color: minimalPalette.accent,
                    }} 
                  />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: bodyFontSize,
                      color: minimalPalette.textSecondary,
                    }}
                  >
                    Issued: {formatDate(cert.issuedDate)}
                  </Typography>
                </Stack>
              )}
              {cert.expiryDate && (
                <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
                  <Event 
                    sx={{ 
                      fontSize: isMobile ? '0.875rem' : '1rem',
                      color: isExpiringSoon(cert.expiryDate) 
                        ? theme.palette.warning.main 
                        : minimalPalette.accent,
                    }} 
                  />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: bodyFontSize,
                      color: minimalPalette.textSecondary,
                    }}
                  >
                    Expires: {formatDate(cert.expiryDate)}
                  </Typography>
                  {isExpiringSoon(cert.expiryDate) && (
                    <Chip 
                      label="Soon" 
                      size="small" 
                      color="warning" 
                      sx={{ 
                        fontSize: captionFontSize, 
                        height: '18px',
                        fontWeight: 600,
                        '& .MuiChip-label': {
                          px: 0.5,
                        }
                      }} 
                    />
                  )}
                </Stack>
              )}
            </Stack>
          )}

          {/* Rejection Details */}
          {showRejectionDetails && cert.verificationStatus?.toLowerCase() === 'rejected' && cert.rejectionReason && (
            <Box 
              sx={{ 
                mb: cardSpacing, 
                p: cardPadding, 
                bgcolor: alpha(theme.palette.error.main, 0.06), 
                borderRadius: 1.5, 
                border: `1px solid ${alpha(theme.palette.error.main, 0.15)}`,
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.06)} 0%, ${alpha(theme.palette.error.main, 0.03)} 100%)`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.75 }}>
                <Cancel 
                  sx={{ 
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    color: theme.palette.error.main,
                  }} 
                />
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 600, 
                    color: 'error.main', 
                    fontSize: bodyFontSize,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Rejection Details
                </Typography>
              </Stack>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'error.main', 
                  fontSize: bodyFontSize, 
                  lineHeight: 1.5,
                }}
              >
                {cert.rejectionReason}
              </Typography>
              {cert.verificationDate && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary', 
                    fontSize: captionFontSize, 
                    mt: 0.75, 
                    display: 'block',
                  }}
                >
                  Rejected on: {formatDate(cert.verificationDate)}
                </Typography>
              )}
            </Box>
          )}

          {/* Documents */}
          {cert.documents?.length > 0 && (
            <Box>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 0.75, 
                  fontWeight: 600, 
                  fontSize: bodyFontSize,
                  color: minimalPalette.text,
                  letterSpacing: '-0.01em',
                }}
              >
                Documents
              </Typography>
              <Stack spacing={0.75}>
                {cert.documents.map((doc, docIndex) => (
                  <Paper
                    key={docIndex}
                    elevation={0}
                    sx={{
                      p: cardPadding,
                      bgcolor: alpha(theme.palette.background.paper, 0.8),
                      borderRadius: 1.5,
                      border: `1px solid ${minimalPalette.border}`,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        bgcolor: minimalPalette.backgroundHover,
                        borderColor: minimalPalette.borderHover,
                        transform: 'translateX(2px)',
                        boxShadow: `0 2px 8px ${minimalPalette.shadow}`,
                      }
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <DocumentIcon fileName={doc.fileName} />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          flex: 1, 
                          fontSize: bodyFontSize,
                          color: minimalPalette.textSecondary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {doc.fileName || `Document ${docIndex + 1}`}
                      </Typography>
                      <Tooltip title="Preview" arrow>
                        <IconButton
                          size="small"
                          onClick={(e) => handlePreviewDocument(e, doc)}
                          sx={{
                            width: isMobile ? 28 : 32,
                            height: isMobile ? 28 : 32,
                            color: minimalPalette.accent,
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              transform: 'scale(1.1)',
                              color: theme.palette.primary.dark,
                            },
                            '& .MuiSvgIcon-root': {
                              fontSize: isMobile ? '0.875rem' : '1rem',
                            }
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      </Collapse>
    </Card>
  );
};

MobileCertificationCard.propTypes = {
  cert: PropTypes.object.isRequired,
  index: PropTypes.number,
  type: PropTypes.oneOf(['professional', 'other']),
  showRejectionDetails: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onPreviewDocument: PropTypes.func,
  prefetchOnboarding: PropTypes.func
};

export default MobileCertificationCard;
