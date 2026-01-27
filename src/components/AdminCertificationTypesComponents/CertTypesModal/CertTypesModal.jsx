import React, { useEffect, useState } from 'react';
import {
  alpha,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '../../common/Alert';

// Constants
const CATEGORY_OPTIONS = [
  'Identity',
  'Education',
  'Professional',
  'Background Check',
  'Training',
  'Insurance',
  'Visa',
  'Citizenship',
  'Other',
];

const ACCEPTABLE_FOR_OPTIONS = [
  { value: 'Citizens', label: 'Citizens' },
  { value: 'PermanentResidents', label: 'Permanent Residents' },
  { value: 'AllResidents', label: 'All Residents' },
  { value: 'Foreigners', label: 'Foreigners' },
  { value: 'NZCitizens', label: 'NZ Citizens' },
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
  { value: 'licenseNo', label: 'Driving License Number' },
  { value: 'workerScreeningId', label: 'NDIS Worker Screening ID' },
  { value: 'Insurance Type', label: 'Insurance Type' },
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
    allowedCountries: [],
  },
  isEducation: false,
  educationSetting: { degreeOptions: [] },
  isCitizenshipProof: false,
  acceptableFor: 'AllResidents',
  description: '',
  instructions: '',
  insuranceTypeOptions: [],
};

/**
 * CertificationTypeFormModal Component
 * 
 * A modal dialog for adding or editing certification types with comprehensive form fields
 * including visa settings, education settings, and insurance type options.
 * 
 * @param {boolean} open - Controls the visibility of the modal
 * @param {Function} onClose - Callback function called when modal is closed
 * @param {Function} onSubmit - Callback function called with form data on submit
 * @param {Object} initialData - Initial form data for edit mode (optional)
 * @returns {JSX.Element} CertificationTypeFormModal component
 */
const CertificationTypeFormModal = ({ open, onClose, onSubmit, initialData }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isEdit = Boolean(initialData && initialData._id);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens or initialData changes
  useEffect(() => {
    if (open) {
      setForm({
        ...INITIAL_FORM_STATE,
        ...initialData,
        visaSettings: initialData?.visaSettings || INITIAL_FORM_STATE.visaSettings,
        educationSetting: initialData?.educationSetting || INITIAL_FORM_STATE.educationSetting,
        insuranceTypeOptions: initialData?.insuranceTypeOptions || [],
      });
      setError('');
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNestedChange = (e, parent, key) => {
    const { value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: type === 'checkbox' ? checked : value,
      },
    }));
  };

  const handleArrayChange = (e, parent, key) => {
    const arr = e.target.value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setForm((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: arr,
      },
    }));
  };

  const handleRequiredFieldsCheckbox = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => {
      let updatedFields = prev.requiredFields;
      if (checked) {
        updatedFields = [...updatedFields, value];
      } else {
        updatedFields = updatedFields.filter((f) => f !== value);
      }

      if (prev.isEducation && !updatedFields.includes('degree')) {
        updatedFields = [...updatedFields, 'degree'];
      }

      if (!prev.isEducation) {
        updatedFields = updatedFields.filter((f) => f !== 'degree');
      }

      return { ...prev, requiredFields: Array.from(new Set(updatedFields)) };
    });
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setForm((prev) => {
      let newForm = { ...prev, category: value };

      if (value !== 'Education') {
        newForm.requiredFields = prev.requiredFields.filter((f) => f !== 'degree');
        newForm.educationSetting = { degreeOptions: [] };
        newForm.isEducation = false;
      }

      if (value !== 'Visa') {
        newForm.requiredFields = newForm.requiredFields.filter(
          (f) => !['subclass', 'workRights', 'visaConditions'].includes(f)
        );
        newForm.visaSettings = INITIAL_FORM_STATE.visaSettings;
        newForm.isVisa = false;
      }

      return newForm;
    });
  };

  const handleIsEducationChange = (e) => {
    const checked = e.target.checked;
    setForm((prev) => {
      let newFields = checked
        ? Array.from(new Set([...prev.requiredFields, 'degree']))
        : prev.requiredFields.filter((f) => f !== 'degree');

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
    setForm((prev) => {
      let newFields = prev.requiredFields.filter(
        (f) => !['subclass', 'workRights', 'visaConditions'].includes(f)
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

    if (
      form.isEducation &&
      (!form.educationSetting.degreeOptions || form.educationSetting.degreeOptions.length === 0)
    ) {
      setError('Degree options are optional but recommended for better user experience');
      return;
    }

    if (form.category === 'Insurance' && (!form.insuranceTypeOptions || form.insuranceTypeOptions.length === 0)) {
      setError('At least one Insurance Type Option is required for Insurance category');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ ...form, insuranceTypeOptions: form.insuranceTypeOptions });
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
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 2 },
          maxHeight: { xs: '100vh', sm: '90vh' },
          boxShadow: (t) => `0 8px 32px ${alpha(t.palette.common.black, 0.12)}`,
        },
      }}
    >
      {/* Custom Header with Close Button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
        }}
      >
        <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          {isEdit ? 'Edit' : 'Add'} Certification Type
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              bgcolor: (t) => alpha(t.palette.error.main, 0.08),
              color: 'error.main',
            },
            transition: 'all 0.2s',
          }}
          aria-label="close"
        >
          <Close fontSize="small" />
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit}>
        <DialogContent
          dividers
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 3 },
            '&.MuiDialogContent-dividers': {
              borderTop: 0,
              borderBottom: 0,
            },
          }}
        >
          <Stack spacing={3}>
            {/* Basic Information Section */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required size="small">
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={form.category}
                      onChange={handleCategoryChange}
                      label="Category"
                      sx={{ borderRadius: 1.5 }}
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Required Fields Section */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, color: 'text.primary' }}>
                Required Fields
              </Typography>
              <FormGroup
                row
                sx={{
                  gap: { xs: 0.5, sm: 1 },
                  flexWrap: 'wrap',
                  '& .MuiFormControlLabel-root': {
                    mr: { xs: 0.5, sm: 1 },
                    mb: 0.5,
                  },
                }}
              >
                {REQUIRED_FIELDS_ENUM.map((opt) => (
                  <FormControlLabel
                    key={opt.value}
                    control={
                      <Checkbox
                        checked={form.requiredFields.includes(opt.value)}
                        onChange={handleRequiredFieldsCheckbox}
                        value={opt.value}
                        disabled={form.isEducation && opt.value === 'degree'}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {opt.label}
                      </Typography>
                    }
                  />
                ))}
              </FormGroup>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Configuration Section */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>
                Configuration
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Number Pattern"
                    name="numberPattern"
                    value={form.numberPattern || ''}
                    onChange={handleChange}
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Default Expiry Period"
                    name="defaultExpiryPeriod"
                    type="number"
                    value={form.defaultExpiryPeriod || ''}
                    onChange={handleChange}
                    size="small"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">months</InputAdornment>,
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox name="hasExpiryDate" checked={form.hasExpiryDate} onChange={handleChange} size="small" />
                    }
                    label={<Typography variant="body2">Has Expiry Date</Typography>}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="documentRequired"
                        checked={form.documentRequired}
                        onChange={handleChange}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">Document Required</Typography>}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Acceptable For</InputLabel>
                    <Select
                      name="acceptableFor"
                      value={form.acceptableFor}
                      onChange={handleChange}
                      label="Acceptable For"
                      sx={{ borderRadius: 1.5 }}
                    >
                      {ACCEPTABLE_FOR_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
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
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">Is Citizenship Proof?</Typography>}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Description & Instructions */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>
                Additional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={form.description || ''}
                    onChange={handleChange}
                    size="small"
                    multiline
                    rows={2}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Instructions"
                    name="instructions"
                    value={form.instructions || ''}
                    onChange={handleChange}
                    size="small"
                    multiline
                    rows={2}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Special Types Section */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>
                Special Types
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <FormControlLabel
                  control={<Checkbox name="isVisa" checked={form.isVisa} onChange={handleIsVisaChange} size="small" />}
                  label={<Typography variant="body2">Is Visa?</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox name="isEducation" checked={form.isEducation} onChange={handleIsEducationChange} size="small" />
                  }
                  label={<Typography variant="body2">Is Education?</Typography>}
                />
              </Stack>
            </Box>

            {/* Visa Settings */}
            {form.isVisa && (
              <Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
                    border: 1,
                    borderColor: (t) => alpha(t.palette.primary.main, 0.2),
                    borderRadius: 2,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <Chip label="Visa" size="small" color="primary" sx={{ fontWeight: 600 }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Visa Settings
                    </Typography>
                  </Stack>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Subclass Options"
                        placeholder="Comma separated (e.g., 482, 189)"
                        value={form.visaSettings.subclassOptions.join(', ')}
                        onChange={(e) => handleArrayChange(e, 'visaSettings', 'subclassOptions')}
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Allowed Countries"
                        placeholder="Comma separated (e.g., Australia, New Zealand)"
                        value={form.visaSettings.allowedCountries.join(', ')}
                        onChange={(e) => handleArrayChange(e, 'visaSettings', 'allowedCountries')}
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form.visaSettings.requiresWorkRights}
                            onChange={(e) => handleNestedChange(e, 'visaSettings', 'requiresWorkRights')}
                            size="small"
                          />
                        }
                        label={<Typography variant="body2">Requires Work Rights</Typography>}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form.visaSettings.requiresConditions}
                            onChange={(e) => handleNestedChange(e, 'visaSettings', 'requiresConditions')}
                            size="small"
                          />
                        }
                        label={<Typography variant="body2">Requires Conditions</Typography>}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            )}

            {/* Education Settings */}
            {form.isEducation && (
              <Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    bgcolor: (t) => alpha(t.palette.success.main, 0.04),
                    border: 1,
                    borderColor: (t) => alpha(t.palette.success.main, 0.2),
                    borderRadius: 2,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <Chip label="Education" size="small" color="success" sx={{ fontWeight: 600 }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Education Settings
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8125rem' }}>
                    Add common degree options for better user experience. Users can still add custom degrees not in this
                    list.
                  </Typography>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={form.educationSetting.degreeOptions}
                    onChange={(event, newValue) => {
                      setForm((prev) => ({
                        ...prev,
                        educationSetting: {
                          ...prev.educationSetting,
                          degreeOptions: newValue,
                        },
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Degree Options (Optional)"
                        placeholder="Type and press Enter to add common degrees"
                        size="small"
                        fullWidth
                        helperText="These are suggested options. Users can add custom degrees."
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                      />
                    )}
                  />
                </Paper>
              </Box>
            )}

            {/* Insurance Settings */}
            {form.category === 'Insurance' && (
              <Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    bgcolor: (t) => alpha(t.palette.info.main, 0.04),
                    border: 1,
                    borderColor: (t) => alpha(t.palette.info.main, 0.2),
                    borderRadius: 2,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <Chip label="Insurance" size="small" color="info" sx={{ fontWeight: 600 }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Insurance Type Settings
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8125rem' }}>
                    Add all allowed insurance types for this certification. Users can still add custom types.
                  </Typography>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={form.insuranceTypeOptions}
                    onChange={(event, newValue) => {
                      setForm((prev) => ({
                        ...prev,
                        insuranceTypeOptions: newValue,
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Insurance Type Options"
                        placeholder="Type and press Enter to add"
                        size="small"
                        fullWidth
                        helperText="Add all allowed insurance types for this certification"
                        required={form.category === 'Insurance'}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                      />
                    )}
                  />
                </Paper>
              </Box>
            )}

            {/* Error Alert */}
            {error && (
              <Box>
                <Alert severity="error">{error}</Alert>
              </Box>
            )}
          </Stack>
        </DialogContent>

        {/* Actions Footer */}
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: (t) => alpha(t.palette.grey[500], 0.02),
            gap: 1.5,
          }}
        >
          <Button
            onClick={onClose}
            disabled={loading}
            variant="outlined"
            sx={{
              minWidth: { xs: 80, sm: 100 },
              textTransform: 'none',
              borderRadius: 1.5,
              px: 2.5,
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={loading}
            sx={{
              minWidth: { xs: 100, sm: 120 },
              textTransform: 'none',
              borderRadius: 1.5,
              px: 3,
              fontWeight: 600,
              boxShadow: (t) => `0 2px 8px ${alpha(t.palette.primary.main, 0.3)}`,
              '&:hover': {
                boxShadow: (t) => `0 4px 12px ${alpha(t.palette.primary.main, 0.4)}`,
              },
            }}
          >
            {isEdit ? 'Update' : 'Add'}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CertificationTypeFormModal;
