import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import api from '../../../api/axios';
import Alert from '../../../components/common/Alert';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Autocomplete from '@mui/material/Autocomplete';

const CATEGORY_OPTIONS = [
  'Identity', 'Education', 'Professional', 'Background Check', 'Training', 'Insurance', 'Visa', 'Citizenship', 'Other'
];

const ACCEPTABLE_FOR_OPTIONS = [
  { value: 'Citizens', label: 'Citizens' },
  { value: 'PermanentResidents', label: 'Permanent Residents' },
  { value: 'AllResidents', label: 'All Residents' },
  { value: 'Foreigners', label: 'Foreigners' },
  { value: 'NZCitizens', label: 'NZ Citizens' }
];

const REQUIRED_FIELDS_ENUM = [
  { value: 'number', label: 'Number' },
  { value: 'issuedDate', label: 'Issued Date' },
  { value: 'expiryDate', label: 'Expiry Date' },
  { value: 'issuer', label: 'Issuer' },
  { value: 'state', label: 'State' },
  { value: 'subclass', label: 'Subclass' },
  { value: 'visaConditions', label: 'Visa Conditions' },
  { value: 'workRights', label: 'Work Rights' },
  { value: 'country', label: 'Country' },
  { value: 'degree', label: 'Degree' },
  { value: 'licenseNo', label: 'Driving License Number ' },
  { value: 'workerScreeningId', label: 'NDIS Worker Screning ID' },
  { value: 'dateOfCompletion', label: 'NDIS Certificate of Completion Completion Date' },
  { value: 'policeRefNo', label: 'Australian Federal Police Reference Id' },

];

const INITIAL_FORM_STATE = {
  name: '',
  requiredFields: [],
  numberPattern: '',
  hasExpiryDate: true,
  defaultExpiryPeriod: '',
  documentRequired: true,
  category: '',
  isVisa: false,
  visaSettings: { 
    subclassOptions: [], 
    requiresWorkRights: true, 
    requiresConditions: true, 
    allowedCountries: [] 
  },
  isEducation: false,
  educationSetting: { degreeOptions: [] },
  isCitizenshipProof: false,
  acceptableFor: 'AllResidents',
  description: '',
  instructions: ''
};

// Modal for Add/Edit Certification Type
function CertificationTypeFormModal({ open, onClose, onSubmit, initialData }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isEdit = Boolean(initialData && initialData._id);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({
        ...INITIAL_FORM_STATE,
        ...initialData,
        visaSettings: initialData?.visaSettings || INITIAL_FORM_STATE.visaSettings,
        educationSetting: initialData?.educationSetting || INITIAL_FORM_STATE.educationSetting,
      });
      setError('');
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNestedChange = (e, parent, key) => {
    const { value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleArrayChange = (e, parent, key) => {
    const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    setForm(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: arr
      }
    }));
  };

  const handleRequiredFieldsCheckbox = (e) => {
    const { value, checked } = e.target;
    setForm(prev => {
      let updatedFields = prev.requiredFields;
      if (checked) {
        updatedFields = [...updatedFields, value];
      } else {
        updatedFields = updatedFields.filter(f => f !== value);
      }
      
      if (prev.isEducation && !updatedFields.includes('degree')) {
        updatedFields = [...updatedFields, 'degree'];
      }
      
      if (!prev.isEducation) {
        updatedFields = updatedFields.filter(f => f !== 'degree');
      }
      
      return { ...prev, requiredFields: Array.from(new Set(updatedFields)) };
    });
  };

  const handleDegreeOptionsChange = (e) => {
    const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    setForm(prev => ({
      ...prev,
      educationSetting: {
        ...prev.educationSetting,
        degreeOptions: arr
      }
    }));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setForm(prev => {
      let newForm = { ...prev, category: value };
      
      if (value !== 'Education') {
        newForm.requiredFields = prev.requiredFields.filter(f => f !== 'degree');
        newForm.educationSetting = { degreeOptions: [] };
        newForm.isEducation = false;
      }
      
      if (value !== 'Visa') {
        newForm.requiredFields = newForm.requiredFields.filter(
          f => !['subclass', 'workRights', 'visaConditions'].includes(f)
        );
        newForm.visaSettings = INITIAL_FORM_STATE.visaSettings;
        newForm.isVisa = false;
      }
      
      return newForm;
    });
  };

  const handleIsEducationChange = (e) => {
    const checked = e.target.checked;
    setForm(prev => {
      let newFields = checked
        ? Array.from(new Set([...prev.requiredFields, 'degree']))
        : prev.requiredFields.filter(f => f !== 'degree');
      
      return {
        ...prev,
        isEducation: checked,
        requiredFields: newFields,
        educationSetting: checked ? prev.educationSetting : { degreeOptions: [] },
      };
    });
  };

  const handleIsVisaChange = (e) => {
    const checked = e.target.checked;
    setForm(prev => {
      let newFields = prev.requiredFields.filter(
        f => !['subclass', 'workRights', 'visaConditions'].includes(f)
      );
      
      if (checked) {
        newFields = Array.from(new Set([...newFields, 'subclass', 'workRights', 'visaConditions']));
      }
      
      return {
        ...prev,
        isVisa: checked,
        requiredFields: newFields,
        visaSettings: checked ? prev.visaSettings : INITIAL_FORM_STATE.visaSettings,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.name || !form.category) {
      setError('Name and Category are required');
      return;
    }
    
    if (form.isEducation && (!form.educationSetting.degreeOptions || form.educationSetting.degreeOptions.length === 0)) {
      setError('Degree options required for education type');
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{isEdit ? 'Edit' : 'Add'} Certification Type</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={form.category}
                  onChange={handleCategoryChange}
                  label="Category"
                >
                  {CATEGORY_OPTIONS.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Required Fields</Typography>
              <FormGroup row>
                {REQUIRED_FIELDS_ENUM.map(opt => (
                  <FormControlLabel
                    key={opt.value}
                    control={
                      <Checkbox
                        checked={form.requiredFields.includes(opt.value)}
                        onChange={handleRequiredFieldsCheckbox}
                        value={opt.value}
                        disabled={form.isEducation && opt.value === 'degree'}
                      />
                    }
                    label={opt.label}
                  />
                ))}
              </FormGroup>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Number Pattern"
                name="numberPattern"
                value={form.numberPattern || ''}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Default Expiry Period (months)"
                name="defaultExpiryPeriod"
                type="number"
                value={form.defaultExpiryPeriod || ''}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  endAdornment: <InputAdornment position="end">months</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="hasExpiryDate"
                    checked={form.hasExpiryDate}
                    onChange={handleChange}
                  />
                }
                label="Has Expiry Date"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="documentRequired"
                    checked={form.documentRequired}
                    onChange={handleChange}
                  />
                }
                label="Document Required"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={form.description || ''}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Instructions"
                name="instructions"
                value={form.instructions || ''}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Acceptable For</InputLabel>
                <Select
                  name="acceptableFor"
                  value={form.acceptableFor}
                  onChange={handleChange}
                  label="Acceptable For"
                >
                  {ACCEPTABLE_FOR_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isCitizenshipProof"
                    checked={form.isCitizenshipProof}
                    onChange={handleChange}
                  />
                }
                label="Is Citizenship Proof?"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isVisa"
                    checked={form.isVisa}
                    onChange={handleIsVisaChange}
                  />
                }
                label="Is Visa?"
              />
            </Grid>
            
            {form.isVisa && (
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Visa Settings</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Subclass Options (comma separated)"
                        value={form.visaSettings.subclassOptions.join(', ')}
                        onChange={e => handleArrayChange(e, 'visaSettings', 'subclassOptions')}
                        margin="normal"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Allowed Countries (comma separated)"
                        value={form.visaSettings.allowedCountries.join(', ')}
                        onChange={e => handleArrayChange(e, 'visaSettings', 'allowedCountries')}
                        margin="normal"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form.visaSettings.requiresWorkRights}
                            onChange={e => handleNestedChange(e, 'visaSettings', 'requiresWorkRights')}
                          />
                        }
                        label="Requires Work Rights"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form.visaSettings.requiresConditions}
                            onChange={e => handleNestedChange(e, 'visaSettings', 'requiresConditions')}
                          />
                        }
                        label="Requires Conditions"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isEducation"
                    checked={form.isEducation}
                    onChange={handleIsEducationChange}
                  />
                }
                label="Is Education?"
              />
            </Grid>
            
            {form.isEducation && (
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Education Settings</Typography>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={form.educationSetting.degreeOptions}
                    onChange={(event, newValue) => {
                      setForm(prev => ({
                        ...prev,
                        educationSetting: {
                          ...prev.educationSetting,
                          degreeOptions: newValue
                        }
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Degree Options"
                        placeholder="Type and press Enter"
                        margin="normal"
                        fullWidth
                      />
                    )}
                  />
                </Paper>
              </Grid>
            )}
            
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={loading}
          >
            {isEdit ? 'Update' : 'Add'}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// Modal for Delete Confirmation
function DeleteConfirmModal({ open, onClose, onConfirm, name }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Certification Type</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete <strong>{name}</strong>?
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={2}>
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <LoadingButton
          onClick={handleConfirm}
          color="error"
          loading={loading}
        >
          Delete
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

// Main Admin Page
export default function CertificationTypes() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/certification/worker');
      setTypes(res.data.data || []);
    } catch (err) {
      setToast({
        open: true,
        message: err.response?.data?.message || 'Failed to fetch certification types',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleAdd = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const handleEdit = (type) => {
    setEditData(type);
    setModalOpen(true);
  };

  const handleDelete = (type) => {
    setDeleteTarget(type);
    setDeleteModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditData(null);
  };

  const handleDeleteClose = () => {
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleFormSubmit = async (form) => {
    try {
      if (editData && editData._id) {
        await api.put(`/certification/worker/${editData._id}`, form);
        setToast({
          open: true,
          message: 'Certification type updated successfully',
          severity: 'success'
        });
      } else {
        await api.post('/certification/worker/seed', form);
        setToast({
          open: true,
          message: 'Certification type added successfully',
          severity: 'success'
        });
      }
      fetchTypes();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/certification/worker/${deleteTarget._id}`);
      setToast({
        open: true,
        message: 'Certification type deleted successfully',
        severity: 'success'
      });
      fetchTypes();
    } catch (err) {
      setToast({
        open: true,
        message: err.response?.data?.message || 'Delete failed',
        severity: 'error'
      });
    }
  };

  const handleToastClose = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Certification Types</Typography>
        <Button variant="contained" onClick={handleAdd} sx={{ minWidth: 200 }}>
          Add Certification Type
        </Button>
      </Box>
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Required Fields</TableCell>
                <TableCell>Visa</TableCell>
                <TableCell>Education</TableCell>
                <TableCell>Citizenship</TableCell>
                <TableCell>Document</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {types.map(type => (
                <TableRow key={type._id} hover>
                  <TableCell>{type.name}</TableCell>
                  <TableCell>{type.category}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(type.requiredFields || []).map(field => (
                        <Chip key={field} label={field} size="small" />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {type.isVisa ? (
                      <Chip label="Yes" color="success" size="small" />
                    ) : (
                      <Chip label="No" color="default" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    {type.isEducation ? (
                      <Chip label="Yes" color="success" size="small" />
                    ) : (
                      <Chip label="No" color="default" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    {type.isCitizenshipProof ? (
                      <Chip label="Yes" color="success" size="small" />
                    ) : (
                      <Chip label="No" color="default" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    {type.documentRequired ? (
                      <Chip label="Required" color="info" size="small" />
                    ) : (
                      <Chip label="Not Required" color="default" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      onClick={() => handleEdit(type)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(type)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {types.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No certification types found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      <CertificationTypeFormModal
        open={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleFormSubmit}
        initialData={editData}
      />
      
      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        name={deleteTarget?.name}
      />
      
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box
          sx={{
            width: '100%',
            p: 2,
            bgcolor:
              toast.severity === 'success'
                ? 'success.main'
                : toast.severity === 'error'
                ? 'error.main'
                : toast.severity === 'warning'
                ? 'warning.main'
                : 'info.main',
            color: 'white',
            borderRadius: 1,
            boxShadow: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="body1" sx={{ flex: 1 }}>
            {toast.message}
          </Typography>
        </Box>
      </Snackbar>
    </Box>
  );
}