/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLIENT INVOICES - Billing Management Page
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Production-ready invoices listing page with filtering, sorting, and pagination.
 * Uses TanStack Query for efficient data fetching and caching.
 * 
 * Features:
 * - Invoice table with status badges
 * - Filtering by status, payment status, date range
 * - Search functionality
 * - Pagination
 * - Download PDF invoices
 * - Responsive design
 * 
 * @module pages/ClientPages/BillingAndPayment/Invoices
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Box,
  Paper,
  Typography,
  Stack,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  alpha,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Button,
  Pagination,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
} from '@mui/material'
import {
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar'
import ClientSidebar from '../../../components/ClientComponents/ClientSidebar/ClientSidebar'
import { CLIENT_SIDEBAR_WIDTH } from '../../../constants/layout'
import { useInvoices } from '../../../stores/useClientProfileStore'
import { useAuth } from '../../../context/AuthContext'

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const INVOICE_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
]

const PAYMENT_STATUSES = [
  { value: '', label: 'All Payment Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const Invoices = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()
  const { user } = useAuth()
  const [topOffset, setTopOffset] = useState(64)
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  
  // Build query params
  const queryParams = useMemo(() => {
    const params = {
      page,
      limit: 10,
      sortBy: 'invoiceDate',
      sortOrder: 'desc',
    }
    
    if (statusFilter) params.status = statusFilter
    if (paymentStatusFilter) params.paymentStatus = paymentStatusFilter
    if (searchQuery) params.search = searchQuery
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    
    return params
  }, [page, statusFilter, paymentStatusFilter, searchQuery, startDate, endDate])
  
  // Fetch invoices
  const {
    invoices,
    pagination,
    isLoading,
    isError,
    error,
    download,
    isDownloading,
  } = useInvoices(queryParams)
  
  // Measure navbar height
  useEffect(() => {
    const measureNavbar = () => {
      const headerEl = document.querySelector('.wrk-dashboard-header')
      if (headerEl) {
        setTopOffset(headerEl.getBoundingClientRect().height || 64)
      }
    }
    measureNavbar()
    window.addEventListener('resize', measureNavbar)
    return () => window.removeEventListener('resize', measureNavbar)
  }, [])
  
  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [statusFilter, paymentStatusFilter, searchQuery, startDate, endDate])
  
  // Handle filter reset
  const handleResetFilters = useCallback(() => {
    setStatusFilter('')
    setPaymentStatusFilter('')
    setSearchQuery('')
    setStartDate('')
    setEndDate('')
    setPage(1)
  }, [])
  
  // Handle invoice view
  const handleViewInvoice = useCallback((invoice) => {
    setSelectedInvoice(invoice)
    setViewDialogOpen(true)
  }, [])
  
  // Handle download
  const handleDownload = useCallback(
    (invoiceId, e) => {
      e.stopPropagation()
      download(invoiceId)
    },
    [download]
  )
  
  // Get status chip color
  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      sent: 'info',
      viewed: 'primary',
      paid: 'success',
      overdue: 'error',
      cancelled: 'default',
      refunded: 'warning',
    }
    return colors[status] || 'default'
  }
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon fontSize="small" />
      case 'overdue':
        return <ErrorIcon fontSize="small" />
      case 'sent':
      case 'viewed':
        return <ScheduleIcon fontSize="small" />
      case 'cancelled':
        return <CancelIcon fontSize="small" />
      default:
        return null
    }
  }
  
  // Format currency
  const formatCurrency = (amount, currency = 'AUD') => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }
  
  // Check if filters are active
  const hasActiveFilters = statusFilter || paymentStatusFilter || searchQuery || startDate || endDate
  
  // Loading state
  if (isLoading && !invoices.length) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <WorkerNavbar />
        <Box sx={{ display: 'flex', width: '100%' }}>
          <ClientSidebar topOffset={topOffset} navigate={navigate} />
          <Box
            sx={{
              flexGrow: 1,
              width: { xs: '100%', md: `calc(100% - ${CLIENT_SIDEBAR_WIDTH}px)` },
              pt: { xs: 10, md: 8.7 },
              px: { xs: 2, sm: 3, md: 4 },
              pb: { xs: 4, sm: 5, md: 6 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Stack spacing={2} alignItems="center">
              <CircularProgress size={48} />
              <Typography variant="body1" color="text.secondary">
                Loading invoices...
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>
    )
  }
  
  // Error state
  if (isError) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <WorkerNavbar />
        <Box sx={{ display: 'flex', width: '100%' }}>
          <ClientSidebar topOffset={topOffset} navigate={navigate} />
          <Box
            sx={{
              flexGrow: 1,
              width: { xs: '100%', md: `calc(100% - ${CLIENT_SIDEBAR_WIDTH}px)` },
              pt: { xs: 10, md: 8.7 },
              px: { xs: 2, sm: 3, md: 4 },
              pb: { xs: 4, sm: 5, md: 6 },
            }}
          >
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Error Loading Invoices
              </Typography>
              <Typography variant="body2">{error?.message || 'Failed to load invoices.'}</Typography>
            </Alert>
          </Box>
        </Box>
      </Box>
    )
  }
  
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <WorkerNavbar />

      <Box sx={{ display: 'flex', width: '100%' }}>
        <ClientSidebar topOffset={topOffset} navigate={navigate} />

        <Box
          sx={{
            flexGrow: 1,
            width: { xs: '100%', md: `calc(100% - ${CLIENT_SIDEBAR_WIDTH}px)` },
            minWidth: 0,
            pt: { xs: 10, md: 8.7 },
            px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
            pb: { xs: 4, sm: 5, md: 6 },
          }}
        >
          <Box
            sx={{
              maxWidth: { xs: '100%', sm: '100%', md: '100%', lg: '1400px', xl: '1600px' },
              mx: 'auto',
              width: '100%',
            }}
          >
            <Stack spacing={3}>
              {/* Header Card */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                      }}
                    >
                      <ReceiptIcon sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700} color="text.primary">
                        Invoices
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        View and manage your invoices
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Filters Card */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  p: { xs: 2, sm: 3 },
                }}
              >
                <Stack spacing={2.5}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <FilterListIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="h6" fontWeight={600}>
                      Filters
                    </Typography>
                    {hasActiveFilters && (
                      <Button
                        size="small"
                        startIcon={<ClearIcon />}
                        onClick={handleResetFilters}
                        sx={{ ml: 'auto' }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </Stack>

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    flexWrap="wrap"
                  >
                    <TextField
                      size="small"
                      placeholder="Search invoices..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ flexGrow: 1, minWidth: 200 }}
                    />
                    <TextField
                      select
                      size="small"
                      label="Status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      sx={{ minWidth: 150 }}
                    >
                      {INVOICE_STATUSES.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      size="small"
                      label="Payment Status"
                      value={paymentStatusFilter}
                      onChange={(e) => setPaymentStatusFilter(e.target.value)}
                      sx={{ minWidth: 180 }}
                    >
                      {PAYMENT_STATUSES.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      type="date"
                      size="small"
                      label="Start Date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ minWidth: 150 }}
                    />
                    <TextField
                      type="date"
                      size="small"
                      label="End Date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ minWidth: 150 }}
                    />
                  </Stack>
                </Stack>
              </Paper>

              {/* Invoices Table */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  overflow: 'hidden',
                }}
              >
                {invoices.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No invoices found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {hasActiveFilters
                        ? 'Try adjusting your filters to see more results.'
                        : 'You don\'t have any invoices yet.'}
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                            <TableCell sx={{ fontWeight: 700 }}>Invoice #</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Amount</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Balance</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {invoices.map((invoice) => (
                            <TableRow
                              key={invoice._id}
                              hover
                              sx={{ cursor: 'pointer' }}
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {invoice.invoiceNumber}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {format(new Date(invoice.invoiceDate), 'dd MMM yyyy')}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {invoice.dueDate
                                    ? format(new Date(invoice.dueDate), 'dd MMM yyyy')
                                    : '-'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={invoice.status}
                                  color={getStatusColor(invoice.status)}
                                  size="small"
                                  icon={getStatusIcon(invoice.status)}
                                  sx={{ textTransform: 'capitalize' }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight={600}>
                                  {formatCurrency(invoice.total, invoice.currency)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography
                                  variant="body2"
                                  color={invoice.balance > 0 ? 'error.main' : 'success.main'}
                                  fontWeight={600}
                                >
                                  {formatCurrency(invoice.balance, invoice.currency)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                  <Tooltip title="View Details">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleViewInvoice(invoice)
                                      }}
                                    >
                                      <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Download PDF">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => handleDownload(invoice._id, e)}
                                      disabled={isDownloading || !invoice.pdfUrl}
                                    >
                                      <DownloadIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                        <Pagination
                          count={pagination.totalPages}
                          page={pagination.page}
                          onChange={(e, value) => setPage(value)}
                          color="primary"
                          size={isMobile ? 'small' : 'medium'}
                        />
                      </Box>
                    )}
                  </>
                )}
              </Paper>

              {/* Summary Card */}
              {pagination && (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    p: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" align="center">
                    Showing {invoices.length} of {pagination.total} invoices
                    {pagination.totalPages > 1 && ` (Page ${pagination.page} of ${pagination.totalPages})`}
                  </Typography>
                </Paper>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Invoice Detail Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <ReceiptIcon />
            <Typography variant="h6">
              {selectedInvoice?.invoiceNumber || 'Invoice Details'}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Invoice Date
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {format(new Date(selectedInvoice.invoiceDate), 'dd MMM yyyy')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Due Date
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedInvoice.dueDate
                      ? format(new Date(selectedInvoice.dueDate), 'dd MMM yyyy')
                      : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedInvoice.status}
                      color={getStatusColor(selectedInvoice.status)}
                      size="small"
                      icon={getStatusIcon(selectedInvoice.status)}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Payment Status
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedInvoice.paymentStatus}
                  </Typography>
                </Grid>
              </Grid>

              <Divider />

              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <>
                  <Typography variant="h6" fontWeight={600}>
                    Items
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Description</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Unit Price</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedInvoice.items.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">
                              {formatCurrency(item.unitPrice, selectedInvoice.currency)}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(item.total, selectedInvoice.currency)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}

              <Divider />

              <Stack spacing={1} alignItems="flex-end">
                <Stack direction="row" spacing={4} sx={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(selectedInvoice.subtotal, selectedInvoice.currency)}
                  </Typography>
                </Stack>
                {selectedInvoice.tax > 0 && (
                  <Stack direction="row" spacing={4} sx={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Typography variant="body2" color="text.secondary">
                      Tax:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatCurrency(selectedInvoice.tax, selectedInvoice.currency)}
                    </Typography>
                  </Stack>
                )}
                {selectedInvoice.discount > 0 && (
                  <Stack direction="row" spacing={4} sx={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Typography variant="body2" color="text.secondary">
                      Discount:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      -{formatCurrency(selectedInvoice.discount, selectedInvoice.currency)}
                    </Typography>
                  </Stack>
                )}
                <Divider sx={{ width: '100%' }} />
                <Stack direction="row" spacing={4} sx={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Typography variant="h6" fontWeight={700}>
                    Total:
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {formatCurrency(selectedInvoice.total, selectedInvoice.currency)}
                  </Typography>
                </Stack>
                {selectedInvoice.amountPaid > 0 && (
                  <Stack direction="row" spacing={4} sx={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Typography variant="body2" color="text.secondary">
                      Amount Paid:
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      {formatCurrency(selectedInvoice.amountPaid, selectedInvoice.currency)}
                    </Typography>
                  </Stack>
                )}
                <Stack direction="row" spacing={4} sx={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Typography variant="body1" fontWeight={600}>
                    Balance:
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    color={selectedInvoice.balance > 0 ? 'error.main' : 'success.main'}
                  >
                    {formatCurrency(selectedInvoice.balance, selectedInvoice.currency)}
                  </Typography>
                </Stack>
              </Stack>

              {selectedInvoice.notes && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body2">{selectedInvoice.notes}</Typography>
                  </Box>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {selectedInvoice?.pdfUrl && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => {
                download(selectedInvoice._id)
                setViewDialogOpen(false)
              }}
              disabled={isDownloading}
            >
              Download PDF
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Invoices

