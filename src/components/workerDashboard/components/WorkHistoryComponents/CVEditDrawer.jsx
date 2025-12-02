import React, { useState, useEffect, useCallback } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Stack,
  Button,
  Alert,
  CircularProgress,
  LinearProgress,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Avatar,
  Chip,
  Paper
} from '@mui/material';
import {
  Close,
  PictureAsPdf,
  Save,
  Cancel,
  CloudUpload,
  Delete,
  Visibility,
  CheckCircle,
  InsertDriveFile,
  Image as ImageIcon
} from '@mui/icons-material';
import { updateWorkHistorySection } from '../../../../api/axios';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { deleteCloudinaryImage } from '../../../../api/cloudinary';
import DocumentPreview from '../../../workerForm/Modals/DocumentPreview';

/**
 * CVEditDrawer Component
 * Production-ready drawer for editing CV/Resume with upload/replace/delete
 */
const CVEditDrawer = ({
  open,
  onClose,
  initialCV = null,
  onSaveSuccess = null
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [currentCV, setCurrentCV] = useState(initialCV);
  const [previewDocument, setPreviewDocument] = useState(null);

  // Emit drawer events for sidebar visibility
  useEffect(() => {
    if (open) {
      window.dispatchEvent(new Event('drawer:open'));
    } else {
      window.dispatchEvent(new Event('drawer:close'));
    }
    
    return () => {
      if (open) {
        window.dispatchEvent(new Event('drawer:close'));
      }
    };
  }, [open]);

  // Initialize when drawer opens
  useEffect(() => {
    if (open) {
      setCurrentCV(initialCV);
      setFile(null);
      setFileName('');
      setFilePreview(null);
      setUploadProgress(0);
      setSubmitError(null);
    }
  }, [open, initialCV]);

  // Extract Cloudinary public_id from URL with improved error handling
  const extractCloudinaryPublicId = useCallback((url) => {
    if (!url || typeof url !== 'string') return null;
    
    try {
      // Remove query parameters and fragments
      const cleanUrl = url.split('?')[0].split('#')[0];
      
      // Find upload path - handle both /upload/ and /upload/v
      const uploadPattern = /\/upload\/(?:v\d+\/)?/;
      const match = cleanUrl.match(uploadPattern);
      
      if (!match) return null;
      
      // Get the part after upload path
      const uploadIdx = cleanUrl.indexOf(match[0]);
      const afterUpload = cleanUrl.substring(uploadIdx + match[0].length);
      
      if (!afterUpload) return null;
      
      // Remove file extension to get public_id
      const lastDot = afterUpload.lastIndexOf('.');
      const publicId = lastDot !== -1 ? afterUpload.substring(0, lastDot) : afterUpload;
      
      // Validate public_id format (should not be empty and should contain valid characters)
      if (!publicId || publicId.trim().length === 0) return null;
      
      return publicId.trim();
    } catch (error) {
      console.warn('Error extracting Cloudinary public ID:', error);
      return null;
    }
  }, []);

  // Handle file change
  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Please upload a PDF, JPG, or PNG file.');
        return;
      }

      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB.');
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
      setSubmitError(null);
      setUploadProgress(0);

      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  }, []);

  // Handle file upload to Cloudinary with progress tracking
  const handleFileUpload = useCallback(async (fileToUpload) => {
    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('upload_preset', 'Certificate(Saas)');
      formData.append('folder', 'SAAS(Support Worker)');

      const cloudName = 'dgsphdhns';
      
      // Simulate progress updates
      setUploadProgress(30);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      setUploadProgress(70);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadProgress(90);
      
      if (data.secure_url && data.public_id) {
        setUploadProgress(100);
        // Small delay to show 100% completion
        await new Promise(resolve => setTimeout(resolve, 300));
        return data.secure_url;
      } else {
        throw new Error('Upload failed - no URL returned');
      }
    } catch (error) {
      setUploadProgress(0);
      throw new Error(error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
  }, []);

  // Handle delete CV with optimized cleanup (non-blocking Cloudinary deletion)
  const handleDelete = useCallback(async () => {
    if (!currentCV) return;

    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this CV? This action cannot be undone.')) {
      return;
    }

    try {
      setIsSubmitting(true);
      const publicId = extractCloudinaryPublicId(currentCV);
      
      // Update CV to null in database first (critical path)
      const response = await updateWorkHistorySection('CV', null);
      
      if (response.data.success) {
        // Delete from Cloudinary asynchronously (non-blocking) - don't wait
        if (publicId) {
          deleteCloudinaryImage(publicId)
            .then(() => {
              console.log('✅ CV deleted from Cloudinary:', publicId);
            })
            .catch((error) => {
              // Handle "not found" as success
              const isNotFound = error?.response?.data?.message?.includes('not found') || 
                               error?.response?.data?.message?.includes('already deleted') ||
                               error?.message?.includes('not found');
              
              if (isNotFound) {
                console.log('ℹ️ CV already deleted or not found:', publicId);
              } else {
                console.warn('⚠️ Failed to delete CV from Cloudinary:', publicId, error);
              }
            });
        }

        queryClient.invalidateQueries(['onboarding']);
        toast.success('CV removed successfully!');
        setCurrentCV(null);
        setFile(null);
        setFileName('');
        setFilePreview(null);
        if (onSaveSuccess) onSaveSuccess();
        onClose();
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to remove CV';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentCV, extractCloudinaryPublicId, queryClient, onSaveSuccess, onClose]);

  // Optimized delete old CV from Cloudinary (non-blocking, fire-and-forget)
  const deleteOldCVFromCloudinary = useCallback(async (publicId) => {
    if (!publicId) return;
    
    try {
      // Fire and forget - don't wait for response to improve UX
      deleteCloudinaryImage(publicId)
        .then(() => {
          console.log('✅ Old CV deleted from Cloudinary:', publicId);
        })
        .catch((error) => {
          // Handle "not found" as success (file already deleted or doesn't exist)
          const isNotFound = error?.response?.data?.message?.includes('not found') || 
                           error?.response?.data?.message?.includes('already deleted') ||
                           error?.message?.includes('not found');
          
          if (isNotFound) {
            console.log('ℹ️ Old CV already deleted or not found:', publicId);
          } else {
            console.warn('⚠️ Failed to delete old CV from Cloudinary:', publicId, error);
          }
        });
    } catch (error) {
      // Silent fail - don't interrupt user experience
      console.warn('Error initiating old CV deletion:', error);
    }
  }, []);

  // Handle form submission with optimized cleanup (non-blocking deletion)
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    
    if (!file && !currentCV) {
      setSubmitError('Please select a file to upload');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let cvUrl = currentCV;
      let oldPublicId = null;

      // If replacing existing CV, get the old public ID for cleanup
      if (currentCV && file) {
        oldPublicId = extractCloudinaryPublicId(currentCV);
      }

      // Upload new file if selected
      if (file) {
        cvUrl = await handleFileUpload(file);
      }

      // Update CV in database (critical path - must complete)
      const response = await updateWorkHistorySection('CV', cvUrl);
      
      if (response.data.success) {
        // Delete old CV asynchronously (non-blocking) - don't wait for it
        if (oldPublicId && cvUrl) {
          deleteOldCVFromCloudinary(oldPublicId);
        }

        // Invalidate queries and update UI immediately
        queryClient.invalidateQueries(['onboarding']);
        toast.success(cvUrl ? 'CV updated successfully!' : 'CV removed successfully!');
        
        // Update local state to show new CV
        if (cvUrl) {
          setCurrentCV(cvUrl);
        } else {
          setCurrentCV(null);
        }
        
        // Reset file state
        setFile(null);
        setFileName('');
        setFilePreview(null);
        
        if (onSaveSuccess) onSaveSuccess();
        onClose();
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update CV';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [file, currentCV, handleFileUpload, extractCloudinaryPublicId, deleteOldCVFromCloudinary, queryClient, onSaveSuccess, onClose]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (isSubmitting || isUploading) return;
    setFile(null);
    setFileName('');
    setFilePreview(null);
    setUploadProgress(0);
    setSubmitError(null);
    onClose();
  }, [isSubmitting, isUploading, onClose]);

  // Get file icon based on type
  const getFileIcon = (fileType) => {
    if (!fileType) return <InsertDriveFile />;
    if (fileType === 'application/pdf') return <PictureAsPdf />;
    if (fileType.startsWith('image/')) return <ImageIcon />;
    return <InsertDriveFile />;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Handle document preview
  const handleDocumentPreview = useCallback((document) => {
    setPreviewDocument(document);
  }, []);

  // Get file type from URL or file
  const getFileTypeFromUrl = (url) => {
    if (!url) return 'application/pdf';
    if (url.endsWith('.pdf')) return 'application/pdf';
    if (url.match(/\.(jpg|jpeg)$/i)) return 'image/jpeg';
    if (url.match(/\.png$/i)) return 'image/png';
    return 'application/pdf';
  };

  const getFileType = (url) => {
    if (!url) return '';
    if (url.endsWith('.pdf')) return 'PDF';
    if (url.match(/\.(jpg|jpeg|png)$/i)) return 'Image';
    return 'Document';
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 520, md: 560 },
          maxWidth: '100vw',
          boxShadow: `-4px 0 24px ${alpha('#000', 0.08)}`,
          borderLeft: `1px solid ${alpha('#E5E7EB', 0.8)}`,
        }
      }}
      SlideProps={{
        timeout: 250,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FAFBFC', position: 'relative' }}>
        {/* Upload Progress Bar */}
        {isUploading && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{
                height: 2,
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
                  borderRadius: '0 0 1px 1px'
                },
                '& .MuiLinearProgress-root': {
                  bgcolor: alpha('#E0E7FF', 0.5)
                }
              }}
            />
          </Box>
        )}

        {/* Header */}
        <Box sx={{ 
          p: { xs: 2, sm: 2.5 }, 
          borderBottom: `1px solid ${alpha('#E5E7EB', 0.8)}`, 
          bgcolor: '#FFFFFF',
          position: 'relative'
        }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  fontSize: { xs: '1.125rem', sm: '1.25rem' }, 
                  color: '#111827', 
                  mb: 0.5,
                  letterSpacing: '-0.01em'
                }}
              >
                Resume / CV
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#6B7280', 
                  fontSize: '0.8125rem',
                  fontWeight: 400
                }}
              >
                {isUploading ? 'Uploading document...' : 'Manage your resume document'}
              </Typography>
            </Box>
            <IconButton 
              onClick={handleCancel} 
              disabled={isSubmitting || isUploading} 
              sx={{ 
                width: 32, 
                height: 32, 
                color: '#6B7280',
                border: `1px solid ${alpha('#E5E7EB', 0.8)}`,
                bgcolor: '#FFFFFF',
                '&:hover': { 
                  bgcolor: '#F9FAFB',
                  borderColor: '#D1D5DB',
                  color: '#374151'
                },
                transition: 'all 0.15s ease',
                '&:disabled': {
                  opacity: 0.5
                }
              }}
            >
              <Close sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </Box>

        {/* Content */}
        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          overflowX: 'hidden', 
          p: { xs: 2.5, sm: 3 },
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': { 
            bgcolor: alpha('#D1D5DB', 0.5), 
            borderRadius: 3,
            '&:hover': { bgcolor: alpha('#9CA3AF', 0.6) }
          }
        }}>
          <Fade in timeout={300}>
            <form onSubmit={handleSubmit} id="cv-form">
              {submitError && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 1.5, 
                    bgcolor: '#FEF2F2',
                    border: `1px solid ${alpha('#FEE2E2', 0.8)}`,
                    '& .MuiAlert-icon': { color: '#DC2626' },
                    '& .MuiAlert-message': { color: '#991B1B' }
                  }} 
                  onClose={() => setSubmitError(null)}
                >
                  {submitError}
                </Alert>
              )}

              <Stack spacing={3}>
                {/* Current CV Display */}
                {currentCV && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      border: `1px solid ${alpha('#E5E7EB', 0.8)}`,
                      bgcolor: '#FFFFFF',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#D1D5DB',
                        boxShadow: `0 1px 3px ${alpha('#000', 0.05)}`
                      }
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2.5} sx={{ mb: 2.5 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 1.5,
                          bgcolor: '#F3F4F6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#6366F1',
                          border: `1px solid ${alpha('#E5E7EB', 0.8)}`
                        }}
                      >
                        {getFileIcon(getFileTypeFromUrl(currentCV))}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 600, 
                            color: '#111827', 
                            mb: 0.5, 
                            fontSize: '0.875rem'
                          }}
                        >
                          Current Document
                        </Typography>
                        <Chip 
                          label={getFileType(currentCV)} 
                          size="small" 
                          sx={{ 
                            bgcolor: '#F3F4F6',
                            color: '#6B7280', 
                            fontWeight: 500,
                            fontSize: '0.6875rem',
                            height: 20,
                            border: `1px solid ${alpha('#E5E7EB', 0.8)}`
                          }} 
                        />
                      </Box>
                      <IconButton
                        onClick={handleDelete}
                        disabled={isSubmitting || isUploading}
                        size="small"
                        sx={{
                          color: '#EF4444',
                          width: 32,
                          height: 32,
                          border: `1px solid ${alpha('#FEE2E2', 0.8)}`,
                          bgcolor: '#FEF2F2',
                          '&:hover': { 
                            bgcolor: '#FEE2E2',
                            borderColor: '#FECACA',
                            transform: 'scale(1.05)'
                          },
                          transition: 'all 0.15s ease',
                          '&:disabled': {
                            opacity: 0.5
                          }
                        }}
                      >
                        <Delete sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Stack>
                   
                    <Button
                      variant="outlined"
                      startIcon={<Visibility sx={{ fontSize: 16 }} />}
                      onClick={() => handleDocumentPreview({
                        url: currentCV,
                        fileName: 'Current CV',
                        fileType: getFileTypeFromUrl(currentCV)
                      })}
                      fullWidth
                      disabled={isUploading || isSubmitting}
                      sx={{
                        borderColor: alpha('#E5E7EB', 0.8),
                        color: '#374151',
                        fontWeight: 500,
                        py: 1.25,
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        bgcolor: '#FFFFFF',
                        '&:hover': { 
                          borderColor: '#D1D5DB',
                          bgcolor: '#F9FAFB',
                        },
                        transition: 'all 0.15s ease',
                        '&:disabled': {
                          opacity: 0.5
                        }
                      }}
                    >
                      Preview Document
                    </Button>
                  </Paper>
                )}

                {/* File Upload Zone */}
                <Box
                  sx={{
                    p: { xs: 3, sm: 4 },
                    borderRadius: 2,
                    border: `1.5px dashed ${submitError && !file ? '#EF4444' : isUploading ? '#6366F1' : alpha('#D1D5DB', 0.8)}`,
                    bgcolor: isUploading ? alpha('#EEF2FF', 0.3) : '#FFFFFF',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': !isUploading && !file && {
                      borderColor: '#6366F1',
                      bgcolor: alpha('#EEF2FF', 0.2),
                    }
                  }}
                >
                  {/* Upload Progress Overlay */}
                  {isUploading && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: alpha('#FFFFFF', 0.95),
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      <CircularProgress
                        size={48}
                        thickness={3.5}
                        sx={{
                          color: '#6366F1',
                          mb: 2
                        }}
                      />
                      <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500, fontSize: '0.875rem' }}>
                        {uploadProgress}% uploaded
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9CA3AF', mt: 0.5, fontSize: '0.75rem' }}>
                        Please wait...
                      </Typography>
                    </Box>
                  )}

                  {/* File Preview or Upload Icon */}
                  {filePreview ? (
                    <Box sx={{ mb: 3 }}>
                      <Box
                        component="img"
                        src={filePreview}
                        alt="File preview"
                        onClick={() => handleDocumentPreview({
                          url: filePreview,
                          fileName: fileName,
                          fileType: file?.type
                        })}
                        sx={{
                          maxWidth: '100%',
                          maxHeight: 200,
                          borderRadius: 1.5,
                          objectFit: 'contain',
                          border: `1px solid ${alpha('#E5E7EB', 0.8)}`,
                          boxShadow: `0 1px 3px ${alpha('#000', 0.05)}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: '#D1D5DB',
                            boxShadow: `0 4px 12px ${alpha('#000', 0.08)}`,
                          }
                        }}
                      />
                      <Button
                        size="small"
                        startIcon={<Visibility sx={{ fontSize: 14 }} />}
                        onClick={() => handleDocumentPreview({
                          url: filePreview,
                          fileName: fileName,
                          fileType: file?.type
                        })}
                        sx={{
                          mt: 2,
                          color: '#6366F1',
                          textTransform: 'none',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          '&:hover': {
                            bgcolor: alpha('#EEF2FF', 0.5)
                          }
                        }}
                      >
                        Preview
                      </Button>
                    </Box>
                  ) : file ? (
                    <Box sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: 1.5,
                          bgcolor: '#F9FAFB',
                          border: `1px solid ${alpha('#E5E7EB', 0.8)}`,
                          display: 'inline-flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1.5,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 1.5,
                            bgcolor: '#EEF2FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#6366F1',
                            border: `1px solid ${alpha('#C7D2FE', 0.5)}`
                          }}
                        >
                          {getFileIcon(file?.type)}
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500, 
                              color: '#111827', 
                              mb: 0.5, 
                              fontSize: '0.875rem',
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {fileName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
                            {formatFileSize(file?.size)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 2,
                          bgcolor: '#F3F4F6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2,
                          border: `1px solid ${alpha('#E5E7EB', 0.8)}`
                        }}
                      >
                        <CloudUpload
                          sx={{
                            fontSize: 32,
                            color: '#9CA3AF',
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500, 
                      color: '#111827', 
                      mb: 1,
                      fontSize: '0.875rem'
                    }}
                  >
                    {isUploading 
                      ? 'Uploading...' 
                      : file 
                        ? fileName 
                        : 'Drag & drop or select a file'}
                  </Typography>
                  
                  {file && !isUploading && (
                    <Stack 
                      direction="row" 
                      alignItems="center" 
                      spacing={1} 
                      justifyContent="center" 
                      sx={{ mb: 2.5 }}
                      flexWrap="wrap"
                    >
                      <Chip
                        label={formatFileSize(file.size)}
                        size="small"
                        sx={{
                          bgcolor: '#ECFDF5',
                          color: '#065F46',
                          fontWeight: 500,
                          fontSize: '0.6875rem',
                          height: 20,
                          border: `1px solid ${alpha('#A7F3D0', 0.5)}`
                        }}
                      />
                      <Chip
                        label="Ready"
                        size="small"
                        icon={<CheckCircle sx={{ fontSize: 12, color: '#10B981 !important' }} />}
                        sx={{
                          bgcolor: '#ECFDF5',
                          color: '#065F46',
                          fontWeight: 500,
                          fontSize: '0.6875rem',
                          height: 20,
                          border: `1px solid ${alpha('#A7F3D0', 0.5)}`
                        }}
                      />
                      {currentCV && (
                        <Chip
                          label="Will replace"
                          size="small"
                          sx={{
                            bgcolor: '#FFFBEB',
                            color: '#92400E',
                            fontWeight: 500,
                            fontSize: '0.6875rem',
                            height: 20,
                            border: `1px solid ${alpha('#FDE68A', 0.5)}`
                          }}
                        />
                      )}
                    </Stack>
                  )}

                  {!file && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#9CA3AF', 
                        mb: 2.5, 
                        fontSize: '0.75rem',
                        display: 'block'
                      }}
                    >
                      PDF, JPEG, or PNG • Max 5MB
                    </Typography>
                  )}

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="cv-upload-input"
                    disabled={isSubmitting || isUploading}
                  />
                  <label htmlFor="cv-upload-input">
                    <Button
                      component="span"
                      variant={file ? "outlined" : "contained"}
                      startIcon={isUploading ? <CircularProgress size={16} color="inherit" /> : <CloudUpload sx={{ fontSize: 16 }} />}
                      disabled={isSubmitting || isUploading}
                      sx={{
                        borderColor: file ? alpha('#E5E7EB', 0.8) : 'transparent',
                        color: file ? '#374151' : 'white',
                        bgcolor: file ? '#FFFFFF' : '#6366F1',
                        textTransform: 'none',
                        fontWeight: 500,
                        borderRadius: 1.5,
                        px: 3,
                        py: 1.125,
                        fontSize: '0.875rem',
                        boxShadow: file ? 'none' : `0 1px 2px ${alpha('#6366F1', 0.2)}`,
                        '&:hover': {
                          borderColor: file ? '#D1D5DB' : 'transparent',
                          bgcolor: file ? '#F9FAFB' : '#4F46E5',
                          boxShadow: file ? 'none' : `0 2px 4px ${alpha('#6366F1', 0.25)}`,
                        },
                        transition: 'all 0.15s ease',
                        '&:disabled': {
                          opacity: 0.6
                        }
                      }}
                    >
                      {file ? 'Change File' : (currentCV ? 'Replace Document' : 'Choose File')}
                    </Button>
                  </label>
                </Box>
              </Stack>
            </form>
          </Fade>
        </Box>

        {/* Footer */}
        <Box sx={{ 
          p: { xs: 2.5, sm: 3 }, 
          borderTop: `1px solid ${alpha('#E5E7EB', 0.8)}`, 
          bgcolor: '#FFFFFF'
        }}>
          <Stack direction="row" spacing={2}>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={handleCancel} 
              disabled={isSubmitting || isUploading} 
              sx={{ 
                borderColor: alpha('#E5E7EB', 0.8),
                color: '#374151', 
                fontWeight: 500, 
                py: 1.25, 
                borderRadius: 1.5, 
                textTransform: 'none', 
                fontSize: '0.875rem',
                bgcolor: '#FFFFFF',
                '&:hover': { 
                  borderColor: '#D1D5DB',
                  bgcolor: '#F9FAFB'
                },
                transition: 'all 0.15s ease',
                '&:disabled': {
                  opacity: 0.5
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              form="cv-form" 
              variant="contained" 
              fullWidth 
              disabled={isSubmitting || isUploading || (!file && !currentCV)} 
              startIcon={isSubmitting || isUploading ? (
                <CircularProgress size={16} color="inherit" sx={{ color: 'white' }} />
              ) : (
                <Save sx={{ fontSize: 16 }} />
              )} 
              sx={{ 
                bgcolor: '#6366F1',
                color: 'white', 
                fontWeight: 500, 
                py: 1.25, 
                borderRadius: 1.5, 
                textTransform: 'none', 
                fontSize: '0.875rem',
                boxShadow: `0 1px 2px ${alpha('#6366F1', 0.2)}`,
                '&:hover': { 
                  bgcolor: '#4F46E5',
                  boxShadow: `0 2px 4px ${alpha('#6366F1', 0.25)}`,
                },
                transition: 'all 0.15s ease',
                '&:disabled': { 
                  bgcolor: alpha('#6366F1', 0.5),
                  color: 'white',
                  cursor: 'not-allowed'
                } 
              }}
            >
              {isUploading 
                ? `Uploading ${uploadProgress}%` 
                : isSubmitting 
                  ? 'Saving...' 
                  : (currentCV ? 'Update' : 'Upload')}
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Document Preview Modal */}
      {previewDocument && (
        <DocumentPreview
          document={previewDocument}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </Drawer>
  );
};

export default CVEditDrawer;

