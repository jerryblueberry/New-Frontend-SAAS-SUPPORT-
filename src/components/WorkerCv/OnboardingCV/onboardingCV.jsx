import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Avatar,
  Alert,
  AlertTitle,
  CircularProgress,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Fade,
  alpha,
  LinearProgress
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { toast } from 'react-hot-toast';
import useOnboardingStore from '../../../stores/useOnboardingStore';
import DocumentPreview from '../../workerForm/Modals/DocumentPreview';

// Helper to extract Cloudinary public_id from a URL
const extractCloudinaryPublicId = (url) => {
  if (!url) return null;
  const cleanUrl = url.split('?')[0];
  const uploadIdx = cleanUrl.indexOf('/upload/');
  if (uploadIdx === -1) return null;
  const afterUpload = cleanUrl.substring(uploadIdx + 8 + 1);
  const lastDot = afterUpload.lastIndexOf('.');
  const publicId = lastDot !== -1 ? afterUpload.substring(0, lastDot) : afterUpload;
  return publicId;
};

const OnboardingCV = ({ cvError, noBorder = false }) => {
  const updateCV = useOnboardingStore((state) => state.updateCV);
  const CV = useOnboardingStore((state) => state.profile?.CV);
  const [localCV, setLocalCV] = useState(CV || null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCVPreview, setShowCVPreview] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const handleCVUpload = async (file) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, JPG, or PNG file.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB.');
      return;
    }

    try {
      setIsUploading(true);
      
      // Check if there's an existing CV to overwrite
      const existingCV = localCV || CV;
      const existingPublicId = existingCV && typeof existingCV === 'object' 
        ? existingCV.publicId || existingCV.public_id
        : existingCV 
          ? extractCloudinaryPublicId(typeof existingCV === 'string' ? existingCV : existingCV.url)
          : null;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'Certificate(Saas)');
      formData.append('folder', 'SAAS(Support Worker)');
      
      // Best Practice: Overwrite existing asset using same public_id
      // Note: With unsigned uploads, we can't use 'overwrite' parameter
      // Instead, we use 'public_id' with the exact same ID - Cloudinary will overwrite automatically
      if (existingPublicId) {
        // Extract public_id - handle both with and without folder prefix
        let publicIdForOverwrite = existingPublicId;
        
        // If publicId includes folder, use as-is; otherwise prepend folder
        if (!existingPublicId.includes('SAAS(Support Worker)')) {
          // Remove file extension if present
          const publicIdWithoutExt = existingPublicId.replace(/\.[^/.]+$/, '');
          // Extract just the filename part if it includes path separators
          const filenamePart = publicIdWithoutExt.includes('/') 
            ? publicIdWithoutExt.split('/').slice(-1)[0]
            : publicIdWithoutExt;
          publicIdForOverwrite = `SAAS(Support Worker)/${filenamePart}`;
        } else {
          // Remove extension from existing publicId to allow Cloudinary to handle format changes
          publicIdForOverwrite = existingPublicId.replace(/\.[^/.]+$/, '');
        }
        
        // Use public_id to overwrite - Cloudinary automatically overwrites when public_id matches
        // This is the only way to overwrite with unsigned uploads
        formData.append('public_id', publicIdForOverwrite);
        // Note: 'overwrite' and 'invalidate' parameters are not allowed in unsigned uploads
        // Cloudinary will automatically overwrite when public_id matches an existing asset
      }
      
      const cloudName = 'dgsphdhns';
      // Use correct endpoint based on file type (unsigned uploads don't support resource_type parameter)
      const uploadEndpoint = file.type === 'application/pdf' 
        ? `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`
        : `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.secure_url && data.public_id) {
        // Create full CV object structure expected by backend
        const fileName = file.name || data.original_filename || 'CV.pdf';
        const fileType = file.type || (fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
        
        // Use existing publicId if overwriting (to maintain consistency), otherwise use new one from Cloudinary
        // Cloudinary returns the public_id used (which will be the same if overwriting)
        const finalPublicId = data.public_id;
        
        const cvData = {
          url: data.secure_url,
          publicId: finalPublicId, // camelCase for backend
          fileName: fileName,
          fileType: fileType,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
        };
        
        // Update store first (this will trigger parent component to clear error)
        updateCV(cvData);
        setLocalCV(cvData);
        toast.success(existingPublicId ? 'CV updated successfully!' : 'CV uploaded successfully!');
      } else {
        throw new Error('Upload failed: Invalid response from Cloudinary');
      }
    } catch (error) {
      console.error('CV upload error:', error);
      toast.error(error.message || 'Failed to upload CV. Please try again.');
    } finally {
      setIsUploading(false);
      setIsDragOver(false);
    }
  };

  // Drag and Drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragOver to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      handleCVUpload(file);
    }
  };

  const getCVDocument = () => {
    const cvObj = localCV || CV;
    if (!cvObj) return null;
    // Handle both string (legacy) and object (new) formats
    const url = typeof cvObj === 'string' ? cvObj : cvObj.url;
    const fileName = typeof cvObj === 'object' && cvObj.fileName 
      ? cvObj.fileName 
      : url?.split('/').pop()?.split('?')[0] || 'CV Document';
    const fileType = typeof cvObj === 'object' && cvObj.fileType 
      ? cvObj.fileType 
      : url?.endsWith('.pdf') 
        ? 'application/pdf' 
        : url?.match(/\.(jpg|jpeg|png)$/i) 
          ? `image/${url.split('.').pop().toLowerCase()}` 
          : '';
    return { url, fileName, fileType };
  };

  // Sync CV from store when it changes
  React.useEffect(() => {
    if (CV && CV !== localCV) {
      setLocalCV(CV);
    }
  }, [CV]);

  const renderDocumentIcon = (url, size = 'large') => {
    if (url?.endsWith('.pdf')) return <PictureAsPdfIcon color="error" fontSize={size} />;
    if (url?.match(/\.(jpg|jpeg|png)$/i)) return <ImageIcon color="primary" fontSize={size} />;
    return <InsertDriveFileIcon fontSize={size} />;
  };

  const renderCVAdded = () => {
    const doc = getCVDocument();
    const fileSize = doc.url ? 'Ready' : '';
    const fileTypeDisplay = doc.fileType.replace('application/', '').replace('image/', '').toUpperCase();
    
    const cvContent = (
      <Stack 
        direction="row" 
        alignItems="center" 
        spacing={{ xs: 1, sm: 1.25 }}
        sx={{ width: '100%' }}
      >
        {/* Icon - Compact */}
        <Box position="relative" sx={{ flexShrink: 0 }}>
          <Avatar 
            sx={{ 
              width: { xs: 32, sm: 36 }, 
              height: { xs: 32, sm: 36 }, 
              bgcolor: alpha(theme.palette.success.main, 0.1),
              border: `1.5px solid ${alpha(theme.palette.success.main, 0.2)}`,
            }}
          >
            {renderDocumentIcon(doc.url, 'small')}
          </Avatar>
          <Box
            sx={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: { xs: 12, sm: 14 },
              height: { xs: 12, sm: 14 },
              borderRadius: '50%',
              bgcolor: theme.palette.success.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${theme.palette.background.paper}`,
              boxShadow: `0 2px 4px ${alpha(theme.palette.success.main, 0.3)}`,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: { xs: 7, sm: 8 }, color: 'white' }} />
          </Box>
        </Box>
        
        {/* File Info - Compact */}
        <Box flex={1} minWidth={0} sx={{ display: 'flex', flexDirection: 'column', gap: 0.125 }}>
          <Stack direction="row" alignItems="center" spacing={0.5} flexWrap="wrap">
            <Typography 
              variant="subtitle2" 
              fontWeight={600} 
              color="text.primary"
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                minWidth: 0
              }}
            >
              {doc.fileName}
            </Typography>
            <Chip
              label={fileTypeDisplay}
              size="small"
              sx={{
                height: { xs: 16, sm: 18 },
                fontSize: { xs: '0.575rem', sm: '0.625rem' },
                fontWeight: 700,
                bgcolor: alpha(theme.palette.success.main, 0.12),
                color: theme.palette.success.main,
                border: `1px solid ${alpha(theme.palette.success.main, 0.25)}`,
                '& .MuiChip-label': {
                  px: { xs: 0.5, sm: 0.75 }
                }
              }}
            />
          </Stack>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.625rem', sm: '0.6875rem' },
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 0.375
            }}
          >
            <CheckCircleIcon sx={{ fontSize: { xs: 9, sm: 10 }, color: theme.palette.success.main }} />
            Uploaded • Ready
          </Typography>
        </Box>
        
        {/* Actions - Compact */}
        <Stack 
          direction="row" 
          spacing={0.5}
          sx={{ flexShrink: 0 }}
        >
          <IconButton
            onClick={() => setShowCVPreview(true)}
            sx={{
              width: { xs: 26, sm: 28 },
              height: { xs: 26, sm: 28 },
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: theme.palette.primary.main,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
              borderRadius: 1,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.15),
                borderColor: alpha(theme.palette.primary.main, 0.3),
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease'
            }}
            size="small"
            title="Preview CV"
          >
            <VisibilityIcon sx={{ fontSize: { xs: 13, sm: 14 } }} />
          </IconButton>
          <IconButton
            onClick={() => {
              // Trigger file input for update/overwrite
              const fileInput = document.getElementById('cv-upload');
              if (fileInput) {
                fileInput.click();
              }
            }}
            disabled={isUploading}
            sx={{
              width: { xs: 26, sm: 28 },
              height: { xs: 26, sm: 28 },
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: theme.palette.primary.main,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
              borderRadius: 1,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.15),
                borderColor: alpha(theme.palette.primary.main, 0.3),
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease'
            }}
            size="small"
            title="Update CV"
          >
            <CloudUploadIcon sx={{ fontSize: { xs: 13, sm: 14 } }} />
          </IconButton>
        </Stack>
      </Stack>
    );

    if (noBorder) {
      return (
        <Fade in={!!doc}>
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: { xs: 2, sm: 2.5 },
              bgcolor: 'transparent',
              position: 'relative',
            }}
          >
            {cvContent}
          </Box>
        </Fade>
      );
    }

    return (
      <Fade in={!!doc}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            border: 'none',
            bgcolor: 'background.paper',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: `0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)`,
            '&:hover': {
              boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.15)}, 0 2px 4px rgba(0,0,0,0.04)`,
              transform: 'translateY(-2px)',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
              opacity: 0.8,
            }
          }}
        >
          <CardContent sx={{ p: { xs: 1.25, sm: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.25, sm: 1.5, md: 2 } } }}>
            {cvContent}
          </CardContent>
        </Card>
      </Fade>
    );
  };

  const renderUploadZone = () => {
    const uploadZoneContent = (
      <Box
        component="label"
        htmlFor="cv-upload"
        onClick={(e) => {
          // Prevent default label behavior and manually trigger input
          e.preventDefault();
          const fileInput = document.getElementById('cv-upload');
          if (fileInput && !isUploading) {
            fileInput.click();
          }
        }}
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'center', sm: 'center' },
          cursor: isUploading ? 'not-allowed' : 'pointer',
          gap: { xs: 1.25, sm: 1.5 },
          position: 'relative',
        }}
      >
        
        {/* Compact Icon Section */}
        <Box
          sx={{
            width: { xs: 44, sm: 48 },
            height: { xs: 44, sm: 48 },
            borderRadius: 1.5,
            background: isDragOver 
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.primary.dark, 0.08)})`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.primary.light, 0.04)})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: isDragOver 
              ? `2px solid ${theme.palette.primary.main}` 
              : `1.5px solid ${alpha(theme.palette.primary.main, 0.25)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isDragOver ? 'scale(1.05)' : 'scale(1)',
            flexShrink: 0,
            boxShadow: isDragOver 
              ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
              : `0 1px 4px ${alpha(theme.palette.primary.main, 0.08)}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.primary.dark, 0.10)})`,
              borderColor: alpha(theme.palette.primary.main, 0.5),
              transform: 'scale(1.03)',
            }
          }}
        >
          {isUploading ? (
            <CircularProgress 
              size={isMobile ? 18 : 20} 
              color="primary"
              thickness={4}
            />
          ) : (
            <CloudUploadIcon 
              sx={{ 
                fontSize: { xs: 20, sm: 22 }, 
                color: theme.palette.primary.main,
              }} 
            />
          )}
        </Box>
        
        {/* Compact Content Section */}
        <Box 
          flex={1} 
          minWidth={0} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 0.25,
            alignItems: { xs: 'center', sm: 'flex-start' },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          <Typography 
            variant="subtitle2"
            fontWeight={600}
            color="text.primary"
            sx={{ 
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              lineHeight: 1.2,
            }}
          >
            {isUploading ? 'Uploading...' : isDragOver ? 'Drop here' : 'Upload Resume'}
          </Typography>
          <Typography 
            variant="caption"
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.6875rem', sm: '0.75rem' },
              lineHeight: 1.3,
            }}
          >
            {isDragOver ? 'Release to upload' : 'PDF, JPG, PNG • Max 5MB'}
          </Typography>
        </Box>
        
        {/* Compact Action Button */}
        {!isDragOver && (
          <Button
            component="span"
            variant="contained"
            disabled={isUploading}
            startIcon={!isUploading && <UploadFileIcon sx={{ fontSize: { xs: 13, sm: 14 } }} />}
            sx={{
              borderRadius: 1.5,
              px: { xs: 2, sm: 2.25 },
              py: { xs: 0.625, sm: 0.75 },
              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: `0 2px 6px ${alpha(theme.palette.primary.main, 0.3)}`,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              width: { xs: '100%', sm: 'auto' },
              minWidth: { xs: '100%', sm: 100 },
              flexShrink: 0,
              minHeight: { xs: '36px', sm: '38px' },
              '&:hover': {
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                transform: 'translateY(-1px)',
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              },
              '&:disabled': {
                boxShadow: 'none',
                transform: 'none',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {isUploading ? 'Uploading...' : 'Browse'}
          </Button>
        )}
      </Box>
    );

    if (noBorder) {
      return (
        <Fade in={!localCV && !CV}>
          <Box
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: { xs: 2, sm: 2.5 },
              border: isDragOver 
                ? `2px solid ${theme.palette.primary.main}` 
                : 'none',
              bgcolor: isDragOver 
                ? theme.palette.primary.main + '06' 
                : 'transparent',
              position: 'relative',
              overflow: 'hidden',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              transform: isDragOver ? 'scale(1.002)' : 'scale(1)',
              '&:hover': {
                bgcolor: isDragOver ? theme.palette.primary.main + '06' : theme.palette.primary.main + '02',
              },
            }}
          >
            {uploadZoneContent}
          </Box>
        </Fade>
      );
    }

    return (
      <Fade in={!localCV && !CV}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            border: isDragOver 
              ? `2px solid ${theme.palette.primary.main}` 
              : `1.5px dashed ${alpha(theme.palette.divider, 0.5)}`,
            bgcolor: isDragOver 
              ? alpha(theme.palette.primary.main, 0.06) 
              : 'background.paper',
            position: 'relative',
            overflow: 'hidden',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isDragOver ? 'scale(1.002)' : 'scale(1)',
            boxShadow: isDragOver 
              ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`
              : '0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: isDragOver 
                ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
                : 'transparent',
              transition: 'opacity 0.3s ease',
            },
            '&:hover': {
              borderColor: isDragOver 
                ? theme.palette.primary.main 
                : alpha(theme.palette.primary.main, 0.5),
              bgcolor: isDragOver 
                ? alpha(theme.palette.primary.main, 0.06) 
                : alpha(theme.palette.primary.main, 0.02),
              transform: isDragOver ? 'scale(1.002)' : 'translateY(-2px)',
              boxShadow: isDragOver 
                ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`
                : `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}, 0 2px 4px rgba(0,0,0,0.04)`,
            },
          }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.25 }, '&:last-child': { pb: { xs: 1.5, sm: 2, md: 2.25 } } }}>
            {uploadZoneContent}
          </CardContent>
        </Card>
      </Fade>
    );
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header Section - Compact SaaS-Level Design */}
      <Box sx={{ mb: { xs: 1, sm: 1.25 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 0.875 }, mb: 0.5 }}>
          <UploadFileIcon sx={{ color: 'primary.main', fontSize: { xs: '1.1rem', sm: '1.2rem' } }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
              lineHeight: 1.2,
            }}
          >
            Resume / CV
          </Typography>
          <Chip 
            label="REQUIRED" 
            size="small" 
            color="error" 
            variant="outlined"
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '0.65rem', sm: '0.7rem' },
              height: { xs: 18, sm: 20 },
              ml: { xs: 0.5, sm: 0.75 },
            }}
          />
        </Box>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            fontSize: { xs: '0.7rem', sm: '0.75rem' }, 
            lineHeight: 1.3,
            ml: { xs: 2.5, sm: 2.75 },
          }}
        >
          PDF, JPG, PNG • Max 5MB
        </Typography>
      </Box>

      {/* Error State - Compact SaaS-Level Design */}
      {cvError && (
        <Fade in={!!cvError}>
          <Alert
            severity="error"
            sx={{ 
              mb: { xs: 1, sm: 1.25 }, 
              borderRadius: 1.5,
              border: 'none',
              py: { xs: 0.75, sm: 1 },
              bgcolor: alpha(theme.palette.error.main, 0.08),
              '& .MuiAlert-icon': {
                fontSize: { xs: '1rem', sm: '1.1rem' },
                color: theme.palette.error.main,
              },
            }}
          >
            <AlertTitle sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.8rem' }, mb: 0.25 }}>
              Resume Required
            </AlertTitle>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, lineHeight: 1.4 }}>
              {cvError}
            </Typography>
            {cvError.includes('required') && (
              <Box sx={{ mt: 0.75 }}>
                <LinearProgress 
                  color="error" 
                  variant="determinate" 
                  value={100} 
                  sx={{ 
                    height: 2, 
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                  }} 
                />
              </Box>
            )}
          </Alert>
        </Fade>
      )}
      
      {/* Hidden file input - always available for both upload and update */}
      <input
        type="file"
        id="cv-upload"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleCVUpload(e.target.files[0]);
            // Reset input to allow selecting the same file again
            e.target.value = '';
          }
        }}
        disabled={isUploading}
        style={{ display: 'none' }}
      />

      {localCV || CV ? renderCVAdded() : renderUploadZone()}
      
      {/* CV Preview using DocumentPreview Component - Best Practice */}
      {showCVPreview && getCVDocument() && (
        <DocumentPreview
          document={getCVDocument()}
          onClose={() => setShowCVPreview(false)}
          certificateData={null} // CV doesn't have certificate data, only show fileName
        />
      )}
    </Box>
  );
};

export default OnboardingCV;