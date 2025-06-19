import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {useNavigate} from 'react-router-dom';
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
    LinearProgress,
    Tooltip,
} from "@mui/material";
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Refresh as RefreshIcon,
    Visibility as ViewIcon,
    Sort as SortIcon,
} from "@mui/icons-material";
import api from "../../../api/axios";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

const AdminDashboard = () => {
    const navigate = useNavigate()
    const { user } = useAuth();
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalWorkers, setTotalWorkers] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
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

        // Add non-empty filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== "" && key !== "sort") {
                if (Array.isArray(value)) {
                    if (value.length > 0) {
                        queryParams.append(key, value.join(','));
                    }
                } else {
                    // Special handling for skills (skillTags in backend)
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
            console.log('Fetching workers with params:', queryParams.toString());
            
            const response = await api.get(`/admin/workers?${queryParams}`);
            console.log('API Response:', response.data);

            if (response.data?.status === 'success' && Array.isArray(response.data.data.workers)) {
                setWorkers(response.data.data.workers);
                setTotalWorkers(response.data.total);
                setTotalPages(response.data.totalPages);
            } else {
                console.error('Unexpected API response structure:', response.data);
                setError('Invalid response format from server');
                setWorkers([]);
                setTotalWorkers(0);
                setTotalPages(0);
            }
        } catch (err) {
            console.error('Error fetching workers:', err);
            setError(err.response?.data?.message || "Error fetching workers. Please try again.");
            setWorkers([]);
            setTotalWorkers(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [buildQueryParams]);

    useEffect(() => {
        console.log('Component mounted, fetching workers...');
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
            >
                <SortIcon />
            </IconButton>
        </Tooltip>
    );

    if (loading && workers.length === 0) {
        // return (
        //     <Container maxWidth="xl" className="admin-dashboard">
        //         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        //             <CircularProgress />
        //         </Box>
        //     </Container>
        // );
        <LoadingSpinner size="lg" text="Loading Dashboard " fullPage= {true}/>
    }


    //  For the handling of the view user details
        const handleWorkerDetails = (workerId) => {
            navigate(`/worker-details/${workerId}`,{})
        }
    return (
        <Container maxWidth="xl" className="admin-dashboard">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Worker Management Dashboard
                </Typography>
                
                {/* Search and Filter Bar */}
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                placeholder="Search workers..."
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<FilterIcon />}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                Filters
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={handleResetFilters}
                            >
                                Reset
                            </Button>
                        </Grid>
                    </Grid>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            {/* Skills Filter */}
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    name="skills"
                                    label="Skills"
                                    value={filters.skills}
                                    onChange={handleFilterChange}
                                    helperText="Enter skills separated by commas"
                                    placeholder="e.g., cooking, cleaning, childcare"
                                />
                            </Grid>

                            {/* Verification Status */}
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Verification Status</InputLabel>
                                    <Select
                                        name="verificationStatus"
                                        value={filters.verificationStatus}
                                        onChange={handleFilterChange}
                                        label="Verification Status"
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="Fully Verified">Fully Verified</MenuItem>
                                        <MenuItem value="Partially Verified">Partially Verified</MenuItem>
                                        <MenuItem value="Unverified">Unverified</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Residency Status */}
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Residency Status</InputLabel>
                                    <Select
                                        name="residencyStatus"
                                        value={filters.residencyStatus}
                                        onChange={handleFilterChange}
                                        label="Residency Status"
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

                            {/* Availability */}
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
                                    >
                                        <MenuItem value="morning">Morning</MenuItem>
                                        <MenuItem value="afternoon">Afternoon</MenuItem>
                                        <MenuItem value="evening">Evening</MenuItem>
                                        <MenuItem value="night">Night</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    )}
                </Paper>

                {/* Workers Table */}
                <Paper>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {!error && workers.length === 0 && !loading && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            No workers found matching your criteria. Try adjusting your filters.
                        </Alert>
                    )}

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        Name {renderSortButton('name', 'Name')}
                                    </TableCell>
                                    <TableCell>Skills</TableCell>
                                    <TableCell>Residency Status</TableCell>
                                    <TableCell>Hourly Rate</TableCell>
                                    <TableCell>
                                        Verification {renderSortButton('verificationStatus', 'Verification')}
                                    </TableCell>
                                    <TableCell>Availability</TableCell>
                                    <TableCell>
                                        Last Active {renderSortButton('lastActive', 'Last Active')}
                                    </TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                                <CircularProgress />
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : workers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            <Typography variant="body1" color="textSecondary">
                                                No workers found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    workers.map((worker) => (
                                        <TableRow key={worker.id} hover>
                                            <TableCell>
                                                <Typography variant="subtitle2">
                                                    {worker.name}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {worker.email}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {worker.skills && worker.skills.length > 0 ? (
                                                    worker.skills.map((skill, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={skill}
                                                            size="small"
                                                            sx={{ mr: 0.5, mb: 0.5 }}
                                                        />
                                                    ))
                                                ) : (
                                                    <Typography variant="caption" color="textSecondary">
                                                        No skills listed
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={worker.residencyStatus}
                                                    size="small"
                                                    color="primary"
                                                />
                                            </TableCell>
                                            <TableCell>${worker.hourlyRate}/hr</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={worker.verificationStatus}
                                                    color={getVerificationStatusColor(worker.verificationStatus)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getAvailabilityText(worker.availability)}
                                                    color={worker.isAvailable ? "success" : "error"}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {worker.lastActive ? new Date(worker.lastActive).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() =>handleWorkerDetails(worker.id)}
                                                    >
                                                        <ViewIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {!loading && workers.length > 0 && (
                        <TablePagination
                            component="div"
                            count={totalWorkers}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                        />
                    )}
                </Paper>
            </Box>
        </Container>
    );
};

export default AdminDashboard;