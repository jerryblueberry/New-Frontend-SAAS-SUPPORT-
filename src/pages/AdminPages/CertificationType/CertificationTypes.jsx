import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  alpha,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import api from '../../../api/axios';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar';
import AdminSidebar from '../../../components/adminSidebar/AdminSidebar';
import CertificationTypeFormModal from '../../../components/AdminCertificationTypesComponents/CertTypesModal/CertTypesModal';

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

const SIDEBAR_WIDTH = 260; // Match AdminSidebar DRAWER_WIDTH for alignment
const NAVBAR_TOP = 64;
const MAX_VISIBLE_CHIPS = 2; // Required-fields overflow before "+N"

export default function CertificationTypes() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
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
    <>
      <WorkerNavbar />
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        {/* Sidebar - aligned with AdminSidebar DRAWER_WIDTH */}
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

        {/* Main Content - adaptive padding for laptop/desktop */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            ml: { md: `${SIDEBAR_WIDTH}px` },
            mt: { xs: 8, md: 10 },
            minHeight: '100vh',
            p: { xs: 2, sm: 2, md: 2.5, lg: 3 },
            transition: theme.transitions.create(['margin', 'padding'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Container
            maxWidth="xl"
            disableGutters
            sx={{
              py: { xs: 1, sm: 1.5, md: 2, lg: 2.5 },
              px: { xs: 0, sm: 1.5, md: 2, lg: 2 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: { xs: 1.5, sm: 2, md: 2, lg: 2.5 },
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                fontWeight={600}
                sx={{ fontSize: { xs: '1.15rem', sm: '1.25rem', md: '1.35rem', lg: '1.5rem' } }}
              >
                Certification Types
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<Add />}
                onClick={handleAdd}
                sx={{
                  minWidth: { xs: 'auto', sm: 140, md: 152, lg: 160 },
                  px: { xs: 1.5, sm: 1.75, md: 2 },
                  py: 0.75,
                  fontSize: { xs: '0.8rem', sm: '0.8125rem' },
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: (t) => `0 1px 3px ${alpha(t.palette.primary.main, 0.25)}`,
                  '&:hover': { boxShadow: (t) => `0 2px 6px ${alpha(t.palette.primary.main, 0.35)}` },
                }}
              >
                {isSmall ? 'Add' : 'Add type'}
              </Button>
            </Box>

            {loading ? (
              <LoadingSpinner />
            ) : isSmall ? (
              /* Mobile: compact, adaptive cards */
              <Stack spacing={1.5}>
                {types.length === 0 ? (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      borderRadius: 2,
                      borderColor: (t) => alpha(t.palette.divider, 0.6),
                      bgcolor: (t) => alpha(t.palette.grey[500], 0.02),
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No certification types found
                    </Typography>
                  </Paper>
                ) : (
                  types.map((type) => {
                    const fields = type.requiredFields || [];
                    const visible = fields.slice(0, MAX_VISIBLE_CHIPS);
                    const extra = fields.length - MAX_VISIBLE_CHIPS;
                    return (
                      <Card
                        key={type._id}
                        elevation={0}
                        sx={{
                          border: '1px solid',
                          borderColor: (t) => alpha(t.palette.divider, 0.5),
                          borderRadius: 2,
                          overflow: 'hidden',
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                          '&:active': {
                            borderColor: (t) => alpha(t.palette.primary.main, 0.3),
                            boxShadow: (t) => `0 2px 8px ${alpha(t.palette.primary.main, 0.12)}`,
                          },
                        }}
                      >
                        <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                          <Stack spacing={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                              <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ flex: 1 }}>
                                {type.name}
                              </Typography>
                              <Chip label={type.category} size="small" sx={{ height: 22, fontSize: '0.7rem', flexShrink: 0 }} />
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                              {visible.map((f) => (
                                <Chip key={f} label={f} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                              ))}
                              {extra > 0 && (
                                <Chip label={`+${extra}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                              )}
                            </Box>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                              {type.isVisa && <Chip label="Visa" size="small" sx={{ height: 20, fontSize: '0.65rem' }} color="success" />}
                              {type.isEducation && <Chip label="Edu" size="small" sx={{ height: 20, fontSize: '0.65rem' }} color="success" />}
                              {type.isCitizenshipProof && <Chip label="Citz" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />}
                              {type.documentRequired && <Chip label="Doc" size="small" sx={{ height: 20, fontSize: '0.65rem' }} color="info" variant="outlined" />}
                            </Stack>
                          </Stack>
                        </CardContent>
                        <CardActions sx={{ px: 2, py: 0.5, justifyContent: 'flex-end', minHeight: 40 }}>
                          <Tooltip title="Edit" placement="top">
                            <IconButton size="small" color="primary" onClick={() => handleEdit(type)} aria-label="Edit">
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete" placement="top">
                            <IconButton size="small" color="error" onClick={() => handleDelete(type)} aria-label="Delete">
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </CardActions>
                      </Card>
                    );
                  })
                )}
              </Stack>
            ) : (
              /* Desktop/tablet: compact, adaptive table — hide Citz/Doc on sm for laptops */
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: (t) => alpha(t.palette.divider, 0.5),
                  borderRadius: { sm: 2, md: 2, lg: 2.5 },
                  overflowX: 'auto',
                  boxShadow: { sm: 'none', lg: (t) => `0 1px 4px ${alpha(t.palette.common.black, 0.06)}` },
                  transition: 'box-shadow 0.2s, border-radius 0.2s',
                }}
              >
                <Table
                  size="small"
                  sx={{
                    minWidth: { sm: 560, md: 640, lg: 720 },
                    '& .MuiTableCell-root': { borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.06)}` },
                  }}
                >
                  <TableHead>
                    <TableRow
                      sx={{
                        bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
                        '& .MuiTableCell-root': { borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.12)}` },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, py: { sm: 1.1, md: 1.25, lg: 1.5 }, fontSize: { sm: '0.75rem', md: '0.8rem' } }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: { sm: 1.1, md: 1.25, lg: 1.5 }, fontSize: { sm: '0.75rem', md: '0.8rem' } }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: { sm: 1.1, md: 1.25, lg: 1.5 }, fontSize: { sm: '0.75rem', md: '0.8rem' } }}>Required</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: { sm: 1.1, md: 1.25, lg: 1.5 }, fontSize: { sm: '0.75rem', md: '0.8rem' }, width: 52 }}>Visa</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: { sm: 1.1, md: 1.25, lg: 1.5 }, fontSize: { sm: '0.75rem', md: '0.8rem' }, width: 52 }}>Edu</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: { sm: 1.1, md: 1.25, lg: 1.5 }, fontSize: { sm: '0.75rem', md: '0.8rem' }, width: 52, display: { sm: 'none', md: 'table-cell' } }}>Citz</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: { sm: 1.1, md: 1.25, lg: 1.5 }, fontSize: { sm: '0.75rem', md: '0.8rem' }, width: 56, display: { sm: 'none', md: 'table-cell' } }}>Doc</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, py: { sm: 1.1, md: 1.25, lg: 1.5 }, fontSize: { sm: '0.75rem', md: '0.8rem' }, width: 88 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {types.map((type, idx) => {
                      const fields = type.requiredFields || [];
                      const visible = fields.slice(0, MAX_VISIBLE_CHIPS);
                      const extra = fields.length - MAX_VISIBLE_CHIPS;
                      return (
                        <TableRow
                          key={type._id}
                          hover
                          sx={{
                            bgcolor: (t) => (idx % 2 === 1 ? alpha(t.palette.grey[500], 0.02) : 'transparent'),
                            transition: 'background-color 0.15s ease',
                            '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.06) },
                          }}
                        >
                          <TableCell sx={{ py: { sm: 1.1, md: 1.25, lg: 1.5 } }}>
                            <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: { sm: 120, md: 160, lg: 200 } }}>
                              {type.name}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: { sm: 1.1, md: 1.25, lg: 1.5 } }}>
                            <Chip label={type.category} size="small" sx={{ fontSize: { sm: '0.7rem', md: '0.75rem' }, height: { sm: 20, lg: 22 } }} />
                          </TableCell>
                          <TableCell sx={{ py: { sm: 1.1, md: 1.25, lg: 1.5 } }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                              {visible.map((f) => (
                                <Chip key={f} label={f} size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
                              ))}
                              {extra > 0 && (
                                <Chip label={`+${extra}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 20 }} />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: { sm: 1.1, md: 1.25, lg: 1.5 } }}>
                            {type.isVisa ? <Chip label="Y" color="success" size="small" sx={{ fontSize: '0.7rem', height: 20, minWidth: 24 }} /> : <Typography variant="caption" color="text.secondary">—</Typography>}
                          </TableCell>
                          <TableCell sx={{ py: { sm: 1.1, md: 1.25, lg: 1.5 } }}>
                            {type.isEducation ? <Chip label="Y" color="success" size="small" sx={{ fontSize: '0.7rem', height: 20, minWidth: 24 }} /> : <Typography variant="caption" color="text.secondary">—</Typography>}
                          </TableCell>
                          <TableCell sx={{ py: { sm: 1.1, md: 1.25, lg: 1.5 }, display: { sm: 'none', md: 'table-cell' } }}>
                            {type.isCitizenshipProof ? <Chip label="Y" color="success" size="small" sx={{ fontSize: '0.7rem', height: 20, minWidth: 24 }} /> : <Typography variant="caption" color="text.secondary">—</Typography>}
                          </TableCell>
                          <TableCell sx={{ py: { sm: 1.1, md: 1.25, lg: 1.5 }, display: { sm: 'none', md: 'table-cell' } }}>
                            {type.documentRequired ? <Chip label="Req" color="info" size="small" sx={{ fontSize: '0.7rem', height: 20 }} /> : <Typography variant="caption" color="text.secondary">—</Typography>}
                          </TableCell>
                          <TableCell align="right" sx={{ py: { sm: 1.1, md: 1.25, lg: 1.5 } }}>
                            <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                              <Tooltip title="Edit">
                                <IconButton size="small" color="primary" onClick={() => handleEdit(type)} aria-label="Edit" sx={{ '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.1) } }}>
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" color="error" onClick={() => handleDelete(type)} aria-label="Delete" sx={{ '&:hover': { bgcolor: (t) => alpha(t.palette.error.main, 0.1) } }}>
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {types.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
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
          </Container>

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
      </Box>
    </>
  );
}