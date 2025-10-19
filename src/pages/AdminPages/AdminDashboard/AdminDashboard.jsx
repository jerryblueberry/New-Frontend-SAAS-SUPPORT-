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
                   
                       <Grid container spacing={2}>
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
                        <Box sx={{ mt: { xs: 3, md: 4 }, display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                onClick={() => navigate('/admin/cleanup-documents')}
                                sx={{ borderRadius: 2, px: 4 }}
                            >
                                Manage  Documents
                            </Button>
                        </Box>
                       </Grid>
                       
                    </Box>
                </Container>
            </Box>
        </Box>
        </>
    );
};

export default AdminDashboard;