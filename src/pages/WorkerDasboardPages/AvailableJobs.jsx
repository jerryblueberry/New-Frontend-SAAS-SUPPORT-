import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Chip,
    useTheme,
    useMediaQuery,
    Fade,
    Slide,
    Zoom
} from '@mui/material';
import {
    Work,
    Rocket
} from '@mui/icons-material';
import WorkerNavbar from '../../components/Navbar/WorkerNavbar';
import DashboardSidebar from '../../components/workerDashboard/components/DashboardSidebar/DashboardSidebar';

const AvailableJobs = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const AnimatedIllustration = () => (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 4
            }}
        >
            <Zoom in={true} timeout={1000}>
                <Box
                    sx={{
                        width: { xs: 120, sm: 150, md: 180 },
                        height: { xs: 120, sm: 150, md: 180 },
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'pulse 2s ease-in-out infinite',
                        '@keyframes pulse': {
                            '0%, 100%': { transform: 'scale(1)' },
                            '50%': { transform: 'scale(1.05)' }
                        }
                    }}
                >
                    <Work sx={{ fontSize: { xs: 50, sm: 60, md: 70 }, color: 'white' }} />
                </Box>
            </Zoom>
        </Box>
    );

    return (
        <Box>
            <WorkerNavbar />
            <Box sx={{ display: 'flex' }}>
                <DashboardSidebar />
                <Box
                    sx={{
                        flexGrow: 1,
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: { xs: 2, sm: 3, md: 4 },
                        mt: { xs: 8, md: 0 }
                    }}
                >
                    <Box sx={{ 
                        textAlign: 'center',
                        maxWidth: { xs: '100%', sm: 500, md: 600 }
                    }}>
                        <Fade in={true} timeout={800}>
                            <Chip
                                icon={<Rocket />}
                                label="Something Amazing is Coming"
                                color="primary"
                                variant="outlined"
                                sx={{
                                    mb: 3,
                                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                    py: 1,
                                    animation: 'bounce 2s ease-in-out infinite',
                                    '@keyframes bounce': {
                                        '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
                                        '40%': { transform: 'translateY(-10px)' },
                                        '60%': { transform: 'translateY(-5px)' }
                                    }
                                }}
                            />
                        </Fade>

                        <AnimatedIllustration />

                        <Slide in={true} direction="up" timeout={1000}>
                            <Typography
                                variant={isMobile ? 'h4' : 'h2'}
                                component="h1"
                                gutterBottom
                                sx={{
                                    fontWeight: 800,
                                    fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 3,
                                    lineHeight: 1.2
                                }}
                            >
                                Jobs Portal
                                <br />
                                Coming Soon!
                            </Typography>
                        </Slide>

                        <Slide in={true} direction="up" timeout={1200}>
                            <Typography
                                variant="h6"
                                color="text.secondary"
                                sx={{ 
                                    mb: 4, 
                                    lineHeight: 1.6,
                                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                                    px: { xs: 1, sm: 2 }
                                }}
                            >
                                We're crafting an exceptional job platform that will connect talented
                                professionals with amazing opportunities. Get ready for a revolutionary
                                career experience!
                            </Typography>
                        </Slide>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default AvailableJobs;