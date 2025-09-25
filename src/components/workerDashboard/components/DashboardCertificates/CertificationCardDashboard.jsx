import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Grid,
    Typography,
    Box,
    Stack,
    Chip,
    IconButton,
    Paper,
    Divider,
    Tooltip,
    Zoom,
    useTheme,
    useMediaQuery,
    alpha
} from '@mui/material';
import {
    Edit,
    CalendarToday,
    Event,
    Assignment,
    OpenInNew,
    CheckCircle,
    Pending,
    Cancel,
    Warning
} from '@mui/icons-material';
import DocumentPreview from '../../../workerForm/Modals/DocumentPreview';

const CertificationCardDashboard = ({ cert, index, type = 'professional', showRejectionDetails = false, showExpiredDetails = false }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const isLaptop = useMediaQuery(theme.breakpoints.down('lg'));
    
    // Document preview state
    const [previewOpen, setPreviewOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);

    // Helper functions
    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'verified': return <CheckCircle />;
            case 'pending': return <Pending />;
            case 'expired': return <Cancel />;
            case 'rejected': return <Cancel />;
            default: return <Warning />;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'verified': return 'success';
            case 'pending': return 'warning';
            case 'expired': return 'error';
            case 'rejected': return 'error';
            default: return 'default';
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const isExpiringSoon = (expiryDate) => {
        const now = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays > 0;
    };

    const formatDegree = (degree) => {
        return {
            isOther: degree?.type === 'other',
            value: degree?.name || degree?.value || degree
        };
    };

    // Responsive spacing configuration
    const spacing = {
        card: isMobile ? 2 : isTablet ? 2.5 : 3,
        content: isMobile ? 1.5 : 2,
        section: isMobile ? 2 : 2.5,
        small: isMobile ? 0.75 : 1,
        medium: isMobile ? 1.25 : 1.5
    };

    // Responsive typography configuration
    const typography = {
        title: {
            fontSize: isMobile ? '0.95rem' : isTablet ? '1.05rem' : '1.1rem',
            lineHeight: isMobile ? 1.2 : 1.3
        },
        body: {
            fontSize: isMobile ? '0.8rem' : '0.875rem'
        },
        caption: {
            fontSize: isMobile ? '0.65rem' : '0.7rem'
        },
        small: {
            fontSize: isMobile ? '0.75rem' : '0.8rem'
        }
    };

    const isExpiredByDate = !!cert?.expiryDate && new Date(cert.expiryDate) < new Date();

    return (
        <>
            <Grid sx={{

            }} item xs={12} sm={6} md={6} lg={4} xl={3} key={cert.id || cert._id || index}>
            <Zoom in timeout={600 + index * 100}>
                <Card
                    elevation={0}
                    sx={{
                        minHeight: 350,
                        height: '100%',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: isMobile ? 2 : 3,
                        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        background: theme.palette.background.paper,
                        cursor: 'pointer',
                        '&:hover': {
                            transform: isMobile ? 'translateY(-2px)' : 'translateY(-6px)',
                            boxShadow: isMobile ? theme.shadows[8] : theme.shadows[16],
                            borderColor: theme.palette.primary.main,
                            '& .edit-button': {
                                opacity: 1,
                                transform: 'translateY(0) scale(1)',
                            },
                            '& .status-gradient': {
                                background: type === 'professional'
                                    ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                                    : `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.success.main})`,
                            }
                        },
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: isMobile ? '3px' : '4px',
                            background: type === 'professional'
                                ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                                : `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.success.main})`,
                            className: 'status-gradient',
                            transition: 'all 0.3s ease',
                        }
                    }}
                >
                    <CardContent
                        sx={{
                            p: spacing.card,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            '&:last-child': {
                                paddingBottom: spacing.card
                            }
                        }}
                    >
                        {/* Header Section */}
                        <Box sx={{ mb: spacing.section }}>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="flex-start"
                                spacing={spacing.medium}
                                sx={{ mb: spacing.small }}
                            >
                                <Typography
                                    variant="h6"
                                    component="h3"
                                    sx={{
                                        flex: 1,
                                        fontWeight: 600,
                                        color: theme.palette.text.primary,
                                        ...typography.title,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        minHeight: isMobile ? '2.4rem' : '2.6rem'
                                    }}
                                >
                                    {type === 'professional' ? cert.certificationType?.name : cert.certificationTitle}
                                </Typography>

                                <Stack direction="row" spacing={spacing.small} alignItems="flex-start">
                                    <Chip
                                        icon={getStatusIcon(cert.verificationStatus)}
                                        label={cert.verificationStatus || 'Pending'}
                                        color={getStatusColor(cert.verificationStatus)}
                                        size={isMobile ? 'small' : 'medium'}
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: typography.caption.fontSize,
                                            height: isMobile ? '24px' : '28px',
                                            '& .MuiChip-icon': {
                                                fontSize: isMobile ? '14px' : '16px'
                                            },
                                            '& .MuiChip-label': {
                                                px: isMobile ? 1 : 1.5
                                            }
                                        }}
                                    />

                                    <IconButton
                                        size="small"
                                        className="edit-button"
                                        sx={{
                                            opacity: 0,
                                            transform: 'translateY(-8px) scale(0.8)',
                                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: theme.palette.primary.main,
                                            width: isMobile ? '28px' : '32px',
                                            height: isMobile ? '28px' : '32px',
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                                                transform: 'translateY(0) scale(1.05)',
                                            }
                                        }}
                                    >
                                        <Edit sx={{ fontSize: isMobile ? '16px' : '18px' }} />
                                    </IconButton>
                                </Stack>
                            </Stack>

                            {/* Certificate Number */}
                            {cert.number && (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        fontFamily: 'monospace',
                                        fontSize: typography.small.fontSize,
                                        mb: spacing.small,
                                        fontWeight: 500
                                    }}
                                >
                                    #{cert.number}
                                </Typography>
                            )}
                               {/*  NDIS WORKER  Screening Number  */}
                               {cert.workerScreeningId && (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        fontFamily: 'monospace',
                                        fontSize: typography.small.fontSize,
                                        mb: spacing.small,
                                        fontWeight: 500
                                    }}
                                >
                                    Worker Screening Id:{cert.workerScreeningId}
                                </Typography>
                            )}

                            {/* FOr the Subclass */}
                            {cert.subclass && (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        fontFamily: 'monospace',
                                        fontSize: typography.small.fontSize,
                                        mb: spacing.small,
                                        fontWeight: 500
                                    }}
                                >
                                    Sub Class:{cert.subclass}
                                </Typography>
                            )}

                            {/*  Driving License Number  */}
                            {cert.licenseNo && (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        fontFamily: 'monospace',
                                        fontSize: typography.small.fontSize,
                                        mb: spacing.small,
                                        fontWeight: 500
                                    }}
                                >
                                    License No : {cert.licenseNo}
                                </Typography>
                            )}

                            {/*  Driving License Number  */}
                            {cert.country && (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        fontFamily: 'monospace',
                                        fontSize: typography.small.fontSize,
                                        mb: spacing.small,
                                        fontWeight: 500
                                    }}
                                >
                                    Country:{cert.country}
                                </Typography>
                            )}

                            {/* Degree Information */}
                            {cert?.degree?.length > 0 && (
                                <Box sx={{ mt: spacing.content }}>
                                    {cert.degree.slice(0, isMobile ? 1 : 2).map((degree, idx) => {
                                        const { isOther, value } = formatDegree(degree);
                                        return (
                                            <Stack
                                                key={idx}
                                                direction="row"
                                                alignItems="center"
                                                spacing={spacing.small}
                                                sx={{
                                                    mb: idx < cert.degree.length - 1 ? spacing.small : 0,
                                                    flexWrap: 'wrap'
                                                }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 500,
                                                        fontSize: typography.small.fontSize,
                                                        color: theme.palette.text.secondary
                                                    }}
                                                >
                                                    Degree:
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        fontSize: typography.small.fontSize
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
                                                            height: '20px',
                                                            fontSize: '10px',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                )}
                                            </Stack>
                                        );
                                    })}
                                    {cert.degree.length > (isMobile ? 1 : 2) && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: theme.palette.text.secondary,
                                                fontSize: typography.caption.fontSize,
                                                fontStyle: 'italic'
                                            }}
                                        >
                                            +{cert.degree.length - (isMobile ? 1 : 2)} more
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </Box>

                        {/* Rejection Details - only in Rejected tab */}
                        {showRejectionDetails && cert.verificationStatus?.toLowerCase() === 'rejected' && cert.rejectionReason && (
                            <Box
                                sx={{
                                    mb: spacing.section,
                                    p: isMobile ? 1.5 : 2,
                                    bgcolor: alpha(theme.palette.error.main, 0.06),
                                    border: `1px solid ${alpha(theme.palette.error.main, 0.15)}`,
                                    borderRadius: isMobile ? 1.5 : 2,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: '3px',
                                        bgcolor: theme.palette.error.main
                                    }
                                }}
                            >
                                <Stack spacing={isMobile ? 1 : 1.25}>
                                    <Stack direction="row" alignItems="center" spacing={spacing.small}>
                                        <Box sx={{
                                            p: 0.5,
                                            borderRadius: '50%',
                                            bgcolor: alpha(theme.palette.error.main, 0.18),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Cancel sx={{ fontSize: isMobile ? '14px' : '16px' }} color="error" />
                                        </Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'error.main', fontSize: typography.small.fontSize }}>
                                            Rejection Details
                                        </Typography>
                                    </Stack>

                                    <Box sx={{
                                        p: isMobile ? 1 : 1.25,
                                        bgcolor: alpha(theme.palette.error.main, 0.04),
                                        borderRadius: 1,
                                        border: `1px solid ${alpha(theme.palette.error.main, 0.12)}`
                                    }}>
                                        <Typography variant="caption" sx={{
                                            color: 'error.main',
                                            fontWeight: 700,
                                            letterSpacing: '0.4px',
                                            textTransform: 'uppercase',
                                            fontSize: typography.caption.fontSize
                                        }}>
                                            Reason for Rejection
                                        </Typography>
                                        <Typography variant="body2" sx={{
                                            color: 'error.main',
                                            fontWeight: 500,
                                            mt: 0.5,
                                            lineHeight: 1.5,
                                            fontSize: typography.body.fontSize
                                        }}>
                                            {cert.rejectionReason}
                                        </Typography>
                                    </Box>

                                    {cert.verificationDate && (
                                        <Stack direction="row" alignItems="center" spacing={spacing.small} sx={{
                                            p: isMobile ? 0.75 : 1,
                                            bgcolor: alpha(theme.palette.grey[500], 0.06),
                                            borderRadius: 1,
                                            border: `1px solid ${alpha(theme.palette.grey[400], 0.2)}`
                                        }}>
                                            <CalendarToday sx={{ fontSize: isMobile ? '14px' : '16px', color: theme.palette.text.secondary }} />
                                            <Box>
                                                <Typography variant="caption" sx={{
                                                    color: theme.palette.text.secondary,
                                                    fontWeight: 700,
                                                    letterSpacing: '0.4px',
                                                    textTransform: 'uppercase',
                                                    fontSize: typography.caption.fontSize
                                                }}>
                                                    Rejected On
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: typography.small.fontSize }}>
                                                    {formatDate(cert.verificationDate)}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    )}
                                </Stack>
                            </Box>
                        )}

                        {/* Expired Details - only in Expired tab */}
                        {showExpiredDetails && (cert.verificationStatus?.toLowerCase() === 'expired' || isExpiredByDate) && (
                            <Box
                                sx={{
                                    mb: spacing.section,
                                    p: isMobile ? 1.5 : 2,
                                    bgcolor: alpha(theme.palette.warning.main, 0.06),
                                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                                    borderRadius: isMobile ? 1.5 : 2,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: '3px',
                                        bgcolor: theme.palette.warning.main
                                    }
                                }}
                            >
                                <Stack spacing={isMobile ? 1 : 1.25}>
                                    <Stack direction="row" alignItems="center" spacing={spacing.small}>
                                        <Box sx={{
                                            p: 0.5,
                                            borderRadius: '50%',
                                            bgcolor: alpha(theme.palette.warning.main, 0.18),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Cancel sx={{ fontSize: isMobile ? '14px' : '16px' }} color="warning" />
                                        </Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'warning.main', fontSize: typography.small.fontSize }}>
                                            Expired Details
                                        </Typography>
                                    </Stack>

                                    {cert.expiryDate && (
                                        <Box sx={{
                                            p: isMobile ? 1 : 1.25,
                                            bgcolor: alpha(theme.palette.warning.main, 0.04),
                                            borderRadius: 1,
                                            border: `1px solid ${alpha(theme.palette.warning.main, 0.12)}`
                                        }}>
                                            <Stack direction="row" alignItems="center" spacing={spacing.small} sx={{ mb: spacing.small }}>
                                                <Event sx={{ fontSize: isMobile ? '14px' : '16px', color: theme.palette.warning.main }} />
                                                <Typography variant="caption" sx={{
                                                    color: theme.palette.text.secondary,
                                                    fontWeight: 700,
                                                    letterSpacing: '0.4px',
                                                    textTransform: 'uppercase',
                                                    fontSize: typography.caption.fontSize
                                                }}>
                                                    Expired On
                                                </Typography>
                                            </Stack>
                                            <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 600, fontSize: typography.small.fontSize }}>
                                                {formatDate(cert.expiryDate)}
                                            </Typography>
                                        </Box>
                                    )}

                                    {cert.verificationDate && (
                                        <Stack direction="row" alignItems="center" spacing={spacing.small} sx={{
                                            p: isMobile ? 0.75 : 1,
                                            bgcolor: alpha(theme.palette.grey[500], 0.06),
                                            borderRadius: 1,
                                            border: `1px solid ${alpha(theme.palette.grey[400], 0.2)}`
                                        }}>
                                            <CalendarToday sx={{ fontSize: isMobile ? '14px' : '16px', color: theme.palette.text.secondary }} />
                                            <Box>
                                                <Typography variant="caption" sx={{
                                                    color: theme.palette.text.secondary,
                                                    fontWeight: 700,
                                                    letterSpacing: '0.4px',
                                                    textTransform: 'uppercase',
                                                    fontSize: typography.caption.fontSize
                                                }}>
                                                    Verified On
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: typography.small.fontSize }}>
                                                    {formatDate(cert.verificationDate)}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    )}
                                </Stack>
                            </Box>
                        )}

                        {/* Date Information - Professional Certificates Only */}
                        {type === 'professional' && (cert.issuedDate || cert.expiryDate) && (
                            <Box sx={{ mb: spacing.section, flex: '0 0 auto' }}>
                                <Grid container spacing={isMobile ? 1 : 1.5}>
                                    <Grid item xs={cert.expiryDate ? 6 : 12}>
                                    {cert.issuedDate && (
                                                <Paper
                                                elevation={0}
                                                sx={{
                                                    p: isMobile ? '8px' : '12px',
                                                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                                                    borderRadius: isMobile ? 1.5 : 2,
                                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                    }
                                                }}
                                            >
                                           
                                                <Stack direction="row" alignItems="center" spacing={spacing.small} sx={{ mb: spacing.small }}>
                                                    <CalendarToday
                                                        sx={{
                                                            fontSize: isMobile ? '14px' : '16px',
                                                            color: theme.palette.primary.main
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontWeight: 700,
                                                            fontSize: typography.caption.fontSize,
                                                            color: theme.palette.text.secondary,
                                                            letterSpacing: '0.5px'
                                                        }}
                                                    >
                                                        ISSUED
                                                    </Typography>
                                                </Stack>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        fontSize: typography.small.fontSize,
                                                        color: theme.palette.text.primary
                                                    }}
                                                >
                                                    {formatDate(cert.issuedDate)}
                                                </Typography>
                                            </Paper>
                                            )}
                                        
                                    </Grid>

                                    {cert.expiryDate && (
                                        <Grid item xs={6}>
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: isMobile ? '8px' : '12px',
                                                    bgcolor: isExpiringSoon(cert.expiryDate)
                                                        ? alpha(theme.palette.warning.main, 0.08)
                                                        : alpha(theme.palette.info.main, 0.06),
                                                    borderRadius: isMobile ? 1.5 : 2,
                                                    border: `1px solid ${isExpiringSoon(cert.expiryDate)
                                                        ? alpha(theme.palette.warning.main, 0.2)
                                                        : alpha(theme.palette.info.main, 0.12)
                                                        }`,
                                                    transition: 'all 0.2s ease',
                                                    position: 'relative'
                                                }}
                                            >
                                                <Stack direction="row" alignItems="center" spacing={spacing.small} sx={{ mb: spacing.small }}>
                                                    <Event
                                                        sx={{
                                                            fontSize: isMobile ? '14px' : '16px',
                                                            color: isExpiringSoon(cert.expiryDate)
                                                                ? theme.palette.warning.main
                                                                : theme.palette.info.main
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontWeight: 700,
                                                            fontSize: typography.caption.fontSize,
                                                            color: theme.palette.text.secondary,
                                                            letterSpacing: '0.5px'
                                                        }}
                                                    >
                                                        EXPIRES
                                                    </Typography>
                                                </Stack>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        fontSize: typography.small.fontSize,
                                                        color: theme.palette.text.primary
                                                    }}
                                                >
                                                    {formatDate(cert.expiryDate)}
                                                </Typography>
                                                {isExpiringSoon(cert.expiryDate) && (
                                                    <Chip
                                                        label="Soon"
                                                        size="small"
                                                        color="warning"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: -8,
                                                            right: -8,
                                                            height: '18px',
                                                            fontSize: '9px',
                                                            fontWeight: 700,
                                                            '& .MuiChip-label': {
                                                                px: 0.75
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </Paper>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        )}

                        {/* Documents Section */}
                        {cert.documents && cert.documents.length > 0 && (
                            <Box sx={{ mt: 'auto' }}>
                                <Divider
                                    sx={{
                                        mb: spacing.content,
                                        bgcolor: alpha(theme.palette.divider, 0.5)
                                    }}
                                />
                                <Stack direction="row" alignItems="center" spacing={spacing.small} sx={{ mb: spacing.content }}>
                                    <Assignment
                                        sx={{
                                            fontSize: isMobile ? '16px' : '18px',
                                            color: theme.palette.primary.main
                                        }}
                                    />
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: typography.small.fontSize,
                                            color: theme.palette.text.primary
                                        }}
                                    >
                                        Documents ({cert.documents.length})
                                    </Typography>
                                </Stack>

                                <Stack spacing={spacing.small}>
                                    {cert.documents.slice(0, isMobile ? 1 : 2).map((doc, docIndex) => (
                                        <Paper
                                            key={doc.id || doc._id || docIndex}
                                            elevation={0}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                p: isMobile ? '8px 12px' : '10px 14px',
                                                bgcolor: alpha(theme.palette.primary.main, 0.04),
                                                borderRadius: isMobile ? 1.5 : 2,
                                                border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                    borderColor: alpha(theme.palette.primary.main, 0.15),
                                                    transform: 'translateX(2px)',
                                                }
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    flex: 1,
                                                    fontSize: typography.small.fontSize,
                                                    fontWeight: 500,
                                                    color: theme.palette.text.primary,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    pr: spacing.small
                                                }}
                                            >
                                                {doc.fileName || `Document ${docIndex + 1}`}
                                            </Typography>
                                            <Tooltip title="View Document" arrow>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedDocument(doc);
                                                        setPreviewOpen(true);
                                                    }}
                                                    sx={{
                                                        color: theme.palette.primary.main,
                                                        width: isMobile ? '28px' : '32px',
                                                        height: isMobile ? '28px' : '32px',
                                                        '&:hover': {
                                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                            transform: 'scale(1.05)',
                                                        }
                                                    }}
                                                >
                                                    <OpenInNew sx={{ fontSize: isMobile ? '14px' : '16px' }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Paper>
                                    ))}
                                    {cert.documents.length > (isMobile ? 1 : 2) && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                textAlign: 'center',
                                                color: theme.palette.text.secondary,
                                                fontSize: typography.caption.fontSize,
                                                fontStyle: 'italic',
                                                pt: spacing.small
                                            }}
                                        >
                                            +{cert.documents.length - (isMobile ? 1 : 2)} more documents
                                        </Typography>
                                    )}
                                </Stack>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Zoom>
        </Grid>
        
        {/* Document Preview Modal */}
        {previewOpen && selectedDocument && (
            <DocumentPreview
                document={selectedDocument}
                onClose={() => {
                    setPreviewOpen(false);
                    setSelectedDocument(null);
                }}
                certificateData={cert}
            />
        )}
        </>
    );
};

export default CertificationCardDashboard;