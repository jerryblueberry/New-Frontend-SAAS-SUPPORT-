import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Stack,
  List,
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
  useTheme,
  useMediaQuery,
  Avatar,
  Collapse,
  Badge,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Edit,
  Add,
  Delete,
  KeyboardArrowUp,
  KeyboardArrowDown,
  Quiz,
  CheckCircle,
  RadioButtonUnchecked,
  TextFields,
  Subject,
  Star,
  ExpandMore,
  ExpandLess,
  Home,
  LibraryBooks
} from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar';
import AdminSidebar from '../../../components/adminSidebar/AdminSidebar';
import EditorCreateQuestionnaire from '../../../components/AdminQuestionnaire/EditorCreateQuestionnaire';
import api from '../../../api/axios';
import { Helmet } from 'react-helmet';

// Constants
const QUESTION_TYPES = [
  { value: 'text', label: 'Short Text', icon: <TextFields />, color: '#1976d2' },
  { value: 'textarea', label: 'Long Text', icon: <Subject />, color: '#388e3c' },
  { value: 'yesno', label: 'Yes/No', icon: <CheckCircle />, color: '#f57c00' },
  { value: 'single_choice', label: 'Single Choice', icon: <RadioButtonUnchecked />, color: '#7b1fa2' },
  { value: 'rating', label: 'Rating', icon: <Star />, color: '#d32f2f' }
];

const EMPTY_QUESTION = {
  text: '',
  type: 'text',
  required: false,
  placeholder: '',
  helpText: '',
  options: [],
  ratingConfig: { min: 1, max: 5, labels: { min: 'Poor', max: 'Excellent' } },
};

const EMPTY_META = {
  name: '',
  description: '',
  version: '1.0.0',
  category: 'reference_check',
};

const SIDEBAR_WIDTH = 280;
const SIDEBAR_GAP = 8;

const ReferenceQuestion = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formMeta, setFormMeta] = useState(EMPTY_META);
  const [formQuestions, setFormQuestions] = useState([]);
  const [questionDraft, setQuestionDraft] = useState(EMPTY_QUESTION);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showQDialog, setShowQDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  // Memoized fetch function
  const fetchQuestionnaire = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/references/questionnaires/all');
      if (Array.isArray(res.data.questionnaires) && res.data.questionnaires.length > 0) {
        setQuestionnaire(res.data.questionnaires[0]);
      } else {
        setQuestionnaire(null);
      }
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to fetch questionnaire. Please try again later.', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchQuestionnaire(); 
  }, [fetchQuestionnaire]);

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
      setFormMeta(EMPTY_META);
      setFormQuestions([]);
    }
    setEditing(true);
    setShowPreview(false);
  };

  // Question dialog handlers
  const openQDialog = (q = EMPTY_QUESTION, idx = null) => {
    setQuestionDraft({ ...q });
    setEditingIndex(idx);
    setShowQDialog(true);
  };

  const closeQDialog = () => {
    setShowQDialog(false);
    setQuestionDraft(EMPTY_QUESTION);
    setEditingIndex(null);
  };

  const handleDraftChange = (field, value) => {
    setQuestionDraft(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (idx, field, value) => {
    setQuestionDraft(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === idx ? { ...opt, [field]: value } : opt)
    }));
  };

  const addOption = () => {
    setQuestionDraft(prev => ({ 
      ...prev, 
      options: [...(prev.options || []), { value: '', label: '' }] 
    }));
  };

  const removeOption = idx => {
    setQuestionDraft(prev => ({ 
      ...prev, 
      options: prev.options.filter((_, i) => i !== idx) 
    }));
  };

  const saveQuestion = () => {
    if (!questionDraft.text.trim()) {
      setSnackbar({
        open: true,
        message: 'Question text is required',
        severity: 'error'
      });
      return;
    }
    
    if (editingIndex !== null) {
      setFormQuestions(prev => 
        prev.map((q, i) => i === editingIndex ? { ...questionDraft, order: i + 1 } : q)
      );
    } else {
      setFormQuestions(prev => [...prev, { ...questionDraft, order: prev.length + 1 }]);
    }
    closeQDialog();
  };

  const editQuestion = idx => openQDialog(formQuestions[idx], idx);
  
  const deleteQuestion = idx => {
    setFormQuestions(prev => 
      prev.filter((_, i) => i !== idx).map((q, i) => ({ ...q, order: i + 1 }))
    );
  };
  
  const moveQuestion = (idx, dir) => {
    const newQs = [...formQuestions];
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newQs.length) return;
    [newQs[idx], newQs[swapIdx]] = [newQs[swapIdx], newQs[idx]];
    setFormQuestions(newQs.map((q, i) => ({ ...q, order: i + 1 })));
  };

  // Save questionnaire (create or update)
  const handleSave = async () => {
    if (!formMeta.name.trim()) {
      setError('Questionnaire name is required');
      return;
    }
    
    if (formQuestions.length === 0) {
      setError('At least one question is required');
      return;
    }

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
      setSnackbar({ 
        open: true, 
        message: 'Questionnaire saved successfully!', 
        severity: 'success' 
      });
      setEditing(false);
      fetchQuestionnaire();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save questionnaire. Please try again.');
    } finally {
      setSaving(false);
    }
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
      <Helmet>
        <title>Reference Questionnaire | Admin Portal</title>
      </Helmet>
      
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
            p: { xs: 2, sm: 3 },
            mt: { xs: 8, md: 3 },
            minHeight: '100vh',
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Container 
            maxWidth="xl" 
            sx={{ 
              width: '100%', 
              mt: { xs: 2, sm: 3 }, 
              mb: 4,
              px: { xs: 0, sm: 2 }
            }}
          >
            {/* Breadcrumb Navigation */}
            <Box sx={{ mb: 3 }}>
              <Breadcrumbs aria-label="breadcrumb">
                <Link 
                  color="inherit" 
                  href="/dashboard" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/dashboard');
                  }}
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <Home sx={{ mr: 0.5 }} fontSize="inherit" />
                  Dashboard
                </Link>
                
                <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Quiz sx={{ mr: 0.5 }} fontSize="inherit" />
                  Questionnaire
                </Typography>
              </Breadcrumbs>
            </Box>

            {/* Main Content */}
            <Paper
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: theme.shadows[1]
              }}
            >
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                  <CircularProgress size={60} />
                </Box>
              ) : questionnaire ? (
                <Fade in={!loading}>
                  <Box>
                    {/* Questionnaire Header */}
                    <Box
                      sx={{
                        background: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        p: 3,
                        backgroundImage: 'linear-gradient(135deg, rgba(0, 123, 255, 0.9) 0%, rgba(0, 86, 179, 0.9) 100%)'
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            {questionnaire.name}
                          </Typography>
                          <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                            {questionnaire.description}
                          </Typography>
                          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                            <Chip
                              label={`Version ${questionnaire.version}`}
                              sx={{ 
                                bgcolor: 'rgba(255,255,255,0.2)', 
                                color: 'white',
                                fontWeight: 500
                              }}
                            />
                            <Chip
                              label={questionnaire.category.replace('_', ' ')}
                              sx={{ 
                                bgcolor: 'rgba(255,255,255,0.2)', 
                                color: 'white',
                                fontWeight: 500
                              }}
                            />
                            <Badge 
                              badgeContent={questionnaire.questions.length} 
                              color="secondary"
                              sx={{
                                '& .MuiBadge-badge': {
                                  right: -5,
                                  top: -5,
                                  fontWeight: 600
                                }
                              }}
                            >
                              <Chip
                                icon={<Quiz fontSize="small" />}
                                label="Questions"
                                sx={{ 
                                  bgcolor: 'rgba(255,255,255,0.2)', 
                                  color: 'white',
                                  fontWeight: 500
                                }}
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
                              '&:hover': { 
                                bgcolor: 'rgba(255,255,255,0.3)',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Questions List */}
                    <Box sx={{ p: { xs: 2, sm: 3 } }}>
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
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: theme.palette.primary.main,
                                  transform: 'translateY(-2px)',
                                  boxShadow: theme.shadows[4]
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
                                        mr: 2,
                                        color: 'white'
                                      }}
                                    >
                                      {typeConfig.icon}
                                    </Avatar>
                                    <Box flex={1}>
                                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                        {idx + 1}. {question.text}
                                      </Typography>
                                      <Stack 
                                        direction="row" 
                                        spacing={1} 
                                        alignItems="center"
                                        flexWrap="wrap"
                                        useFlexGap
                                      >
                                        <Chip
                                          label={typeConfig.label}
                                          size="small"
                                          sx={{ 
                                            bgcolor: typeConfig.color, 
                                            color: 'white',
                                            fontWeight: 500
                                          }}
                                        />
                                        {question.required && (
                                          <Chip 
                                            label="Required" 
                                            color="error" 
                                            size="small" 
                                            sx={{ fontWeight: 500 }}
                                          />
                                        )}
                                        {question.helpText && (
                                          <Chip 
                                            label="Has Help Text" 
                                            color="info" 
                                            size="small" 
                                            sx={{ fontWeight: 500 }}
                                          />
                                        )}
                                      </Stack>
                                    </Box>
                                  </Box>
                                  <IconButton
                                    onClick={() => toggleQuestionExpansion(idx)}
                                    sx={{ 
                                      ml: 1,
                                      '&:hover': {
                                        bgcolor: 'transparent',
                                        color: theme.palette.primary.main
                                      }
                                    }}
                                  >
                                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                                  </IconButton>
                                </Box>
                                
                                <Collapse in={isExpanded}>
                                  <Box sx={{ 
                                    mt: 2, 
                                    pt: 2, 
                                    borderTop: '1px solid', 
                                    borderColor: 'divider' 
                                  }}>
                                    {question.helpText && (
                                      <Typography 
                                        variant="body2" 
                                        color="text.secondary" 
                                        sx={{ mb: 2 }}
                                      >
                                        <strong>Help Text:</strong> {question.helpText}
                                      </Typography>
                                    )}
                                    <Typography 
                                      variant="body2" 
                                      color="text.secondary" 
                                      sx={{ mb: 2, fontWeight: 500 }}
                                    >
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
                <Box sx={{ 
                  p: { xs: 4, sm: 6 }, 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <Quiz sx={{ 
                    fontSize: 80, 
                    color: 'text.secondary', 
                    mb: 2,
                    opacity: 0.8
                  }} />
                  <Typography variant="h5" sx={{ 
                    mb: 2, 
                    fontWeight: 600,
                    color: theme.palette.text.primary
                  }}>
                    No Questionnaire Found
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    mb: 3, 
                    maxWidth: 500,
                    mx: 'auto',
                    color: theme.palette.text.secondary
                  }}>
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
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: theme.shadows[2],
                      '&:hover': {
                        boxShadow: theme.shadows[4],
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Create Questionnaire
                  </Button>
                </Box>
              )}
            </Paper>

            {/* Edit/Create Dialog */}
            <EditorCreateQuestionnaire
              open={editing}
              onClose={() => setEditing(false)}
              onSave={handleSave}
              formMeta={formMeta}
              setFormMeta={setFormMeta}
              formQuestions={formQuestions}
              setFormQuestions={setFormQuestions}
              openQDialog={openQDialog}
              editQuestion={editQuestion}
              deleteQuestion={deleteQuestion}
              moveQuestion={moveQuestion}
              showPreview={showPreview}
              setShowPreview={setShowPreview}
              isMobile={isMobile}
              saving={saving}
              error={error}
              QUESTION_TYPES={QUESTION_TYPES}
              getTypeConfig={getTypeConfig}
              theme={theme}
            />

            {/* Question Dialog */}
            <Dialog
              open={showQDialog}
              onClose={closeQDialog}
              maxWidth="md"
              fullWidth
              fullScreen={isMobile}
              PaperProps={{
                sx: {
                  borderRadius: isMobile ? 0 : 3
                }
              }}
            >
              <DialogTitle sx={{ 
                pb: 1,
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {editingIndex !== null ? 'Edit Question' : 'Add New Question'}
                </Typography>
              </DialogTitle>
              
              <DialogContent sx={{ p: 3 }}>
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                  
                  <FormControl fullWidth>
                    <InputLabel>Question Type</InputLabel>
                    <Select
                      value={questionDraft.type}
                      label="Question Type"
                      onChange={e => handleDraftChange('type', e.target.value)}
                      sx={{
                        borderRadius: 2,
                        '& .MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'center'
                        }
                      }}
                    >
                      {QUESTION_TYPES.map(type => (
                        <MenuItem key={type.value} value={type.value}>
                          <Box display="flex" alignItems="center">
                            <Avatar
                              sx={{
                                bgcolor: type.color,
                                width: 24,
                                height: 24,
                                mr: 2,
                                color: 'white'
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
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
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
                        sx={{
                          '& .MuiFormControlLabel-label': {
                            fontWeight: 500
                          }
                        }}
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />

                  {/* Options for single choice */}
                  {questionDraft.type === 'single_choice' && (
                    <Paper sx={{ 
                      p: 3, 
                      bgcolor: 'grey.50',
                      borderRadius: 2
                    }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Choice Options
                      </Typography>
                      <Stack spacing={2}>
                        {questionDraft.options.map((option, idx) => (
                          <Card 
                            key={idx} 
                            sx={{ 
                              p: 2,
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'divider'
                            }}
                          >
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} md={5}>
                                <TextField
                                  label="Option Label"
                                  fullWidth
                                  value={option.label}
                                  onChange={e => handleOptionChange(idx, 'label', e.target.value)}
                                  variant="outlined"
                                  size="small"
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2
                                    }
                                  }}
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
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2
                                    }
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} md={2}>
                                <Tooltip title="Remove Option">
                                  <IconButton
                                    onClick={() => removeOption(idx)}
                                    color="error"
                                    size="small"
                                    sx={{
                                      '&:hover': {
                                        bgcolor: theme.palette.error.light,
                                        color: theme.palette.error.contrastText
                                      }
                                    }}
                                  >
                                    <Delete fontSize="small" />
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
                          sx={{ 
                            alignSelf: 'flex-start',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 500
                          }}
                        >
                          Add Option
                        </Button>
                      </Stack>
                    </Paper>
                  )}

                  {/* Rating configuration */}
                  {questionDraft.type === 'rating' && (
                    <Paper sx={{ 
                      p: 3, 
                      bgcolor: 'grey.50',
                      borderRadius: 2
                    }}>
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
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2
                              }
                            }}
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
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2
                              }
                            }}
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
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2
                              }
                            }}
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
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  )}

                  {/* Question Preview */}
                  <Paper sx={{ 
                    p: 3, 
                    bgcolor: 'primary.50', 
                    border: '1px solid', 
                    borderColor: 'primary.200',
                    borderRadius: 2
                  }}>
                    <Typography variant="h6" sx={{ 
                      mb: 2, 
                      fontWeight: 600, 
                      color: 'primary.main' 
                    }}>
                      Question Preview
                    </Typography>
                    <Box>
                      <Typography variant="subtitle1" sx={{ 
                        mb: 1, 
                        fontWeight: 600 
                      }}>
                        {questionDraft.text || 'Enter question text above'}
                        {questionDraft.required && (
                          <Typography component="span" color="error">
                            *
                          </Typography>
                        )}
                      </Typography>
                      {questionDraft.helpText && (
                        <Typography variant="body2" sx={{ 
                          mb: 1,
                          color: theme.palette.text.secondary
                        }}>
                          {questionDraft.helpText}
                        </Typography>
                      )}
                      {renderQuestionPreview(questionDraft)}
                    </Box>
                  </Paper>
                </Stack>
              </DialogContent>

              <DialogActions sx={{ 
                p: 3, 
                borderTop: '1px solid', 
                borderColor: 'divider' 
              }}>
                <Button 
                  onClick={closeQDialog} 
                  size="large"
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    fontWeight: 500,
                    textTransform: 'none'
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveQuestion}
                  variant="contained"
                  disabled={!questionDraft.text.trim()}
                  size="large"
                  sx={{ 
                    px: 4,
                    borderRadius: 2,
                    fontWeight: 500,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: theme.shadows[2]
                    }
                  }}
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
                  boxShadow: theme.shadows[3],
                  alignItems: 'center'
                }}
                variant="filled"
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default ReferenceQuestion;