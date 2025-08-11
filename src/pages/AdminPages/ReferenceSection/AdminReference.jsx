import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../api/axios';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
  Card,
  CardContent,
  Chip,
  Divider,
  Tooltip,
  IconButton,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  Email,
  Visibility,
  Sync,
  CheckCircle,
  PendingActions,
  HourglassEmpty,
  Error,
  Business,
  Person,
  Phone,
  CalendarToday,
  Notes,
  QuestionAnswer,
  History
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar';
import { Select } from 'antd';
import AdminSidebar from '../../../components/adminSidebar/AdminSidebar';
import ReferenceSummaryCard from '../../../components/AdminReference/ReferenceSummaryCard';


// Custom styled components
const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  ...(status === 'Completed' && {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark
  }),
  ...(status === 'Pending' && {
    backgroundColor: theme.palette.warning.light,
    color: 'white'
  }),
  ...(status === 'EmailSent' && {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.dark
  }),
  ...(status === 'Error' && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark
  })
}));

const ProgressBar = styled(LinearProgress)(({ theme, value }) => ({
  height: 8,
  borderRadius: 4,
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    ...(value < 30 && { backgroundColor: theme.palette.error.main }),
    ...(value >= 30 && value < 70 && { backgroundColor: theme.palette.warning.main }),
    ...(value >= 70 && { backgroundColor: theme.palette.success.main })
  }
}));

const AdminReference = () => {
  const { workerId } = useParams();
  const [references, setReferences] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [selectedReference, setSelectedReference] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [totals, setTotals] = useState({ total: 0, completed: 0, pending: 0 });
  const [activeTab, setActiveTab] = useState(0);
  const [workerDetail, setWorkerDetail] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Fetch references for the worker
  const fetchReferences = () => {
    if (!workerId) return;
    setLoading(true);
    setError('');
    api.get(`/references/worker/${workerId}`)
      .then(res => {
        setReferences(res.data.references || []);
        setSummary(res.data.summary || []);
        setWorkerDetail(res.data.worker)
        setTotals({
          total: res.data.totalReferences || 0,
          completed: res.data.completedReferences || 0,
          pending: res.data.pendingReferences || 0
        });
      })
      .catch(() => setError('Failed to fetch references'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReferences();
    // eslint-disable-next-line
  }, [workerId]);

  // Sync references
  const handleSync = () => {
    setSyncing(true);
    api.post('/references/sync', { workerProfileId: workerId, questionnaireId: '686800b0d5b8997db68fd94b' })
      .then(() => {
        setSnackbar({ open: true, message: 'References synced successfully!', severity: 'success' });
        fetchReferences();
      })
      .catch(() => setSnackbar({ open: true, message: 'Failed to sync references', severity: 'error' }))
      .finally(() => setSyncing(false));
  };

  // Send reference email
  const handleSendEmail = (id) => {
    api.post(`/references/${id}/send-email`)
      .then(() => setSnackbar({ open: true, message: 'Email sent successfully!', severity: 'success' }))
      .catch(() => setSnackbar({ open: true, message: 'Failed to send email', severity: 'error' }));
  };

  // View reference details
  const handleView = (ref) => {
    setSelectedReference(ref);
    setModalOpen(true);
    setActiveTab(0);
  };

  // Status icon helper
  const statusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle color="success" />;
      case 'Pending': return <PendingActions color="white" />;
      case 'EmailSent': return <HourglassEmpty color="info" />;
      default: return <Error color="error" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  console.log("workerDetails", workerDetail)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <WorkerNavbar />
      <AdminSidebar />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 10,
          p: 2,
          ml: { xs: 0, md: '0px' }, // Account for sidebar width
          width: { xs: '100%', md: `calc(100% - 280px)` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Stack direction={isMobile ? 'column' : 'row'} alignItems="center" justifyContent="space-between" spacing={2} mb={1}>
          <Stack>
            <Stack direction='row' alignItems='center' spacing={1} sx={{
              justifyContent: { xs: "center" }
            }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600, fontSize: { xs: '22px' } }}>
                {workerDetail?.fullName}
              </Typography>
              <Stack direction="row" spacing={1}>
                {summary.map((s) => (
                  <Badge key={s._id} badgeContent={s.count} color="primary" sx={{ mb: 1 }}>
                    <StatusChip
                      status={s._id}
                      label={s._id}
                      icon={statusIcon(s._id)}
                      size="medium"
                      sx={{
                        fontSize: { xs: '12px' }
                      }}
                    />
                  </Badge>
                ))}
              </Stack>

            </Stack>


            <Stack direction='row' alignItems='center' spacing={0.5}>
              <Email sx={{
                fontSize: '19px'
              }} />
              <Typography>
                {workerDetail?.email}
              </Typography>

            </Stack>

          </Stack>





          <Button
            variant="contained"
            color="primary"
            onClick={handleSync}
            disabled={syncing || !workerId}
            startIcon={<Sync />}
            sx={{ minWidth: 180 }}
          >

            {syncing ? <CircularProgress size={24} color="inherit" /> : 'Sync References'}
          </Button>



        </Stack>





        
        <ReferenceSummaryCard totals={totals}/>

     

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <Paper elevation={2} sx={{ overflow: 'hidden' }}>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                    {!isMobile && <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>}
                    {!isTablet && <TableCell sx={{ fontWeight: 600 }}>Position</TableCell>}
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Progress</TableCell>
                    {!isMobile && <TableCell sx={{ fontWeight: 600 }}>Last Contact</TableCell>}
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(references) && references.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="subtitle1" color="text.secondary">
                          No references found for this worker
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : Array.isArray(references) ? (
                    references.map(ref => (
                      <TableRow key={ref._id} hover>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.light }}>
                              {ref.referenceInfo?.name?.charAt(0) || <Person />}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">{ref.referenceInfo?.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {ref.referenceInfo?.email}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        {!isMobile && (
                          <TableCell>
                            <Typography>{ref.referenceInfo?.company || '—'}</Typography>
                          </TableCell>
                        )}
                        {!isTablet && (
                          <TableCell>
                            <Typography>{ref.referenceInfo?.position || '—'}</Typography>
                          </TableCell>
                        )}
                        <TableCell>
                          <StatusChip
                            status={ref.status}
                            label={ref.status}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: '60px' }}>
                              <ProgressBar
                                variant="determinate"
                                value={ref.progress?.percentageComplete ?? 0}
                              />
                            </Box>
                            <Typography variant="body2">
                              {ref.progress?.percentageComplete ?? 0}%
                            </Typography>
                          </Box>
                        </TableCell>
                        {!isMobile && (
                          <TableCell>
                            <Typography variant="body2">
                              {ref.emailTracking?.lastEmailSent
                                ? formatDate(ref.emailTracking.lastEmailSent)
                                : '—'}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="View Details">
                              <IconButton
                                onClick={() => handleView(ref)}
                                color="primary"
                                size="small"
                              >
                                <Visibility fontSize={isMobile ? 'small' : 'medium'} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Send Reminder">
                              <IconButton
                                onClick={() => handleSendEmail(ref._id)}
                                color="secondary"
                                size="small"
                              >
                                <Email fontSize={isMobile ? 'small' : 'medium'} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="subtitle1" color="text.secondary">
                          Error loading references
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            sx={{ width: '100%' }}
            elevation={6}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Reference Details Modal */}
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Person />
              <Typography variant="h6">Reference Details</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 0 }}>
            {selectedReference ? (
              <Box>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant={isMobile ? 'scrollable' : 'standard'}
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                  <Tab label="Overview" icon={<Person fontSize="small" />} />
                  <Tab label="Responses" icon={<QuestionAnswer fontSize="small" />} />
                  <Tab label="History" icon={<History fontSize="small" />} />
                  <Tab label="Verification" icon={<History fontSize="small" />} />
                </Tabs>

                <Box sx={{ p: isMobile ? 2 : 3 }}>
                  {activeTab === 0 && (
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
                          Reference Information
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              <Person color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Name"
                              secondary={selectedReference.referenceInfo?.name || '—'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Email color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Email"
                              secondary={selectedReference.referenceInfo?.email || '—'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Business color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Company"
                              secondary={selectedReference.referenceInfo?.company || '—'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Business color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Position"
                              secondary={selectedReference.referenceInfo?.position || '—'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Phone color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Phone"
                              secondary={selectedReference.referenceInfo?.phone || '—'}
                            />
                          </ListItem>
                        </List>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          <PendingActions sx={{ verticalAlign: 'middle', mr: 1 }} />
                          Status Information
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              {statusIcon(selectedReference.status)}
                            </ListItemIcon>
                            <ListItemText
                              primary="Status"
                              secondary={
                                <StatusChip
                                  status={selectedReference.status}
                                  label={selectedReference.status}
                                  size="small"
                                />
                              }
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <CheckCircle color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Completion"
                              secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Box sx={{ width: '100px' }}>
                                    <ProgressBar
                                      variant="determinate"
                                      value={selectedReference.progress?.percentageComplete ?? 0}
                                    />
                                  </Box>
                                  <Typography variant="body2">
                                    {selectedReference.progress?.percentageComplete ?? 0}%
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Email color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Emails Sent"
                              secondary={selectedReference.emailTracking?.emailsSent ?? 0}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <CalendarToday color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Last Email Sent"
                              secondary={formatDate(selectedReference.emailTracking?.lastEmailSent)}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Error color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Email Bounced"
                              secondary={selectedReference.emailTracking?.emailBounced ? 'Yes' : 'No'}
                            />
                          </ListItem>
                        </List>
                      </Grid>
                    </Grid>
                  )}

                  {activeTab === 1 && (
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        <QuestionAnswer sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Questionnaire Responses
                      </Typography>
                      {selectedReference.responses?.length > 0 ? (
                        <List sx={{ bgcolor: 'background.paper' }}>
                          {selectedReference.responses.map((r, idx) => (
                            <React.Fragment key={r.questionId || idx}>
                              <ListItem alignItems="flex-start">
                                <ListItemText
                                  primary={
                                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                      {r.questionText}
                                    </Typography>
                                  }
                                  secondary={
                                    <Typography variant="body2" color="text.secondary">
                                      {r.skipped ? (
                                        <Chip label="Skipped" size="small" color="warning" variant="outlined" />
                                      ) : (
                                        r.answer || 'No answer provided'
                                      )}
                                    </Typography>
                                  }
                                />
                              </ListItem>
                              {idx < selectedReference.responses.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                          No responses available
                        </Typography>
                      )}
                    </Box>
                  )}

                  {activeTab === 2 && (
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        <History sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Status History
                      </Typography>
                      {selectedReference.statusHistory?.length > 0 ? (
                        <List sx={{ bgcolor: 'background.paper' }}>
                          {selectedReference.statusHistory.map((h, idx) => (
                            <React.Fragment key={h._id || idx}>
                              <ListItem alignItems="flex-start">
                                <ListItemIcon>
                                  {statusIcon(h.status)}
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                      {h.status}
                                    </Typography>
                                  }
                                  secondary={
                                    <>
                                      <Typography variant="body2" color="text.secondary">
                                        {formatDate(h.timestamp)}
                                      </Typography>
                                      {h.notes && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                          <Notes sx={{ verticalAlign: 'middle', fontSize: 16, mr: 0.5 }} />
                                          {h.notes}
                                        </Typography>
                                      )}
                                    </>
                                  }
                                />
                              </ListItem>
                              {idx < selectedReference.statusHistory.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                          No history available
                        </Typography>
                      )}
                    </Box>
                  )}

                  {activeTab === 3 && (
                    <Box>
                      <Typography>Overall verification for this reference</Typography>
                      <Select>
                        <option>

                        </option>
                      </Select>
                    </Box>
                  )}
                </Box>
              </Box>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress size={60} />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: 'background.default' }}>
            <Button
              onClick={() => setModalOpen(false)}
              color="primary"
              variant="contained"
              sx={{ minWidth: 100 }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default AdminReference;