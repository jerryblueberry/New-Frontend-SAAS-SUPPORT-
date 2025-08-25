import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Avatar,
  Paper,
  Alert,
  Dialog,
  DialogContent,
  CircularProgress,
  Stack,
  Badge,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Fade
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { toast } from 'react-hot-toast';
import { deleteCloudinaryImage } from '../../../api/cloudinary';
import useOnboardingStore from '../../../stores/useOnboardingStore';

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

const OnboardingCV = ({ cvError }) => {
  const updateCV = useOnboardingStore((state) => state.updateCV);
  const CV = useOnboardingStore((state) => state.workHistory?.CV);
  const [localCV, setLocalCV] = useState(CV || null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCVPreview, setShowCVPreview] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'Certificate(Saas)');
      formData.append('folder', 'SAAS(Support Worker)');
      const cloudName = 'dgsphdhns';
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await response.json();
      if (data.secure_url && data.public_id) {
        const cvData = { url: data.secure_url, public_id: data.public_id };
        updateCV(cvData);
        setLocalCV(cvData);
        toast.success('CV uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('CV upload error:', error);
      toast.error('Failed to upload CV. Please try again.');
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
    const url = typeof cvObj === 'string' ? cvObj : cvObj.url;
    const fileName = url?.split('/').pop()?.split('?')[0] || 'CV Document';
    let fileType = '';
    if (url?.endsWith('.pdf')) fileType = 'application/pdf';
    else if (url?.match(/\.(jpg|jpeg|png)$/i)) fileType = `image/${url.split('.').pop().toLowerCase()}`;
    else fileType = '';
    return { url, fileName, fileType };
  };

  const renderDocumentIcon = (url, size = 'large') => {
    if (url?.endsWith('.pdf')) return <PictureAsPdfIcon color="error" fontSize={size} />;
    if (url?.match(/\.(jpg|jpeg|png)$/i)) return <ImageIcon color="primary" fontSize={size} />;
    return <InsertDriveFileIcon fontSize={size} />;
  };

  const renderCVAdded = () => {
    const doc = getCVDocument();
    return (
      <Fade in={!!doc}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `2px solid ${theme.palette.success.main}`,
            bgcolor: theme.palette.success.light + '08',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
            }
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={3}>
              <Box position="relative">
                <Avatar 
                  sx={{ 
                    width: 56, 
                    height: 56, 
                    bgcolor: theme.palette.success.main + '15',
                    border: `3px solid ${theme.palette.success.main}20`,
                  }}
                >
                  {renderDocumentIcon(doc.url, 'large')}
                </Avatar>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: theme.palette.success.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `3px solid ${theme.palette.background.paper}`,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 14, color: 'white' }} />
                </Box>
              </Box>
              
              <Box flex={1} minWidth={0}>
                <Typography 
                  variant="h6" 
                  fontWeight={700} 
                  color={theme.palette.success.dark}
                  sx={{ fontSize: '1.1rem', mb: 0.5 }}
                >
                  CV Successfully Uploaded
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: '0.9rem',
                    opacity: 0.8,
                    fontWeight: 500
                  }}
                >
                  {doc.fileName}
                </Typography>
                <Typography 
                  variant="caption" 
                  color={theme.palette.success.main}
                  sx={{ 
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {doc.fileType.replace('application/', '').replace('image/', '')}
                </Typography>
              </Box>
              
              <Stack direction="row" spacing={1}>
                <IconButton
                  onClick={() => setShowCVPreview(true)}
                  sx={{
                    bgcolor: theme.palette.primary.main + '15',
                    color: theme.palette.primary.main,
                    border: `1px solid ${theme.palette.primary.main}30`,
                    '&:hover': {
                      bgcolor: theme.palette.primary.main + '25',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                  size="small"
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={async () => {
                    const cvObj = typeof (localCV || CV) === 'string'
                      ? { url: localCV || CV }
                      : (localCV || CV);
                    let publicId = cvObj && cvObj.public_id;
                    if (!publicId && cvObj && cvObj.url) {
                      publicId = extractCloudinaryPublicId(cvObj.url);
                    }
                    if (publicId) {
                      setIsUploading(true);
                      try {
                        await toast.promise(
                          deleteCloudinaryImage(publicId),
                          {
                            loading: 'Deleting CV...',
                            success: 'CV removed successfully!',
                            error: 'Failed to remove CV from Cloudinary.',
                          }
                        );
                        updateCV(null);
                        setLocalCV(null);
                      } finally {
                        setIsUploading(false);
                      }
                    }
                  }}
                  disabled={isUploading}
                  sx={{
                    bgcolor: theme.palette.error.main + '15',
                    color: theme.palette.error.main,
                    border: `1px solid ${theme.palette.error.main}30`,
                    '&:hover': {
                      bgcolor: theme.palette.error.main + '25',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                  size="small"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Fade>
    );
  };

  const renderUploadZone = () => (
    <Fade in={!localCV && !CV}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: isDragOver 
            ? `2px solid ${theme.palette.primary.main}` 
            : `2px dashed ${theme.palette.primary.main}40`,
          bgcolor: isDragOver 
            ? theme.palette.primary.main + '15' 
            : theme.palette.primary.main + '03',
          position: 'relative',
          overflow: 'hidden',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            bgcolor: theme.palette.primary.main + '08',
            transform: isDragOver ? 'scale(1.02)' : 'translateY(-2px)',
            boxShadow: `0 8px 32px ${theme.palette.primary.main}20`,
          },
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <CardContent sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
          <input
            type="file"
            id="cv-upload"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleCVUpload(e.target.files[0]);
              }
            }}
            disabled={isUploading}
            style={{ display: 'none' }}
          />
          <label 
            htmlFor="cv-upload" 
            style={{ 
              width: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              cursor: isUploading ? 'not-allowed' : 'pointer'
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: isDragOver 
                  ? theme.palette.primary.main + '25' 
                  : theme.palette.primary.main + '15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                border: isDragOver 
                  ? `3px solid ${theme.palette.primary.main}` 
                  : `3px solid ${theme.palette.primary.main}30`,
                transition: 'all 0.3s ease',
                transform: isDragOver ? 'scale(1.1)' : 'scale(1)',
                '&:hover': {
                  bgcolor: theme.palette.primary.main + '25',
                  borderColor: theme.palette.primary.main,
                  transform: isDragOver ? 'scale(1.1)' : 'scale(1.1)',
                }
              }}
            >
              {isUploading ? (
                <CircularProgress size={32} color="primary" />
              ) : (
                <CloudUploadIcon 
                  sx={{ 
                    fontSize: 36, 
                    color: theme.palette.primary.main,
                    transform: isDragOver ? 'scale(1.2)' : 'scale(1)',
                    transition: 'transform 0.2s ease'
                  }} 
                />
              )}
            </Box>
            
            <Typography 
              variant="h5" 
              fontWeight={700} 
              color={theme.palette.primary.main}
              sx={{ 
                mb: 1, 
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                transform: isDragOver ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.2s ease'
              }}
            >
              {isUploading ? 'Uploading...' : isDragOver ? 'Drop your CV here!' : 'Upload Your CV'}
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                mb: 3, 
                fontSize: '1rem',
                fontWeight: 500,
                maxWidth: 280,
                lineHeight: 1.5,
                opacity: isDragOver ? 1 : 0.8,
                transition: 'opacity 0.2s ease'
              }}
            >
              {isDragOver 
                ? 'Release to upload your file' 
                : 'Drag and drop your CV here, or click to browse files'
              }
            </Typography>
            
            {!isDragOver && (
              <Button
                component="span"
                variant="contained"
                disabled={isUploading}
                sx={{
                  borderRadius: 2.5,
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: `0 4px 16px ${theme.palette.primary.main}30`,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  '&:hover': {
                    boxShadow: `0 6px 24px ${theme.palette.primary.main}40`,
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                  mb: 2
                }}
              >
                {isUploading ? 'Uploading...' : 'Choose File'}
              </Button>
            )}
            
            {isDragOver && (
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  animation: 'pulse 1.5s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(1)',
                      opacity: 1,
                    },
                    '50%': {
                      transform: 'scale(1.1)',
                      opacity: 0.8,
                    },
                    '100%': {
                      transform: 'scale(1)',
                      opacity: 1,
                    },
                  },
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
            )}
            
            <Box
              sx={{
                bgcolor: isDragOver 
                  ? theme.palette.primary.main + '20' 
                  : theme.palette.grey[100],
                borderRadius: 2,
                px: 2,
                py: 1,
                display: 'inline-block',
                transition: 'background-color 0.2s ease'
              }}
            >
              <Typography 
                variant="caption" 
                color={isDragOver ? theme.palette.primary.main : "text.secondary"}
                sx={{ 
                  fontSize: '0.85rem',
                  fontWeight: isDragOver ? 600 : 500,
                  letterSpacing: '0.3px',
                  transition: 'color 0.2s ease'
                }}
              >
                Supported formats: PDF, JPG, PNG (Max 5MB)
              </Typography>
            </Box>
          </label>
        </CardContent>
      </Card>
    </Fade>
  );

  return (
    <Box
      sx={{
        width: '100%',
        p: { xs: 2, sm: 3 }
      }}
    >
      {cvError && (
        <Fade in={!!cvError}>
          <Alert
            severity="error"
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '0.95rem',
              border: `1px solid ${theme.palette.error.main}30`,
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }}
          >
            {cvError}
          </Alert>
        </Fade>
      )}
      
      {localCV || CV ? renderCVAdded() : renderUploadZone()}
      
      <Dialog
        open={showCVPreview}
        onClose={() => setShowCVPreview(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {getCVDocument()?.fileType === 'application/pdf' ? (
            <iframe
              src={getCVDocument()?.url}
              title="CV PDF Preview"
              width="100%"
              height="600px"
              style={{ border: 'none' }}
            />
          ) : (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              width="100%" 
              height="600px" 
              bgcolor={theme.palette.grey[50]}
            >
              <img
                src={getCVDocument()?.url}
                alt="CV Preview"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%',
                  borderRadius: '8px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.1)'
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default OnboardingCV;