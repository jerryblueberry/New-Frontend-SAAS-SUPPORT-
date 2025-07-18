import React from "react";
import { Container, Box, Typography, Grid, Card, CardContent, Button } from "@mui/material";
import AdminSidebar from "../../../components/adminSidebar/AdminSidebar";
import { useNavigate } from "react-router-dom";
import WorkerNavbar from "../../../components/Navbar/WorkerNavbar";

const SIDEBAR_WIDTH = 280;
const SIDEBAR_GAP = 4; // px

const AdminDashboard = () => {
    const navigate = useNavigate();

    return (
        <>
        <WorkerNavbar/>
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            {/* Sidebar */}
            <Box sx={{
                width: { xs: '0px', md: `${SIDEBAR_WIDTH}px` },
                flexShrink: 0,
                zIndex: 1200,
                position: 'fixed',
                top: { xs: 56, md: 64 }, // adjust if your navbar height is different
                left: 0,
                height: `calc(100vh - 64px)`
            }}>
                <AdminSidebar topOffset={64} navigate={navigate} />
            </Box>
            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: '100%',
                    ml: { md: `${SIDEBAR_WIDTH + SIDEBAR_GAP}px`, xs: 0 }, // 8px gap between sidebar and content on desktop
                    p: { xs: 2, sm: 3, md: 4 },
                    mt: { xs: 8, md: 3 },
                    minHeight: '100vh',
                    transition: 'margin-left 0.2s',
                }}
            >
                <Container maxWidth={false} disableGutters sx={{ width: '100%', p: 0, m: 0 }}>
                    <Box sx={{ mb: 4, width: '100%' }}>
                        <Typography
                            variant="h4"
                            component="h1"
                            gutterBottom
                            sx={{
                                fontWeight: 600,
                                color: '#1a202c',
                                textAlign: { xs: 'center', md: 'left' },
                                mt: { xs: 2, md: 4 }
                            }}
                        >
                            Admin Dashboard
                        </Typography>
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            {/* Example summary cards for NDIS worker admin */}
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ minWidth: 0, borderRadius: 3, boxShadow: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6">Total Workers</Typography>
                                        <Typography variant="h4">123</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ minWidth: 0, borderRadius: 3, boxShadow: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6">Active Jobs</Typography>
                                        <Typography variant="h4">45</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ minWidth: 0, borderRadius: 3, boxShadow: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6">Pending Verifications</Typography>
                                        <Typography variant="h4">8</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ minWidth: 0, borderRadius: 3, boxShadow: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6">New Registrations</Typography>
                                        <Typography variant="h4">12</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                        <Box sx={{ mt: { xs: 3, md: 4 }, display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                onClick={() => navigate('/admin/workers')}
                                sx={{ borderRadius: 2, px: 4 }}
                            >
                                Go to Worker Management
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </Box>
        </>
    );
};

export default AdminDashboard;