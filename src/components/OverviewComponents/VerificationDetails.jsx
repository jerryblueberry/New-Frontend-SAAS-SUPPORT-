import { Box, Grid, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

/**
 * VerificationDetails Component
 * Displays three verification items: Identity, Background Check, Skills
 */
const VerificationDetails = ({ verificationDetail }) => {
    const theme = useTheme();

    const verificationItems = [
        {
            key: 'identityVerified',
            label: 'Identity Verified',
            value: verificationDetail.identityVerified
        },
        {
            key: 'backgroundCheckPassed',
            label: 'Background Check',
            value: verificationDetail.backgroundCheckPassed
        },
        {
            key: 'skillsVerified',
            label: 'Skills Verified',
            value: verificationDetail.skillsVerified
        }
    ];

    return (
        <Box sx={{ pt: { xs: 1.5, sm: 1.75, md: 2 }, borderTop: '1px solid', borderColor: 'divider', width: '100%' }}>
            <Grid container spacing={{ xs: 1.25, sm: 1.5, md: 2 }} sx={{ width: '100%' }}>
                {verificationItems.map((item) => (
                    <Grid item xs={12} sm={4} key={item.key}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 1, sm: 1.125, md: 1.25 },
                                borderRadius: { xs: 2, sm: 2.5 },
                                border: '1.5px solid',
                                borderColor: item.value
                                    ? alpha(theme.palette.success.main, 0.3)
                                    : alpha(theme.palette.text.disabled, 0.2),
                                background: item.value
                                    ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.08)} 0%, ${alpha(theme.palette.success.main, 0.02)} 100%)`
                                    : `linear-gradient(135deg, ${alpha(theme.palette.grey[500], 0.04)} 0%, transparent 100%)`,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: item.value
                                        ? `0 6px 20px ${alpha(theme.palette.success.main, 0.15)}`
                                        : '0 4px 12px rgba(0,0,0,0.08)',
                                    borderColor: item.value
                                        ? theme.palette.success.main
                                        : alpha(theme.palette.text.disabled, 0.4),
                                },
                                width: '100%',
                                minHeight: 'auto'
                            }}
                        >
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box
                                    sx={{
                                        width: { xs: 20, sm: 20, md: 24 },
                                        height: { xs: 20, sm: 20, md: 24 },
                                        borderRadius: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: item.value
                                            ? `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${alpha(theme.palette.success.main, 0.8)} 100%)`
                                            : `linear-gradient(135deg, ${alpha(theme.palette.grey[500], 0.2)} 0%, ${alpha(theme.palette.grey[500], 0.1)} 100%)`,
                                        flexShrink: 0,
                                        boxShadow: item.value ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                                    }}
                                >
                                    {item.value ? (
                                        <CheckCircleIcon sx={{ 
                                            fontSize: { xs: 15, sm: 18, md: 20 }, 
                                            color: 'white' 
                                        }} />
                                    ) : (
                                        <RadioButtonUncheckedIcon sx={{ 
                                            fontSize: { xs: 15, sm: 18, md: 20 }, 
                                            color: 'text.disabled' 
                                        }} />
                                    )}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.8125rem' },
                                            fontWeight: item.value ? 600 : 500,
                                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                            color: item.value ? 'text.primary' : 'text.secondary',
                                            lineHeight: { xs: 1, sm: 1, md: 1.1 },
                                            letterSpacing: '0.001em'
                                        }}
                                    >
                                        {item.label}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default VerificationDetails;

