import React, { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Card,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Paper,
  alpha
} from '@mui/material';
import {
  Person,
  Email,
  Business,
  Phone,
  CalendarToday,
  CheckCircle,
  PendingActions,
  HourglassEmpty,
  Error as ErrorIcon,
  QuestionAnswer,
  History,
  Close,
  Send,
  Visibility,
  TouchApp
} from '@mui/icons-material';

const ReferenceDetailsModal = ({
  open,
  onClose,
  reference,
  isLoading,
  error,
  onRetry,
  onSendEmail,
  showEmailTracking,
  showVerificationTab,
  verificationContent,
  title = "Reference Details"
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const statusConfig = {
    'Completed': { color: 'success', icon: CheckCircle },
    'Pending': { color: 'warning', icon: PendingActions },
    'EmailSent': { color: 'info', icon: HourglassEmpty },
    'Error': { color: 'error', icon: ErrorIcon }
  };

  const getStatusColor = (status) => statusConfig[status]?.color || 'default';
  const StatusIcon = statusConfig[reference?.status]?.icon || ErrorIcon;

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const handleClose = useCallback(() => {
    setActiveTab(0);
    onClose();
  }, [onClose]);

  React.useEffect(() => {
    if (open) setActiveTab(0);
  }, [open]);

  const tabs = useMemo(() => {
    const baseTabs = [
      { label: "Overview", icon: Person },
      { label: "Responses", icon: QuestionAnswer },
      { label: "Activity", icon: History }
    ];
    if (showEmailTracking) baseTabs.push({ label: "Email", icon: Email });
    if (showVerificationTab) baseTabs.push({ label: "Verification", icon: CheckCircle });
    return baseTabs;
  }, [showEmailTracking, showVerificationTab]);

  const InfoRow = ({ icon: Icon, label, value, chip }) => (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 1.5 }}>
      <Box sx={{ 
        width: 40, 
        height: 40, 
        borderRadius: 2, 
        bgcolor: alpha('#000', 0.04),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon sx={{ fontSize: 20, color: 'text.secondary' }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
          {label}
        </Typography>
        {chip ? chip : (
          <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>
            {value || '—'}
          </Typography>
        )}
      </Box>
    </Stack>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        px: 3, 
        py: 2.5,
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ 
              width: 36, 
              height: 36, 
              borderRadius: 2, 
              bgcolor: alpha('#1976d2', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Person sx={{ fontSize: 20, color: 'primary.main' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
              {title}
            </Typography>
          </Stack>
          <IconButton onClick={handleClose} size="small" sx={{ ml: 2 }}>
            <Close fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        {isLoading ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={300} gap={2}>
            <CircularProgress size={48} thickness={4} />
            <Typography variant="body2" color="text.secondary">
              Loading details...
            </Typography>
          </Box>
        ) : error ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={300} gap={2} px={3}>
            <Box sx={{ 
              width: 56, 
              height: 56, 
              borderRadius: 3, 
              bgcolor: alpha('#d32f2f', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ErrorIcon sx={{ fontSize: 28, color: 'error.main' }} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Unable to load details
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={400}>
              {error?.message || 'An unexpected error occurred'}
            </Typography>
            {onRetry && (
              <Button variant="outlined" onClick={onRetry} sx={{ mt: 1 }}>
                Try Again
              </Button>
            )}
          </Box>
        ) : reference ? (
          <Box>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                px: 2,
                '& .MuiTab-root': {
                  minHeight: 56,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }
              }}
            >
              {tabs.map((tab, index) => (
                <Tab 
                  key={index} 
                  label={tab.label}
                  icon={<tab.icon sx={{ fontSize: 20 }} />}
                  iconPosition="start"
                />
              ))}
            </Tabs>

            <Box sx={{ p: 3 }}>
              {/* Overview Tab */}
              {activeTab === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                        Contact Information
                      </Typography>
                      <Stack divider={<Divider />}>
                        <InfoRow icon={Person} label="Full Name" value={reference.referenceInfo?.name} />
                        <InfoRow icon={Email} label="Email" value={reference.referenceInfo?.email} />
                        <InfoRow icon={Business} label="Company" value={reference.referenceInfo?.company} />
                        <InfoRow icon={Business} label="Position" value={reference.referenceInfo?.position} />
                        <InfoRow icon={Phone} label="Phone" value={reference.referenceInfo?.phone} />
                      </Stack>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                        Status
                      </Typography>
                      <Stack divider={<Divider />}>
                        <InfoRow 
                          icon={StatusIcon} 
                          label="Current Status" 
                          chip={
                            <Chip 
                              label={reference.status} 
                              color={getStatusColor(reference.status)}
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          }
                        />
                        <InfoRow 
                          icon={CheckCircle} 
                          label="Progress" 
                          chip={
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
                              <Box sx={{ 
                                flex: 1, 
                                height: 6, 
                                bgcolor: alpha('#000', 0.06), 
                                borderRadius: 3,
                                overflow: 'hidden'
                              }}>
                                <Box sx={{ 
                                  width: `${reference.progress?.percentageComplete ?? 0}%`,
                                  height: '100%',
                                  bgcolor: reference.progress?.percentageComplete >= 70 ? 'success.main' : 
                                           reference.progress?.percentageComplete >= 30 ? 'warning.main' : 'error.main',
                                  transition: 'width 0.3s ease'
                                }} />
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 40, textAlign: 'right' }}>
                                {reference.progress?.percentageComplete ?? 0}%
                              </Typography>
                            </Stack>
                          }
                        />
                      </Stack>
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                        Email Activity
                      </Typography>
                      <Stack divider={<Divider />}>
                        <InfoRow icon={Send} label="Emails Sent" value={reference.emailTracking?.emailsSent ?? 0} />
                        <InfoRow icon={CalendarToday} label="Last Sent" value={formatDate(reference.emailTracking?.lastEmailSent)} />
                        {reference.emailTracking?.emailBounced !== undefined && (
                          <InfoRow 
                            icon={ErrorIcon} 
                            label="Bounced" 
                            chip={
                              <Chip 
                                label={reference.emailTracking?.emailBounced ? 'Yes' : 'No'} 
                                color={reference.emailTracking?.emailBounced ? 'error' : 'default'}
                                size="small"
                                variant="outlined"
                              />
                            }
                          />
                        )}
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {/* Responses Tab */}
              {activeTab === 1 && (
                <Box>
                  {reference.responses?.length > 0 ? (
                    <Stack spacing={2}>
                      {reference.responses.map((r, idx) => (
                        <Paper key={r.questionId || idx} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
                            {r.questionText}
                          </Typography>
                          {r.skipped ? (
                            <Chip label="Skipped" size="small" color="warning" variant="outlined" />
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                              {r.answer || 'No answer provided'}
                            </Typography>
                          )}
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <QuestionAnswer sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        No responses available
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* History Tab */}
              {activeTab === 2 && (
                <Box>
                  {reference.statusHistory?.length > 0 ? (
                    <Stack spacing={2}>
                      {reference.statusHistory.map((h, idx) => {
                        const HistIcon = statusConfig[h.status]?.icon || ErrorIcon;
                        return (
                          <Paper key={h._id || idx} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                            <Stack direction="row" spacing={2} alignItems="flex-start">
                              <Box sx={{ 
                                width: 40, 
                                height: 40, 
                                borderRadius: 2, 
                                bgcolor: alpha(statusConfig[h.status]?.color === 'success' ? '#2e7d32' : 
                                              statusConfig[h.status]?.color === 'warning' ? '#ed6c02' :
                                              statusConfig[h.status]?.color === 'info' ? '#0288d1' : '#d32f2f', 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <HistIcon sx={{ fontSize: 20, color: `${getStatusColor(h.status)}.main` }} />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                                  <Chip 
                                    label={h.status} 
                                    color={getStatusColor(h.status)}
                                    size="small"
                                    sx={{ fontWeight: 500 }}
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDate(h.timestamp)}
                                  </Typography>
                                </Stack>
                                {h.notes && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.6 }}>
                                    {h.notes}
                                  </Typography>
                                )}
                              </Box>
                            </Stack>
                          </Paper>
                        );
                      })}
                    </Stack>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <History sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        No activity history
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Email Tracking Tab */}
              {showEmailTracking && activeTab === 3 && (
                <Box>
                  <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} sm={4}>
                      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, textAlign: 'center' }}>
                        <Send sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {reference.emailTracking?.emailsSent ?? 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Emails Sent
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, textAlign: 'center' }}>
                        <Visibility sx={{ fontSize: 32, color: reference.emailTracking?.opened ? 'success.main' : 'text.disabled', mb: 1 }} />
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {reference.emailTracking?.opened ? '✓' : '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Opened
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, textAlign: 'center' }}>
                        <TouchApp sx={{ fontSize: 32, color: reference.emailTracking?.clicked ? 'info.main' : 'text.disabled', mb: 1 }} />
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {reference.emailTracking?.clicked ? '✓' : '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Clicked
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
                    <Stack divider={<Divider />}>
                      <InfoRow icon={CalendarToday} label="Last Email Sent" value={formatDate(reference.emailTracking?.lastEmailSent)} />
                      {reference.emailTracking?.lastOpened && (
                        <InfoRow icon={CalendarToday} label="Last Opened" value={formatDate(reference.emailTracking?.lastOpened)} />
                      )}
                      {reference.emailTracking?.emailBounced && (
                        <InfoRow 
                          icon={ErrorIcon} 
                          label="Email Bounced" 
                          chip={<Chip label="Yes" color="error" size="small" />}
                        />
                      )}
                    </Stack>
                  </Paper>

                  {onSendEmail && (
                    <Button
                      variant="contained"
                      startIcon={<Send />}
                      onClick={() => onSendEmail(reference._id)}
                      fullWidth
                      sx={{ borderRadius: 2 }}
                    >
                      Send Reminder Email
                    </Button>
                  )}
                </Box>
              )}

              {/* Verification Tab */}
              {showVerificationTab && activeTab === (showEmailTracking ? 4 : 3) && (
                <Box>
                  {verificationContent || (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <CheckCircle sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        No verification data available
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={300}>
            <Person sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No reference selected
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          onClick={handleClose}
          variant="contained"
          sx={{ minWidth: 100, borderRadius: 2 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReferenceDetailsModal;