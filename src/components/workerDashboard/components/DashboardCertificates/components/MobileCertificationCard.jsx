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
  useTheme
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
 * Displays certification information in a card format for mobile/tablet
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

  return (
    <Card
      elevation={0}
      sx={{
        mb: 2,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[8],
          borderColor: theme.palette.primary.main,
        }
      }}
    >
      <CardActionArea onClick={() => setExpanded(!expanded)}>
        <CardContent sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: '1rem',
                  mb: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {type === 'professional' ? cert.certificationType?.name : cert.certificationTitle}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <StatusChip
                  status={status}
                  size="small"
                  sx={{ fontSize: '0.7rem', height: '24px' }}
                />
                {missingFields.length > 0 && (
                  <Tooltip title={`Missing: ${missingFields.join(', ')}`}>
                    <Chip
                      label={`Missing ${missingFields.length}`}
                      color="error"
                      size="small"
                      variant="outlined"
                      sx={{ height: '24px' }}
                    />
                  </Tooltip>
                )}
                {cert.documents?.length > 0 && (
                  <Chip
                    icon={<Assignment />}
                    label={`${cert.documents.length} docs`}
                    variant="outlined"
                    size="small"
                    sx={{ fontSize: '0.7rem', height: '24px' }}
                  />
                )}
              </Stack>
            </Box>
            <Stack direction="row" spacing={0.5} alignItems="center">
              {/* Edit button */}
              {(type === 'other' || shouldShowEdit(cert)) && (
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    onMouseEnter={prefetchOnboarding}
                    onClick={handleEdit}
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: theme.palette.primary.main,
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) }
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {/* Delete button */}
              {type === 'other' && status !== 'verified' && (
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={handleDelete}
                    sx={{
                      bgcolor: alpha(theme.palette.error.main, 0.08),
                      color: theme.palette.error.main,
                      '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) }
                    }}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <IconButton size="small">
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>

      <Collapse in={expanded}>
        <Box sx={{ px: 2, pb: 2 }}>
          <Divider sx={{ mb: 2 }} />

          {/* Certificate Number */}
          {cert.number && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontFamily: 'monospace' }}>
              #{cert.number}
            </Typography>
          )}

          {/* Worker Screening ID */}
          {cert.workerScreeningId && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}>
              Worker Screening ID: {cert.workerScreeningId}
            </Typography>
          )}

          {/* Degree Information */}
          {cert?.degree?.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
                Degrees
              </Typography>
              <Stack spacing={1}>
                {cert.degree.slice(0, 2).map((degree, idx) => {
                  const { isOther, value } = formatDegree(degree);
                  return (
                    <Stack key={idx} direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                        {value}
                      </Typography>
                      {isOther && (
                        <Chip
                          label="Other"
                          color="secondary"
                          size="small"
                          sx={{ height: '18px', fontSize: '0.6rem', fontWeight: 600 }}
                        />
                      )}
                    </Stack>
                  );
                })}
                {cert.degree.length > 2 && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontStyle: 'italic' }}>
                    +{cert.degree.length - 2} more degrees
                  </Typography>
                )}
              </Stack>
            </Box>
          )}

          {/* Dates */}
          {type === 'professional' && (cert.issuedDate || cert.expiryDate) && (
            <Stack spacing={1} sx={{ mb: 2 }}>
              {cert.issuedDate && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CalendarToday fontSize="small" color="primary" />
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                    Issued: {formatDate(cert.issuedDate)}
                  </Typography>
                </Stack>
              )}
              {cert.expiryDate && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Event fontSize="small" color={isExpiringSoon(cert.expiryDate) ? "warning" : "info"} />
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                    Expires: {formatDate(cert.expiryDate)}
                  </Typography>
                  {isExpiringSoon(cert.expiryDate) && (
                    <Chip label="Soon" size="small" color="warning" sx={{ fontSize: '0.6rem', height: '18px' }} />
                  )}
                </Stack>
              )}
            </Stack>
          )}

          {/* Rejection Details */}
          {showRejectionDetails && cert.verificationStatus?.toLowerCase() === 'rejected' && cert.rejectionReason && (
            <Box sx={{ mb: 2, p: 2, bgcolor: alpha(theme.palette.error.main, 0.05), borderRadius: 2, border: `1px solid ${alpha(theme.palette.error.main, 0.15)}` }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Cancel fontSize="small" color="error" />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'error.main', fontSize: '0.85rem' }}>
                  Rejection Details
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'error.main', fontSize: '0.8rem', lineHeight: 1.4 }}>
                {cert.rejectionReason}
              </Typography>
              {cert.verificationDate && (
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', mt: 1, display: 'block' }}>
                  Rejected on: {formatDate(cert.verificationDate)}
                </Typography>
              )}
            </Box>
          )}

          {/* Documents */}
          {cert.documents?.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
                Documents
              </Typography>
              <Stack spacing={1}>
                {cert.documents.map((doc, docIndex) => (
                  <Paper
                    key={docIndex}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <DocumentIcon fileName={doc.fileName} />
                      <Typography variant="body2" sx={{ flex: 1, fontSize: '0.8rem' }}>
                        {doc.fileName || `Document ${docIndex + 1}`}
                      </Typography>
                      <Tooltip title="Preview">
                        <IconButton
                          size="small"
                          onClick={(e) => handlePreviewDocument(e, doc)}
                        >
                          <Visibility fontSize="small" />
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
