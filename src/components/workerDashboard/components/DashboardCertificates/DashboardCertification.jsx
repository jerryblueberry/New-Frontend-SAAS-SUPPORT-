import React, { useMemo, useCallback, useRef, useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Button,
    Grid,
    Container,
    Paper,
    Avatar,
    Divider,
    Stack,
    IconButton,
    Fade,
    Zoom,
    useTheme,
    useMediaQuery,
    Tooltip,
    Tab,
    Tabs,
    ButtonGroup,
    alpha,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Collapse,
    CardActionArea
} from '@mui/material';
import DocumentPreview from '../../../workerForm/Modals/DocumentPreview';
import {
    WorkspacePremium,
    CalendarToday,
    Event,
    Assignment,
    Add,
    FileDownload,
    Verified,
    Schedule,
    Cancel,
    OpenInNew,
    Edit,
    School,
    BusinessCenter,
    NavigateNext,
    Visibility,
    ExpandMore,
    ExpandLess,
    PictureAsPdf,
    Description,
    Image
} from '@mui/icons-material';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import { useNavigate } from 'react-router-dom';
import { deleteOtherCertificationById } from '../../../../api/axios';
import { message, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
// removed unused import `color` from framer-motion
import CertificationCardDashboard from './CertificationCardDashboard';
import CertificationEditorDrawer from '../../../certifications/CertificationEditorDrawer';
import OtherCertificationEditorDrawer from '../../../certifications/OtherCertificationEditorDrawer';
import { useQueryClient } from '@tanstack/react-query';
import { onboardingApi } from '../../../../stores/useOnboardingStore';

const DashboardCertification = ({ onboardingData }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const lastPrefetchAtRef = useRef(0);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [editorOpen, setEditorOpen] = useState(false);
    const [editorTypeId, setEditorTypeId] = useState(null);
    const [otherEditorOpen, setOtherEditorOpen] = useState(false);
    const [otherEditorId, setOtherEditorId] = useState(null);

    const certifications = useMemo(
        () => onboardingData?.data?.profile?.certifications || [],
        [onboardingData]
    );
    const otherCertifications = useMemo(
        () => onboardingData?.data?.profile?.otherCertifications || [],
        [onboardingData]
    );

    // Derived datasets for tabs
    const today = useMemo(() => new Date(), []);
    const isExpired = useCallback((item) => {
        const status = (item?.verificationStatus || '').toLowerCase();
        // If backend already marks it expired, treat as expired even without expiryDate
        if (status === 'expired') return true;
        if (!item?.expiryDate) return false;
        try {
            return new Date(item.expiryDate) < today;
        } catch (_) {
            return false;
        }
    }, [today]);
    const isRejected = useCallback((item) => (item?.verificationStatus || '').toLowerCase() === 'rejected', []);

    const expiredCertifications = useMemo(
        () => [...certifications, ...otherCertifications].filter(isExpired),
        [certifications, otherCertifications, isExpired]
    );
    const rejectedCertifications = useMemo(
        () => [...certifications, ...otherCertifications].filter(isRejected),
        [certifications, otherCertifications, isRejected]
    );
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'verified': return 'success';
            case 'pending': return 'warning';
            case 'expired': return 'error';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'verified': return <Verified fontSize="small" />;
            case 'pending': return <Schedule fontSize="small" />;
            case 'expired': return <Cancel fontSize="small" />;
            default: return <Schedule fontSize="small" />;
        }
    };

    // Frontend-computed status with expiry override
    const getComputedStatus = useCallback((cert) => {
        if (!cert) return 'pending';
        if (isExpired(cert)) return 'expired';
        const s = (cert?.verificationStatus || '').toLowerCase();
        return s || 'pending';
    }, [isExpired]);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }, []);

    const isExpiringSoon = useCallback((expiryDate) => {
        if (!expiryDate) return false;
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 90 && diffDays > 0;
    }, []);

    const prefetchOnboarding = useCallback(() => {
        const now = Date.now();
        // throttle: at most once every 2s
        if (now - lastPrefetchAtRef.current < 2000) return;

        // condition: skip if cache is warm (updated within last 2 minutes)
        const state = queryClient.getQueryState(['onboarding']);
        if (state?.dataUpdatedAt && now - state.dataUpdatedAt < 2 * 60 * 1000) {
            return;
        }

        lastPrefetchAtRef.current = now;
        try {
            queryClient.prefetchQuery({
                queryKey: ['onboarding'],
                queryFn: onboardingApi.fetchOnboardingProgress,
                staleTime: 5 * 60 * 1000
            });
        } catch (_) {}
    }, [queryClient]);

    // Compute missing fields for a certification using its type definition
    const computeMissingFields = useCallback((cert) => {
        if (!cert) return [];
        const missing = [];
        const type = cert.certificationType || {};
        const requiredFields = Array.isArray(type.requiredFields) ? type.requiredFields : [];
        // Required simple fields
        for (const field of requiredFields) {
            if (field === 'degree' || field === 'insuranceType') continue; // handled separately
            if (!cert[field]) missing.push(field);
        }
        // Education
        if (type.isEducation) {
            if (!Array.isArray(cert.degree) || cert.degree.length === 0) {
                missing.push('degree');
            }
        }
        // Insurance
        if (requiredFields.includes('insuranceType') && !cert.insuranceType) {
            missing.push('insuranceType');
        }
        // Documents
        if (type.documentRequired && (!Array.isArray(cert.documents) || cert.documents.length === 0)) {
            missing.push('documents');
        }
        return missing;
    }, []);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const TabPanel = ({ children, value, index }) => (
        <div hidden={value !== index} style={{ width: '100%' }}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );

    // Enhanced responsive breakpoints
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
    const isLargeDesktop = useMediaQuery(theme.breakpoints.up('xl'));

    // Document type icon helper
    const getDocumentIcon = (fileName) => {
        if (!fileName) return <Description />;
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf': return <PictureAsPdf />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif': return <Image />;
            default: return <Description />;
        }
    };

    // Enhanced mobile card component
    const MobileCertificationCard = ({ cert, index, type = 'professional', showRejectionDetails = false }) => {
        const [expanded, setExpanded] = useState(false);
        
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
                                    {(() => { const cs = getComputedStatus(cert); return (
                                        <Chip
                                            icon={getStatusIcon(cs)}
                                            label={cs.charAt(0).toUpperCase() + cs.slice(1)}
                                            color={getStatusColor(cs)}
                                            size="small"
                                            sx={{ fontSize: '0.7rem', height: '24px' }}
                                        />
                                    ); })()}
                                    {(() => { const m = computeMissingFields(cert); return m.length > 0 ? (
                                        <Tooltip title={`Missing: ${m.join(', ')}`}>
                                            <Chip label={`Missing ${m.length}`} color="error" size="small" variant="outlined" sx={{ height: '24px' }} />
                                        </Tooltip>
                                    ) : null; })()}
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
                                {/* Mobile edit/delete action bar */}
                                    {(function(){ const cs = getComputedStatus(cert); return (type === 'other' || ['rejected','expired','pending'].includes(cs)); })() && (
                                  <Tooltip title="Edit">
                                    <IconButton
                                      size="small"
                                          onMouseEnter={prefetchOnboarding}
                                      onClick={(e)=>{
                                        e.stopPropagation();
                                        if (type === 'professional') {
                                          const typeId = cert?.certificationType?._id || cert?.certificationType;
                                          if (typeId) { setEditorTypeId(typeId); setEditorOpen(true); }
                                        } else {
                                          const oid = cert?._id || cert?.id;
                                          if (oid) { setOtherEditorId(oid); setOtherEditorOpen(true); }
                                        }
                                      }}
                                      sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) } }}
                                    >
                                      <Edit fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {(() => { const cs = getComputedStatus(cert); return type === 'other' && cs !== 'verified'; })() && (
                                  <Tooltip title="Delete">
                                    <IconButton
                                      size="small"
                                      onClick={async (e)=>{
                                        e.stopPropagation();
                                        const oid = cert?._id || cert?.id;
                                        if (!oid) return;
                                        const confirmed = window.confirm('This will permanently delete the certification and its documents. Continue?');
                                        if (!confirmed) return;
                                        try {
                                          const hide = message.loading('Deleting certification...', 0);
                                          const res = await deleteOtherCertificationById(oid);
                                          hide();
                                          message.success(res?.data?.message || 'Certification deleted');
                                          const evt = typeof window.CustomEvent === 'function' ? new CustomEvent('onboarding:refresh') : (function(){ const ev = document.createEvent('Event'); ev.initEvent('onboarding:refresh', true, true); return ev; })();
                                          window.dispatchEvent(evt);
                                        } catch (err) {
                                          message.error(err?.response?.data?.message || 'Failed to delete certification');
                                        }
                                      }}
                                      sx={{ bgcolor: alpha(theme.palette.error.main, 0.08), color: theme.palette.error.main, '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) } }}
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
                        
                        {/* Certificate Details */}
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
                                                {getDocumentIcon(doc.fileName)}
                                                <Typography variant="body2" sx={{ flex: 1, fontSize: '0.8rem' }}>
                                                    {doc.fileName || `Document ${docIndex + 1}`}
                                                </Typography>
                                                <Tooltip title="Preview">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedDocument(doc);
                                                            setSelectedCertificate(cert);
                                                            setPreviewOpen(true);
                                                        }}
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

    // Desktop table component
    const DesktopCertificationTable = ({ certifications, type = 'professional', showRejectionDetails = false }) => {
        const [expandedRows, setExpandedRows] = useState({});
        
        const toggleRow = (certId) => {
            setExpandedRows(prev => ({
                ...prev,
                [certId]: !prev[certId]
            }));
        };

        return (
            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
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
                                            {(() => { const cs = getComputedStatus(cert); return (
                                                <Chip
                                                    icon={getStatusIcon(cs)}
                                                    label={cs.charAt(0).toUpperCase() + cs.slice(1)}
                                                    color={getStatusColor(cs)}
                                                    size="small"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ); })()}
                                            {(() => { const m = computeMissingFields(cert); return m.length > 0 ? (
                                                <Tooltip title={`Missing: ${m.join(', ')}`}>
                                                    <Chip label={`Missing ${m.length}`} color="error" size="small" variant="outlined" sx={{ ml: 1 }} />
                                                </Tooltip>
                                            ) : null; })()}
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
                                                {/* Edit button - only show for rejected or expired */}
                                                {(function(){ const cs = getComputedStatus(cert); return (type === 'other' || ['rejected','expired','pending'].includes(cs)); })() && (
                                                    <Tooltip title="Edit">
                                                        <IconButton 
                                                            size="small" 
                                                            color="primary"
                                                            onMouseEnter={prefetchOnboarding}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (type === 'professional') {
                                                                  const typeId = cert?.certificationType?._id || cert?.certificationType;
                                                                  if (typeId) { setEditorTypeId(typeId); setEditorOpen(true); }
                                                                } else {
                                                                  const oid = cert?._id || cert?.id;
                                                                  if (oid) { setOtherEditorId(oid); setOtherEditorOpen(true); }
                                                                }
                                                            }}
                                                        >
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {/* Delete for other certifications if not verified */}
                                                {(() => { const cs = getComputedStatus(cert); return type === 'other' && cs !== 'verified'; })() && (
                                                  <Tooltip title="Delete">
                                                    <IconButton
                                                      size="small"
                                                      color="error"
                                                      onClick={async (e)=>{
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
                                                              const evt = typeof window.CustomEvent === 'function'
                                                                ? new CustomEvent('onboarding:refresh')
                                                                : (function(){ const ev = document.createEvent('Event'); ev.initEvent('onboarding:refresh', true, true); return ev; })();
                                                              window.dispatchEvent(evt);
                                                            } catch (err) {
                                                              message.error(err?.response?.data?.message || 'Failed to delete certification');
                                                            }
                                                          }
                                                        });
                                                      }}
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
                                                    {/* Additional Details */}
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
                                                            <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(theme.palette.error.main, 0.05), border: `1px solid ${alpha(theme.palette.error.main, 0.15)}`, borderRadius: 2 }}>
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
                                                                                <Box sx={{
                                                                                    p: 1,
                                                                                    borderRadius: 1,
                                                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center'
                                                                                }}>
                                                                                    {getDocumentIcon(doc.fileName)}
                                                                                </Box>
                                                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                                    <Typography variant="body2" sx={{ 
                                                                                        fontWeight: 500,
                                                                                        overflow: 'hidden',
                                                                                        textOverflow: 'ellipsis',
                                                                                        whiteSpace: 'nowrap'
                                                                                    }}>
                                                                                        {doc.fileName || `Document ${docIndex + 1}`}
                                                                                    </Typography>
                                                                                    <Typography variant="caption" color="text.secondary">
                                                                                        Click to preview
                                                                                    </Typography>
                                                                                </Box>
                                                                                <Tooltip title="Preview Document">
                                                                                    <IconButton
                                                                                        size="small"
                                                                                        onClick={() => {
                                                                                            setSelectedDocument(doc);
                                                                                            setSelectedCertificate(cert);
                                                                                            setPreviewOpen(true);
                                                                                        }}
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

    const EmptyState = ({ type, onAdd }) => (
        <Fade in timeout={1000}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 4, md: 6 },
                    textAlign: 'center',
                    border: `2px dashed ${theme.palette.divider}`,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 100,
                        height: 100,
                        background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
                    }
                }}
            >
                <Avatar
                    sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        width: { xs: 60, md: 80 },
                        height: { xs: 60, md: 80 },
                        mx: 'auto',
                        mb: 3,
                        border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                >
                    {type === 'professional' ? (
                        <WorkspacePremium fontSize="large" color="primary" />
                    ) : (
                        <School fontSize="large" color="primary" />
                    )}
                </Avatar>

                <Typography
                    variant={isMobile ? "h6" : "h5"}
                    fontWeight="600"
                    color="text.primary"
                    sx={{ mb: 2 }}
                >
                    {type === 'professional' ? 'No Professional Certifications' : 'No Other Certifications'}
                </Typography>

                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4, maxWidth: '400px', mx: 'auto', lineHeight: 1.6 }}
                >
                    {type === 'professional'
                        ? 'Complete your onboarding to add professional certifications and enhance your profile.'
                        : 'Add additional certifications to showcase your diverse skills and qualifications.'
                    }
                </Typography>

                {onAdd && (
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<Add />}
                        onClick={onAdd}
                        sx={{
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: theme.shadows[4],
                            '&:hover': {
                                boxShadow: theme.shadows[8],
                                transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                    >
                        Complete Onboarding
                    </Button>
                )}
            </Paper>
        </Fade>
    );

  //  FOr Formating the Degree
  function formatDegree(degree) {
    // Ensure it's always a string before processing
    if (typeof degree !== "string") {
      return {
        isOther: false,
        value: "",
      };
    }
  
    if (degree.startsWith("Other|")) {
      return {
        isOther: true,
        value: degree.split("|")[1] || "", // take part after "|"
      };
    }
  
    return {
      isOther: false,
      value: degree,
    };
  }
  

    const CertificationCard = ({ cert, index, type = 'professional' }) => (
        <Grid item xs={12} lg={6} xl={4} key={cert.id || cert._id || index}>
            <Zoom in timeout={600 + index * 150}>
                <Card
                    elevation={0}
                    sx={{
                        
                        height: '100%',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 3,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        background: theme.palette.background.paper,
                        '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: theme.shadows[12],
                            borderColor: theme.palette.primary.main,
                            '& .edit-button': {
                                opacity: 1,
                                transform: 'translateY(0)',
                            }
                        },
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: type === 'professional'
                                ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                                : `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.success.main})`,
                        }
                    }}
                >
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', }}>
                        {/* Certificate Header */}
                        <Box sx={{ mb: 3, position: 'relative', }}>
                            <Stack direction="row" sx={{
                                display:'flex',
                                flexDirection:'row',
                                justifyContent:'space-between',
                                alignItems:'flex-start',
                            }}  spacing={isMobile?18:2}>
                                <Typography
                                    variant="h6"
                                    component="h3"
                                    fontWeight="600"
                                    sx={{
                                        flex: 1,
                                        lineHeight: 1.3,
                                        color: theme.palette.text.primary,
                                        pr: 1,
                                        fontSize:{xs:'1rem'},
                                        
                                    }}
                                >
                                    {type === 'professional' ? cert.certificationType?.name : cert.certificationTitle}
                                </Typography>

                                <Stack direction="row" spacing={1} alignItems="center">
                                    {(() => { const cs = getComputedStatus(cert); return (
                                        <Chip
                                            icon={getStatusIcon(cs)}
                                            label={cs.charAt(0).toUpperCase() + cs.slice(1)}
                                            color={getStatusColor(cs)}
                                            size="small"
                                            sx={{
                                                fontWeight: 600,
                                                '& .MuiChip-icon': { fontSize: '16px' }
                                            }}
                                        />
                                    ); })()}

                                    {/* Edit button - only show for rejected, expired, or pending (computed) */}
                                    {(() => { const cs = getComputedStatus(cert); return ['rejected','expired','pending'].includes(cs); })() && (
                                        <IconButton
                                            size="small"
                                            className="edit-button"
                                            onMouseEnter={prefetchOnboarding}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const typeId = cert?.certificationType?._id || cert?.certificationType;
                                                if (typeId) {
                                                  setEditorTypeId(typeId);
                                                  setEditorOpen(true);
                                                }
                                            }}
                                            sx={{
                                                opacity: 0,
                                                transform: 'translateY(-10px)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                color: theme.palette.primary.main,
                                                '&:hover': {
                                                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                                                }
                                            }}
                                        >
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    )}
                                </Stack>
                                
                                {/* Rejection Reason Display */}
                                {cert.verificationStatus?.toLowerCase() === 'rejected' && cert.rejectionReason && (
                                    <Box sx={{ 
                                        mt: 2, 
                                        p: { xs: 2, sm: 2.5 }, 
                                        bgcolor: alpha(theme.palette.error.main, 0.08), 
                                        borderRadius: 3, 
                                        border: `1px solid ${alpha(theme.palette.error.main, 0.15)}`,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '4px',
                                            height: '100%',
                                            bgcolor: theme.palette.error.main,
                                        }
                                    }}>
                                        <Stack spacing={2}>
                                            {/* Header */}
                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                <Box sx={{
                                                    p: 0.5,
                                                    borderRadius: '50%',
                                                    bgcolor: alpha(theme.palette.error.main, 0.2),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Cancel fontSize="small" color="error" />
                                                </Box>
                                                <Typography variant="subtitle2" fontWeight="700" color="error.main">
                                                    Rejection Details
                                                </Typography>
                                            </Stack>

                                            {/* Rejection Reason */}
                                            <Box sx={{ 
                                                p: { xs: 1.5, sm: 2 }, 
                                                bgcolor: alpha(theme.palette.error.main, 0.05),
                                                borderRadius: 2,
                                                border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
                                            }}>
                                                <Typography variant="caption" fontWeight="600" color="error.main" sx={{ 
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    fontSize: '0.7rem'
                                                }}>
                                                    Reason for Rejection
                                                </Typography>
                                                <Typography 
                                                    variant="body2" 
                                                    color="error.main" 
                                                    sx={{ 
                                                        fontWeight: 500,
                                                        mt: 0.5,
                                                        lineHeight: 1.5,
                                                        fontSize: { xs: '0.85rem', sm: '0.9rem' }
                                                    }}
                                                >
                                                    {cert.rejectionReason}
                                                </Typography>
                                            </Box>

                                            {/* Rejection Date */}
                                            {cert.verificationDate && (
                                                <Stack direction="row" alignItems="center" spacing={1} sx={{ 
                                                    p: 1, 
                                                    bgcolor: alpha(theme.palette.grey[500], 0.08),
                                                    borderRadius: 2,
                                                    border: `1px solid ${alpha(theme.palette.grey[400], 0.2)}`
                                                }}>
                                                    <CalendarToday fontSize="small" color="action" />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ 
                                                            fontWeight: 600,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            fontSize: '0.7rem'
                                                        }}>
                                                            Rejected On
                                                        </Typography>
                                                        <Typography variant="body2" color="text.primary" sx={{ 
                                                            fontWeight: 500,
                                                            fontSize: { xs: '0.8rem', sm: '0.85rem' }
                                                        }}>
                                                            {formatDate(cert.verificationDate)}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            )}
                                        </Stack>
                                    </Box>
                                )}
                            </Stack>

                            {cert.number && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: 1.5, fontFamily: 'monospace', fontSize: '0.875rem' }}
                                >
                                    Cert #{cert.number}
                                </Typography>
                            )}
                            {/* For Degree */}

                            {cert?.degree?.length > 0 &&
                                cert.degree.map((degree, index) => {
                                    const { isOther, value } = formatDegree(degree);
                                    return (
                                        <Stack
                                            key={index}
                                            direction="row"
                                            alignItems="center"
                                            spacing={1}
                                            sx={{ mb: 1,mt:1 }}
                                        >
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                Degree: {value}
                                            </Typography>

                                            {isOther && (
                                                <Chip
                                                    label="Other"
                                                    color="secondary"
                                                    size="small"
                                                    sx={{ fontWeight: "bold" }}
                                                />
                                            )}
                                        </Stack>
                                    );
                                })
                            }


                        </Box>

                        {/* Certificate Details - Only for professional certs */}
                        {type === 'professional' && cert.issuedDate && (
                            <Box sx={{ mb: 3, flex: 1 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={cert.expiryDate ? 6 : 12}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                // p: '5px 5px',
                                                p:{xs:"5px 5px", md:'10px 10px'},
                                                bgcolor: alpha(theme.palette.primary.main, 0.5),
                                                borderRadius: 2,
                                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                            }}
                                        >
                                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>

                                                <CalendarToday fontSize="small" color="primary" sx={{
                                                    fontSize:{xs:'13px',md:'15px'}
                                                }}/>
                                                <Typography sx={{
                                                    fontSize:{xs:"0.68rem"},
                                                    fontWeight:600
                                                }} variant="caption"  color="text.secondary">
                                                    ISSUED
                                                </Typography>
                                            </Stack>
                                            <Typography variant="body2" fontWeight="500">
                                                {formatDate(cert.issuedDate)}
                                            </Typography>
                                        </Paper>

                                    </Grid>

                                    {cert.expiryDate && (
                                        <Grid item xs={6}>
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p:{xs:"5px 5px", md:'10px 10px'},
                                                    bgcolor: isExpiringSoon(cert.expiryDate)
                                                        ? alpha(theme.palette.warning.main, 0.1)
                                                        : alpha(theme.palette.info.main, 0.05),
                                                    borderRadius: 2,
                                                    border: `1px solid ${isExpiringSoon(cert.expiryDate)
                                                        ? alpha(theme.palette.warning.main, 0.3)
                                                        : alpha(theme.palette.info.main, 0.1)
                                                        }`,
                                                }}
                                            >
                                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                                    <Event sx={{
                                                    fontSize:{xs:'13px',md:'16px'}
                                                }} fontSize="small" color={isExpiringSoon(cert.expiryDate) ? "warning" : "info"} />
                                                    <Typography sx={{
                                                    fontSize:{xs:"0.68rem"},
                                                    fontWeight:600
                                                }} variant="caption"  color="text.secondary">
                                                        EXPIRES
                                                    </Typography>
                                                    {isExpiringSoon(cert.expiryDate) && (
                                                    <Chip
                                                        label="Expiring Soon"
                                                        size="small"
                                                        color="warning"
                                                        variant="outlined"
                                                        sx={{ mt: 1, fontSize: '10px', height: '20px' }}
                                                    />
                                                )}
                                                </Stack>
                                                <Typography variant="body2" fontWeight="500">
                                                    {formatDate(cert.expiryDate)}
                                                </Typography>
                                                
                                            </Paper>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        )}

                        {/* Documents Section */}
                        {cert.documents && cert.documents.length > 0 && (
                            <Box sx={{ mt: 'auto' }}>
                                <Divider sx={{ mb: 2 }} />
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                    <Assignment fontSize="small" color="primary" />
                                    <Typography variant="subtitle2" fontWeight="600">
                                        Documents ({cert.documents.length})
                                    </Typography>
                                </Stack>
                                <Stack spacing={1}>
                                    {cert.documents.slice(0, 2).map((doc, docIndex) => (
                                        <Box
                                            key={doc.id || doc._id || docIndex}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                p: 1.5,
                                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                borderRadius: 2,
                                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                    borderColor: alpha(theme.palette.primary.main, 0.2),
                                                }
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    flex: 1,
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
                                                    color: theme.palette.text.primary
                                                }}
                                            >
                                                {doc.fileName || `Document ${docIndex + 1}`}
                                            </Typography>
                                            <Tooltip title="View Document">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedDocument(doc);
                                                        setSelectedCertificate(cert);
                                                        setPreviewOpen(true);
                                                    }}
                                                    sx={{
                                                        color: theme.palette.primary.main,
                                                        '&:hover': {
                                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                        }
                                                    }}
                                                >
                                                    <OpenInNew fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    ))}
                                    {cert.documents.length > 2 && (
                                        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', pt: 1 }}>
                                            +{cert.documents.length - 2} more documents
                                        </Typography>
                                    )}
                                </Stack>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Zoom>
        </Grid>
    );

  



    return (
        <Container
        maxWidth="xl"
        sx={{
          py: { xs: 0, sm: 1, md: 0 }, // no padding on xs
        }}
      >
        <Fade in timeout={800}>
          <Box sx={{ mt: { xs: 2, md: 4 } }}>
            {/* Header Section */}
            <Box
              sx={{
                width: '100%',
                background: `linear-gradient(135deg, ${alpha(
                  theme.palette.primary.main,
                  0.08
                )} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
                borderRadius: 4,
                p: { xs: 2, sm: 3, md: 4 },
                mb: { xs: 2, md: 4 },
                position: 'relative',
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                boxShadow: theme.shadows[1],
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: { xs: '120px', md: '200px' },
                  height: { xs: '120px', md: '200px' },
                  background: `radial-gradient(circle, ${alpha(
                    theme.palette.primary.main,
                    0.1
                  )} 0%, transparent 70%)`,
                  transform: 'translate(50%, -50%)',
                },
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={{ xs: 2, md: 3 }}
                sx={{ position: 'relative', zIndex: 1 }}
              >
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    width: { xs: 48, sm: 56, md: 72 },
                    height: { xs: 48, sm: 56, md: 72 },
                    boxShadow: theme.shadows[6],
                  }}
                >
                  <WorkspacePremium fontSize="large" />
                </Avatar>
      
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h4"
                    component="h1"
                    fontWeight="bold"
                    color="primary"
                    sx={{
                      mb: 1,
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
                    }}
                  >
                    My Certifications
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' },
                    }}
                  >
                    Manage and track your professional certifications and credentials
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    flexWrap="wrap"
                    sx={{ rowGap: 1 }}
                  >
                    <Chip
                      icon={<BusinessCenter fontSize="small" />}
                      label={`${certifications.length} Professional`}
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{ fontSize: { xs: '0.7rem', md: '0.85rem' } }}
                    />
                    <Chip
                      icon={<School fontSize="small" />}
                      label={`${otherCertifications.length} Additional`}
                      color="secondary"
                      variant="outlined"
                      size="small"
                      sx={{ fontSize: { xs: '0.7rem', md: '0.85rem' } }}
                    />
                  </Stack>
                </Box>
              </Stack>
            </Box>
      
            {/* Navigation Tabs */}
            <Paper
              elevation={0}
              sx={{
                mb: { xs: 2, md: 4 },
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    py: { xs: 1.2, sm: 1.5, md: 2 },
                    minHeight: 'auto',
                  },
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                  },
                }}
              >
                <Tab
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <BusinessCenter fontSize="small" />
                      <Typography sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
                        Certifications
                      </Typography>
                      {certifications.length > 0 && (
                        <Chip
                          label={certifications.length}
                          size="small"
                          color="primary"
                          sx={{ height: 20, fontSize: '0.75rem' }}
                        />
                      )}
                    </Stack>
                  }
                />
                <Tab
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <School fontSize="small" />
                      <Typography sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
                        Other Certifications
                      </Typography>
                      {otherCertifications.length > 0 && (
                        <Chip
                          label={otherCertifications.length}
                          size="small"
                          color="secondary"
                          sx={{ height: 20, fontSize: '0.75rem' }}
                        />
                      )}
                    </Stack>
                  }
                />
                <Tab
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Event fontSize="small" />
                      <Typography sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
                        Expired Certifications
                      </Typography>
                      {expiredCertifications.length > 0 && (
                        <Chip
                          label={expiredCertifications.length}
                          size="small"
                          color="warning"
                          sx={{ height: 20, fontSize: '0.75rem' }}
                        />
                      )}
                    </Stack>
                  }
                />
                      <Tab
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Cancel fontSize="small" />
                      <Typography sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
                        Rejected Certifications
                      </Typography>
                      {rejectedCertifications.length > 0 && (
                        <Chip
                          label={rejectedCertifications.length}
                          size="small"
                          color="error"
                          sx={{ height: 20, fontSize: '0.75rem' }}
                        />
                      )}
                    </Stack>
                  }
                />
              </Tabs>
              
            </Paper>
      
            {/* Tab Content */}
            <TabPanel value={activeTab} index={0}>
              {certifications.length > 0 ? (
                isDesktop ? (
                  <DesktopCertificationTable certifications={certifications} type="professional" />
                ) : (
                  <Box>
                    {certifications.map((cert, index) => (
                      <MobileCertificationCard
                        key={cert.id || cert._id || index}
                        cert={cert}
                        index={index}
                        type="professional"
                      />
                    ))}
                  </Box>
                )
              ) : (
                <EmptyState type="professional" onAdd={() => navigate('/onboarding')} />
              )}
            </TabPanel>
      
            <TabPanel value={activeTab} index={1}>
              {otherCertifications.length > 0 ? (
                isDesktop ? (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                      <Button variant="contained" size="small" startIcon={<Add />} onClick={() => { setOtherEditorId(null); setOtherEditorOpen(true); }}>
                        Add New Certification
                      </Button>
                    </Box>
                    <DesktopCertificationTable certifications={otherCertifications} type="other" />
                  </>
                ) : (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                      <Button variant="contained" size="small" startIcon={<Add />} onClick={() => { setOtherEditorId(null); setOtherEditorOpen(true); }}>
                        Add New Certification
                      </Button>
                    </Box>
                    {otherCertifications.map((cert, index) => (
                      <MobileCertificationCard
                        key={cert.id || cert._id || index}
                        cert={cert}
                        index={index}
                        type="other"
                      />
                    ))}
                  </Box>
                )
              ) : (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button variant="contained" size="small" startIcon={<Add />} onClick={() => { setOtherEditorId(null); setOtherEditorOpen(true); }}>
                      Add New Certification
                    </Button>
                  </Box>
                  <EmptyState type="other" />
                </>
              )}
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
              {expiredCertifications.length > 0 ? (
                isDesktop ? (
                  <DesktopCertificationTable 
                    certifications={expiredCertifications} 
                    type={expiredCertifications[0]?.certificationType ? 'professional' : 'other'} 
                  />
                ) : (
                  <Box>
                    {expiredCertifications.map((cert, index) => (
                      <MobileCertificationCard
                        key={cert.id || cert._id || `exp-${index}`}
                        cert={cert}
                        index={index}
                        type={cert?.certificationType ? 'professional' : 'other'}
                      />
                    ))}
                  </Box>
                )
              ) : (
                <EmptyState type="professional" />
              )}
            </TabPanel>
            <TabPanel value={activeTab} index={3}>
              {rejectedCertifications.length > 0 ? (
                isDesktop ? (
                  <DesktopCertificationTable 
                    certifications={rejectedCertifications} 
                    type={rejectedCertifications[0]?.certificationType ? 'professional' : 'other'}
                    showRejectionDetails={true}
                  />
                ) : (
                  <Box>
                    {rejectedCertifications.map((cert, index) => (
                      <MobileCertificationCard
                        key={cert.id || cert._id || `rej-${index}`}
                        cert={cert}
                        index={index}
                        type={cert?.certificationType ? 'professional' : 'other'}
                        showRejectionDetails={true}
                      />
                    ))}
                  </Box>
                )
              ) : (
                <EmptyState type="professional" />
              )}
            </TabPanel>
          </Box>
        </Fade>
      
        {/* Document Preview Modal */}
        {previewOpen && selectedDocument && (
          <DocumentPreview
            document={selectedDocument}
            onClose={() => {
              setPreviewOpen(false);
              setSelectedDocument(null);
              setSelectedCertificate(null);
            }}
            certificateData={selectedCertificate}
          />
        )}

        {/* Certification Editor Drawer */}
        <CertificationEditorDrawer
          open={editorOpen}
          typeId={editorTypeId}
          onClose={() => setEditorOpen(false)}
          onSaved={() => {
            // refetch onboarding data page if available
            try {
              const evt = typeof window.CustomEvent === 'function'
                ? new CustomEvent('onboarding:refresh')
                : (function(){ const e = document.createEvent('Event'); e.initEvent('onboarding:refresh', true, true); return e; })();
              window.dispatchEvent(evt);
            } catch (_e) {
              // swallow
            }
          }}
        />

        {/* Other Certification Editor Drawer */}
        <OtherCertificationEditorDrawer
          open={otherEditorOpen}
          id={otherEditorId}
          mode={otherEditorId ? 'edit' : 'create'}
          onClose={() => setOtherEditorOpen(false)}
          onSaved={(saved) => {
            // Optimistically update onboardingData cert list if available
            try {
              const evt = typeof window.CustomEvent === 'function'
                ? new CustomEvent('onboarding:refresh')
                : (function(){ const e = document.createEvent('Event'); e.initEvent('onboarding:refresh', true, true); return e; })();
              window.dispatchEvent(evt);
            } catch (_) {}
          }}
        />
      </Container>
      
    );
};

export default DashboardCertification;