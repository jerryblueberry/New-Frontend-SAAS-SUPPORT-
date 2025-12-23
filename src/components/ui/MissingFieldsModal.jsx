import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

/**
 * MissingFieldsModal Component
 * 
 * Displays a modal showing missing required fields from previous steps
 * when user tries to navigate to a step without completing prerequisites.
 * 
 * Best Practices:
 * - Clear, actionable error messages
 * - Grouped by step for better UX
 * - Visual hierarchy with icons
 * - Accessible and responsive
 */
const MissingFieldsModal = ({ open, onClose, incompleteSteps, targetStep }) => {
  const theme = useTheme();

  if (!open || !incompleteSteps || incompleteSteps.length === 0) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: `0 8px 32px ${alpha(theme.palette.error.main, 0.2)}`,
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.error.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WarningIcon sx={{ color: theme.palette.error.main, fontSize: 24 }} />
          </Box>
          <Typography variant="h6" fontWeight={600} color="text.primary">
            Incomplete Steps Detected
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.08),
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, lineHeight: 1.6 }}
        >
          Before proceeding to <strong>Step {targetStep}</strong>, please complete the following required fields from previous steps:
        </Typography>

        {incompleteSteps.map((step, index) => (
          <Box key={step.stepNumber} sx={{ mb: index < incompleteSteps.length - 1 ? 3 : 0 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1.5,
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.error.main, 0.05),
                border: `1px solid ${alpha(theme.palette.error.main, 0.15)}`,
              }}
            >
              <WarningIcon
                sx={{
                  color: theme.palette.error.main,
                  fontSize: 20,
                }}
              />
              <Typography variant="subtitle2" fontWeight={600} color="error.main">
                Step {step.stepNumber}: {step.stepName}
              </Typography>
            </Box>

            <List dense sx={{ pl: 1 }}>
              {step.missingFields.map((field, fieldIndex) => (
                <ListItem
                  key={fieldIndex}
                  sx={{
                    py: 0.5,
                    px: 1,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.error.main, 0.04),
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: theme.palette.error.main,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={field}
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: 'text.primary',
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
              ))}
            </List>

            {index < incompleteSteps.length - 1 && (
              <Divider sx={{ mt: 2, mb: 1 }} />
            )}
          </Box>
        ))}

        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.info.main, 0.08),
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
          }}
        >
          <CheckCircleIcon
            sx={{
              color: theme.palette.info.main,
              fontSize: 20,
              mt: 0.25,
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            <strong>Tip:</strong> Complete all required fields in the previous steps to unlock Step {targetStep}. 
            You can navigate back to any completed step to make changes.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
          }}
        >
          I Understand
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MissingFieldsModal;

