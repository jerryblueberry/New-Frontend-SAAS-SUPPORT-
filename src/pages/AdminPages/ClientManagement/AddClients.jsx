import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ArrowBack, Person, Business, Email, Phone, Home, LocalHospital } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import api from '../../../api/axios';
import Alert from '../../../components/common/Alert';
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar';
import AdminSidebar from '../../../components/adminSidebar/AdminSidebar';

const SIDEBAR_WIDTH = 260;
const NAVBAR_TOP = 64;

// Australian states
const AUSTRALIAN_STATES = [
  'NSW',
  'VIC',
  'QLD',
  'WA',
  'SA',
  'TAS',
  'ACT',
  'NT',
];

const INITIAL_FORM_STATE = {
  // User Account Fields
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  phone: '',

  // Profile Fields
  accountType: 'individual',
  organizationName: '',
  abn: '',
  ndisNumber: '',

  // Address Fields
  address: {
    street: '',
    suburb: '',
    state: '',
    postcode: '',
  },

  // Emergency Contact (Optional)
  emergencyContact: {
    name: '',
    relationship: '',
    phone: '',
  },
};

export default function AddClients() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const handleEmergencyContactChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [name]: value,
      },
    }));
  };

  const handleAccountTypeChange = (e) => {
    const accountType = e.target.value;
    setForm((prev) => ({
      ...prev,
      accountType,
      // Clear organization fields when switching to individual
      ...(accountType === 'individual' && {
        organizationName: '',
        abn: '',
      }),
    }));
  };

  const validateForm = () => {
    setError('');

    // User account validation
    if (!form.email || !form.email.trim()) {
      setError('Email is required');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!form.password || form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!form.firstName || !form.firstName.trim()) {
      setError('First name is required');
      return false;
    }

    if (!form.lastName || !form.lastName.trim()) {
      setError('Last name is required');
      return false;
    }

    // Profile validation
    if (!form.accountType) {
      setError('Account type is required');
      return false;
    }

    // Organization-specific validation
    if (form.accountType === 'organization') {
      if (!form.organizationName || !form.organizationName.trim()) {
        setError('Organization name is required');
        return false;
      }
      if (!form.abn || !form.abn.trim()) {
        setError('ABN is required for organization accounts');
        return false;
      }
    }

    // Address validation
    if (!form.address.suburb || !form.address.suburb.trim()) {
      setError('Suburb is required');
      return false;
    }

    if (!form.address.state || !form.address.state.trim()) {
      setError('State is required');
      return false;
    }

    if (!form.address.postcode || !form.address.postcode.trim()) {
      setError('Postcode is required');
      return false;
    }

    if (!/^\d{4}$/.test(form.address.postcode)) {
      setError('Postcode must be 4 digits');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create user account
      const userPayload = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone ? form.phone.trim() : undefined,
        role: 'client',
        termsAndConditionsAccepted: true, // Admin creating on behalf
      };

      const userResponse = await api.post('/auth/client/register', userPayload);
      const userId = userResponse.data?.data?.user?._id || userResponse.data?.user?._id;

      if (!userId) {
        throw new Error('User creation failed - no user ID returned');
      }

      // Step 2: Create client profile with basic information
      // Note: Profile creation typically requires the user to be authenticated
      // For admin-created clients, the profile will be created when the user first logs in
      // Or backend can be extended to support admin profile creation
      
      setSuccess(
        `Client account created successfully! ${
          form.accountType === 'individual'
            ? `${form.firstName} ${form.lastName}`
            : form.organizationName
        } can now log in to complete their profile.`
      );
      
      // Reset form
      setForm(INITIAL_FORM_STATE);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin/clients');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <WorkerNavbar />
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        {/* Sidebar */}
        <Box
          sx={{
            width: { xs: 0, md: SIDEBAR_WIDTH },
            flexShrink: 0,
            zIndex: theme.zIndex.drawer,
            position: 'fixed',
            top: { xs: 56, md: NAVBAR_TOP },
            left: 0,
            height: `calc(100vh - ${NAVBAR_TOP}px)`,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <AdminSidebar topOffset={NAVBAR_TOP} navigate={navigate} />
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            ml: { md: `${SIDEBAR_WIDTH}px` },
            mt: { xs: 8, md: 10 },
            minHeight: '100vh',
            p: { xs: 2, sm: 2.5, md: 3 },
            transition: theme.transitions.create(['margin', 'padding'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Container
            maxWidth="lg"
            disableGutters
            sx={{
              py: { xs: 1, sm: 1.5, md: 2 },
              px: { xs: 0, sm: 1.5, md: 2 },
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: { xs: 2, sm: 2.5, md: 3 },
                flexWrap: 'wrap',
              }}
            >
              <IconButton
                onClick={() => navigate('/admin/clients')}
                sx={{
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                  '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.12) },
                }}
              >
                <ArrowBack />
              </IconButton>
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                fontWeight={600}
                sx={{ fontSize: { xs: '1.15rem', sm: '1.25rem', md: '1.35rem', lg: '1.5rem' } }}
              >
                Add New Client
              </Typography>
            </Box>

            {/* Form Card */}
            <Paper
              elevation={0}
              sx={{
                border: 1,
                borderColor: (t) => alpha(t.palette.divider, 0.5),
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: (t) => `0 2px 12px ${alpha(t.palette.common.black, 0.08)}`,
              }}
            >
              <form onSubmit={handleSubmit}>
                <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                  <Stack spacing={3}>
                    {/* Account Type Selection */}
                    <Box>
                      <FormLabel
                        component="legend"
                        sx={{
                          mb: 2,
                          fontWeight: 600,
                          fontSize: '0.9375rem',
                          color: 'text.primary',
                        }}
                      >
                        Account Type
                      </FormLabel>
                      <RadioGroup
                        row
                        value={form.accountType}
                        onChange={handleAccountTypeChange}
                        sx={{ gap: { xs: 1, sm: 2 } }}
                      >
                        <FormControlLabel
                          value="individual"
                          control={<Radio size="small" />}
                          label={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Person fontSize="small" />
                              <Typography variant="body2">Individual</Typography>
                            </Stack>
                          }
                        />
                        <FormControlLabel
                          value="organization"
                          control={<Radio size="small" />}
                          label={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Business fontSize="small" />
                              <Typography variant="body2">Organization</Typography>
                            </Stack>
                          }
                        />
                      </RadioGroup>
                    </Box>

                    <Divider />

                    {/* User Account Information */}
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <Email fontSize="small" color="primary" />
                        <Typography variant="subtitle2" fontWeight={600}>
                          User Account Information
                        </Typography>
                      </Stack>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            size="small"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Email fontSize="small" />
                                </InputAdornment>
                              ),
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Phone"
                            name="phone"
                            type="tel"
                            value={form.phone}
                            onChange={handleChange}
                            size="small"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Phone fontSize="small" />
                                </InputAdornment>
                              ),
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="First Name"
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            required
                            size="small"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Last Name"
                            name="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            required
                            size="small"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            size="small"
                            helperText="Minimum 6 characters"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                            size="small"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider />

                    {/* Profile Information */}
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <Chip
                          label={form.accountType === 'individual' ? 'Individual' : 'Organization'}
                          size="small"
                          color={form.accountType === 'individual' ? 'primary' : 'secondary'}
                          sx={{ fontWeight: 600 }}
                        />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Profile Information
                        </Typography>
                      </Stack>
                      <Grid container spacing={2}>
                        {form.accountType === 'organization' && (
                          <>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Organization Name"
                                name="organizationName"
                                value={form.organizationName}
                                onChange={handleChange}
                                required={form.accountType === 'organization'}
                                size="small"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Business fontSize="small" />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                              />
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="ABN"
                                name="abn"
                                value={form.abn}
                                onChange={handleChange}
                                required={form.accountType === 'organization'}
                                size="small"
                                placeholder="11 digits"
                                helperText="Australian Business Number"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                              />
                            </Grid>
                          </>
                        )}

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="NDIS Number"
                            name="ndisNumber"
                            value={form.ndisNumber}
                            onChange={handleChange}
                            size="small"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LocalHospital fontSize="small" />
                                </InputAdornment>
                              ),
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider />

                    {/* Address Information */}
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <Home fontSize="small" color="primary" />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Address Information
                        </Typography>
                      </Stack>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Street Address"
                            name="street"
                            value={form.address.street}
                            onChange={handleAddressChange}
                            size="small"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Suburb"
                            name="suburb"
                            value={form.address.suburb}
                            onChange={handleAddressChange}
                            required
                            size="small"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                          />
                        </Grid>

                        <Grid item xs={12} md={3}>
                          <FormControl fullWidth size="small" required>
                            <InputLabel>State</InputLabel>
                            <Select
                              name="state"
                              value={form.address.state}
                              onChange={handleAddressChange}
                              label="State"
                              sx={{ borderRadius: 1.5 }}
                            >
                              {AUSTRALIAN_STATES.map((state) => (
                                <MenuItem key={state} value={state}>
                                  {state}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            label="Postcode"
                            name="postcode"
                            value={form.address.postcode}
                            onChange={handleAddressChange}
                            required
                            size="small"
                            inputProps={{ maxLength: 4 }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider />

                    {/* Emergency Contact (Optional) */}
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                        Emergency Contact (Optional)
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Name"
                            name="name"
                            value={form.emergencyContact.name}
                            onChange={handleEmergencyContactChange}
                            size="small"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                          />
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Relationship"
                            name="relationship"
                            value={form.emergencyContact.relationship}
                            onChange={handleEmergencyContactChange}
                            size="small"
                            placeholder="e.g., Spouse, Parent"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                          />
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Phone"
                            name="phone"
                            type="tel"
                            value={form.emergencyContact.phone}
                            onChange={handleEmergencyContactChange}
                            size="small"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Error/Success Messages */}
                    {error && (
                      <Alert severity="error" sx={{ borderRadius: 1.5 }}>
                        {error}
                      </Alert>
                    )}

                    {success && (
                      <Alert severity="success" sx={{ borderRadius: 1.5 }}>
                        {success}
                      </Alert>
                    )}

                    {/* Form Actions */}
                    <Stack
                      direction="row"
                      spacing={2}
                      justifyContent="flex-end"
                      sx={{
                        pt: 2,
                        borderTop: 1,
                        borderColor: 'divider',
                        mt: 2,
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/admin/clients')}
                        disabled={loading}
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
                          minWidth: { xs: 120, sm: 140 },
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
                        Create Client
                      </LoadingButton>
                    </Stack>
                  </Stack>
                </Box>
              </form>
            </Paper>
          </Container>
        </Box>
      </Box>
    </>
  );
}
