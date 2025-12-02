import { Box, Typography, useTheme } from '@mui/material';
import { getGreeting } from './utils/dateHelpers';

/**
 * HeaderSection Component
 * Premium SaaS-level header with mature, professional design
 * Displays personalized greeting and subtitle
 */
const HeaderSection = ({ user }) => {
    const theme = useTheme();

    return (
        <Box sx={{ mb: { xs: 1.5, sm: 2, md: 2.5 } }}>
            <Typography
                variant="h5"
                fontWeight={600}
                sx={{
                    mb: { xs: 0.25, sm: 0.375 },
                    fontSize: { xs: '1.125rem', sm: '1.375rem', md: '1.625rem', lg: '1.75rem' },
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    color: 'text.primary',
                    lineHeight: 1.3,
                    letterSpacing: { xs: '-0.01em', sm: '-0.015em' },
                }}
            >
                {getGreeting()}, {user?.firstName || 'Worker'}
            </Typography>
            <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                    fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontWeight: 400,
                    lineHeight: 1.5,
                    letterSpacing: '0.01em'
                }}
            >
                Here's your overview and activity
            </Typography>
        </Box>
    );
};

export default HeaderSection;

