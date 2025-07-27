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
  CardActions,
  Fade
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { toast } from 'react-hot-toast';
import { deleteCloudinaryImage } from '../../../api/cloudinary';
import useOnboardingStore from '../../../stores/useOnboardingStore';

// Helper to extract Cloudinary public_id from a URL
const extractCloudinaryPublicId = (url) => {
  if (!url) return null;
  // Remove query params
  const cleanUrl = url.split('?')[0];
  // Find the part after '/upload/'
  const uploadIdx = cleanUrl.indexOf('/upload/');
  if (uploadIdx === -1) return null;
  const afterUpload = cleanUrl.substring(uploadIdx + 8 + 1); // +1 to skip the final '/'
  // Remove file extension
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleCVUpload = async (file) => {
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
        <Box width="100%">
          <Card
            elevation={6}
            sx={{
              borderRadius: 4,
              border: `2px solid ${theme.palette.success.light}`,
              bgcolor: theme.palette.background.paper,
              position: 'relative',
              mb: 2,
              boxShadow: '0 4px 24px 0 rgba(34,197,94,0.08)',
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={<CheckCircleIcon color="success" sx={{ fontSize: 28, bgcolor: 'white', borderRadius: '50%' }} />}
                >
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'background.paper', boxShadow: 2 }}>
                    {renderDocumentIcon(doc.url, 'large')}
                  </Avatar>
                </Badge>
                <Box flex={1} minWidth={0}>
                  <Typography variant="subtitle1" fontWeight={700} noWrap title={doc.fileName} color="success.main">
                    CV Added
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap title={doc.fileName}>
                    {doc.fileName}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    color="primary"
                    onClick={() => setShowCVPreview(true)}
                    aria-label="View CV"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    color="error"
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
                    aria-label="Remove CV"
                    disabled={isUploading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Fade>
    );
  };

  const renderUploadZone = () => (
    <Fade in={!localCV && !CV}>
      <Box
        width="100%"
        sx={{
          border: `2px dashed ${theme.palette.primary.light}`,
          borderRadius: 4,
          bgcolor: theme.palette.background.paper,
          p: { xs: 2, sm: 4 },
          mb: 2,
          boxShadow: 2,
          transition: 'border-color 0.2s',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            boxShadow: 4,
          },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
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
        <label htmlFor="cv-upload" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'background.paper', mb: 2, boxShadow: 2 }}>
            <UploadFileIcon color="primary" fontSize="large" />
          </Avatar>
          <Button
            component="span"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isUploading}
            sx={{ mb: 1, textTransform: 'none', fontWeight: 600, fontSize: 16 }}
            aria-label="Upload CV"
          >
            {isUploading ? <CircularProgress size={20} color="inherit" /> : 'Upload CV'}
          </Button>
          <Typography variant="caption" color="text.secondary" align="center">
            PDF, JPG, or PNG (Max 5MB)
          </Typography>
        </label>
      </Box>
    </Fade>
  );

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 480,
        mx: 'auto',
        p: { xs: 1, sm: 2 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack spacing={2} width="100%" alignItems="center">
        <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700} align="center" gutterBottom>
          Upload Your CV <span style={{ color: theme.palette.error.main }}>*</span>
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" mb={1}>
          Upload your resume or CV in PDF or image format
        </Typography>
        {cvError && (
          <Fade in={!!cvError}>
            <Alert
              severity="error"
              sx={{ width: '100%', fontWeight: 600, fontSize: 15, mb: 1, borderRadius: 2 }}
              variant="filled"
            >
              {cvError}
            </Alert>
          </Fade>
        )}
        {localCV || CV ? renderCVAdded() : renderUploadZone()}
      </Stack>
      <Dialog
        open={showCVPreview}
        onClose={() => setShowCVPreview(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          {getCVDocument()?.fileType === 'application/pdf' ? (
            <iframe
              src={getCVDocument()?.url}
              title="CV PDF Preview"
              width="100%"
              height="500px"
              style={{ border: 'none' }}
            />
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" width="100%" height="500px" bgcolor="#fafafa">
              <img
                src={getCVDocument()?.url}
                alt="CV Preview"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default OnboardingCV;