import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Box,
  Typography,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  Grid,
  alpha,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CalendarToday,
  Event,
  Assignment,
  School,
  Edit,
  Cancel,
  ExpandMore,
  ExpandLess,
  Visibility
} from '@mui/icons-material';
import { Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
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
import { deleteOtherCertificationById } from '../../../../../api/axios';

/**
 * Desktop Certification Table Component
 * Displays certifications in a table format for desktop
 */
const DesktopCertificationTable = ({
  certifications,
  type = 'professional',
  showRejectionDetails = false,
  onEdit,
  onPreviewDocument,
  onDelete,
  prefetchOnboarding,
  triggerRefresh
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (certId) => {
    setExpandedRows(prev => ({
      ...prev,
      [certId]: !prev[certId]
    }));
  };

  const handleEdit = (e, cert) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(cert, type);
    }
  };

  const handleDelete = async (e, cert) => {
    e.stopPropagation();
    const oid = cert?._id || cert?.id;
    if (!oid) return;

    Modal.confirm({
      title: 'Delete Other Certification?',
      icon: <ExclamationCircleOutlined style={{ color: theme.palette.error.main }} />,
      content: (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          This action will permanently delete this certification and all associated documents from cloud storage.
        </Typography>
      ),
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      centered: true,
      maskClosable: true,
      width: isMobile ? 360 : 480,
      okButtonProps: {
        danger: true,
        style: isMobile ? { minWidth: '100%' } : {}
      },
      cancelButtonProps: {
        style: isMobile ? { minWidth: '100%' } : {}
      },
      onOk: async () => {
        try {
          const hide = message.loading('Deleting certification...', 0);
          const res = await deleteOtherCertificationById(oid);
          hide();
          message.success(res?.data?.message || 'Certification deleted');
          if (triggerRefresh) {
            triggerRefresh();
          }
        } catch (err) {
          message.error(err?.response?.data?.message || 'Failed to delete certification');
        }
      }
    });
  };

  const handlePreviewDocument = (doc, cert) => {
    if (onPreviewDocument) {
      onPreviewDocument(doc, cert);
    }
  };

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Certification</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Issued Date</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Expiry Date</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Documents</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {certifications.map((cert, index) => {
            const certId = cert.id || cert._id || index;
            const isExpanded = expandedRows[certId];
            const status = getComputedStatus(cert);
            const missingFields = computeMissingFields(cert);

            return (
              <React.Fragment key={certId}>
                <TableRow
                  hover
                  sx={{
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleRow(certId)}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {type === 'professional' ? cert.certificationType?.name : cert.certificationTitle}
                      </Typography>
                      {cert.number && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', display: 'block' }}>
                          #{cert.number}
                        </Typography>
                      )}
                      {cert.workerScreeningId && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', display: 'block' }}>
                          Worker Screening ID: {cert.workerScreeningId}
                        </Typography>
                      )}
                      {cert?.degree?.length > 0 && (
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                          <School fontSize="small" color="primary" sx={{ fontSize: '14px' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {cert.degree.length} degree{cert.degree.length > 1 ? 's' : ''}
                          </Typography>
                        </Stack>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={status} size="small" sx={{ fontWeight: 600 }} />
                    {missingFields.length > 0 && (
                      <Tooltip title={`Missing: ${missingFields.join(', ')}`}>
                        <Chip
                          label={`Missing ${missingFields.length}`}
                          color="error"
                          size="small"
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    {cert.issuedDate ? (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CalendarToday fontSize="small" color="primary" />
                        <Typography variant="body2">
                          {formatDate(cert.issuedDate)}
                        </Typography>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {cert.expiryDate ? (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Event fontSize="small" color={isExpiringSoon(cert.expiryDate) ? "warning" : "info"} />
                        <Typography variant="body2">
                          {formatDate(cert.expiryDate)}
                        </Typography>
                        {isExpiringSoon(cert.expiryDate) && (
                          <Chip label="Soon" size="small" color="warning" sx={{ fontSize: '0.6rem' }} />
                        )}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Assignment fontSize="small" color="primary" />
                      <Typography variant="body2">
                        {cert.documents?.length || 0}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {/* Edit button */}
                      {(type === 'other' || shouldShowEdit(cert)) && (
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            onMouseEnter={prefetchOnboarding}
                            onClick={(e) => handleEdit(e, cert)}
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
                            color="error"
                            onClick={(e) => handleDelete(e, cert)}
                          >
                            <Cancel fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </Stack>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 0, border: 0 }}>
                    <Collapse in={isExpanded}>
                      <Box sx={{ p: 3, bgcolor: alpha(theme.palette.grey[50], 0.5) }}>
                        {/* Degree Information */}
                        {cert.degree?.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                              Degrees
                            </Typography>
                            <Stack spacing={1}>
                              {cert.degree.map((degree, idx) => {
                                const { isOther, value } = formatDegree(degree);
                                return (
                                  <Stack key={idx} direction="row" alignItems="center" spacing={1}>
                                    <Typography variant="body2">{value}</Typography>
                                    {isOther && (
                                      <Chip label="Other" size="small" color="secondary" />
                                    )}
                                  </Stack>
                                );
                              })}
                            </Stack>
                          </Box>
                        )}

                        {/* Rejection Details */}
                        {showRejectionDetails && cert.verificationStatus?.toLowerCase() === 'rejected' && cert.rejectionReason && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'error.main' }}>
                              Rejection Details
                            </Typography>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                bgcolor: alpha(theme.palette.error.main, 0.05),
                                border: `1px solid ${alpha(theme.palette.error.main, 0.15)}`,
                                borderRadius: 2
                              }}
                            >
                              <Typography variant="body2" sx={{ color: 'error.main', mb: 1 }}>
                                {cert.rejectionReason}
                              </Typography>
                              {cert.verificationDate && (
                                <Typography variant="caption" color="text.secondary">
                                  Rejected on: {formatDate(cert.verificationDate)}
                                </Typography>
                              )}
                            </Paper>
                          </Box>
                        )}

                        {/* Documents Preview */}
                        {cert.documents?.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                              Documents
                            </Typography>
                            <Grid container spacing={2}>
                              {cert.documents.map((doc, docIndex) => (
                                <Grid item xs={12} sm={6} md={4} key={docIndex}>
                                  <Paper
                                    elevation={0}
                                    sx={{
                                      p: 2,
                                      border: `1px solid ${theme.palette.divider}`,
                                      borderRadius: 2,
                                      transition: 'all 0.2s',
                                      '&:hover': {
                                        borderColor: theme.palette.primary.main,
                                        bgcolor: alpha(theme.palette.primary.main, 0.02)
                                      }
                                    }}
                                  >
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                      <Box
                                        sx={{
                                          p: 1,
                                          borderRadius: 1,
                                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                      >
                                        <DocumentIcon fileName={doc.fileName} />
                                      </Box>
                                      <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            fontWeight: 500,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                          }}
                                        >
                                          {doc.fileName || `Document ${docIndex + 1}`}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          Click to preview
                                        </Typography>
                                      </Box>
                                      <Tooltip title="Preview Document">
                                        <IconButton
                                          size="small"
                                          onClick={() => handlePreviewDocument(doc, cert)}
                                          sx={{ color: theme.palette.primary.main }}
                                        >
                                          <Visibility />
                                        </IconButton>
                                      </Tooltip>
                                    </Stack>
                                  </Paper>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

DesktopCertificationTable.propTypes = {
  certifications: PropTypes.array.isRequired,
  type: PropTypes.oneOf(['professional', 'other']),
  showRejectionDetails: PropTypes.bool,
  onEdit: PropTypes.func,
  onPreviewDocument: PropTypes.func,
  onDelete: PropTypes.func,
  prefetchOnboarding: PropTypes.func,
  triggerRefresh: PropTypes.func
};

export default DesktopCertificationTable;
