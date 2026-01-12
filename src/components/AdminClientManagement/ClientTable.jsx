import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Toolbar,
  Tooltip,
  useMediaQuery,
  useTheme,
  Collapse,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useClients, useDeleteClient, useExportClients } from '../../hooks/useClients';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Debounce hook
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Status color mapping
const getStatusColor = (status) => {
  const colors = {
    draft: 'default',
    submitted: 'info',
    'under-review': 'warning',
    verified: 'success',
    rejected: 'error',
  };
  return colors[status] || 'default';
};

// Account type labels
const getAccountTypeLabel = (type) => {
  return type === 'individual' ? 'Individual' : 'Organization';
};

const ClientTable = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  // State management
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState({
    status: '',
    accountType: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  // Debounced search
  const debouncedSearch = useDebounce(search, 500);

  // Build query params
  const queryParams = useMemo(() => {
    const params = {
      page: page + 1,
      limit: rowsPerPage,
      sort: sortBy,
    };

    if (debouncedSearch) {
      params.search = debouncedSearch;
    }

    if (filters.status) {
      params.status = filters.status;
    }

    if (filters.accountType) {
      params.accountType = filters.accountType;
    }

    return params;
  }, [page, rowsPerPage, sortBy, debouncedSearch, filters]);

  // Fetch clients with TanStack Query
  const { data, isLoading, isError, error, refetch, isFetching } = useClients(queryParams);

  // Mutations
  const deleteClientMutation = useDeleteClient();
  const exportClientsMutation = useExportClients();

  // Handlers
  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearch(event.target.value);
    setPage(0); // Reset to first page on search
  }, []);

  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    setPage(0);
  }, []);

  const handleFilterChange = useCallback((field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(0);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ status: '', accountType: '' });
    setSearch('');
    setPage(0);
  }, []);

  const handleMenuOpen = useCallback((event, client) => {
    setAnchorEl(event.currentTarget);
    setSelectedClient(client);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedClient(null);
  }, []);

  const handleViewDetails = useCallback(() => {
    if (selectedClient) {
      navigate(`/admin/clients/${selectedClient._id}`);
    }
    handleMenuClose();
  }, [selectedClient, navigate, handleMenuClose]);

  const handleEdit = useCallback(() => {
    if (selectedClient) {
      navigate(`/admin/clients/${selectedClient._id}/edit`);
    }
    handleMenuClose();
  }, [selectedClient, navigate, handleMenuClose]);

  const handleDelete = useCallback(() => {
    if (selectedClient && window.confirm('Are you sure you want to delete this client?')) {
      deleteClientMutation.mutate(selectedClient._id);
    }
    handleMenuClose();
  }, [selectedClient, deleteClientMutation, handleMenuClose]);

  const handleExport = useCallback(() => {
    exportClientsMutation.mutate(queryParams);
  }, [exportClientsMutation, queryParams]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Extract data
  const clients = data?.data || [];
  const meta = data?.meta || {};
  const hasActiveFilters = filters.status || filters.accountType || search;

  // Desktop Table View
  const renderTableView = () => (
    <TableContainer>
      <Table size="small" sx={{ minWidth: 800 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Client Name</TableCell>
            <TableCell sx={{ fontWeight: 600, py: 1.5 }}>NDIS Number</TableCell>
            <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Location</TableCell>
            <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Completeness</TableCell>
            <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Created</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, py: 1.5 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  {hasActiveFilters ? 'No clients found matching your filters' : 'No clients available'}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow
                key={client._id}
                hover
                sx={{
                  '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' },
                  transition: 'background-color 0.2s',
                }}
              >
                <TableCell sx={{ py: 1.5 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {client.accountType === 'individual' 
                      ? client.user?.firstName && client.user?.lastName
                        ? `${client.user.firstName} ${client.user.lastName}`
                        : client.user?.email || 'N/A'
                      : client.organizationName || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    {client.ndisNumber || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1.5 }}>
                  <Chip
                    label={getAccountTypeLabel(client.accountType)}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem', height: 24 }}
                  />
                </TableCell>
                <TableCell sx={{ py: 1.5 }}>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                    {client.address?.suburb && client.address?.state
                      ? `${client.address.suburb}, ${client.address.state}`
                      : 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1.5 }}>
                  <Chip
                    label={client.status || 'N/A'}
                    color={getStatusColor(client.status)}
                    size="small"
                    sx={{ fontSize: '0.75rem', height: 24, textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell sx={{ py: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 6,
                        bgcolor: 'grey.200',
                        borderRadius: 1,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          width: `${client.profileCompleteness?.percentage || 0}%`,
                          height: '100%',
                          bgcolor: client.profileCompleteness?.percentage >= 80 ? 'success.main' : 'warning.main',
                          transition: 'width 0.3s',
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {client.profileCompleteness?.percentage || 0}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ py: 1.5 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, client);
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Mobile Card View
  const renderCardView = () => (
    <Stack spacing={2}>
      {clients.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {hasActiveFilters ? 'No clients found matching your filters' : 'No clients available'}
          </Typography>
        </Paper>
      ) : (
        clients.map((client) => (
          <Card
            key={client._id}
            elevation={1}
            sx={{
              transition: 'all 0.2s',
              '&:hover': { boxShadow: 3 },
            }}
          >
            <CardContent sx={{ pb: 1 }}>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      {client.accountType === 'individual' 
                        ? client.user?.firstName && client.user?.lastName
                          ? `${client.user.firstName} ${client.user.lastName}`
                          : client.user?.email || 'N/A'
                        : client.organizationName || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      NDIS: {client.ndisNumber || 'N/A'}
                    </Typography>
                  </Box>
                  <Chip
                    label={client.status || 'N/A'}
                    color={getStatusColor(client.status)}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={getAccountTypeLabel(client.accountType)}
                    size="small"
                    variant="outlined"
                  />
                  {client.address?.suburb && (
                    <Chip
                      label={`${client.address.suburb}, ${client.address.state || ''}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Profile Completeness
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        flex: 1,
                        height: 6,
                        bgcolor: 'grey.200',
                        borderRadius: 1,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          width: `${client.profileCompleteness?.percentage || 0}%`,
                          height: '100%',
                          bgcolor: client.profileCompleteness?.percentage >= 80 ? 'success.main' : 'warning.main',
                          transition: 'width 0.3s',
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      {client.profileCompleteness?.percentage || 0}%
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Created: {new Date(client.createdAt).toLocaleDateString()}
                </Typography>
              </Stack>
            </CardContent>

            <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'flex-end' }}>
              <Button
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={() => navigate(`/admin/clients/${client._id}`)}
              >
                View
              </Button>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/admin/clients/${client._id}/edit`)}
              >
                Edit
              </Button>
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, client)}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </CardActions>
          </Card>
        ))
      )}
    </Stack>
  );

  return (
    <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Toolbar */}
      <Toolbar
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          borderBottom: 1,
          borderColor: 'divider',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', sm: 'center' },
        }}
      >
        {/* Search */}
        <TextField
          size="small"
          placeholder="Search by name, NDIS number, suburb..."
          value={search}
          onChange={handleSearchChange}
          sx={{ flex: { sm: 1 }, minWidth: { xs: '100%', sm: 250 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        {/* Sort */}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="oldest">Oldest First</MenuItem>
            <MenuItem value="updated">Recently Updated</MenuItem>
            <MenuItem value="status">By Status</MenuItem>
            <MenuItem value="organization">By Name</MenuItem>
          </Select>
        </FormControl>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1}>
          <Tooltip title="Toggle Filters">
            <IconButton
              size="small"
              onClick={() => setShowFilters(!showFilters)}
              color={showFilters ? 'primary' : 'default'}
            >
              {showFilters ? <ExpandLessIcon /> : <FilterListIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Refresh">
            <IconButton size="small" onClick={handleRefresh} disabled={isFetching}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export CSV">
            <IconButton
              size="small"
              onClick={handleExport}
              disabled={exportClientsMutation.isPending}
            >
              <FileDownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>

      {/* Filters Collapse */}
      <Collapse in={showFilters}>
        <Box
          sx={{
            p: 2,
            bgcolor: 'grey.50',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="under-review">Under Review</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Account Type</InputLabel>
              <Select
                value={filters.accountType}
                label="Account Type"
                onChange={(e) => handleFilterChange('accountType', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="individual">Individual</MenuItem>
                <MenuItem value="organization">Organization</MenuItem>
              </Select>
            </FormControl>

            {hasActiveFilters && (
              <Button
                size="small"
                variant="outlined"
                onClick={handleClearFilters}
                sx={{ alignSelf: 'center' }}
              >
                Clear Filters
              </Button>
            )}
          </Stack>

          {meta.unknownFilterKeys && meta.unknownFilterKeys.length > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Unknown filter keys: {meta.unknownFilterKeys.join(', ')}
            </Alert>
          )}
        </Box>
      </Collapse>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {isError && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error?.response?.data?.message || 'Failed to load clients'}
        </Alert>
      )}

      {/* Content */}
      {!isLoading && !isError && (
        <Box sx={{ position: 'relative' }}>
          {isFetching && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                bgcolor: 'primary.main',
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 0.3 },
                  '50%': { opacity: 1 },
                },
              }}
            />
          )}

          {isMobile ? renderCardView() : renderTableView()}
        </Box>
      )}

      {/* Pagination */}
      {!isLoading && !isError && clients.length > 0 && (
        <TablePagination
          component="div"
          count={meta.total || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            borderTop: 1,
            borderColor: 'divider',
          }}
        />
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleViewDetails}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {/* <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem> */}
      </Menu>
    </Paper>
  );
};

export default ClientTable;
