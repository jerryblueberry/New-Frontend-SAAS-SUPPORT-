/**
 * WorkerCard Component
 * 
 * Production-ready SaaS-level worker card with clean design,
 * perfect alignment, and responsive layout.
 */

import React, { memo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Badge,
  Chip,
  Button,
  Stack,
  Box,
  Grid,
  Rating,
  useTheme,
  alpha,
  useMediaQuery
} from '@mui/material';
import {
  Verified,
  Person,
  AttachMoney,
  LocationOn,
  Language,
  KeyboardArrowRight
} from '@mui/icons-material';
import { sanitizeHTML } from '../utils';

/**
 * WorkerCard Component
 * 
 * @param {Object} props
 * @param {Object} props.worker - Worker data object
 * @param {Function} props.onViewProfile - Callback when view profile is clicked
 * @param {Function} props.onHover - Callback when card is hovered (for prefetching)
 */
const WorkerCard = ({ worker, onViewProfile, onHover }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card
      onMouseEnter={() => {
        // Prefetch worker data on hover for instant modal open
        if (onHover && worker._id) {
          onHover(worker._id);
        }
      }}
      onClick={(e) => {
        // Make entire card clickable
        e.stopPropagation();
        onViewProfile(worker._id);
      }}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        borderRadius: 2,
        bgcolor: 'background.paper',
        overflow: 'hidden',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.12)}`,
          borderColor: alpha(theme.palette.primary.main, 0.3)
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2 }, display: 'flex', flexDirection: 'column' }}>
        {/* Header with Avatar and Name - Clean Design */}
        <Stack direction="row" spacing={1.5} sx={{ mb: 1.75 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              worker.verificationStatus?.overall === 'Fully Verified' ? (
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: theme.palette.success.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${theme.palette.background.paper}`,
                    boxShadow: `0 2px 4px ${alpha(theme.palette.success.main, 0.3)}`
                  }}
                >
                  <Verified sx={{ fontSize: 12, color: 'white' }} />
                </Box>
              ) : null
            }
          >
            <Avatar
              src={worker.user?.profilePicture}
              alt={`${worker.user?.firstName} ${worker.user?.lastName}`}
              sx={{ 
                width: { xs: 48, sm: 52 },
                height: { xs: 48, sm: 52 },
                border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              <Person />
            </Avatar>
          </Badge>

          <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                fontSize: { xs: '0.938rem', sm: '1rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                mb: 0.25,
                color: 'text.primary',
                lineHeight: 1.3
              }}
            >
              {worker.user?.firstName} {worker.user?.lastName?.[0]}.
            </Typography>
            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
              <Rating
                value={worker.ratings?.average || 0}
                precision={0.1}
                size="small"
                readOnly
                sx={{
                  '& .MuiRating-icon': {
                    fontSize: { xs: 16, sm: 18 }
                  }
                }}
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: { xs: '0.688rem', sm: '0.75rem' },
                  fontWeight: 500
                }}
              >
                ({worker.ratings?.count || 0})
              </Typography>
            </Stack>
          </Box>
        </Stack>

        {/* Biography - Clean & Compact */}
        <Box
          sx={{
            mb: 1.5,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: { xs: 36, sm: 40 },
            flex: '0 0 auto',
            '& *': {
              fontSize: '0.813rem !important',
              lineHeight: '1.5 !important',
              color: theme.palette.text.secondary,
              margin: '0 !important',
              padding: '0 !important'
            },
            '& ol, & ul': {
              paddingLeft: '20px !important',
              margin: '0 !important'
            },
            '& li': {
              marginBottom: '2px !important'
            },
            '& strong, & b': {
              fontWeight: 600,
              color: theme.palette.text.primary
            }
          }}
          dangerouslySetInnerHTML={{
            __html: sanitizeHTML(worker.biography) || '<p style="color: rgba(0,0,0,0.5); font-style: italic;">No biography available</p>'
          }}
        />

        {/* Skills - Clean Chips */}
        <Box sx={{ mb: 1.75, flex: '0 0 auto' }}>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {worker.skillTags?.slice(0, 3).map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                size="small"
                sx={{
                  fontSize: { xs: '0.688rem', sm: '0.75rem' },
                  height: { xs: 24, sm: 26 },
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.main',
                  fontWeight: 500,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    borderColor: alpha(theme.palette.primary.main, 0.25)
                  }
                }}
              />
            ))}
            {worker.skillTags?.length > 3 && (
              <Chip
                label={`+${worker.skillTags.length - 3}`}
                size="small"
                sx={{
                  fontSize: { xs: '0.688rem', sm: '0.75rem' },
                  height: { xs: 24, sm: 26 },
                  bgcolor: alpha(theme.palette.grey[500], 0.08),
                  color: 'text.secondary',
                  border: `1px solid ${alpha(theme.palette.grey[500], 0.15)}`
                }}
              />
            )}
          </Stack>
        </Box>

        {/* Divider */}
        <Box 
          sx={{ 
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`, 
            my: { xs: 1.25, sm: 1.5 },
            flex: '0 0 auto'
          }} 
        />

        {/* Info Grid - Perfectly Aligned */}
        <Grid container spacing={1.25} sx={{ mb: { xs: 1.5, sm: 1.75 }, flex: '0 0 auto' }}>
          <Grid item xs={6}>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <AttachMoney 
                sx={{ 
                  fontSize: { xs: 16, sm: 18 },
                  color: 'text.secondary'
                }} 
              />
              <Typography 
                variant="caption" 
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.75rem', sm: '0.813rem' },
                  fontWeight: 500
                }}
              >
                ${worker.expectedHourlyRate}/hr
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={6}>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <LocationOn 
                sx={{ 
                  fontSize: { xs: 16, sm: 18 },
                  color: 'text.secondary'
                }} 
              />
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.75rem', sm: '0.813rem' },
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {worker.availability?.suburb || 'N/A'}
              </Typography>
            </Stack>
          </Grid>
          {worker.languages?.[0] && (
            <Grid item xs={6}>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Language 
                  sx={{ 
                    fontSize: { xs: 16, sm: 18 },
                    color: 'text.secondary'
                  }} 
                />
                <Typography 
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: { xs: '0.75rem', sm: '0.813rem' },
                    fontWeight: 500
                  }}
                >
                  {worker.languages[0].language}
                </Typography>
              </Stack>
            </Grid>
          )}
        </Grid>

        {/* View Profile Button - Clean Design */}
        <Button
          fullWidth
          variant="outlined"
          size="small"
          endIcon={<KeyboardArrowRight sx={{ fontSize: 18 }} />}
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile(worker._id);
          }}
          sx={{
            mt: 'auto',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 1.5,
            py: { xs: 1, sm: 1.25 },
            borderColor: alpha(theme.palette.primary.main, 0.3),
            color: 'primary.main',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              borderColor: theme.palette.primary.main,
              transform: 'translateX(2px)',
              '& .MuiButton-endIcon': {
                transform: 'translateX(2px)'
              }
            },
            '& .MuiButton-endIcon': {
              transition: 'transform 0.2s ease-in-out'
            }
          }}
        >
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
};

export default memo(WorkerCard);
