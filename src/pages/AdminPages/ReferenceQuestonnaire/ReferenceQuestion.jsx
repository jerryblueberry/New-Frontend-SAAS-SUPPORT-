
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Tooltip,
  CircularProgress,
  Container,
  IconButton,
  Fade,
  Slide,
  useTheme,
  useMediaQuery,
  Avatar,
  Collapse,
  Badge
} from '@mui/material';
import {
  Edit,
  Add,
  Delete,
  DragIndicator,
  KeyboardArrowUp,
  KeyboardArrowDown,
  Preview,
  Quiz,
  Settings,
  CheckCircle,
  RadioButtonUnchecked,
  TextFields,
  Subject,
  Star,
  ExpandMore,
  ExpandLess,
  Save,
  Close,
  Visibility
} from '@mui/icons-material';
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar';
import api from '../../../api/axios';

const QUESTION_TYPES = [
  { value: 'text', label: 'Short Text', icon: <TextFields />, color: '#1976d2' },
  { value: 'textarea', label: 'Long Text', icon: <Subject />, color: '#388e3c' },
  { value: 'yesno', label: 'Yes/No', icon: <CheckCircle />, color: '#f57c00' },
  { value: 'single_choice', label: 'Single Choice', icon: <RadioButtonUnchecked />, color: '#7b1fa2' },
  { value: 'rating', label: 'Rating', icon: <Star />, color: '#d32f2f' }
];

const emptyQuestion = {
  text: '',
  type: 'text',
  required: false,
  placeholder: '',
  helpText: '',
  options: [],
  ratingConfig: { min: 1, max: 5, labels: { min: 'Poor', max: 'Excellent' } },
};

const emptyMeta = {
  name: '',
  description: '',
  version: '1.0.0',
  category: 'reference_check',
};

const ReferenceQuestion = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formMeta, setFormMeta] = useState(emptyMeta);
  const [formQuestions, setFormQuestions] = useState([]);
  const [questionDraft, setQuestionDraft] = useState(emptyQuestion);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showQDialog, setShowQDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  // Fetch the single questionnaire (if any)
  const fetchQuestionnaire = () => {
    setLoading(true);
    api.get('/references/questionnaires/all')
      .then(res => {
        if (Array.isArray(res.data.questionnaires) && res.data.questionnaires.length > 0) {
          setQuestionnaire(res.data.questionnaires[0]);
        } else {
          setQuestionnaire(null);
        }
      })
      .catch(() => setSnackbar({ open: true, message: 'Failed to fetch questionnaire', severity: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchQuestionnaire(); }, []);

  // Open edit/create dialog
  const openEdit = () => {
    if (questionnaire) {
      setFormMeta({
        name: questionnaire.name,
        description: questionnaire.description,
        version: questionnaire.version,
        category: questionnaire.category
      });
      setFormQuestions(questionnaire.questions || []);
    } else {
      setFormMeta(emptyMeta);
      setFormQuestions([]);
    }
    setEditing(true);
    setShowPreview(false);
  };

  // Question dialog handlers
  const openQDialog = (q = emptyQuestion, idx = null) => {
    setQuestionDraft({ ...q });
    setEditingIndex(idx);
    setShowQDialog(true);
  };

  const closeQDialog = () => {
    setShowQDialog(false);
    setQuestionDraft(emptyQuestion);
    setEditingIndex(null);
  };

  const handleDraftChange = (field, value) => {
    setQuestionDraft(q => ({ ...q, [field]: value }));
  };

  const handleOptionChange = (idx, field, value) => {
    setQuestionDraft(q => ({
      ...q,
      options: q.options.map((opt, i) => i === idx ? { ...opt, [field]: value } : opt)
    }));
  };

  const addOption = () => {
    setQuestionDraft(q => ({ ...q, options: [...(q.options || []), { value: '', label: '' }] }));
  };

  const removeOption = idx => {
    setQuestionDraft(q => ({ ...q, options: q.options.filter((_, i) => i !== idx) }));
  };

  const saveQuestion = () => {
    if (!questionDraft.text.trim()) return;
    if (editingIndex !== null) {
      setFormQuestions(qs => qs.map((q, i) => i === editingIndex ? { ...questionDraft, order: i + 1 } : q));
    } else {
      setFormQuestions(qs => [...qs, { ...questionDraft, order: qs.length + 1 }]);
    }
    closeQDialog();
  };

  const editQuestion = idx => openQDialog(formQuestions[idx], idx);
  const deleteQuestion = idx => setFormQuestions(qs => qs.filter((_, i) => i !== idx).map((q, i) => ({ ...q, order: i + 1 })));
  const moveQuestion = (idx, dir) => {
    const newQs = [...formQuestions];
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newQs.length) return;
    [newQs[idx], newQs[swapIdx]] = [newQs[swapIdx], newQs[idx]];
    setFormQuestions(newQs.map((q, i) => ({ ...q, order: i + 1 })));
  };

  // Save questionnaire (create or update)
  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (questionnaire) {
        await api.put(`/references/questionnaires/${questionnaire._id}`, {
          ...formMeta,
          questions: formQuestions
        });
      } else {
        await api.post('/references/questionnaires', {
          ...formMeta,
          questions: formQuestions
        });
      }
      setSnackbar({ open: true, message: 'Questionnaire saved successfully!', severity: 'success' });
      setEditing(false);
      fetchQuestionnaire();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save questionnaire.');
    }
    setSaving(false);
  };

  const getTypeConfig = (type) => {
    return QUESTION_TYPES.find(t => t.value === type) || QUESTION_TYPES[0];
  };

  const toggleQuestionExpansion = (index) => {
    setExpandedQuestions(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const renderQuestionPreview = (question) => {
    const typeConfig = getTypeConfig(question.type);
    
    return (
      <Box sx={{ mt: 2 }}>
        {question.type === 'text' && (
          <TextField
            fullWidth
            disabled
            placeholder={question.placeholder || 'Enter your answer...'}
            variant="outlined"
            size="small"
          />
        )}
        {question.type === 'textarea' && (
          <TextField
            fullWidth
            disabled
            multiline
            rows={3}
            placeholder={question.placeholder || 'Enter your detailed answer...'}
            variant="outlined"
            size="small"
          />
        )}
        {question.type === 'yesno' && (
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Button variant="outlined" disabled color="success">Yes</Button>
            <Button variant="outlined" disabled color="error">No</Button>
          </Stack>
        )}
        {question.type === 'single_choice' && (
          <Stack spacing={1} sx={{ mt: 1 }}>
            {(question.options || []).map((opt, i) => (
              <Button
                key={i}
                variant="outlined"
                disabled
                startIcon={<RadioButtonUnchecked />}
                sx={{ justifyContent: 'flex-start' }}
              >
                {opt.label}
              </Button>
            ))}
          </Stack>
        )}
        {question.type === 'rating' && (
          <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Rating: {question.ratingConfig?.min || 1} - {question.ratingConfig?.max || 5}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {Array.from({ length: (question.ratingConfig?.max || 5) - (question.ratingConfig?.min || 1) + 1 }, (_, i) => (
                <Star key={i} color="disabled" />
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <>
      <WorkerNavbar />
      <Container maxWidth="xl" sx={{ display:'flex',
          justifyContent:'center',
          width:'100%', mt: { xs: 8, sm: 10 }, mb: 4, px: { xs: 2, sm: 3 } }}>
        {/* Header Section */}


        {/* Main Content */}
        <Grid sx={{
         
        }} container spacing={3}>
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                overflow: 'hidden'
              }}
            >
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                  <CircularProgress size={60} />
                </Box>
              ) : questionnaire ? (
                <Fade in={true}>
                  <Box>
                    {/* Questionnaire Header */}
                    <Box
                      sx={{
                        background: 'linear-gradient(135deg,rgb(75, 134, 243) 0%,rgb(42, 241, 89) 100%)',
                        color: 'white',
                        p: 3
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                            {questionnaire.name}
                          </Typography>
                          <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                            {questionnaire.description}
                          </Typography>
                          <Stack direction="row" spacing={2} flexWrap="wrap">
                            <Chip
                              label={`Version ${questionnaire.version}`}
                              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                            />
                            <Chip
                              label={questionnaire.category.replace('_', ' ')}
                              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                            />
                            <Badge badgeContent={questionnaire.questions.length} color="secondary">
                              <Chip
                                icon={<Quiz />}
                                label="Questions"
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                              />
                            </Badge>
                          </Stack>
                        </Box>
                        <Tooltip title="Edit Questionnaire">
                          <IconButton
                            onClick={openEdit}
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.2)',
                              color: 'white',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Questions List */}
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Questions Overview
                      </Typography>
                      <List sx={{ p: 0 }}>
                        {questionnaire.questions.map((question, idx) => {
                          const typeConfig = getTypeConfig(question.type);
                          const isExpanded = expandedQuestions[idx];
                          
                          return (
                            <Card
                              key={idx}
                              sx={{
                                mb: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  borderColor: 'primary.main',
                                  transform: 'translateY(-2px)',
                                  boxShadow: 3
                                }
                              }}
                            >
                              <CardContent sx={{ p: 2 }}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                  <Box display="flex" alignItems="center" flex={1}>
                                    <Avatar
                                      sx={{
                                        bgcolor: typeConfig.color,
                                        width: 40,
                                        height: 40,
                                        mr: 2
                                      }}
                                    >
                                      {typeConfig.icon}
                                    </Avatar>
                                    <Box flex={1}>
                                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
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
                                        {question.helpText && (
                                          <Chip label="Has Help Text" color="info" size="small" />
                                        )}
                                      </Stack>
                                    </Box>
                                  </Box>
                                  <IconButton
                                    onClick={() => toggleQuestionExpansion(idx)}
                                    sx={{ ml: 1 }}
                                  >
                                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                                  </IconButton>
                                </Box>
                                
                                <Collapse in={isExpanded}>
                                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                                    {question.helpText && (
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        <strong>Help Text:</strong> {question.helpText}
                                      </Typography>
                                    )}
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                      <strong>Preview:</strong>
                                    </Typography>
                                    {renderQuestionPreview(question)}
                                  </Box>
                                </Collapse>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </List>
                    </Box>
                  </Box>
                </Fade>
              ) : (
                <Box sx={{ p: 6, textAlign: 'center' }}>
                  <Quiz sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    No Questionnaire Found
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                    Get started by creating your first reference questionnaire. Build comprehensive forms to gather valuable insights about candidates.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Add />}
                    onClick={openEdit}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600
                    }}
                  >
                    Create Questionnaire
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Edit/Create Dialog */}
        <Dialog
          open={editing}
          onClose={() => setEditing(false)}
          maxWidth="xl"
          fullWidth
          fullScreen={isMobile}
          TransitionComponent={Slide}
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
              {questionnaire ? 'Edit Questionnaire' : 'Create New Questionnaire'}
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
              <IconButton onClick={() => setEditing(false)} sx={{ color: 'white' }}>
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
                              {renderQuestionPreview(question)}
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
            <Button onClick={() => setEditing(false)} size="large">
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
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

        {/* Question Dialog */}
        <Dialog
          open={showQDialog}
          onClose={closeQDialog}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {editingIndex !== null ? 'Edit Question' : 'Add New Question'}
            </Typography>
          </DialogTitle>
          
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Question Text"
                fullWidth
                value={questionDraft.text}
                onChange={e => handleDraftChange('text', e.target.value)}
                variant="outlined"
                required
                multiline
                rows={2}
              />
              
              <FormControl fullWidth>
                <InputLabel>Question Type</InputLabel>
                <Select
                  value={questionDraft.type}
                  label="Question Type"
                  onChange={e => handleDraftChange('type', e.target.value)}
                >
                  {QUESTION_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: type.color,
                            width: 24,
                            height: 24,
                            mr: 2
                          }}
                        >
                          {React.cloneElement(type.icon, { fontSize: 'small' })}
                        </Avatar>
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Placeholder Text"
                    fullWidth
                    value={questionDraft.placeholder}
                    onChange={e => handleDraftChange('placeholder', e.target.value)}
                    variant="outlined"
                    helperText="Text shown when field is empty"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={questionDraft.required}
                        onChange={e => handleDraftChange('required', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Required Field"
                  />
                </Grid>
              </Grid>

              <TextField
                label="Help Text"
                fullWidth
                value={questionDraft.helpText}
                onChange={e => handleDraftChange('helpText', e.target.value)}
                variant="outlined"
                multiline
                rows={2}
                helperText="Additional guidance for respondents"
              />

              {/* Options for single choice */}
              {questionDraft.type === 'single_choice' && (
                <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Choice Options
                  </Typography>
                  <Stack spacing={2}>
                    {questionDraft.options.map((option, idx) => (
                      <Card key={idx} sx={{ p: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={5}>
                            <TextField
                              label="Option Label"
                              fullWidth
                              value={option.label}
                              onChange={e => handleOptionChange(idx, 'label', e.target.value)}
                              variant="outlined"
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} md={5}>
                            <TextField
                              label="Option Value"
                              fullWidth
                              value={option.value}
                              onChange={e => handleOptionChange(idx, 'value', e.target.value)}
                              variant="outlined"
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} md={2}>
                            <Tooltip title="Remove Option">
                              <IconButton
                                onClick={() => removeOption(idx)}
                                color="error"
                                size="small"
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </Grid>
                        </Grid>
                      </Card>
                    ))}
                    <Button
                      onClick={addOption}
                      startIcon={<Add />}
                      variant="outlined"
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      Add Option
                    </Button>
                  </Stack>
                </Paper>
              )}

              {/* Rating configuration */}
              {questionDraft.type === 'rating' && (
                <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Rating Configuration
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <TextField
                        label="Minimum"
                        type="number"
                        value={questionDraft.ratingConfig.min}
                        onChange={e => handleDraftChange('ratingConfig', {
                          ...questionDraft.ratingConfig,
                          min: Number(e.target.value)
                        })}
                        variant="outlined"
                        size="small"
                        inputProps={{ min: 1, max: 10 }}
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        label="Maximum"
                        type="number"
                        value={questionDraft.ratingConfig.max}
                        onChange={e => handleDraftChange('ratingConfig', {
                          ...questionDraft.ratingConfig,
                          max: Number(e.target.value)
                        })}
                        variant="outlined"
                        size="small"
                        inputProps={{ min: 1, max: 10 }}
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        label="Min Label"
                        value={questionDraft.ratingConfig.labels.min}
                        onChange={e => handleDraftChange('ratingConfig', {
                          ...questionDraft.ratingConfig,
                          labels: { ...questionDraft.ratingConfig.labels, min: e.target.value }
                        })}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        label="Max Label"
                        value={questionDraft.ratingConfig.labels.max}
                        onChange={e => handleDraftChange('ratingConfig', {
                          ...questionDraft.ratingConfig,
                          labels: { ...questionDraft.ratingConfig.labels, max: e.target.value }
                        })}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {/* Question Preview */}
              <Paper sx={{ p: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                  Question Preview
                </Typography>
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    {questionDraft.text || 'Enter question text above'}
                    {questionDraft.required && (
                      <Typography component="span" color="error">
                        *
                      </Typography>
                    )}
                  </Typography>
                  {questionDraft.helpText && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {questionDraft.helpText}
                    </Typography>
                  )}
                  {renderQuestionPreview(questionDraft)}
                </Box>
              </Paper>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button onClick={closeQDialog} size="large">
              Cancel
            </Button>
            <Button
              onClick={saveQuestion}
              variant="contained"
              disabled={!questionDraft.text.trim()}
              size="large"
              sx={{ px: 4 }}
            >
              {editingIndex !== null ? 'Update Question' : 'Add Question'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            sx={{
              width: '100%',
              borderRadius: 2,
              boxShadow: 3
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default ReferenceQuestion;