/**
 * ActionItemsCard Component
 * Premium, lively design with informative content and actionable items
 * Displays upcoming tasks with enhanced visuals and navigation
 */

import React from 'react'
import { Typography, Chip, Box, useTheme, alpha, Stack, useMediaQuery } from '@mui/material'
import { 
  Timeline, 
  CheckCircle, 
  Description, 
  ArrowForward,
  Assignment,
  VerifiedUser,
  Info,
  Person,
  ContactPhone,
  Payment,
  Settings
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { TASK_STATUS, TASK_TYPES } from '../utils/constants'

/**
 * ActionItemsCard Component
 * @param {Array} tasks - Array of task objects with title, status, time, type, documentId
 */
const ActionItemsCard = ({ tasks = [] }) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const getTaskConfig = (task) => {
    const isUrgent = task.status === TASK_STATUS.URGENT
    const isCompleted = task.status === TASK_STATUS.COMPLETED
    
    const configs = {
      [TASK_TYPES.DOCUMENT]: {
        icon: Description,
        color: isUrgent ? theme.palette.error.main : theme.palette.warning.main,
        bgColor: isUrgent 
          ? alpha(theme.palette.error.main, 0.1)
          : alpha(theme.palette.warning.main, 0.1),
        borderColor: isUrgent
          ? alpha(theme.palette.error.main, 0.2)
          : alpha(theme.palette.warning.main, 0.2),
        actionPath: task.actionPath || '/client/documents',
        tip: isUrgent 
          ? 'Urgent: Renew this document to maintain compliance'
          : 'Keep your documents up to date for seamless service'
      },
      [TASK_TYPES.VERIFICATION]: {
        icon: VerifiedUser,
        color: theme.palette.info.main,
        bgColor: alpha(theme.palette.info.main, 0.1),
        borderColor: alpha(theme.palette.info.main, 0.2),
        actionPath: task.actionPath || '/client/documents/pending',
        tip: 'Documents are being reviewed by our admin team'
      },
      [TASK_TYPES.PREFERENCES]: {
        icon: Assignment,
        color: theme.palette.primary.main,
        bgColor: alpha(theme.palette.primary.main, 0.1),
        borderColor: alpha(theme.palette.primary.main, 0.2),
        actionPath: task.actionPath || '/client/profile/preferences',
        tip: 'Complete your preferences to get better worker matches'
      },
      'basic_info': {
        icon: Person,
        color: theme.palette.error.main,
        bgColor: alpha(theme.palette.error.main, 0.1),
        borderColor: alpha(theme.palette.error.main, 0.2),
        actionPath: task.actionPath || '/client/profile',
        tip: 'Complete your basic information to proceed with verification'
      },
      'emergency_contact': {
        icon: ContactPhone,
        color: theme.palette.warning.main,
        bgColor: alpha(theme.palette.warning.main, 0.1),
        borderColor: alpha(theme.palette.warning.main, 0.2),
        actionPath: task.actionPath || '/client/profile',
        tip: 'Add an emergency contact for safety and support purposes'
      },
      'billing': {
        icon: Payment,
        color: theme.palette.info.main,
        bgColor: alpha(theme.palette.info.main, 0.1),
        borderColor: alpha(theme.palette.info.main, 0.2),
        actionPath: task.actionPath || '/client/billing/preferences',
        tip: 'Set up billing preferences to streamline payment processing'
      },
      'communication': {
        icon: Settings,
        color: theme.palette.primary.main,
        bgColor: alpha(theme.palette.primary.main, 0.1),
        borderColor: alpha(theme.palette.primary.main, 0.2),
        actionPath: task.actionPath || '/client/profile/communication',
        tip: 'Configure how you prefer to receive notifications and updates'
      },
      default: {
        icon: CheckCircle,
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, 0.1),
        borderColor: alpha(theme.palette.success.main, 0.2),
        actionPath: task.actionPath || null,
        tip: 'Great job keeping everything up to date!'
      }
    }

    return configs[task.type] || configs.default
  }

  const handleTaskClick = (task) => {
    // Use task's actionPath if available, otherwise use config's actionPath
    const actionPath = task.actionPath || getTaskConfig(task).actionPath
    if (actionPath) {
      navigate(actionPath)
    }
  }

  const pendingTasks = tasks.filter(t => t.status !== TASK_STATUS.COMPLETED)
  const completedTasks = tasks.filter(t => t.status === TASK_STATUS.COMPLETED)

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        height: '100%',
        minHeight: 0,
        p: { xs: 2, sm: 2.5, md: 3, lg: 3.5 },
        borderRadius: { xs: 2, sm: 2.5 },
        bgcolor: alpha(theme.palette.primary.main, 0.04),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.2),
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`
        }
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1.5, sm: 0 },
          mb: { xs: 2, sm: 2.5, md: 3 }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, sm: 1.5 }, flex: 1 }}>
          <Box
            sx={{
              p: { xs: 0.75, sm: 0.875, md: 1 },
              borderRadius: { xs: 1.5, sm: 2 },
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Timeline
              sx={{
                fontSize: { xs: 18, sm: 20, md: 22 },
                color: theme.palette.primary.main
              }}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                color: theme.palette.text.primary,
                mb: 0.25,
                lineHeight: 1.3
              }}
            >
              Action Items
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                color: theme.palette.text.secondary
              }}
            >
              Tasks requiring your attention
            </Typography>
          </Box>
        </Box>
        {pendingTasks.length > 0 && (
          <Chip
            label={pendingTasks.length}
            size="small"
            sx={{
              height: { xs: 22, sm: 24, md: 26 },
              fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.8125rem' },
              fontWeight: 700,
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              color: theme.palette.warning.main,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              alignSelf: { xs: 'flex-start', sm: 'center' }
            }}
          />
        )}
      </Box>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 3, sm: 4, md: 5 },
            px: { xs: 1.5, sm: 2 }
          }}
        >
          <CheckCircle
            sx={{
              fontSize: { xs: 40, sm: 48, md: 56 },
              color: theme.palette.success.main,
              mb: { xs: 1.5, sm: 2 },
              opacity: 0.8
            }}
          />
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{
              fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.125rem' },
              color: theme.palette.text.primary,
              mb: 1
            }}
          >
            All caught up!
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              color: theme.palette.text.secondary,
              lineHeight: 1.6
            }}
          >
            You have no pending action items at the moment.
          </Typography>
        </Box>
      ) : (
        <Stack 
          spacing={{ xs: 1.25, sm: 1.5 }}
          sx={{ 
            width: '100%', 
            maxWidth: '100%',
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            '&::-webkit-scrollbar': {
              width: '6px'
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: alpha(theme.palette.text.secondary, 0.2),
              borderRadius: '10px'
            }
          }}
        >
          {/* Pending Tasks */}
          {pendingTasks.map((task, index) => {
            const config = getTaskConfig(task)
            const IconComponent = config.icon
            const isUrgent = task.status === TASK_STATUS.URGENT

            return (
              <Box
                key={index}
                onClick={() => handleTaskClick(task)}
                sx={{
                  p: { xs: 1.5, sm: 1.75, md: 2 },
                  borderRadius: { xs: 1.5, sm: 2 },
                  bgcolor: config.bgColor,
                  border: `1px solid ${config.borderColor}`,
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  '&:hover': {
                    bgcolor: alpha(config.color, 0.15),
                    borderColor: config.color,
                    transform: { xs: 'none', sm: 'translateX(4px)' },
                    boxShadow: `0 4px 12px ${alpha(config.color, 0.15)}`
                  },
                  '&:active': {
                    transform: { xs: 'scale(0.98)', sm: 'translateX(2px)' }
                  }
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: { xs: 1.25, sm: 1.5, md: 2 },
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Icon */}
                  <Box
                    sx={{
                      p: { xs: 0.625, sm: 0.75, md: 0.875 },
                      borderRadius: { xs: 1.25, sm: 1.5 },
                      bgcolor: alpha(config.color, 0.15),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      mt: 0.125
                    }}
                  >
                    <IconComponent
                      sx={{
                        fontSize: { xs: 18, sm: 20, md: 22 },
                        color: config.color
                      }}
                    />
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 0.5, sm: 1 },
                        mb: 0.5,
                        width: '100%'
                      }}
                    >
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        sx={{
                          fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                          color: theme.palette.text.primary,
                          lineHeight: 1.3,
                          flex: 1,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          wordBreak: 'break-word'
                        }}
                      >
                        {task.title}
                      </Typography>
                      {isUrgent && (
                        <Chip
                          label="Urgent"
                          size="small"
                          sx={{
                            height: { xs: 18, sm: 20 },
                            fontSize: { xs: '0.625rem', sm: '0.6875rem' },
                            fontWeight: 700,
                            bgcolor: theme.palette.error.main,
                            color: 'white',
                            alignSelf: { xs: 'flex-start', sm: 'center' },
                            flexShrink: 0,
                            '& .MuiChip-label': {
                              px: { xs: 0.625, sm: 0.75 }
                            }
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                        color: theme.palette.text.secondary,
                        mb: { xs: 0.75, sm: 1 },
                        lineHeight: 1.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '100%'
                      }}
                    >
                      {task.time}
                    </Typography>
                    <Box
                      sx={{
                        display: { xs: 'none', sm: 'flex' },
                        alignItems: 'flex-start',
                        gap: 0.75,
                        mt: 1,
                        width: '100%'
                      }}
                    >
                      <Info
                        sx={{
                          fontSize: 14,
                          color: theme.palette.text.secondary,
                          opacity: 0.7,
                          flexShrink: 0,
                          mt: 0.125
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                          color: theme.palette.text.secondary,
                          fontStyle: 'italic',
                          lineHeight: 1.4,
                          flex: 1,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {config.tip}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Action Arrow */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flexShrink: 0,
                      mt: 0.5
                    }}
                  >
                    <ArrowForward
                      sx={{
                        fontSize: { xs: 16, sm: 18, md: 20 },
                        color: config.color,
                        opacity: 0.6,
                        transition: 'all 0.2s ease'
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            )
          })}

          {/* Completed Tasks (if any) */}
          {completedTasks.length > 0 && (
            <Box
              sx={{
                mt: { xs: 1.5, sm: 2 },
                pt: { xs: 1.5, sm: 2 },
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`
              }}
            >
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{
                  fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.8125rem' },
                  color: theme.palette.text.secondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  mb: { xs: 1.25, sm: 1.5 },
                  display: 'block'
                }}
              >
                Completed
              </Typography>
              <Stack spacing={{ xs: 1, sm: 1.25 }}>
                {completedTasks.map((task, index) => {
                  const config = getTaskConfig(task)
                  const IconComponent = config.icon

                  return (
                    <Box
                      key={index}
                      sx={{
                        p: { xs: 1.25, sm: 1.5 },
                        borderRadius: { xs: 1.5, sm: 2 },
                        bgcolor: alpha(theme.palette.success.main, 0.06),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 1.25, sm: 1.5 },
                        opacity: 0.8
                      }}
                    >
                      <IconComponent
                        sx={{
                          fontSize: { xs: 16, sm: 18, md: 20 },
                          color: theme.palette.success.main,
                          flexShrink: 0
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          sx={{
                            fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                            color: theme.palette.text.primary,
                            textDecoration: 'line-through',
                            opacity: 0.7,
                            lineHeight: 1.4,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {task.title}
                        </Typography>
                      </Box>
                      <CheckCircle
                        sx={{
                          fontSize: { xs: 16, sm: 18, md: 20 },
                          color: theme.palette.success.main,
                          flexShrink: 0
                        }}
                      />
                    </Box>
                  )
                })}
              </Stack>
            </Box>
          )}
        </Stack>
      )}
    </Box>
  )
}

export default ActionItemsCard
