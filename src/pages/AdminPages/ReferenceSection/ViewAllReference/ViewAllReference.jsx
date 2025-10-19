import React from 'react'
import AdminSidebar from '../../../../components/adminSidebar/AdminSidebar'
import WorkerNavbar from '../../../../components/Navbar/WorkerNavbar'
import { 
  Box, 
  Typography, 
  Container, 
  Avatar, 
  Stack, 
  useTheme, 
  useMediaQuery,
  Paper,
  Chip
} from '@mui/material'
import { Person, VerifiedUser, Assessment } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const SIDEBAR_WIDTH = 280;
const SIDEBAR_GAP = 4;

const ViewAllReference = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  return (
    <>
      <WorkerNavbar />
      
      <Box sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default
      }}>
        {/* Sidebar */}
        <Box sx={{
          width: { xs: 0, md: SIDEBAR_WIDTH },
          flexShrink: 0,
          zIndex: theme.zIndex.drawer,
          position: 'fixed',
          top: { xs: 56, md: 64 },
          left: 0,
          height: `calc(100vh - 64px)`,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}>
          <AdminSidebar topOffset={64} navigate={navigate} />
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            ml: { md: `${SIDEBAR_WIDTH + SIDEBAR_GAP}px` },
            p: { xs: 1, sm: 3, md: 0 },
            mt: { xs: 1, md: 0 },
            minHeight: '100vh',
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Container maxWidth="xl" sx={{ py: { xs: 0, sm: 0, md: 2}, px: { xs: 2, sm: 3, md: 4 } }}>
            {/* Enhanced Header Section */}
            <Paper
              elevation={0}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}08 100%)`,
                borderRadius: { xs: 2, sm: 3, md: 4 },
                border: `1px solid ${theme.palette.divider}`,
                p: { xs: 2.5, sm: 3.5, md: 4 },
                mb: { xs: 2, sm: 3, md: 4 },
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: theme.shadows[2],
                  transform: 'translateY(-2px)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: { xs: '120px', sm: '180px', md: '250px' },
                  height: { xs: '120px', sm: '180px', md: '250px' },
                  background: `radial-gradient(circle, ${theme.palette.primary.main}12 0%, transparent 70%)`,
                  borderRadius: '50%',
                  transform: 'translate(30%, -30%)',
                  pointerEvents: 'none',
                }
              }}
            >
              <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                {/* Title Row */}
                <Stack 
                  direction="row" 
                  alignItems="center" 
                  spacing={{ xs: 1.5, sm: 2, md: 2.5 }}
                  sx={{ position: 'relative', zIndex: 1 }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.main',
                      width: { xs: 48, sm: 56, md: 64 },
                      height: { xs: 48, sm: 56, md: 64 },
                      boxShadow: `0 4px 14px ${theme.palette.primary.main}40`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: `0 6px 20px ${theme.palette.primary.main}50`,
                      }
                    }}
                  >
                    <Person sx={{ fontSize: { xs: 24, sm: 28, md: 32 } }} />
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="h3"
                      component="h1" 
                      sx={{ 
                        fontWeight: 700,
                        color: 'text.primary',
                        fontSize: { 
                          xs: '1rem',
                          sm: '1.2rem', 
                          md: '1.5rem',
                          lg: '1.75rem'
                        },
                        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                        letterSpacing: '-0.03em',
                        lineHeight: { xs: 1.3, md: 1.2 },
                        mb: { xs: 0.5, md: 0.75 },
                        background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      All References
                    </Typography>

                    {/* Status Chips - Hidden on mobile */}
                    {!isMobile && (
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip
                          icon={<VerifiedUser sx={{ fontSize: 16 }} />}
                          label="Verification System"
                          size="small"
                          sx={{
                            bgcolor: `${theme.palette.success.main}15`,
                            color: 'success.main',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            border: `1px solid ${theme.palette.success.main}30`,
                            '& .MuiChip-icon': {
                              color: 'success.main'
                            }
                          }}
                        />
                        <Chip
                          icon={<Assessment sx={{ fontSize: 16 }} />}
                          label="Real-time Monitoring"
                          size="small"
                          sx={{
                            bgcolor: `${theme.palette.info.main}15`,
                            color: 'info.main',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            border: `1px solid ${theme.palette.info.main}30`,
                            '& .MuiChip-icon': {
                              color: 'info.main'
                            }
                          }}
                        />
                      </Stack>
                    )}
                  </Box>
                </Stack>

            
              </Stack>
            </Paper>

            {/* Add your content here */}
          </Container>
        </Box>
      </Box>
    </>
  )
}

export default ViewAllReference