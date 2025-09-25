import React, { useState, useEffect, useCallback } from "react";
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    InputAdornment,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Alert,
    Tooltip,
    useMediaQuery,
    Card,
    CardContent,
    Avatar,
    Stack,
    Divider,
    Fade,
    Slide,
    Badge,
    ButtonGroup
} from "@mui/material";
import { useTheme, alpha } from '@mui/material/styles';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Refresh as RefreshIcon,
    Visibility as ViewIcon,
    Sort as SortIcon,
    Person as PersonIcon,
    Work as WorkIcon,
    LocationOn as LocationIcon,
    Schedule as ScheduleIcon,
    AttachMoney as MoneyIcon,
    VerifiedUser as VerifiedIcon,
    Clear as ClearIcon,
   
    ViewList as ViewListIcon,
    ViewModule as ViewModuleIcon
} from "@mui/icons-material";
import { useNavigate } from 'react-router-dom';
import api from "../../../api/axios";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import WorkerNavbar from "../../../components/Navbar/WorkerNavbar";
import AdminSidebar from "../../../components/adminSidebar/AdminSidebar";

const SIDEBAR_WIDTH = 280;
const SIDEBAR_GAP =0;

const WorkerManagementDashboard = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalWorkers, setTotalWorkers] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
    const [filters, setFilters] = useState({
        search: "",
        skills: "",
        verificationStatus: "",
        residencyStatus: "",
        availability: [],
        sort: "-lastActiveDate"
    });
    const [showFilters, setShowFilters] = useState(false);

    const buildQueryParams = useCallback(() => {
        const queryParams = new URLSearchParams({
            page: page + 1,
            limit: rowsPerPage,
            sort: filters.sort
        });
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== "" && key !== "sort") {
                if (Array.isArray(value)) {
                    if (value.length > 0) {
                        queryParams.append(key, value.join(','));
                    }
                } else {
                    if (key === 'skills') {
                        queryParams.append('skillTags', value);
                    } else {
                        queryParams.append(key, value);
                    }
                }
            }
        });
        return queryParams;
    }, [filters, page, rowsPerPage]);

    const fetchWorkers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const queryParams = buildQueryParams();
            const response = await api.get(`/admin/workers?${queryParams}`);
            if (response.data?.status === 'success' && Array.isArray(response.data.data.workers)) {
                setWorkers(response.data.data.workers);
                setTotalWorkers(response.data.total);
                setTotalPages(response.data.totalPages);
            } else {
                setError('Invalid response format from server');
                setWorkers([]);
                setTotalWorkers(0);
                setTotalPages(0);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Error fetching workers. Please try again.");
            setWorkers([]);
            setTotalWorkers(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [buildQueryParams]);

    useEffect(() => {
        fetchWorkers();
    }, [fetchWorkers]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setPage(0);
    };

    const handleSortChange = (field) => {
        setFilters(prev => ({
            ...prev,
            sort: prev.sort === field ? `-${field}` : field
        }));
    };

    const handleResetFilters = () => {
        setFilters({
            search: "",
            skills: "",
            verificationStatus: "",
            residencyStatus: "",
            availability: [],
            sort: "-lastActiveDate"
        });
        setPage(0);
    };

    const getVerificationStatusColor = (status) => {
        switch (status) {
            case "Fully Verified":
                return "success";
            case "Partially Verified":
                return "warning";
            case "Unverified":
                return "error";
            default:
                return "default";
        }
    };

    const getAvailabilityText = (availability) => {
        if (!availability || availability.length === 0) return "Not Available";
        const allSlots = availability.reduce((slots, day) => {
            return [...slots, ...(day.slots || [])];
        }, []);
        if (allSlots.length === 0) return "Not Available";
        const uniqueSlots = [...new Set(allSlots)];
        return uniqueSlots.join(", ");
    };

    const renderSortButton = (field, label) => (
        <Tooltip title={`Sort by ${label}`}>
            <IconButton
                size="small"
                onClick={() => handleSortChange(field)}
                color={filters.sort === field || filters.sort === `-${field}` ? "primary" : "default"}
                sx={{
                    ml: 1,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.1)',
                    }
                }}
            >
                <SortIcon fontSize="small" />
            </IconButton>
        </Tooltip>
    );

    const handleWorkerDetails = (workerId) => {
        navigate(`/worker-details/${workerId}`,{});
    };

    const getActiveFiltersCount = () => {
        return Object.values(filters).filter(value => 
            value && value !== "" && value !== "-lastActiveDate" && 
            (!Array.isArray(value) || value.length > 0)
        ).length;
    };

    const renderWorkerCard = (worker) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={worker.id}>
            <Fade in timeout={300}>
                <Card
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s ease-in-out',
                        cursor: 'pointer',
                        '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: theme.shadows[12],
                        },
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
                    }}
                    onClick={() => handleWorkerDetails(worker.id)}
                >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar
                                sx={{
                                    bgcolor: theme.palette.primary.main,
                                    width: 56,
                                    height: 56,
                                    mr: 2,
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                }}
                            >
                                <PersonIcon fontSize="large" />
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    {worker.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {worker.email}
                                </Typography>
                            </Box>
                        </Box>

                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <WorkIcon color="primary" fontSize="small" />
                                <Box sx={{ flexGrow: 1 }}>
                                    {worker.skills && worker.skills.length > 0 ? (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {worker.skills.slice(0, 3).map((skill, index) => (
                                                <Chip
                                                    key={index}
                                                    label={skill}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                        color: theme.palette.primary.main,
                                                        fontWeight: 500,
                                                    }}
                                                />
                                            ))}
                                            {worker.skills.length > 3 && (
                                                <Chip
                                                    label={`+${worker.skills.length - 3}`}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: alpha(theme.palette.grey[500], 0.1),
                                                        color: theme.palette.grey[600],
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">
                                            No skills listed
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationIcon color="primary" fontSize="small" />
                                <Chip
                                    label={worker.residencyStatus}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <MoneyIcon color="primary" fontSize="small" />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    ${worker.hourlyRate}/hr
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <VerifiedIcon color="primary" fontSize="small" />
                                <Chip
                                    label={worker.verificationStatus}
                                    color={getVerificationStatusColor(worker.verificationStatus)}
                                    size="small"
                                    sx={{ fontWeight: 500 }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ScheduleIcon color="primary" fontSize="small" />
                                <Chip
                                    label={getAvailabilityText(worker.availability)}
                                    color={worker.isAvailable ? "success" : "error"}
                                    size="small"
                                    variant="outlined"
                                />
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" color="text.secondary">
                                    Last Active: {worker.lastActive ? new Date(worker.lastActive).toLocaleDateString() : 'N/A'}
                                </Typography>
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleWorkerDetails(worker.id);
                                    }}
                                    sx={{
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.2),
                                        }
                                    }}
                                >
                                    <ViewIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Fade>
        </Grid>
    );

    return (
        <>
            <WorkerNavbar />

            <Box sx={{
                display: 'flex',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                overflowX: 'hidden'
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
                        p: { xs: 2, sm: 1,md: 1 },
                        mt: { xs: 7, md: 1 },
                        minHeight: '100vh',
                        transition: theme.transitions.create('margin', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }),
                    }}
                >
                <Container maxWidth="xl" sx={{ width: '100%', mt: { xs: 1.5, sm: 2 }, mb: 3, px: { xs: 1, sm: 2 } }}>
                    <Box sx={{ mb: 4, width: '100%' }}>
                        {/* Header Section */}
                        <Slide direction="down" in timeout={500}>
                            <Paper
                                elevation={0}
                                sx={{
                                    mb: 2,
                                    p: { xs: 2, md: 3 },
                                    borderRadius: 3,
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                }}
                            >
                                <Box sx={{ mb: 3 }}>
                                    <Typography 
                                        variant="h4" 
                                        sx={{ 
                                            fontWeight: 700, 
                                            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            mb: 1 
                                        }}
                                    >
                                        Worker Management
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Manage and monitor all registered workers
                                    </Typography>
                                </Box>

                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            name="search"
                                            value={filters.search}
                                            onChange={handleFilterChange}
                                            placeholder="Search workers by name, email, or skills..."
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon color="primary" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 3,
                                                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                                                    '&:hover': {
                                                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                                                    },
                                                    '&.Mui-focused': {
                                                        bgcolor: 'rgba(255, 255, 255, 1)',
                                                    }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                            <Badge badgeContent={getActiveFiltersCount()} color="primary">
                                                <Button
                                                    variant={showFilters ? "contained" : "outlined"}
                                                    startIcon={<FilterIcon />}
                                                    onClick={() => setShowFilters(!showFilters)}
                                                    sx={{
                                                        borderRadius: 3,
                                                        minWidth: 120,
                                                        transition: 'all 0.3s ease-in-out',
                                                    }}
                                                >
                                                    Filters
                                                </Button>
                                            </Badge>
                                            
                                            <ButtonGroup variant="outlined" sx={{ borderRadius: 3 }}>
                                                <Button
                                                    variant={viewMode === 'table' ? 'contained' : 'outlined'}
                                                    onClick={() => setViewMode('table')}
                                                    sx={{ borderRadius: '24px 0 0 24px' }}
                                                >
                                                    <ViewListIcon />
                                                </Button>
                                                <Button
                                                    variant={viewMode === 'card' ? 'contained' : 'outlined'}
                                                    onClick={() => setViewMode('card')}
                                                    sx={{ borderRadius: '0 24px 24px 0' }}
                                                >
                                                    <ViewModuleIcon />
                                                </Button>
                                            </ButtonGroup>

                                            <Button
                                                variant="outlined"
                                                startIcon={<RefreshIcon />}
                                                onClick={handleResetFilters}
                                                sx={{
                                                    borderRadius: 3,
                                                    minWidth: 120,
                                                    transition: 'all 0.3s ease-in-out',
                                                }}
                                            >
                                                Reset
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Slide direction="down" in={showFilters} mountOnEnter unmountOnExit>
                                    <Box sx={{ mt: 3 }}>
                                        <Divider sx={{ mb: 3 }} />
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={3}>
                                                <TextField
                                                    fullWidth
                                                    name="skills"
                                                    label="Skills"
                                                    value={filters.skills}
                                                    onChange={handleFilterChange}
                                                    helperText="Enter skills separated by commas"
                                                    placeholder="e.g., cooking, cleaning, childcare"
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 3,
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Verification Status</InputLabel>
                                                    <Select
                                                        name="verificationStatus"
                                                        value={filters.verificationStatus}
                                                        onChange={handleFilterChange}
                                                        label="Verification Status"
                                                        sx={{
                                                            borderRadius: 3,
                                                        }}
                                                    >
                                                        <MenuItem value="">All</MenuItem>
                                                        <MenuItem value="Fully Verified">Fully Verified</MenuItem>
                                                        <MenuItem value="Partially Verified">Partially Verified</MenuItem>
                                                        <MenuItem value="Unverified">Unverified</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Residency Status</InputLabel>
                                                    <Select
                                                        name="residencyStatus"
                                                        value={filters.residencyStatus}
                                                        onChange={handleFilterChange}
                                                        label="Residency Status"
                                                        sx={{
                                                            borderRadius: 3,
                                                        }}
                                                    >
                                                        <MenuItem value="">All</MenuItem>
                                                        <MenuItem value="Citizen">Citizen</MenuItem>
                                                        <MenuItem value="NZCitizen">NZ Citizen</MenuItem>
                                                        <MenuItem value="PermanentResident">Permanent Resident</MenuItem>
                                                        <MenuItem value="StudentVisa">Student Visa</MenuItem>
                                                        <MenuItem value="TemporaryGraduateVisa">Temporary Graduate Visa</MenuItem>
                                                        <MenuItem value="TSS">TSS</MenuItem>
                                                        <MenuItem value="BridgingVisa">Bridging Visa</MenuItem>
                                                        <MenuItem value="WorkingHoliday">Working Holiday</MenuItem>
                                                        <MenuItem value="TemporaryVisa">Temporary Visa</MenuItem>
                                                        <MenuItem value="Other">Other</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Availability</InputLabel>
                                                    <Select
                                                        name="availability"
                                                        value={filters.availability}
                                                        onChange={handleFilterChange}
                                                        label="Availability"
                                                        multiple
                                                        renderValue={(selected) => selected.join(', ')}
                                                        sx={{
                                                            borderRadius: 3,
                                                        }}
                                                    >
                                                        <MenuItem value="morning">Morning</MenuItem>
                                                        <MenuItem value="afternoon">Afternoon</MenuItem>
                                                        <MenuItem value="evening">Evening</MenuItem>
                                                        <MenuItem value="night">Night</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Slide>
                            </Paper>
                        </Slide>

                        {/* Results Section */}
                        <Fade in timeout={700}>
                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: 3,
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    p: { xs: 2, sm: 3, md: 3 },
                                    minHeight: 400,
                                    overflowX: 'auto',
                                }}
                            >
                                {error && (
                                    <Alert 
                                        severity="error" 
                                        sx={{ 
                                            mb: 2, 
                                            borderRadius: 3,
                                            '& .MuiAlert-message': {
                                                fontWeight: 500,
                                            }
                                        }}
                                    >
                                        {error}
                                    </Alert>
                                )}
                                
                                {!error && workers.length === 0 && !loading && (
                                    <Alert 
                                        severity="info" 
                                        sx={{ 
                                            mb: 2, 
                                            borderRadius: 3,
                                            '& .MuiAlert-message': {
                                                fontWeight: 500,
                                            }
                                        }}
                                    >
                                        No workers found matching your criteria. Try adjusting your filters.
                                    </Alert>
                                )}

                                {viewMode === 'card' ? (
                                    <Grid container spacing={3}>
                                        {loading ? (
                                            <Grid item xs={12}>
                                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                                    <CircularProgress size={60} />
                                                </Box>
                                            </Grid>
                                        ) : (
                                            workers.map((worker) => renderWorkerCard(worker))
                                        )}
                                    </Grid>
                                ) : (
                                    <TableContainer>
                                        <Table size={isMobile ? 'small' : 'medium'}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell 
                                                        sx={{ 
                                                            fontWeight: 700, 
                                                            color: theme.palette.primary.main,
                                                            borderBottom: `2px solid ${theme.palette.primary.main}`,
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            Name
                                                            {renderSortButton('name', 'Name')}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell 
                                                        sx={{ 
                                                            fontWeight: 700, 
                                                            color: theme.palette.primary.main,
                                                            borderBottom: `2px solid ${theme.palette.primary.main}`,
                                                        }}
                                                    >
                                                        Skills
                                                    </TableCell>
                                                    <TableCell 
                                                        sx={{ 
                                                            fontWeight: 700, 
                                                            color: theme.palette.primary.main,
                                                            borderBottom: `2px solid ${theme.palette.primary.main}`,
                                                        }}
                                                    >
                                                        Residency Status
                                                    </TableCell>
                                                    <TableCell 
                                                        sx={{ 
                                                            fontWeight: 700, 
                                                            color: theme.palette.primary.main,
                                                            borderBottom: `2px solid ${theme.palette.primary.main}`,
                                                        }}
                                                    >
                                                        Hourly Rate
                                                    </TableCell>
                                                    <TableCell 
                                                        sx={{ 
                                                            fontWeight: 700, 
                                                            color: theme.palette.primary.main,
                                                            borderBottom: `2px solid ${theme.palette.primary.main}`,
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            Verification
                                                            {renderSortButton('verificationStatus', 'Verification')}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell 
                                                        sx={{ 
                                                            fontWeight: 700, 
                                                            color: theme.palette.primary.main,
                                                            borderBottom: `2px solid ${theme.palette.primary.main}`,
                                                        }}
                                                    >
                                                        Availability
                                                    </TableCell>
                                                    <TableCell 
                                                        sx={{ 
                                                            fontWeight: 700, 
                                                            color: theme.palette.primary.main,
                                                            borderBottom: `2px solid ${theme.palette.primary.main}`,
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            Last Active
                                                            {renderSortButton('lastActive', 'Last Active')}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell 
                                                        sx={{ 
                                                            fontWeight: 700, 
                                                            color: theme.palette.primary.main,
                                                            borderBottom: `2px solid ${theme.palette.primary.main}`,
                                                        }}
                                                    >
                                                        Actions
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {loading ? (
                                                    <TableRow>
                                                        <TableCell colSpan={8} align="center">
                                                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                                                <CircularProgress size={60} />
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : workers.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={8} align="center">
                                                            <Box sx={{ p: 4 }}>
                                                                <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                                                <Typography variant="h6" color="text.secondary">
                                                                    No workers found
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Try adjusting your search criteria
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    workers.map((worker) => (
                                                        <TableRow 
                                                            key={worker.id} 
                                                            hover
                                                            sx={{
                                                                '&:hover': {
                                                                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                                                }
                                                            }}
                                                        >
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Avatar
                                                                        sx={{
                                                                            bgcolor: theme.palette.primary.main,
                                                                            width: 40,
                                                                            height: 40,
                                                                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                                                        }}
                                                                    >
                                                                        <PersonIcon />
                                                                    </Avatar>
                                                                    <Box>
                                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                                            {worker.name}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            {worker.email}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
                                                                    {worker.skills && worker.skills.length > 0 ? (
                                                                        worker.skills.slice(0, 3).map((skill, index) => (
                                                                            <Chip
                                                                                key={index}
                                                                                label={skill}
                                                                                size="small"
                                                                                sx={{
                                                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                                                    color: theme.palette.primary.main,
                                                                                    fontWeight: 500,
                                                                                    fontSize: '0.75rem',
                                                                                }}
                                                                            />
                                                                        ))
                                                                    ) : (
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            No skills listed
                                                                        </Typography>
                                                                    )}
                                                                    {worker.skills && worker.skills.length > 3 && (
                                                                        <Chip
                                                                            label={`+${worker.skills.length - 3}`}
                                                                            size="small"
                                                                            sx={{
                                                                                bgcolor: alpha(theme.palette.grey[500], 0.1),
                                                                                color: theme.palette.grey[600],
                                                                                fontSize: '0.75rem',
                                                                            }}
                                                                        />
                                                                    )}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={worker.residencyStatus}
                                                                    size="small"
                                                                    color="primary"
                                                                    variant="outlined"
                                                                    sx={{
                                                                        fontWeight: 500,
                                                                        borderRadius: 2,
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                    <MoneyIcon color="success" fontSize="small" />
                                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                                        ${worker.hourlyRate}/hr
                                                                    </Typography>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={worker.verificationStatus}
                                                                    color={getVerificationStatusColor(worker.verificationStatus)}
                                                                    size="small"
                                                                    sx={{
                                                                        fontWeight: 500,
                                                                        borderRadius: 2,
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={getAvailabilityText(worker.availability)}
                                                                    color={worker.isAvailable ? "success" : "error"}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{
                                                                        fontWeight: 500,
                                                                        borderRadius: 2,
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {worker.lastActive ? new Date(worker.lastActive).toLocaleDateString() : 'N/A'}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Tooltip title="View Details">
                                                                    <IconButton
                                                                        size="small"
                                                                        color="primary"
                                                                        onClick={() => handleWorkerDetails(worker.id)}
                                                                        sx={{
                                                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                                            transition: 'all 0.2s ease-in-out',
                                                                            '&:hover': {
                                                                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                                                                                transform: 'scale(1.1)',
                                                                            }
                                                                        }}
                                                                    >
                                                                        <ViewIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}

                                {!loading && workers.length > 0 && (
                                    <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.grey[100], 0.5), borderRadius: 3 }}>
                                        <TablePagination
                                            component="div"
                                            count={totalWorkers}
                                            page={page}
                                            onPageChange={handleChangePage}
                                            rowsPerPage={rowsPerPage}
                                            onRowsPerPageChange={handleChangeRowsPerPage}
                                            rowsPerPageOptions={[5, 10, 25, 50]}
                                            sx={{
                                                '& .MuiTablePagination-toolbar': {
                                                    color: theme.palette.text.primary,
                                                },
                                                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                                    fontWeight: 500,
                                                },
                                            }}
                                        />
                                    </Box>
                                )}
                            </Paper>
                        </Fade>
                    </Box>
                </Container>
                </Box>
            </Box>
        </>
    );
};

export default WorkerManagementDashboard;