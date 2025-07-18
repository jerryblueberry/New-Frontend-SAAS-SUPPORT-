import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Tooltip,
  IconButton,
  Chip,
  Avatar,
  List,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  KeyboardArrowUp,
  KeyboardArrowDown,
  Quiz,
  Save,
  Close,
  Visibility
} from '@mui/icons-material';

// QUESTION_TYPES and getTypeConfig should be passed as props or imported if shared

const EditorCreateQuestionnaire = ({
  open,
  onClose,
  onSave,
  formMeta,
  setFormMeta,
  formQuestions,
  setFormQuestions,
  openQDialog,
  editQuestion,
  deleteQuestion,
  moveQuestion,
  showPreview,
  setShowPreview,
  isMobile,
  saving,
  error,
  QUESTION_TYPES,
  getTypeConfig
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      fullScreen={isMobile}
      TransitionProps={{ direction: 'up' }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {formMeta?._id ? 'Edit Questionnaire' : 'Create New Questionnaire'}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Preview">
            <IconButton
              onClick={() => setShowPreview(!showPreview)}
              sx={{ color: 'white' }}
            >
              <Visibility />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Grid container sx={{ minHeight: 'calc(100vh - 200px)' }}>
          {/* Form Section */}
          <Grid
            item
            xs={12}
            lg={showPreview ? 6 : 12}
            sx={{
              borderRight: showPreview ? '1px solid' : 'none',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ p: 3, flex: 1 }}>
              {/* Questionnaire Metadata */}
              <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Questionnaire Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Questionnaire Name"
                      fullWidth
                      value={formMeta.name}
                      onChange={e => setFormMeta(m => ({ ...m, name: e.target.value }))}
                      variant="outlined"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Version"
                      fullWidth
                      value={formMeta.version}
                      onChange={e => setFormMeta(m => ({ ...m, version: e.target.value }))}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Description"
                      fullWidth
                      multiline
                      rows={2}
                      value={formMeta.description}
                      onChange={e => setFormMeta(m => ({ ...m, description: e.target.value }))}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={formMeta.category}
                        label="Category"
                        onChange={e => setFormMeta(m => ({ ...m, category: e.target.value }))}
                      >
                        <MenuItem value="reference_check">Reference Check</MenuItem>
                        <MenuItem value="skill_assessment">Skill Assessment</MenuItem>
                        <MenuItem value="background_check">Background Check</MenuItem>
                        <MenuItem value="general">General</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>
              {/* Questions Section */}
              <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Questions ({formQuestions.length})
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => openQDialog()}
                    sx={{ borderRadius: 2 }}
                  >
                    Add Question
                  </Button>
                </Box>
                {formQuestions.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Quiz sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No questions yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start building your questionnaire by adding questions
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {formQuestions.map((question, idx) => {
                      const typeConfig = getTypeConfig(question.type);
                      return (
                        <Card
                          key={idx}
                          sx={{
                            mb: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2
                          }}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <Box display="flex" alignItems="center" flex={1}>
                                <Avatar
                                  sx={{
                                    bgcolor: typeConfig.color,
                                    width: 32,
                                    height: 32,
                                    mr: 2
                                  }}
                                >
                                  {typeConfig.icon}
                                </Avatar>
                                <Box flex={1}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {idx + 1}. {question.text}
                                  </Typography>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip
                                      label={typeConfig.label}
                                      size="small"
                                      sx={{ bgcolor: typeConfig.color, color: 'white' }}
                                    />
                                    {question.required && (
                                      <Chip label="Required" color="error" size="small" />
                                    )}
                                  </Stack>
                                </Box>
                              </Box>
                              <Stack direction="row" spacing={1}>
                                <Tooltip title="Edit Question">
                                  <IconButton
                                    size="small"
                                    onClick={() => editQuestion(idx)}
                                    color="primary"
                                  >
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Question">
                                  <IconButton
                                    size="small"
                                    onClick={() => deleteQuestion(idx)}
                                    color="error"
                                  >
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Move Up">
                                  <IconButton
                                    size="small"
                                    onClick={() => moveQuestion(idx, 'up')}
                                    disabled={idx === 0}
                                  >
                                    <KeyboardArrowUp />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Move Down">
                                  <IconButton
                                    size="small"
                                    onClick={() => moveQuestion(idx, 'down')}
                                    disabled={idx === formQuestions.length - 1}
                                  >
                                    <KeyboardArrowDown />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Box>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </List>
                )}
              </Paper>
            </Box>
          </Grid>
          {/* Preview Section */}
          {showPreview && (
            <Grid item xs={12} lg={6}>
              <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: '100%' }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Live Preview
                </Typography>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                    {formMeta.name || 'Untitled Questionnaire'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {formMeta.description || 'No description provided'}
                  </Typography>
                  {formQuestions.length === 0 ? (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      Add questions to see preview
                    </Typography>
                  ) : (
                    <Stack spacing={3}>
                      {formQuestions.map((question, idx) => (
                        <Box key={idx}>
                          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            {idx + 1}. {question.text}
                            {question.required && (
                              <Typography component="span" color="error">
                                *
                              </Typography>
                            )}
                          </Typography>
                          {question.helpText && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {question.helpText}
                            </Typography>
                          )}
                          {/* You may want to pass a renderQuestionPreview prop for preview rendering */}
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Paper>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} size="large">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={saving || !formMeta.name.trim() || formQuestions.length === 0}
          startIcon={saving ? <CircularProgress size={20} /> : <Save />}
          size="large"
          sx={{ px: 4 }}
        >
          {saving ? 'Saving...' : 'Save Questionnaire'}
        </Button>
      </DialogActions>
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}
    </Dialog>
  );
};

export default EditorCreateQuestionnaire;
