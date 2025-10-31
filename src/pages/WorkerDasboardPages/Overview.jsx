import {
    Box,
    Typography,
    Button,
    Chip,
    Card,
    CardContent,
    Stack,
    Divider,
    Grid,
    LinearProgress,
    Avatar,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Tooltip,
    alpha,
    useTheme,
    Paper,
    Container,
    useMediaQuery,
    Skeleton
} from '@mui/material'
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import ScheduleIcon from '@mui/icons-material/Schedule';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import React,{useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import WorkerNavbar from '../../components/Navbar/WorkerNavbar'
import DashboardSidebar from '../../components/workerDashboard/components/DashboardSidebar/DashboardSidebar'
import OnboardingPrompt from '../../components/workerDashboard/components/OnboardingPrompt/OnboardingPrompt'
// CSS removed in favor of MUI sx-based styling

// Hoisted status maps for stable references and perf
const STATUS_COLOR_MAP = {
    'Verified': 'success',
    'Pending': 'warning',
    'Rejected': 'error',
    'Expiring Soon': 'warning',
    'Expired': 'error',
    'Completed': 'success',
    'InProgress': 'info',
    'EmailSent': 'info',
    'Viewed': 'info',
    'Submitted': 'info',
    'Approved': 'success',
    'Draft': 'default',
};

const STATUS_TEXT_MAP = {
    'Verified': 'Verified',
    'Pending': 'Pending Review',
    'Rejected': 'Rejected',
    'Expiring Soon': 'Expiring Soon',
    'Expired': 'Expired',
    'Completed': 'Completed',
    'InProgress': 'In Progress',
    'EmailSent': 'Email Sent',
    'Viewed': 'Viewed',
    'Submitted': 'Submitted',
    'Approved': 'Approved',
    'Draft': 'Draft',
};

const Overview = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { signOut, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const isGoogleUser = localStorage.getItem('auth_provider') === 'google';

    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ['currentUser'],
        queryFn: getCurrentUser,
        staleTime: 10 * 60 * 1000,
        retry: (failureCount, error) => {
            if (error?.response?.status === 401) {
                signOut();
                return false;
            }
            return failureCount < 2;
        },
    });

    const { data: profileStatus, isLoading: isProfileLoading } = useQuery({
        queryKey: ['workerProfileStatus'],
        queryFn: async () => {
            const response = await api.get('/onboarding/status');
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
        enabled: !!user,
    });

    const { data: overviewData, isLoading: isOverviewLoading } = useQuery({
        queryKey: ['workerOverview'],
        queryFn: async () => {
            const response = await api.get('/onboarding/overview');
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
        enabled: !!user,
    });

    // Lightweight references overview query (decoupled from onboarding overview)
    const { data: referencesData, isLoading: isReferencesLoading } = useQuery({
        queryKey: ['references.overview'],
        queryFn: async () => {
            const response = await api.get('/references/overview');
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
        enabled: !!user,
        select: (data) => ({
            stats: data?.stats || {},
            recent: Array.isArray(data?.recent) ? data.recent : [],
        }),
    });

    // Lightweight notifications overview query
    const { data: notificationsData, isLoading: isNotificationsLoading } = useQuery({
        queryKey: ['notifications.overview'],
        queryFn: async () => {
            const response = await api.get('/notifications/overview');
            return response.data;
        },
        staleTime: 3 * 60 * 1000,
        retry: false,
        enabled: !!user,
        select: (data) => ({
            recent: Array.isArray(data?.recent) ? data.recent : [],
            unreadCount: Number(data?.unreadCount || 0),
        }),
    });

    // Lightweight timesheets overview query
    const { data: timesheetsData, isLoading: isTimesheetsLoading } = useQuery({
        queryKey: ['timesheets.overview'],
        queryFn: async () => {
            const response = await api.get('/timesheet/overview');
            return response.data;
        },
        staleTime: 3 * 60 * 1000,
        retry: false,
        enabled: !!user,
        select: (data) => ({
            stats: data?.stats || {},
            recent: Array.isArray(data?.recent) ? data.recent : [],
        }),
    });

    const verificationStatus =
        typeof profileStatus?.verificationStatus === 'object'
            ? profileStatus?.verificationStatus?.overall
            : profileStatus?.verificationStatus;

    const overviewVerificationStatus = overviewData?.verificationStatus?.overall || verificationStatus;
    const isLoading = isUserLoading || isProfileLoading || isOverviewLoading;


    const handleSignOut = async () => {
        try {
            await signOut(false);
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Logout failed:', error);
            navigate('/', { replace: true });
        }
    };

    const needsOnboarding =
        !profileStatus ||
        (profileStatus && !profileStatus.profileCompleteness) ||
        profileStatus?.profileCompleteness?.percentage < 100;

    const getNextOnboardingStep = () => {
        if (!profileStatus || !profileStatus.profileCompleteness) return 1;
        const { completedSections } = profileStatus.profileCompleteness;
        if (!completedSections.basicInfo) return 1;
        if (!completedSections.workHistory) return 2;
        if (!completedSections.availability) return 3;
        if (!completedSections.certifications) return 4;
        if (!completedSections.healthInformation) return 5;
        return null;
    };

    const continueOnboarding = () => navigate('/onboarding');

    const getStatusColor = (status) => STATUS_COLOR_MAP[status] || 'default';

    const getStatusText = (status) => STATUS_TEXT_MAP[status] || status;

    const getStatusIcon = (status) => {
        const iconMap = {
            'Verified': <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />,
            'Pending': <ScheduleIcon sx={{ fontSize: 16 }} />,
            'Rejected': <CancelIcon sx={{ fontSize: 16 }} />,
            'Expiring Soon': <WarningIcon sx={{ fontSize: 16 }} />,
            'Expired': <CancelIcon sx={{ fontSize: 16 }} />,
            'Completed': <CheckCircleIcon sx={{ fontSize: 16 }} />,
            'InProgress': <ScheduleIcon sx={{ fontSize: 16 }} />,
            'EmailSent': <EmailIcon sx={{ fontSize: 16 }} />,
            'Viewed': <InfoOutlinedIcon sx={{ fontSize: 16 }} />,
            'Submitted': <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />,
            'Approved': <CheckCircleIcon sx={{ fontSize: 16 }} />,
            'Draft': <RadioButtonUncheckedIcon sx={{ fontSize: 16 }} />,
        };
        return iconMap[status] || null;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    // Data extraction
    const unverifiedCertifications = overviewData?.certifications?.unverified || profileStatus?.unverifiedCertifications || [];
    const certStats = overviewData?.certifications?.stats || {};
    const referenceStats = referencesData?.stats || overviewData?.references?.stats || {};
    const recentReferences = referencesData?.recent || overviewData?.references?.recent || [];
    const recentNotifications = notificationsData?.recent || overviewData?.notifications?.recent || [];
    const unreadNotifications = notificationsData?.unreadCount || overviewData?.notifications?.unreadCount || 0;
    const timesheetStats = timesheetsData?.stats || overviewData?.timesheets?.stats || {};
    const recentTimesheets = timesheetsData?.recent || overviewData?.timesheets?.recent || [];
    const verificationDetail = overviewData?.verificationStatus || {};
    const profileCompleteness = overviewData?.profileCompleteness || profileStatus?.profileCompleteness?.percentage || 0;

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <LoadingSpinner
                size="lg"
                showLogo={true}
                text="Loading overview..."
                fullPage={true}
                variant="light"
            />
        </div>
    );

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <Box sx={{ minHeight: '100vh',}}>
            <WorkerNavbar />
            <Box sx={{ display: 'flex',}}>
        
                    <DashboardSidebar

/>
                <Box component="main" sx={{ flex: 1, minWidth: 0, minHeight: 0, overflow: 'auto' }}>
                    {needsOnboarding && (
                        <Box sx={{ mt: 2, px: { xs: 2, sm: 3 } }}>
                            <OnboardingPrompt
                                percentage={profileStatus?.profileCompleteness?.percentage || 0}
                                nextStep={getNextOnboardingStep()}
                                onContinue={continueOnboarding}
                            />
                        </Box>
                    )}

                    <Container maxWidth="xl" sx={{ pt: { xs: 1, sm: 1.5, }, pb: { xs: 2, sm: 3 }, mt: { xs: 0, md: 10 } }}>
                        {/* Header Section */}
                        <Box sx={{ mb: { xs: 3, md: 4 } }}>
                            <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700} sx={{ mb: 0.5 }}>
                                {getGreeting()}, {user?.firstName || 'Worker'} 👋
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Here's your overview and activity
                            </Typography>
                        </Box>

                        {/* Main Stats Grid */}
                        <Grid container spacing={{ xs: 2, sm: 2.5, md: 2 }} sx={{ mb: 3 }}>
                            {/* Verification Status - Redesigned */}
                          

                            {/* Recent Notifications list beside Unverified card */}
                            {/*  for the recent notifications list beside the unverified card */}
                            <Box sx={{ display: 'flex', alignItems: 'stretch', flexDirection: {xs:'column', sm:'column',md:'row'}, gap: 2 ,maxWidth: { xs: '100%', md: '100%' } }}>
                            <Grid item xs={12} sx={{
                                maxHeight: { xs: '100%', md: '88%' },
                            }} lg={overviewVerificationStatus === 'Unverified' ? 8 : 6}>
                                <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, height: '100%', border: '1px solid', borderColor: overviewVerificationStatus === 'Unverified' ? 'error.main' : overviewVerificationStatus === 'Partially Verified' ? 'warning.main' : 'success.main', borderRadius: 2, bgcolor: 'background.paper', transition: 'all 0.2s ease-in-out', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' } }}>
                                    <Stack spacing={2.5}>
                                        <Stack direction="row" spacing={2} alignItems="flex-start">
                                            <Box sx={{ width: 48, height: 48, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: overviewVerificationStatus === 'Unverified' ? alpha(theme.palette.error.main, 0.12) : overviewVerificationStatus === 'Partially Verified' ? alpha(theme.palette.warning.main, 0.12) : alpha(theme.palette.success.main, 0.12), color: overviewVerificationStatus === 'Unverified' ? 'error.main' : overviewVerificationStatus === 'Partially Verified' ? 'warning.main' : 'success.main', flexShrink: 0 }}>
                                                {overviewVerificationStatus === 'Unverified' ? <WarningIcon /> : overviewVerificationStatus === 'Partially Verified' ? <ScheduleIcon /> : <VerifiedUserIcon />}
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                                                    {overviewVerificationStatus === 'Unverified' ? 'Profile Unverified' : overviewVerificationStatus === 'Partially Verified' ? 'Partially Verified' : 'Fully Verified'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {overviewVerificationStatus === 'Unverified' ? 'Complete verification to access features' : overviewVerificationStatus === 'Partially Verified' ? 'Some items need attention' : 'All checks complete'}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        {overviewVerificationStatus !== 'Unverified' && (
                                            <Stack spacing={1.5}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {verificationDetail.identityVerified ? (<CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />) : (<RadioButtonUncheckedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />)}
                                                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>Identity Verified</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {verificationDetail.backgroundCheckPassed ? (<CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />) : (<RadioButtonUncheckedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />)}
                                                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>Background Check</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {verificationDetail.skillsVerified ? (<CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />) : (<RadioButtonUncheckedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />)}
                                                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>Skills Verified</Typography>
                                                </Box>
                                            </Stack>
                                        )}

                                        {overviewVerificationStatus === 'Unverified' && (
                                            <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                                                    {(certStats.pending || 0) > 0 && (<Chip label={`Pending ${certStats.pending}`} color="warning" size="small" variant="outlined" />)}
                                                    {(certStats.expiring || 0) > 0 && (<Chip label={`Expiring ${certStats.expiring}`} color="warning" size="small" variant="outlined" />)}
                                                    {((certStats.rejected || 0) + (certStats.expired || 0)) > 0 && (<Chip label={`Issues ${(certStats.rejected || 0) + (certStats.expired || 0)}`} color="error" size="small" variant="outlined" />)}
                                                </Stack>
                                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>Unverified Certifications ({unverifiedCertifications.length})</Typography>
                                                {unverifiedCertifications.length > 0 ? (
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: { xs: 240, lg: 260 }, overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 } }}>
                                                        {unverifiedCertifications.slice(0, 8).map((cert, index) => (
                                                            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.25, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
                                                                <Typography variant="body2" noWrap sx={{ flex: 1, mr: 1 }}>{cert.name}</Typography>
                                                                <Chip icon={getStatusIcon(cert.status)} label={getStatusText(cert.status)} color={getStatusColor(cert.status)} size="small" sx={{ fontSize: '0.7rem', height: 24 }} />
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                ) : (<Typography variant="body2" color="text.secondary">No pending certifications.</Typography>)}
                                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1.5 }}>
                                                    <Button variant="contained" color="error" size="small" fullWidth onClick={() => navigate('/my-certifications')}>Fix Now</Button>
                                                    <Button variant="outlined" color="error" size="small" fullWidth onClick={() => navigate('/my-certifications')}>View All</Button>
                                                </Stack>
                                            </Box>
                                        )}
                                    </Stack>
                                </Paper>
                            </Grid>
                            {overviewVerificationStatus === 'Unverified' && (
                                <Grid item xs={12} md={8} lg={4} sx={{ minWidth: { md: 360 } ,maxHeight:{xs:'100%',md:'88%'}}}>
                                    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 2, p: 3, height: '100%', }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="h6" fontWeight={700}>Recent Notifications</Typography>
                                                {unreadNotifications > 0 && (<Chip size="small" label={`${unreadNotifications} new`} color="info" sx={{ height: 22, fontSize: '0.7rem' }} />)}
                                            </Stack>
                                            <Button size="small" endIcon={<KeyboardArrowRightIcon />} onClick={() => navigate('/notifications')}>View All</Button>
                                        </Stack>
                                        {isNotificationsLoading && recentNotifications.length === 0 ? (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                {[...Array(6)].map((_, i) => (
                                                    <Box key={i} sx={{ p: 1.25, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                                        <Skeleton variant="text" width="60%" height={18} />
                                                        <Skeleton variant="text" width="40%" height={14} />
                                                    </Box>
                                                ))}
                                            </Box>
                                        ) : recentNotifications.length > 0 ? (
                                            <List sx={{
                                                p: 0, overflowY: 'auto', pr: 1,
                                                '&::-webkit-scrollbar': { width: 6 },
                                                '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 },
                                            }}>
                                                {recentNotifications.slice(0, 9).map((notification, idx) => (
                                                    <React.Fragment key={notification.id || idx}>
                                                        <ListItem
                                                            sx={{
                                                                px: 1,
                                                                py: 1.25,
                                                                borderRadius: 2,
                                                                border: '1px solid',
                                                                borderColor: 'divider',
                                                                mb: 1,
                                                                bgcolor: notification.read ? 'background.paper' : alpha(theme.palette.info.main, 0.05),
                                                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                                                                position: 'relative',
                                                                overflow: 'hidden'
                                                            }}
                                                        >
                                                            <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: notification.priority === 'high' ? 'error.main' : (notification.read ? 'divider' : 'info.main') }} />
                                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                                {notification.read ? (
                                                                    <NotificationsIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                                                                ) : (
                                                                    <NotificationsActiveIcon sx={{ color: 'info.main', fontSize: 20 }} />
                                                                )}
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={
                                                                    <Typography variant="body2" fontWeight={notification.read ? 400 : 600} noWrap>
                                                                        {notification.title || 'Notification'}
                                                                    </Typography>
                                                                }
                                                                secondary={
                                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                                                        {formatDate(notification.createdAt)} • {formatTime(notification.createdAt)}
                                                                    </Typography>
                                                                }
                                                            />
                                                            {notification.priority === 'high' && (
                                                                <Chip label="High" color="error" size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
                                                            )}
                                                        </ListItem>
                                                    </React.Fragment>
                                                ))}
                                            </List>
                                        ) : (
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: { xs: 140, lg: 200 },
                                                bgcolor: 'background.default',
                                                borderRadius: 2,
                                                border: '1px dashed',
                                                borderColor: 'divider',
                                            }}>
                                                <Typography variant="body2" color="text.secondary">No recent notifications</Typography>
                                            </Box>
                                        )}
                                    </Paper>
                                </Grid>
                            )}
                           
                                  {/* {/* For the stats table */}
                        <Grid container spacing={3} sx={{ mb: 3, mt: { xs: 6,md:0  } }}>
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 2, p: 3 }}>
                                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Your Stats</Typography>
                                    <Stack spacing={2.5}>
                                        {/* Certifications summary */}
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 1.5, border: '1px solid', borderColor: (certStats.expired || 0) > 0 || (certStats.rejected || 0) > 0 ? 'error.light' : (certStats.expiring || 0) > 0 || (certStats.pending || 0) > 0 ? 'warning.light' : 'divider', borderRadius: 1.5 }}>
                                            <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                                                <SchoolIcon sx={{ color: 'primary.main' }} />
                                            </Avatar>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Stack direction="row" spacing={1.1} alignItems="center">
                                                    <Typography variant="subtitle2" color="text.secondary">Certifications</Typography>
                                                    <Typography variant="subtitle1" fontWeight={700}>{certStats.total || 0}</Typography>
                                                </Stack>
                                                <Stack direction="column" spacing={1} sx={{ mt: 0.75, flexWrap: 'wrap' }}>
                                                    <Chip size="small" label={`Verified ${certStats.verified || 0}`} color="success" variant="outlined" />
                                                    {(certStats.pending || 0) > 0 && <Chip size="small" label={`Pending ${certStats.pending}`} color="warning" variant="outlined" />}
                                                    {(certStats.expiring || 0) > 0 && <Chip size="small" label={`Expiring ${certStats.expiring}`} color="warning" variant="outlined" />}
                                                    {((certStats.rejected || 0) + (certStats.expired || 0)) > 0 && <Chip size="small" label={`Issues ${(certStats.rejected || 0) + (certStats.expired || 0)}`} color="error" variant="outlined" />}
                                                </Stack>
                                            </Box>
                                            <Button size="small" onClick={() => navigate('/my-certifications')}>Open</Button>
                                        </Stack>

                                        {/* For Hourly Rate */}
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                                            <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                                                <AttachMoneyIcon sx={{ color: 'primary.secondary' }} />
                                            </Avatar>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Stack direction="row" justifyContent='space-between' alignItems="center">
                                                    <Typography variant="subtitle2" color="text.secondary">Hourly Rate</Typography>
                                                    <Typography variant="subtitle1" sx={{ fontSize: '0.9rem' }} fontWeight={700}>${overviewData?.expectedHourlyRate || 0}/hr</Typography>
                                                </Stack>

                                            </Box>

                                        </Stack>


                                        {/* Timesheets summary */}
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                                            <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                                                <AccessTimeIcon sx={{ color: 'primary.main' }} />
                                            </Avatar>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                {isTimesheetsLoading ? (
                                                    <>
                                                        <Skeleton variant="text" width={120} height={18} />
                                                        <Stack direction="row" spacing={1} sx={{ mt: 0.75, flexWrap: 'wrap' }}>
                                                            <Skeleton variant="rounded" width={90} height={24} />
                                                            <Skeleton variant="rounded" width={90} height={24} />
                                                        </Stack>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Stack direction="row" spacing={1.1} alignItems="center">
                                                            <Typography variant="subtitle2" color="text.secondary">Timesheets</Typography>
                                                            <Typography variant="subtitle1" fontWeight={700}>{(timesheetStats.approved || 0) + (timesheetStats.submitted || 0) + (timesheetStats.pending_review || 0) + (timesheetStats.draft || 0)}</Typography>
                                                        </Stack>
                                                        <Stack direction="row" spacing={1} sx={{ mt: 0.75, flexWrap: 'wrap' }}>
                                                            {(timesheetStats.approved || 0) > 0 && <Chip size="small" label={`Approved ${timesheetStats.approved}`} color="success" variant="outlined" />}
                                                            {(timesheetStats.pending_review || 0) > 0 && <Chip size="small" label={`Pending ${timesheetStats.pending_review}`} color="warning" variant="outlined" />}
                                                            {(timesheetStats.draft || 0) > 0 && <Chip size="small" label={`Draft ${timesheetStats.draft}`} variant="outlined" />}
                                                        </Stack>
                                                    </>
                                                )}
                                            </Box>
                                            <Button size="small" onClick={() => navigate('/timesheets')}>Open</Button>
                                        </Stack>

                                        {/* References summary */}
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                                            <Avatar sx={{ bgcolor: 'secondary.light', width: 40, height: 40 }}>
                                                <PersonIcon sx={{ color: 'secondary.main' }} />
                                            </Avatar>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                {isReferencesLoading ? (
                                                    <>
                                                        <Skeleton variant="text" width={120} height={18} />
                                                        <Stack direction="row" spacing={1} sx={{ mt: 0.75, flexWrap: 'wrap' }}>
                                                            <Skeleton variant="rounded" width={110} height={24} />
                                                            <Skeleton variant="rounded" width={110} height={24} />
                                                        </Stack>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Typography variant="subtitle2" color="text.secondary">References</Typography>
                                                            <Typography variant="subtitle1" fontWeight={700}>{referenceStats.total || 0}</Typography>
                                                        </Stack>
                                                        <Stack direction="row" spacing={1.1} sx={{ mt: 0.75, flexWrap: 'wrap' }}>
                                                            {(referenceStats.completed || 0) > 0 && <Chip size="small" label={`Completed ${referenceStats.completed}`} color="success" variant="outlined" />}
                                                            {(referenceStats.pending || 0) > 0 && <Chip size="small" label={`Pending ${referenceStats.pending}`} color="warning" variant="outlined" />}
                                                            {(referenceStats.inProgress || 0) > 0 && <Chip size="small" label={`In Progress ${referenceStats.inProgress}`} color="info" variant="outlined" />}
                                                        </Stack>
                                                    </>
                                                )}
                                            </Box>
                                            <Button size="small" onClick={() => navigate('/work-history')}>Open</Button>
                                        </Stack>

                                        {/* Work History */}
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                                            <Avatar sx={{ bgcolor: 'info.light', width: 40, height: 40 }}>
                                                <WorkHistoryIcon sx={{ color: 'info.main' }} />
                                            </Avatar>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Stack direction="row" spacing={1.1} alignItems="center">
                                                    <Typography variant="subtitle2" color="text.secondary">Work History</Typography>
                                                    <Typography sx={{ pt: 0, fontSize: { xs: '0.8rem', md: '1rem' } }} variant="subtitle1" fontWeight={700}>{overviewData?.workHistory?.count || 0}</Typography>
                                                </Stack>
                                                <Typography variant="caption" color="text.secondary">Experiences</Typography>
                                            </Box>
                                            <Button size="small" onClick={() => navigate('/work-history')}>Open</Button>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            </Grid>
                        </Grid>
                            </Box>
                           

                            {/* Profile Completeness */}
                            {overviewVerificationStatus !== 'Unverified' && (
                                <Grid item xs={12} lg={6}>
                                    <Card
                                        elevation={0}
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 3,
                                            p: 3,
                                            height: '100%',
                                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, transparent 100%)`,
                                        }}
                                    >
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                                                <AssignmentIcon />
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                                                    Profile Completeness
                                                </Typography>
                                                <Typography variant="h4" fontWeight={700} color="primary.main">
                                                    {profileCompleteness}%
                                                </Typography>
                                            </Box>
                                        </Stack>
                                        <LinearProgress
                                            variant="determinate"
                                            value={profileCompleteness}
                                            sx={{
                                                height: 10,
                                                borderRadius: 2,
                                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                '& .MuiLinearProgress-bar': {
                                                    borderRadius: 2,
                                                }
                                            }}
                                        />
                                        {profileCompleteness < 100 && (
                                            <Button
                                                variant="text"
                                                size="small"
                                                sx={{ mt: 2 }}
                                                onClick={continueOnboarding}
                                            >
                                                Complete Profile →
                                            </Button>
                                        )}
                                    </Card>
                                </Grid>
                            )}
                        </Grid>

                  

                      

                        {/* Recent Activity Section */}
                        <Grid container spacing={3}>
                            {/* Recent Notifications */}
                            {overviewVerificationStatus !== 'Unverified' && (
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 2, p: 3 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="h6" fontWeight={700}>Recent Notifications</Typography>
                                                {unreadNotifications > 0 && (<Chip size="small" label={`${unreadNotifications} new`} color="info" sx={{ height: 22, fontSize: '0.7rem' }} />)}
                                            </Stack>
                                            <Button size="small" endIcon={<KeyboardArrowRightIcon />} onClick={() => navigate('/notifications')}>View All</Button>
                                        </Stack>
                                        {isNotificationsLoading && recentNotifications.length === 0 ? (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                {[...Array(6)].map((_, i) => (
                                                    <Box key={i} sx={{ p: 1.25, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                                        <Skeleton variant="text" width="60%" height={18} />
                                                        <Skeleton variant="text" width="40%" height={14} />
                                                    </Box>
                                                ))}
                                            </Box>
                                        ) : recentNotifications.length > 0 ? (
                                            <List sx={{ p: 0 }}>
                                                {recentNotifications.slice(0, 6).map((notification, idx) => (
                                                    <React.Fragment key={notification.id || idx}>
                                                        <ListItem sx={{ px: 1, py: 1.25, borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 1, bgcolor: notification.read ? 'background.paper' : alpha(theme.palette.info.main, 0.05), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) }, position: 'relative', overflow: 'hidden' }}>
                                                            <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: notification.priority === 'high' ? 'error.main' : (notification.read ? 'divider' : 'info.main') }} />
                                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                                {notification.read ? <NotificationsIcon sx={{ color: 'text.disabled', fontSize: 20 }} /> : <NotificationsActiveIcon sx={{ color: 'info.main', fontSize: 20 }} />}
                                                            </ListItemIcon>
                                                            <ListItemText primary={<Typography variant="body2" fontWeight={notification.read ? 400 : 600} noWrap>{notification.title || 'Notification'}</Typography>} secondary={<Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>{formatDate(notification.createdAt)} • {formatTime(notification.createdAt)}</Typography>} />
                                                            {notification.priority === 'high' && (<Chip label="High" color="error" size="small" sx={{ fontSize: '0.65rem', height: 20 }} />)}
                                                        </ListItem>
                                                    </React.Fragment>
                                                ))}
                                            </List>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">No recent notifications</Typography>
                                        )}
                                    </Paper>
                                </Grid>
                            )}

                            {/* Recent Timesheets */}
                            {true && (
                                <Grid item xs={12} md={6}>
                                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                            <Typography variant="h6" fontWeight={700}>
                                                Recent Timesheets
                                            </Typography>
                                            <Button
                                                size="small"
                                                endIcon={<KeyboardArrowRightIcon />}
                                                onClick={() => navigate('/timesheets')}
                                            >
                                                View All
                                            </Button>
                                        </Stack>
                                        {isTimesheetsLoading && recentTimesheets.length === 0 ? (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <Box key={i}>
                                                        <Skeleton variant="text" width="40%" height={18} />
                                                        <Skeleton variant="text" width="30%" height={14} />
                                                    </Box>
                                                ))}
                                            </Box>
                                        ) : recentTimesheets.length > 0 ? (
                                            <List sx={{ p: 0 }}>
                                                {recentTimesheets.slice(0, 5).map((timesheet, idx) => (
                                                    <React.Fragment key={timesheet.id || idx}>
                                                        <ListItem
                                                            sx={{
                                                                px: 0,
                                                                py: 1.5,
                                                                borderRadius: 2,
                                                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                                                            }}
                                                        >
                                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                                <AccessTimeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={
                                                                    <Typography variant="body2" fontWeight={600}>
                                                                        {timesheet.clientName || 'Client'}
                                                                    </Typography>
                                                                }
                                                                secondary={
                                                                    <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                                                            {formatDate(timesheet.clockIn)} • {timesheet.totalHours || 0}h
                                                                        </Typography>
                                                                        {timesheet.totalPay && (
                                                                            <Typography variant="caption" color="success.main" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                                                                                ${timesheet.totalPay}
                                                                            </Typography>
                                                                        )}
                                                                    </Stack>
                                                                }
                                                            />
                                                            <Chip
                                                                icon={getStatusIcon(timesheet.status)}
                                                                label={getStatusText(timesheet.status)}
                                                                color={getStatusColor(timesheet.status)}
                                                                size="small"
                                                                sx={{ fontSize: '0.7rem', height: 24 }}
                                                            />
                                                        </ListItem>
                                                        {idx < recentTimesheets.slice(0, 5).length - 1 && <Divider />}
                                                    </React.Fragment>
                                                ))}
                                            </List>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">No recent timesheets</Typography>
                                        )}
                                    </Card>
                                </Grid>
                            )}

                            {/* Recent References */}
                            {true && (
                                <Grid item xs={12} md={recentNotifications.length > 0 || recentTimesheets.length > 0 ? 12 : 6} sx={{ mt: { xs: 2, md: 5 }, minWidth: { md: '100%' } }}>
                                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                            <Typography variant="h6" fontWeight={700}>
                                                Recent References
                                            </Typography>
                                            <Button
                                                size="small"
                                                endIcon={<KeyboardArrowRightIcon />}
                                                onClick={() => navigate('/work-history')}
                                            >
                                                View All
                                            </Button>
                                        </Stack>
                                        {isReferencesLoading && recentReferences.length === 0 ? (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <Box key={i}>
                                                        <Skeleton variant="text" width="35%" height={18} />
                                                        <Skeleton variant="text" width="30%" height={14} />
                                                    </Box>
                                                ))}
                                            </Box>
                                        ) : recentReferences.length > 0 ? (
                                            <List sx={{ p: 0 }}>
                                                {recentReferences.slice(0, 5).map((ref, idx) => (
                                                    <React.Fragment key={idx}>
                                                        <ListItem
                                                            sx={{
                                                                px: 0,
                                                                py: 1.5,
                                                                borderRadius: 2,
                                                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                                                            }}
                                                        >
                                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                                <BusinessIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={
                                                                    <Typography variant="body2" fontWeight={600}>
                                                                        {ref.name}
                                                                    </Typography>
                                                                }
                                                                secondary={
                                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                                                        {ref.company || 'Reference'} • {ref.progress}% Complete
                                                                    </Typography>
                                                                }
                                                            />
                                                            <Chip
                                                                icon={getStatusIcon(ref.status)}
                                                                label={getStatusText(ref.status)}
                                                                color={getStatusColor(ref.status)}
                                                                size="small"
                                                                sx={{ fontSize: '0.7rem', height: 24 }}
                                                            />
                                                        </ListItem>
                                                        {idx < recentReferences.slice(0, 5).length - 1 && <Divider />}
                                                    </React.Fragment>
                                                ))}
                                            </List>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">No recent references</Typography>
                                        )}
                                    </Card>
                                </Grid>
                            )}
                        </Grid>
                    </Container>
                </Box>
            </Box>
        </Box>
    )
}

export default Overview