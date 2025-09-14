import React, { useMemo, useState } from 'react';
import { Drawer, Box, Typography, IconButton, Button, TextField, Grid, Select, MenuItem, Chip, Stack, FormControl, InputLabel, Checkbox, FormControlLabel, Divider } from '@mui/material';
import Close from '@mui/icons-material/Close';
import EventNoteIcon from '@mui/icons-material/EventNote';
import dayjs from 'dayjs';
import RichTextEditor from '../../common/RichTextEditor';
import TimesheetProgressNote from './TimesheetProgressNote';

const AddProgressNoteDrawer = ({ open, onClose, selectedTimesheet,timesheet }) => {
  const categoryOptions = useMemo(() => ([
    { value: 'daily_activities', label: 'Daily Activities' },
    { value: 'behavioral_observations', label: 'Behavioral Observations' },
    { value: 'medical_notes', label: 'Medical Notes' },
    { value: 'goals_progress', label: 'Goals Progress' },
    { value: 'incidents', label: 'Incidents' },
    { value: 'medications', label: 'Medications' },
    { value: 'appointments', label: 'Appointments' },
    { value: 'other', label: 'Other' }
  ]), []);

  const priorityOptions = ['low', 'medium', 'high', 'urgent'];
  const confidentialityOptions = ['public', 'internal', 'restricted', 'confidential'];
  const incidentSeverityOptions = ['low', 'medium', 'high', 'critical'];

  console.log("Timesheet2",timesheet?._id)
  const memoizedTimesheet = useMemo(() => timesheet, [timesheet?._id]);


  const [form, setForm] = useState({
    title: '',
    content: '',
    clientName: selectedTimesheet?.clientName || '',
    category: 'daily_activities',
    priority: 'medium',
    confidentialityLevel: 'internal',
    tags: [],
    structuredData: {
      behaviors: [],
      goals: [],
      incident: {
        incidentType: '',
        severity: 'low',
        witnesses: [],
        actionsTaken: [],
        followUpRequired: false
      },
      medical: {
        vitalSigns: {
          temperature: '',
          bloodPressure: '',
          heartRate: '',
          respiratoryRate: ''
        },
        symptoms: [],
        medications: [],
        concerns: []
      }
    },
    customFields: [],
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (path, value) => {
    setForm(prev => {
      const clone = { ...prev };
      const keys = path.split('.');
      let cursor = clone;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        cursor[k] = { ...cursor[k] };
        cursor = cursor[k];
      }
      cursor[keys[keys.length - 1]] = value;
      return clone;
    });
  };

  const pushArrayItem = (path, item) => {
    setForm(prev => {
      const clone = { ...prev };
      const keys = path.split('.');
      let cursor = clone;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        cursor[k] = Array.isArray(cursor[k]) ? [...cursor[k]] : { ...cursor[k] };
        cursor = cursor[k];
      }
      const lastKey = keys[keys.length - 1];
      const arr = Array.isArray(cursor[lastKey]) ? [...cursor[lastKey]] : [];
      arr.push(item);
      cursor[lastKey] = arr;
      return clone;
    });
  };

  const removeArrayItem = (path, index) => {
    setForm(prev => {
      const clone = { ...prev };
      const keys = path.split('.');
      let cursor = clone;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        cursor[k] = Array.isArray(cursor[k]) ? [...cursor[k]] : { ...cursor[k] };
        cursor = cursor[k];
      }
      const lastKey = keys[keys.length - 1];
      const arr = Array.isArray(cursor[lastKey]) ? [...cursor[lastKey]] : [];
      arr.splice(index, 1);
      cursor[lastKey] = arr;
      return clone;
    });
  };

  const validate = () => {
    const e = {};
    if (!form.title?.trim()) e.title = 'Title is required';
    if (!form.content?.trim()) e.content = 'Content is required';
    if (!form.category) e.category = 'Category is required';
    if (form.tags?.some(t => t.length > 50)) e.tags = 'Each tag must be ≤ 50 chars';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (status = 'draft') => {
    if (!validate()) return;
    const payload = {
      ...form,
      status,
      timesheetId: selectedTimesheet?._id,
      clientName: form.clientName || selectedTimesheet?.clientName || undefined,
    };
    if (status === 'draft' && typeof onSaveDraft === 'function') onSaveDraft(payload);
    if (status === 'submitted' && typeof onSubmit === 'function') onSubmit(payload);
    onClose?.();
  };
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 650, md: 800 },
          maxWidth: '100%',
          height: '100vh',
          borderTopLeftRadius: { xs: 0, sm: 10 },
          borderBottomLeftRadius: { xs: 0, sm: 10 }
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ ml:{xs:'3.5rem',sm:0,md:0},mt:{xs:1.4,md:1},p: {xs:1,md:2}, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          
            <EventNoteIcon sx={{ display: { xs: 'none', md: 'flex' }, }} color="primary" />
            <Typography variant="h6" fontWeight={600} sx={{
                fontSize:{xs:'0.85rem',md:'1rem'},
            }}>Add Progress Note</Typography>
          </Box>
        
          <IconButton sx={{ cursor: 'pointer' }} onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
        <Box sx={{ p: { xs: 1.5, md: 2 }, overflow: 'auto', flex: 1 }}>
          {selectedTimesheet && (
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              For {selectedTimesheet.clientName} • {dayjs(selectedTimesheet.clockIn).format('MMM D, YYYY')}
            </Typography>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Title"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                fullWidth
                error={Boolean(errors.title)}
                helperText={errors.title}
              />
            </Grid>
            {/* <Grid item xs={12} sm={4}>
              <TextField
                label="Client Name (optional)"
                value={form.clientName}
                onChange={(e) => handleChange('clientName', e.target.value)}
                fullWidth
              />
            </Grid> */}

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  label="Category"
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  error={Boolean(errors.category)}
                >
                  {categoryOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  label="Priority"
                  value={form.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                >
                  {priorityOptions.map(p => (<MenuItem key={p} value={p}>{p}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Confidentiality</InputLabel>
                <Select
                  label="Confidentiality"
                  value={form.confidentialityLevel}
                  onChange={(e) => handleChange('confidentialityLevel', e.target.value)}
                >
                  {confidentialityOptions.map(c => (<MenuItem key={c} value={c}>{c}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Content</Typography>
              <RichTextEditor
                value={form.content}
                onChange={(html) => handleChange('content', html)}
                placeholder="Write progress details..."
                minHeight={200}
              />
              {errors.content && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>{errors.content}</Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
                {form.tags.map((tag, idx) => (
                  <Chip key={`${tag}-${idx}`} label={tag} onDelete={() => removeArrayItem('tags', idx)} />
                ))}
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <TextField
                  size="small"
                  label="New tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  error={Boolean(errors.tags)}
                  helperText={errors.tags}
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    const trimmed = newTag.trim();
                    if (!trimmed) return;
                    pushArrayItem('tags', trimmed);
                    setNewTag('');
                  }}
                >Add Tag</Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
          <Stack direction="row" spacing={1}>
            <Chip size="small" label={`Category: ${form.category}`} />
            <Chip size="small" label={`Priority: ${form.priority}`} />
            <Chip size="small" label={`Confidentiality: ${form.confidentialityLevel}`} />
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="outlined" onClick={() => handleSave('draft')}>Save Draft</Button>
            <Button variant="contained" onClick={() => handleSave('submitted')}>Submit</Button>
          </Stack>
        </Box>
        <Box sx={{
          p:2
        }}>
          {/* <TimesheetProgressNote timesheet={memoizedTimesheet} /> */}

        </Box>
      </Box>
     
    </Drawer>
  );
};

export default AddProgressNoteDrawer;