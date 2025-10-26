import React, { useState, useMemo } from 'react';
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
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Typography,
  Stack,
  Button,
  Checkbox,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  useMediaQuery,
  alpha,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GetApp as ExportIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { format, formatDistanceToNow, isValid } from 'date-fns';
import { useReferenceManagement } from '../../hooks/useReferences';

// Status configuration
const STATUS_CONFIG = {
  Pending: { color: 'warning', icon: PendingIcon, label: 'Pending' },
  EmailSent: { color: 'info', icon: EmailIcon, label: 'Email Sent' },
  Viewed: { color: 'primary', icon: VisibilityIcon, label: 'Viewed' },
  InProgress: { color: 'secondary', icon: ScheduleIcon, label: 'In Progress' },
  Completed: { color: 'success', icon: CheckCircleIcon, label: 'Completed' },
  Rejected: { color: 'error', icon: ErrorIcon, label: 'Rejected' },
  Expired: { color: 'default', icon: ScheduleIcon, label: 'Expired' },
  Bounced: { color: 'error', icon: ErrorIcon, label: 'Bounced' }
};

// Email tracking status component
const EmailTrackingStatus = ({ emailTracking }) => {
  const theme = useTheme();
  
  if (!emailTracking) return null;

  const { opened, clicked, emailBounced, emailsSent, lastEmailSent } = emailTracking;
  
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {emailBounced ? (
        <Chip
          size="small"
          icon={<ErrorIcon />}
          label="Bounced"
          color="error"
          variant="outlined"
        />
      ) : (
        <>
          {opened && (
            <Chip
              size="small"
              icon={<VisibilityIcon />}
              label="Opened"
              color="success"
              variant="outlined"
            />
          )}
          {clicked && (
            <Chip
              size="small"
              icon={<CheckCircleIcon />}
              label="Clicked"
              color="primary"
              variant="outlined"
            />
          )}
          {emailsSent > 0 && (
            <Chip
              size="small"
              label={`${emailsSent} sent`}
              color="info"
              variant="outlined"
            />
          )}
        </>
      )}
    </Stack>
  );
};

// Progress indicator component
const ProgressIndicator = ({ progress }) => {
  const theme = useTheme();
  
  if (!progress) return null;
  
  const { percentageComplete, answeredQuestions, totalQuestions } = progress;
  
  return (
    <Box sx={{ minWidth: 100 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ flexGrow: 1 }}>
          <LinearProgress
            variant="determinate"
            value={percentageComplete}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                backgroundColor: theme.palette.primary.main
              }
            }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary">
          {percentageComplete}%
        </Typography>
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        {answeredQuestions}/{totalQuestions} questions
      </Typography>
    </Box>
  );
};

// Reference row component
const ReferenceRow = ({ 
  reference, 
  isSelected, 
  onSelect, 
  onAction,
  onView,
  isMobile 
}) => {
  const theme = useTheme();
  const statusConfig = STATUS_CONFIG[reference.status] || STATUS_CONFIG.Pending;
  const StatusIcon = statusConfig.icon;
  
  const formatDate = (date) => {
    if (!date || !isValid(new Date(date))) return 'N/A';
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const formatRelativeTime = (date) => {
    if (!date || !isValid(new Date(date))) return 'N/A';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  if (isMobile) {
    return (
      <TableRow
        hover
        selected={isSelected}
        onClick={() => onView && onView(reference._id)}
        sx={{ cursor: 'pointer' }}
      >
        <TableCell padding="checkbox">
          <Checkbox
            checked={isSelected}
            onChange={() => onSelect(reference._id)}
            onClick={(e) => e.stopPropagation()}
          />
        </TableCell>
        <TableCell>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                <PersonIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {reference.referenceInfo?.name || 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {reference.referenceInfo?.company || 'N/A'}
                </Typography>
              </Box>
            </Stack>
            
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <StatusIcon fontSize="small" color={statusConfig.color} />
                <Chip
                  size="small"
                  label={statusConfig.label}
                  color={statusConfig.color}
                  variant="outlined"
                />
              </Stack>
              
              <EmailTrackingStatus emailTracking={reference.emailTracking} />
              
              <ProgressIndicator progress={reference.progress} />
              
              <Typography variant="caption" color="text.secondary">
                Created {formatRelativeTime(reference.createdAt)}
              </Typography>
            </Stack>
          </Box>
        </TableCell>
        <TableCell align="right">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onAction(reference._id, e.currentTarget);
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow
      hover
      selected={isSelected}
      onClick={() => onView && onView(reference._id)}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell padding="checkbox">
        <Checkbox
          checked={isSelected}
          onChange={() => onSelect(reference._id)}
          onClick={(e) => e.stopPropagation()}
        />
      </TableCell>
      
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {reference.referenceInfo?.name || 'N/A'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {reference.referenceInfo?.email || 'N/A'}
            </Typography>
          </Box>
        </Stack>
      </TableCell>
      
      <TableCell>
        <Typography variant="body2">
          {reference.referenceInfo?.company || 'N/A'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {reference.referenceInfo?.position || 'N/A'}
        </Typography>
      </TableCell>
      
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <StatusIcon fontSize="small" color={statusConfig.color} />
          <Chip
            size="small"
            label={statusConfig.label}
            color={statusConfig.color}
            variant="outlined"
          />
        </Stack>
      </TableCell>
      
      <TableCell>
        <EmailTrackingStatus emailTracking={reference.emailTracking} />
      </TableCell>
      
      <TableCell>
        <ProgressIndicator progress={reference.progress} />
      </TableCell>
      
      <TableCell>
        <Typography variant="body2">
          {formatDate(reference.createdAt)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatRelativeTime(reference.createdAt)}
        </Typography>
      </TableCell>
      
      <TableCell>
        <Typography variant="body2">
          {formatDate(reference.completedAt)}
        </Typography>
        {reference.completedAt && (
          <Typography variant="caption" color="text.secondary">
            {formatRelativeTime(reference.completedAt)}
          </Typography>
        )}
      </TableCell>
      
      <TableCell align="right">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onAction(reference._id, e.currentTarget);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

// Main ReferenceTable component
const ReferenceTable = ({ 
  initialFilters = {},
  onReferenceSelect,
  onSendEmail,
  showFilters = true,
  showBulkActions = true 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [actionReferenceId, setActionReferenceId] = useState(null);
  const [showFiltersState, setShowFiltersState] = useState(showFilters);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedReferenceForStatus, setSelectedReferenceForStatus] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReferenceForDelete, setSelectedReferenceForDelete] = useState(null);

  // Debug parameters
  const hookParams = {
    page: page + 1,
    limit: rowsPerPage,
    sortBy: orderBy,
    sortOrder: order,
    search: search || undefined,
    status: statusFilter || undefined,
    ...initialFilters
  };
  
  console.log('ReferenceTable hook parameters:', hookParams);
  console.log('ReferenceTable state values:', {
    page,
    rowsPerPage,
    orderBy,
    order,
    search,
    statusFilter,
    initialFilters
  });

  // Hooks
  const {
    references,
    totalReferences,
    totalPages,
    currentPage,
    isLoading,
    refetch,
    updateStatus,
    deleteReference,
    bulkUpdateStatus,
    bulkSendEmails,
    exportReferences,
    isUpdatingStatus,
    isDeleting,
    isBulkUpdating,
    isBulkSending,
    isExporting
  } = useReferenceManagement(hookParams);

  // Handlers
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = (references || []).map((reference) => reference._id);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (referenceId) => {
    const selectedIndex = selected.indexOf(referenceId);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, referenceId);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleAction = (referenceId, anchorEl) => {
    setActionReferenceId(referenceId);
    setAnchorEl(anchorEl);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setActionReferenceId(null);
  };

  const handleBulkAction = (action) => {
    if (selected.length === 0) return;

    switch (action) {
      case 'send-emails':
        bulkSendEmails({ ids: selected });
        break;
      case 'mark-completed':
        bulkUpdateStatus({ 
          ids: selected, 
          status: 'Completed', 
          notes: 'Bulk update' 
        });
        break;
      case 'mark-pending':
        bulkUpdateStatus({ 
          ids: selected, 
          status: 'Pending', 
          notes: 'Bulk update' 
        });
        break;
      default:
        break;
    }
    
    setSelected([]);
  };

  const handleExport = () => {
    exportReferences({
      status: statusFilter,
      search: search
    });
  };

  const handleOpenStatusModal = (reference) => {
    setSelectedReferenceForStatus(reference);
    setSelectedStatus(reference.status);
    setStatusModalOpen(true);
    handleCloseMenu();
  };

  const handleCloseStatusModal = () => {
    setStatusModalOpen(false);
    setSelectedReferenceForStatus(null);
    setSelectedStatus('');
  };

  const handleConfirmStatusUpdate = () => {
    if (selectedReferenceForStatus && selectedStatus) {
      updateStatus({
        id: selectedReferenceForStatus._id,
        status: selectedStatus,
        notes: 'Status updated by admin'
      });
      handleCloseStatusModal();
    }
  };

  const handleOpenDeleteModal = (reference) => {
    setSelectedReferenceForDelete(reference);
    setDeleteModalOpen(true);
    handleCloseMenu();
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedReferenceForDelete(null);
  };

  const handleConfirmDelete = () => {
    if (selectedReferenceForDelete) {
      deleteReference(selectedReferenceForDelete._id);
      handleCloseDeleteModal();
    }
  };

  const isSelected = (referenceId) => selected.indexOf(referenceId) !== -1;
  const numSelected = selected.length;
  const rowCount = references?.length || 0;


  // Table columns for desktop
  const columns = [
    { id: 'reference', label: 'Reference', sortable: false },
    { id: 'company', label: 'Company', sortable: false },
    { id: 'status', label: 'Status', sortable: true },
    { id: 'emailTracking', label: 'Email Tracking', sortable: false },
    { id: 'progress', label: 'Progress', sortable: false },
    { id: 'createdAt', label: 'Created', sortable: true },
    { id: 'completedAt', label: 'Completed', sortable: true },
    { id: 'actions', label: 'Actions', sortable: false }
  ];

  // Simple test to see if component is rendering
  console.log('ReferenceTable rendering with:', { 
    referencesCount: references?.length, 
    isLoading, 
    isMobile,
    totalReferences 
  });

  return (
    <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
      {/* Header with filters and actions */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
            {showFiltersState && (
              <>
                <TextField
                  size="small"
                  placeholder="Search references..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                  sx={{ minWidth: 250 }}
                />
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <MenuItem key={key} value={key}>
                        {config.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
          </Stack>
          
          <Stack direction="row" spacing={1} alignItems="center">
            {showBulkActions && numSelected > 0 && (
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  startIcon={<SendIcon />}
                  onClick={() => handleBulkAction('send-emails')}
                  disabled={isBulkSending}
                >
                  Send Emails ({numSelected})
                </Button>
                <Button
                  size="small"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleBulkAction('mark-completed')}
                  disabled={isBulkUpdating}
                >
                  Mark Completed
                </Button>
              </Stack>
            )}
            
            <Button
              size="small"
              startIcon={<ExportIcon />}
              onClick={handleExport}
              disabled={isExporting}
            >
              Export
            </Button>
            
            <IconButton onClick={() => refetch()} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={numSelected > 0 && numSelected < rowCount}
                  checked={rowCount > 0 && numSelected === rowCount}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              
              {!isMobile && columns.map((column) => (
                <TableCell
                  key={column.id}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              
              {isMobile && (
                <TableCell>Reference Details</TableCell>
              )}
            </TableRow>
          </TableHead>
          
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={isMobile ? 3 : columns.length + 2}>
                  <LinearProgress />
                </TableCell>
              </TableRow>
            ) : (references || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={isMobile ? 3 : columns.length + 2} align="center">
                  <Box sx={{ py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      No references found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting your search or filter criteria
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              (references || []).map((reference) => (
                <ReferenceRow
                  key={reference._id}
                  reference={reference}
                  isSelected={isSelected(reference._id)}
                  onSelect={handleSelect}
                  onAction={handleAction}
                  onView={onReferenceSelect}
                  isMobile={isMobile}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[10, 20, 50, 100]}
        component="div"
        count={totalReferences}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Rows per page:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
        }
      />

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem 
          onClick={() => {
            if (onReferenceSelect && actionReferenceId) {
              onReferenceSelect(actionReferenceId);
            }
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (onSendEmail && actionReferenceId) {
              onSendEmail(actionReferenceId);
            }
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <SendIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Send Email</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            const reference = references.find(r => r._id === actionReferenceId);
            if (reference) {
              handleOpenStatusModal(reference);
            }
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Status</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            const reference = references.find(r => r._id === actionReferenceId);
            if (reference) {
              handleOpenDeleteModal(reference);
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Status Update Modal */}
      <Dialog
        open={statusModalOpen}
        onClose={handleCloseStatusModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center">
            <EditIcon />
            <Typography variant="h6">Update Reference Status</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedReferenceForStatus && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Update status for: <strong>{selectedReferenceForStatus.referenceInfo?.name}</strong>
              </Typography>
              
              <FormControl component="fieldset">
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Select New Status:
                </Typography>
                <RadioGroup
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                    const IconComponent = config.icon;
                    return (
                      <FormControlLabel
                        key={key}
                        value={key}
                        control={<Radio />}
                        label={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <IconComponent fontSize="small" color={config.color} />
                            <Typography>{config.label}</Typography>
                          </Stack>
                        }
                        sx={{ mb: 1 }}
                      />
                    );
                  })}
                </RadioGroup>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseStatusModal} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmStatusUpdate} 
            variant="contained" 
            disabled={!selectedStatus || isUpdatingStatus}
          >
            {isUpdatingStatus ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center">
            <DeleteIcon color="error" />
            <Typography variant="h6">Delete Reference</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedReferenceForDelete && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to delete this reference?
              </Typography>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'grey.50', 
                borderRadius: 1, 
                border: '1px solid', 
                borderColor: 'grey.200' 
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Reference Details:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Name:</strong> {selectedReferenceForDelete.referenceInfo?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Email:</strong> {selectedReferenceForDelete.referenceInfo?.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Company:</strong> {selectedReferenceForDelete.referenceInfo?.company || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Status:</strong> {selectedReferenceForDelete.status}
                </Typography>
              </Box>
              <Alert severity="warning" sx={{ mt: 2 }}>
                This action cannot be undone. The reference will be permanently deleted from the database.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDeleteModal} color="inherit" disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained" 
            color="error"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
          >
            {isDeleting ? 'Deleting...' : 'Delete Reference'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ReferenceTable;
