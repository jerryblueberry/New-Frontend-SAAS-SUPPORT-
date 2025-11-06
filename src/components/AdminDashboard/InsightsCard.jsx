/**
 * InsightsCard Component
 * Displays actionable insights and recommendations based on platform data
 * Production-ready with responsive design
 */
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Info,
  ExpandMore,
  ExpandLess,
  ArrowUpward,
  ArrowDownward,
  Error as ErrorIcon
} from '@mui/icons-material';

const InsightItem = ({ insight }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const getIconByType = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle sx={{ fontSize: 24 }} />;
      case 'warning':
        return <Warning sx={{ fontSize: 24 }} />;
      case 'error':
        return <ErrorIcon sx={{ fontSize: 24 }} />;
      default:
        return <Info sx={{ fontSize: 24 }} />;
    }
  };

  const getColorByType = (type) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  const color = getColorByType(insight.type);

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette[color].main, 0.08),
        border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: alpha(theme.palette[color].main, 0.12),
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 12px ${alpha(theme.palette[color].main, 0.2)}`
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette[color].main, 0.15),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.palette[color].main,
            flexShrink: 0
          }}
        >
          {getIconByType(insight.type)}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
              {insight.title}
            </Typography>
            <Stack direction="row" spacing={0.5}>
              {insight.priority === 'high' && (
                <Chip 
                  label="High Priority" 
                  size="small" 
                  color={color}
                  sx={{ fontSize: '0.7rem', height: 22 }}
                />
              )}
              {insight.change && (
                <Chip
                  icon={insight.change > 0 ? <ArrowUpward sx={{ fontSize: 14 }} /> : <ArrowDownward sx={{ fontSize: 14 }} />}
                  label={`${Math.abs(insight.changePercentage)}%`}
                  size="small"
                  color={insight.change > 0 ? 'success' : 'error'}
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 22 }}
                />
              )}
            </Stack>
          </Box>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, lineHeight: 1.5 }}>
            {insight.description}
          </Typography>

          {insight.metric !== undefined && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Current Value:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette[color].main }}>
                {typeof insight.metric === 'number' ? insight.metric.toLocaleString() : insight.metric}
              </Typography>
            </Box>
          )}

          {insight.suggestedActions && insight.suggestedActions.length > 0 && (
            <>
              <Box
                onClick={() => setExpanded(!expanded)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  color: theme.palette[color].main,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                <Lightbulb sx={{ fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Suggested Actions ({insight.suggestedActions.length})
                </Typography>
                {expanded ? <ExpandLess sx={{ fontSize: 20 }} /> : <ExpandMore sx={{ fontSize: 20 }} />}
              </Box>

              <Collapse in={expanded}>
                <List dense sx={{ mt: 1 }}>
                  {insight.suggestedActions.map((action, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: theme.palette[color].main
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={action}
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { lineHeight: 1.5 }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const InsightsCard = ({ insights = {}, loading = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { insights: insightsList = [], summary = {} } = insights;

  if (!insightsList || insightsList.length === 0) {
    return (
      <Card 
        sx={{ 
          height: '100%', 
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Lightbulb sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Insights & Recommendations
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 48, color: theme.palette.success.main, mb: 2, opacity: 0.5 }} />
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              All systems operating optimally
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, opacity: 0.8 }}>
              No actionable insights at this time
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box 
      sx={{ 
        height: '100%',
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        p: { xs: 2, sm: 2.5 },
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: theme.palette.primary.main
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
          opacity: 0.8
        }
      }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Lightbulb sx={{ color: 'primary.main', fontSize: { xs: 24, sm: 28 } }} />
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '1rem', sm: '1.125rem' }
                }}
              >
                Insights & Recommendations
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                }}
              >
                Based on recent platform activity
              </Typography>
            </Box>
          </Box>

          {summary.totalInsights > 0 && (
            <Stack direction="row" spacing={1}>
              {summary.highPriority > 0 && (
                <Chip 
                  label={`${summary.highPriority} High Priority`}
                  size="small" 
                  color="error"
                  sx={{ fontSize: '0.7rem', height: 24 }}
                />
              )}
              {summary.actionableInsights > 0 && (
                <Chip 
                  label={`${summary.actionableInsights} Actionable`}
                  size="small" 
                  color="info"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 24 }}
                />
              )}
            </Stack>
          )}
        </Box>

        <Stack spacing={2}>
          {insightsList.map((insight, index) => (
            <InsightItem key={index} insight={insight} />
          ))}
        </Stack>
      </Box>
  );
};

export default InsightsCard;

