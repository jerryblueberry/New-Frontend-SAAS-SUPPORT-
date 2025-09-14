import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    TextField,
    IconButton,
    Fade,
    Backdrop,
    CircularProgress,
    useTheme,
    useMediaQuery,
    alpha,
    Stack,
    Alert,
    Snackbar,
    Chip,
    Avatar,
    Card,
    CardContent,
    LinearProgress,
    Tooltip,
    Badge,
    Divider,
    Container
} from '@mui/material';
import {
    Close as CloseIcon,
    Save as SaveIcon,
    Person as PersonIcon,
    Work as WorkIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    AttachMoney as MoneyIcon,
    Description as DescriptionIcon,
    Star as StarIcon,
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Camera as CameraIcon,
    Add as AddIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Debug: Ensure ReactQuill is available
console.log('ReactQuill imported:', !!ReactQuill);
import api from '../../../../api/axios';
import imageCompression from 'browser-image-compression';

const EditWorkerProfileComponent = ({
    open,
    onClose,
    user,
    onboardingData,
    onSuccess
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const quillRef = useRef(null);

    // Form state
    const [formState, setFormState] = useState({});
    const [initialFormState, setInitialFormState] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errors, setErrors] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Profile picture state
    const [profilePicture, setProfilePicture] = useState({
        file: null,
        preview: '',
        currentUrl: '',
        hasChanged: false
    });

    // Biography state
    const [biography, setBiography] = useState('');
    const [biographyCharCount, setBiographyCharCount] = useState(0);
    const [isQuillFocused, setIsQuillFocused] = useState(false);
    const maxBiographyChars = 5000;

    // Get plain text length from HTML content
    const getPlainTextLength = useCallback((html) => {
        if (!html) return 0;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent?.length || 0;
    }, []);

    // React Quill configuration
    const quillModules = useMemo(() => ({
        toolbar: {
            container: isMobile ? [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link'],
                ['clean']
            ] : [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'indent': '-1' }, { 'indent': '+1' }],
                ['blockquote', 'link'],
                [{ 'align': [] }],
                ['clean']
            ],
            handlers: {
                // Custom handlers can be added here
            }
        },
        clipboard: {
            matchVisual: false,
        },
        history: {
            delay: 1000,
            maxStack: 50,
            userOnly: false
        }
    }), [isMobile]);

    const quillFormats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet', 'indent',
        'blockquote', 'link', 'align'
    ];

    // Initialize form state when modal opens
    useEffect(() => {
        if (open && user && onboardingData) {
            const initialState = {
                firstName: user?.firstName || '',
                lastName: user?.lastName || '',
                phone: user?.phone || '',
                expectedHourlyRate: onboardingData?.data?.profile?.expectedHourlyRate || 0,
                skills: onboardingData?.data?.profile?.skillTags?.join(', ') || '',
                availability: onboardingData?.data?.profile?.availability || 'full-time',
                education: onboardingData?.data?.profile?.education || 'high-school',
                newSkill: ''
            };

            const initialBiography = onboardingData?.data?.profile?.biography || '';
            
            setFormState(initialState);
            setInitialFormState(initialState);
            setBiography(initialBiography);
            setBiographyCharCount(getPlainTextLength(initialBiography));
            
            setProfilePicture({
                file: null,
                preview: '',
                currentUrl: onboardingData?.data?.profile?.profilePicture || '',
                hasChanged: false
            });
            setErrors({});
            setUploadProgress(0);

            // Debug: Check if ReactQuill is loaded
            console.log('ReactQuill component loaded:', !!ReactQuill);
            console.log('Initial biography:', initialBiography);
        }
    }, [open, user, onboardingData, getPlainTextLength]);

    // Debug: Check component mount and Quill availability
    useEffect(() => {
        console.log('EditWorkerProfileComponent mounted');
        console.log('ReactQuill available in component:', !!ReactQuill);
        
        // Force re-render of Quill if needed
        if (open && quillRef.current) {
            setTimeout(() => {
                console.log('Quill ref available:', !!quillRef.current);
            }, 100);
        }
    }, [open]);

    // Handle biography change
    const handleBiographyChange = useCallback((content) => {
        const plainTextLength = getPlainTextLength(content);
        
        if (plainTextLength > maxBiographyChars) {
            setSnackbar({
                open: true,
                message: `Biography cannot exceed ${maxBiographyChars} characters`,
                severity: 'warning'
            });
            return;
        }
        
        setBiography(content);
        setBiographyCharCount(plainTextLength);
    }, [getPlainTextLength, maxBiographyChars]);

    // Handle form field changes
    const handleChange = useCallback((field, value) => {
        setFormState(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    }, [errors]);

    // Handle file selection with validation
    const handleFileChange = useCallback(async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setSnackbar({
                open: true,
                message: 'Please select a valid image file (JPEG, PNG, or WebP)',
                severity: 'error'
            });
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setSnackbar({
                open: true,
                message: 'Image size must be less than 5MB',
                severity: 'error'
            });
            return;
        }

        // Compress image
        try {
            const compressedFile = await imageCompression(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true
            });

            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicture(prev => ({
                    ...prev,
                    file: compressedFile,
                    preview: reader.result,
                    hasChanged: true
                }));
            };
            reader.readAsDataURL(compressedFile);
        } catch (error) {
            console.error('Error compressing image:', error);
            setSnackbar({
                open: true,
                message: 'Failed to compress image. Please try again.',
                severity: 'error'
            });
        }
    }, []);

    // Remove profile picture
    const handleRemoveProfilePicture = useCallback(() => {
        setProfilePicture(prev => ({
            ...prev,
            file: null,
            preview: '',
            hasChanged: true
        }));
    }, []);

    // Upload image to Cloudinary
    const uploadImageToCloudinary = useCallback(async () => {
        if (!profilePicture.file) return null;

        const formData = new FormData();
        formData.append('file', profilePicture.file);
        formData.append('upload_preset', 'Certificate(Saas)');
        formData.append('folder', 'SAAS(Support Worker)');

        const cloudName = 'dgsphdhns';

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Error uploading image:', error);
            setSnackbar({
                open: true,
                message: 'Failed to upload image. Please try again.',
                severity: 'error'
            });
            throw error;
        }
    }, [profilePicture.file]);

    // Add skill function
    const addSkill = useCallback(() => {
        const newSkill = formState.newSkill?.trim();
        if (!newSkill) return;

        const currentSkills = formState.skills ? formState.skills.split(',').map(s => s.trim()) : [];

        if (currentSkills.includes(newSkill)) {
            setErrors(prev => ({ ...prev, newSkill: 'This skill already exists' }));
            return;
        }

        if (currentSkills.length >= 10) {
            setErrors(prev => ({ ...prev, newSkill: 'Maximum 10 skills allowed' }));
            return;
        }

        const updatedSkills = currentSkills.length > 0 ? `${formState.skills}, ${newSkill}` : newSkill;
        setFormState(prev => ({ ...prev, skills: updatedSkills, newSkill: '' }));
        setErrors(prev => ({ ...prev, newSkill: '' }));
    }, [formState.newSkill, formState.skills]);

    // Remove skill function
    const removeSkill = useCallback((skillToRemove) => {
        const currentSkills = formState.skills.split(',').map(s => s.trim());
        const updatedSkills = currentSkills.filter(skill => skill !== skillToRemove);
        setFormState(prev => ({ ...prev, skills: updatedSkills.join(', ') }));
    }, [formState.skills]);

    // Validation
    const validateForm = useCallback(() => {
        const newErrors = {};

        if (!formState.firstName?.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formState.lastName?.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formState.phone?.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formState.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (formState.expectedHourlyRate < 0) {
            newErrors.expectedHourlyRate = 'Hourly rate cannot be negative';
        }

        if (getPlainTextLength(biography) > maxBiographyChars) {
            newErrors.biography = `Biography cannot exceed ${maxBiographyChars} characters`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formState, biography, maxBiographyChars, getPlainTextLength]);

    // Get only changed fields
    const getChangedFields = useCallback(() => {
        const changedFields = {};

        Object.keys(formState).forEach(key => {
            if (key !== 'newSkill' && formState[key] !== initialFormState[key]) {
                changedFields[key] = formState[key];
            }
        });

        // Check biography changes
        const initialBiography = onboardingData?.data?.profile?.biography || '';
        if (biography !== initialBiography) {
            changedFields.biography = biography;
        }

        return changedFields;
    }, [formState, initialFormState, biography, onboardingData]);

    // Handle save
    const handleSave = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        setUploadProgress(0);

        try {
            const changedFields = getChangedFields();

            // Upload image if changed
            if (profilePicture.hasChanged) {
                if (profilePicture.file) {
                    const uploadedUrl = await uploadImageToCloudinary();
                    changedFields.profilePicture = uploadedUrl;
                } else {
                    changedFields.profilePicture = '';
                }
            }

            // Only proceed if there are changes
            if (Object.keys(changedFields).length === 0 && !profilePicture.hasChanged) {
                setSnackbar({
                    open: true,
                    message: 'No changes to save',
                    severity: 'info'
                });
                setIsLoading(false);
                return;
            }

            const response = await api.put('/onboarding/update-profile', changedFields);

            if (response.data.success) {
                setSnackbar({
                    open: true,
                    message: 'Profile updated successfully!',
                    severity: 'success'
                });

                if (onSuccess) {
                    onSuccess(response.data);
                }

                setTimeout(() => {
                    onClose();
                }, 1500);
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to update profile. Please try again.',
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
            setUploadProgress(0);
        }
    };

    // Handle close with unsaved changes warning
    const handleClose = useCallback(() => {
        if (isLoading) return;

        const hasChanges = Object.keys(getChangedFields()).length > 0 || profilePicture.hasChanged;

        if (hasChanges) {
            if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
                onClose();
            }
        } else {
            onClose();
        }
    }, [isLoading, getChangedFields, profilePicture.hasChanged, onClose]);

    const currentSkills = formState.skills ? formState.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
    
    // Character count display
    const characterCountDisplay = useMemo(() => (
        <Chip
            size="small"
            label={`${biographyCharCount}/${maxBiographyChars}`}
            variant="outlined"
            color={biographyCharCount > maxBiographyChars * 0.9 ? 'warning' : 'default'}
            sx={{ borderRadius: 2 }}
        />
    ), [biographyCharCount, maxBiographyChars]);

    return (
        <>
            {/* Global Quill Styles */}
            <style jsx global>{`
                .quill-biography-editor {
                    width: 100% !important;
                    display: block !important;
                    visibility: visible !important;
                    position: relative;
                }

                .quill-biography-editor .ql-toolbar.ql-snow {
                    border: 1px solid ${alpha(theme.palette.divider, 0.2)} !important;
                    border-bottom: none;
                    border-radius: 12px 12px 0 0;
                    background: ${alpha(theme.palette.grey[50], 0.8)};
                    padding: 12px 16px;
                    width: 100% !important;
                    box-sizing: border-box;
                    display: block !important;
                    visibility: visible !important;
                }

                .quill-biography-editor .ql-container.ql-snow {
                    border: 1px solid ${alpha(theme.palette.divider, 0.2)} !important;
                    border-radius: 0 0 12px 12px;
                    font-family: ${theme.typography.fontFamily};
                    font-size: 1rem;
                    line-height: 1.6;
                    width: 100% !important;
                    box-sizing: border-box;
                    background: ${theme.palette.background.paper};
                    display: block !important;
                    visibility: visible !important;
                }

                .quill-biography-editor .ql-editor {
                    min-height: 300px !important;
                    max-height: 500px;
                    padding: 24px;
                    color: ${theme.palette.text.primary};
                    overflow-y: auto;
                    width: 100% !important;
                    box-sizing: border-box;
                    font-size: 1rem;
                    line-height: 1.6;
                    letter-spacing: 0.01em;
                    display: block !important;
                    visibility: visible !important;
                }

                .quill-biography-editor .ql-editor.ql-blank::before {
                    content: 'Share your professional journey, skills, achievements, and what makes you unique...';
                    color: ${alpha(theme.palette.text.secondary, 0.8)};
                    font-style: italic;
                    font-weight: 400;
                    left: 28px;
                    right: 28px;
                    top: 32px;
                    pointer-events: none;
                }

                .quill-biography-editor .ql-editor:focus {
                    outline: none;
                }

                .quill-biography-editor .ql-toolbar .ql-formats {
                    margin-right: 20px;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }

                .quill-biography-editor .ql-toolbar button {
                    border-radius: 10px;
                    margin: 0 3px;
                    padding: 10px;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    border: none;
                    background: transparent;
                    min-width: 38px;
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                }

                .quill-biography-editor .ql-toolbar button::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: transparent;
                    border-radius: 10px;
                    transition: all 0.25s ease;
                    transform: scale(0);
                }

                .quill-biography-editor .ql-toolbar button:hover::before {
                    background: ${alpha(theme.palette.primary.main, 0.08)};
                    transform: scale(1);
                }

                .quill-biography-editor .ql-toolbar button:hover {
                    color: ${theme.palette.primary.main};
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px ${alpha(theme.palette.primary.main, 0.15)};
                }

                .quill-biography-editor .ql-toolbar button.ql-active {
                    background: ${alpha(theme.palette.primary.main, 0.12)};
                    color: ${theme.palette.primary.main};
                    transform: translateY(0);
                    box-shadow: 0 2px 8px ${alpha(theme.palette.primary.main, 0.2)};
                }

                .quill-biography-editor .ql-toolbar button.ql-active::before {
                    background: ${alpha(theme.palette.primary.main, 0.08)};
                    transform: scale(1);
                }

                .quill-biography-editor .ql-toolbar .ql-picker {
                    border-radius: 10px;
                    transition: all 0.25s ease;
                }

                .quill-biography-editor .ql-toolbar .ql-picker:hover {
                    background: ${alpha(theme.palette.primary.main, 0.08)};
                }

                .quill-biography-editor .ql-container {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .quill-biography-editor:hover .ql-container {
                    border-color: ${alpha(theme.palette.primary.main, 0.3)};
                }

                .quill-biography-editor.focused .ql-container,
                .quill-biography-editor .ql-container:focus-within {
                    border-color: ${theme.palette.primary.main};
                    box-shadow: 0 0 0 4px ${alpha(theme.palette.primary.main, 0.08)}, 
                                0 8px 32px ${alpha(theme.palette.primary.main, 0.12)};
                    transform: translateY(-2px);
                }

                .quill-biography-editor .ql-editor h1,
                .quill-biography-editor .ql-editor h2,
                .quill-biography-editor .ql-editor h3 {
                    font-weight: 700;
                    color: ${theme.palette.text.primary};
                    margin: 1.5em 0 0.75em 0;
                    letter-spacing: -0.01em;
                }

                .quill-biography-editor .ql-editor h1 {
                    font-size: 1.75em;
                }

                .quill-biography-editor .ql-editor h2 {
                    font-size: 1.5em;
                }

                .quill-biography-editor .ql-editor h3 {
                    font-size: 1.25em;
                }

                .quill-biography-editor .ql-editor h1:first-child,
                .quill-biography-editor .ql-editor h2:first-child,
                .quill-biography-editor .ql-editor h3:first-child {
                    margin-top: 0;
                }

                .quill-biography-editor .ql-editor p {
                    margin: 1em 0;
                    text-align: justify;
                }

                .quill-biography-editor .ql-editor ul,
                .quill-biography-editor .ql-editor ol {
                    margin: 1em 0;
                    padding-left: 2em;
                }

                .quill-biography-editor .ql-editor li {
                    margin: 0.5em 0;
                    line-height: 1.8;
                }

                .quill-biography-editor .ql-editor strong {
                    font-weight: 700;
                    color: ${theme.palette.text.primary};
                }

                .quill-biography-editor .ql-editor em {
                    font-style: italic;
                    color: ${alpha(theme.palette.text.primary, 0.9)};
                }

                .quill-biography-editor .ql-editor a {
                    color: ${theme.palette.primary.main};
                    text-decoration: none;
                    background: linear-gradient(transparent 60%, ${alpha(theme.palette.primary.main, 0.2)} 60%);
                    padding: 2px 4px;
                    border-radius: 4px;
                    transition: all 0.2s ease;
                }

                .quill-biography-editor .ql-editor a:hover {
                    background: ${alpha(theme.palette.primary.main, 0.15)};
                    transform: translateY(-1px);
                }

                .quill-biography-editor .ql-editor blockquote {
                    border-left: 4px solid ${theme.palette.primary.main};
                    margin: 1.5em 0;
                    padding-left: 1.5em;
                    color: ${alpha(theme.palette.text.primary, 0.8)};
                    font-style: italic;
                    background: ${alpha(theme.palette.grey[50], 0.5)};
                    padding: 1em 1.5em;
                    border-radius: 0 8px 8px 0;
                }

                /* Responsive adjustments */
                @media (max-width: ${theme.breakpoints.values.sm}px) {
                    .quill-biography-editor .ql-toolbar.ql-snow {
                        padding: 8px 12px;
                    }

                    .quill-biography-editor .ql-editor {
                        padding: 16px;
                        min-height: 250px !important;
                    }

                    .quill-biography-editor .ql-editor.ql-blank::before {
                        left: 16px;
                        right: 16px;
                        top: 16px;
                    }

                    .quill-biography-editor .ql-toolbar .ql-formats {
                        margin-right: 8px;
                    }
                }

                /* Enhanced scrollbar styling */
                .quill-biography-editor .ql-editor::-webkit-scrollbar {
                    width: 6px;
                }

                .quill-biography-editor .ql-editor::-webkit-scrollbar-track {
                    background: transparent;
                    border-radius: 3px;
                }

                .quill-biography-editor .ql-editor::-webkit-scrollbar-thumb {
                    background: ${alpha(theme.palette.grey[400], 0.6)};
                    border-radius: 3px;
                    transition: all 0.2s ease;
                }

                .quill-biography-editor .ql-editor::-webkit-scrollbar-thumb:hover {
                    background: ${alpha(theme.palette.grey[500], 0.8)};
                    width: 8px;
                }

                /* Firefox scrollbar */
                .quill-biography-editor .ql-editor {
                    scrollbar-width: thin;
                    scrollbar-color: ${alpha(theme.palette.grey[400], 0.6)} transparent;
                }

                /* Focus states and animations */
                .quill-biography-editor .ql-toolbar.ql-snow:hover {
                    background: linear-gradient(135deg, ${alpha(theme.palette.grey[50], 0.95)} 0%, ${alpha(theme.palette.grey[100], 0.7)} 100%);
                }

                .quill-biography-editor .ql-editor:focus {
                    background: ${alpha(theme.palette.primary.main, 0.01)};
                }

                /* Tooltip animations */
                .quill-biography-editor .ql-tooltip {
                    border-radius: 8px;
                    border: 1px solid ${alpha(theme.palette.divider, 0.2)};
                    box-shadow: 0 8px 32px ${alpha(theme.palette.common.black, 0.12)};
                    background: ${theme.palette.background.paper};
                    backdrop-filter: blur(10px);
                }

                /* Loading state */
                .quill-biography-editor.loading {
                    opacity: 0.7;
                    pointer-events: none;
                }

                .quill-biography-editor.loading .ql-editor {
                    background: ${alpha(theme.palette.grey[100], 0.3)};
                }
            `}</style>

            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: theme.zIndex.modal - 1,
                    backdropFilter: 'blur(20px)',
                    backgroundColor: alpha(theme.palette.common.black, 0.4)
                }}
                open={open}
                onClick={handleClose}
            />

            <Fade in={open}>
                <Container
                    maxWidth="lg"
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: theme.zIndex.modal,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: { xs: 1, sm: 2 }
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            width: '100%',
                            maxWidth: 900,
                            maxHeight: '95vh',
                            overflow: 'hidden',
                            borderRadius: { xs: 3, sm: 4 },
                            background: theme.palette.background.paper,
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            boxShadow: `0 25px 50px -12px ${alpha(theme.palette.common.black, 0.25)}`
                        }}
                    >
                        {/* Loading Progress Bar */}
                        {(isLoading || uploadProgress > 0) && (
                            <LinearProgress
                                variant={uploadProgress > 0 ? "determinate" : "indeterminate"}
                                value={uploadProgress}
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    zIndex: 1,
                                    height: 3,
                                    '& .MuiLinearProgress-bar': {
                                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                                    }
                                }}
                            />
                        )}

                        {/* Header */}
                        <Box
                            sx={{
                                p: { xs: 3, sm: 4 },
                                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                                background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.grey[50], 0.3)} 100%)`
                            }}
                        >
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography 
                                        variant={isMobile ? "h5" : "h4"} 
                                        fontWeight="600"
                                        sx={{ 
                                            color: theme.palette.text.primary,
                                            letterSpacing: '-0.02em'
                                        }}
                                    >
                                        Edit Profile
                                    </Typography>
                                    <Typography 
                                        variant="body1" 
                                        color="text.secondary"
                                        sx={{ mt: 0.5, fontWeight: 400 }}
                                    >
                                        Update your professional information
                                    </Typography>
                                </Box>

                                <IconButton 
                                    onClick={handleClose} 
                                    disabled={isLoading}
                                    sx={{
                                        bgcolor: alpha(theme.palette.grey[100], 0.8),
                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.grey[200], 0.8),
                                            transform: 'scale(1.05)'
                                        },
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Stack>
                        </Box>

                        {/* Content */}
                        <Box sx={{ flex: 1, overflow: 'auto' }}>
                            <Box sx={{ p: { xs: 3, sm: 4 } }}>

                                {/* Profile Picture Section */}
                                <Box sx={{ mb: 4 }}>
                                    <Typography 
                                        variant="h6" 
                                        fontWeight="600" 
                                        sx={{ mb: 3, color: theme.palette.text.primary }}
                                    >
                                        Profile Picture
                                    </Typography>
                                    
                                    <Stack
                                        direction={{ xs: 'column', sm: 'row' }}
                                        alignItems="center"
                                        spacing={4}
                                        sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            bgcolor: alpha(theme.palette.grey[50], 0.5),
                                            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`
                                        }}
                                    >
                                        <Box sx={{ position: 'relative' }}>
                                            <Avatar
                                                src={profilePicture.preview || profilePicture.currentUrl || user?.profilePicture || undefined}
                                                sx={{
                                                    width: { xs: 120, sm: 140 },
                                                    height: { xs: 120, sm: 140 },
                                                    border: `4px solid ${theme.palette.background.paper}`,
                                                    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
                                                    fontSize: '3rem'
                                                }}
                                            >
                                                {!profilePicture.preview && !profilePicture.currentUrl && <PersonIcon fontSize="inherit" />}
                                            </Avatar>

                                            {(profilePicture.preview || profilePicture.currentUrl) && (
                                                <IconButton
                                                    size="small"
                                                    onClick={handleRemoveProfilePicture}
                                                    disabled={isLoading}
                                                    sx={{
                                                        position: 'absolute',
                                                        top: -8,
                                                        right: -8,
                                                        bgcolor: 'error.main',
                                                        color: 'white',
                                                        width: 32,
                                                        height: 32,
                                                        boxShadow: 2,
                                                        '&:hover': { 
                                                            bgcolor: 'error.dark',
                                                            transform: 'scale(1.1)'
                                                        },
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Box>

                                        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                disabled={isLoading}
                                                style={{ display: 'none' }}
                                                id="profile-picture-upload"
                                            />
                                            <label htmlFor="profile-picture-upload">
                                                <Button
                                                    variant="contained"
                                                    component="span"
                                                    disabled={isLoading}
                                                    startIcon={<CloudUploadIcon />}
                                                    sx={{ 
                                                        mb: 2,
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        fontWeight: 500,
                                                        px: 3,
                                                        py: 1
                                                    }}
                                                >
                                                    Choose Image
                                                </Button>
                                            </label>
                                            <Typography 
                                                variant="body2" 
                                                color="text.secondary"
                                                sx={{ maxWidth: 200 }}
                                            >
                                                Upload a professional photo. JPG, PNG or WebP. Maximum size: 5MB
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>

                                {/* Form Fields */}
                                <Grid container spacing={4}>
                                    {/* Personal Information */}
                                    <Grid item xs={12} md={6}>
                                        <Box>
                                            <Typography 
                                                variant="h6" 
                                                fontWeight="600" 
                                                sx={{ mb: 3, color: theme.palette.text.primary }}
                                            >
                                                Personal Information
                                            </Typography>

                                            <Stack spacing={3}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            fullWidth
                                                            label="First Name *"
                                                            value={formState.firstName || ''}
                                                            onChange={(e) => handleChange('firstName', e.target.value)}
                                                            error={!!errors.firstName}
                                                            helperText={errors.firstName}
                                                            disabled={isLoading}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: 2,
                                                                    '&:hover fieldset': {
                                                                        borderColor: theme.palette.primary.main,
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            fullWidth
                                                            label="Last Name *"
                                                            value={formState.lastName || ''}
                                                            onChange={(e) => handleChange('lastName', e.target.value)}
                                                            error={!!errors.lastName}
                                                            helperText={errors.lastName}
                                                            disabled={isLoading}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: 2,
                                                                    '&:hover fieldset': {
                                                                        borderColor: theme.palette.primary.main,
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </Grid>
                                                </Grid>

                                                <TextField
                                                    fullWidth
                                                    label="Email"
                                                    value={user?.email || ''}
                                                    disabled
                                                    InputProps={{
                                                        startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                    }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 2,
                                                            bgcolor: alpha(theme.palette.grey[100], 0.5)
                                                        }
                                                    }}
                                                />

                                                <TextField
                                                    fullWidth
                                                    label="Phone Number *"
                                                    value={formState.phone || ''}
                                                    onChange={(e) => handleChange('phone', e.target.value)}
                                                    error={!!errors.phone}
                                                    helperText={errors.phone}
                                                    disabled={isLoading}
                                                    InputProps={{
                                                        startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                    }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 2,
                                                            '&:hover fieldset': {
                                                                borderColor: theme.palette.primary.main,
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Stack>
                                        </Box>
                                    </Grid>

                                    {/* Professional Information */}
                                    <Grid item xs={12} md={6}>
                                        <Box>
                                            <Typography 
                                                variant="h6" 
                                                fontWeight="600" 
                                                sx={{ mb: 3, color: theme.palette.text.primary }}
                                            >
                                                Hourly Rate
                                            </Typography>

                                            <TextField
                                                fullWidth
                                                label="Expected Hourly Rate ($)"
                                                type="number"
                                                value={formState.expectedHourlyRate || ''}
                                                onChange={(e) => handleChange('expectedHourlyRate', parseFloat(e.target.value) || 0)}
                                                error={!!errors.expectedHourlyRate}
                                                helperText={errors.expectedHourlyRate}
                                                disabled={isLoading}
                                                InputProps={{
                                                    startAdornment: <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                        '&:hover fieldset': {
                                                            borderColor: theme.palette.primary.main,
                                                        }
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Grid>

                                    {/* Skills */}
                                    <Grid item xs={12}>
                                        <Box>
                                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                                                <Typography 
                                                    variant="h6" 
                                                    fontWeight="600" 
                                                    sx={{ color: theme.palette.text.primary }}
                                                >
                                                    Skills 
                                                </Typography>
                                                <Chip 
                                                    label={`${currentSkills.length}/10`} 
                                                    size="small" 
                                                    color="primary" 
                                                    variant="outlined"
                                                />
                                            </Stack>

                                            {/* Add Skill Input */}
                                            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Add new skill"
                                                    value={formState.newSkill || ''}
                                                    onChange={(e) => handleChange('newSkill', e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            addSkill();
                                                        }
                                                    }}
                                                    error={!!errors.newSkill}
                                                    helperText={errors.newSkill}
                                                    disabled={isLoading || currentSkills.length >= 10}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 2,
                                                            '&:hover fieldset': {
                                                                borderColor: theme.palette.primary.main,
                                                            }
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    variant="contained"
                                                    onClick={addSkill}
                                                    disabled={isLoading || !formState.newSkill?.trim() || currentSkills.length >= 10}
                                                    startIcon={<AddIcon />}
                                                    sx={{ 
                                                        minWidth: 120,
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    Add
                                                </Button>
                                            </Stack>

                                            {/* Skills Display */}
                                            {currentSkills.length > 0 ? (
                                                <Box 
                                                    sx={{ 
                                                        display: 'flex', 
                                                        flexWrap: 'wrap', 
                                                        gap: 1.5,
                                                        p: 3,
                                                        borderRadius: 3,
                                                        bgcolor: alpha(theme.palette.grey[50], 0.5),
                                                        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`
                                                    }}
                                                >
                                                    {currentSkills.map((skill, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={skill}
                                                            onDelete={() => removeSkill(skill)}
                                                            disabled={isLoading}
                                                            color="primary"
                                                            variant="filled"
                                                            sx={{
                                                                borderRadius: 2,
                                                                '& .MuiChip-deleteIcon': {
                                                                    '&:hover': {
                                                                        color: 'error.main'
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            ) : (
                                                <Box 
                                                    sx={{ 
                                                        p: 4,
                                                        textAlign: 'center',
                                                        borderRadius: 3,
                                                        bgcolor: alpha(theme.palette.grey[50], 0.3),
                                                        border: `2px dashed ${alpha(theme.palette.divider, 0.2)}`
                                                    }}
                                                >
                                                    <Typography variant="body2" color="text.secondary">
                                                        No skills added yet. Add your first skill above.
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Grid>

                                    {/* Biography Section */}
                                    <Grid item xs={12}>
                                        <Box>
                                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                                                <Typography 
                                                    variant="h6" 
                                                    fontWeight="600" 
                                                    sx={{ color: theme.palette.text.primary }}
                                                >
                                                    Professional Biography
                                                </Typography>
                                                {characterCountDisplay}
                                            </Stack>

                                            {/* React Quill Editor */}
                                            <Box 
                                                className={`quill-biography-editor ${isQuillFocused ? 'focused' : ''} ${isLoading ? 'loading' : ''}`}
                                                sx={{ 
                                                    position: 'relative',
                                                    width: '100%',
                                                    display: 'block !important',
                                                    visibility: 'visible !important',
                                                    minHeight: '350px'
                                                }}
                                            >
                                                {ReactQuill ? (
                                                    <ReactQuill 
                                                        ref={quillRef}
                                                        theme="snow"
                                                        value={biography}
                                                        onChange={handleBiographyChange}
                                                        onFocus={() => setIsQuillFocused(true)}
                                                        onBlur={() => setIsQuillFocused(false)}
                                                        modules={quillModules}
                                                        formats={quillFormats}
                                                        placeholder="Share your professional journey, skills, achievements, and what makes you unique..."
                                                        readOnly={isLoading}
                                                    />
                                                ) : (
                                                    <TextField
                                                        fullWidth
                                                        multiline
                                                        rows={8}
                                                        value={biography}
                                                        onChange={(e) => handleBiographyChange(e.target.value)}
                                                        placeholder="Share your professional journey, skills, achievements, and what makes you unique..."
                                                        disabled={isLoading}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 2,
                                                                backgroundColor: theme.palette.background.paper
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </Box>

                                            {errors.biography && (
                                                <Typography 
                                                    variant="caption" 
                                                    color="error" 
                                                    sx={{ mt: 1, display: 'block' }}
                                                >
                                                    {errors.biography}
                                                </Typography>
                                            )}

                                           
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Box>

                        {/* Footer */}
                        <Box
                            sx={{
                                p: { xs: 3, sm: 4 },
                                borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                                background: `linear-gradient(180deg, ${alpha(theme.palette.grey[50], 0.3)} 0%, ${theme.palette.background.paper} 100%)`
                            }}
                        >
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={3}
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Typography 
                                    variant="body2" 
                                    color="text.secondary"
                                    sx={{ fontWeight: 500 }}
                                >
                                    * Required fields
                                </Typography>

                                <Stack direction="row" spacing={2}>
                                    <Button
                                        variant="outlined"
                                        onClick={handleClose}
                                        disabled={isLoading}
                                        sx={{ 
                                            minWidth: 100,
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: 500,
                                            borderColor: alpha(theme.palette.divider, 0.3),
                                            color: 'text.secondary',
                                            '&:hover': {
                                                borderColor: alpha(theme.palette.primary.main, 0.5),
                                                bgcolor: alpha(theme.palette.primary.main, 0.04)
                                            }
                                        }}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        variant="contained"
                                        onClick={handleSave}
                                        disabled={isLoading}
                                        startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <CheckIcon />}
                                        sx={{
                                            minWidth: 140,
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            py: 1.5,
                                            boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                                            '&:hover': {
                                                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                                                transform: 'translateY(-1px)'
                                            },
                                            '&:active': {
                                                transform: 'translateY(0)'
                                            },
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </Stack>
                            </Stack>
                        </Box>
                    </Paper>
                </Container>
            </Fade>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default EditWorkerProfileComponent;