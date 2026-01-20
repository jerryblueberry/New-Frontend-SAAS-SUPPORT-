import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Container,
  Fade,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DocumentPreview from '../../../workerForm/Modals/DocumentPreview';
import CertificationEditorDrawer from '../../../certifications/CertificationEditorDrawer';
import OtherCertificationEditorDrawer from '../../../certifications/OtherCertificationEditorDrawer';
import {
  EmptyState,
  CertificationHeader,
  CertificationTabs,
  MobileCertificationCard,
  DesktopCertificationTable,
  AddOtherCertificationButton
} from './components';
import { useCertificationFilters } from './hooks/useCertificationFilters';
import { useCertificationActions } from './hooks/useCertificationActions';
import { getComputedStatus } from './utils/certificationUtils';

/**
 * Tab Panel Component
 */
const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ width: '100%' }}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

TabPanel.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired
};

/**
 * Main Dashboard Certification Component
 * Displays and manages certifications for workers
 */
const DashboardCertification = ({ onboardingData }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const navigate = useNavigate();

  // State
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTypeId, setEditorTypeId] = useState(null);
  const [otherEditorOpen, setOtherEditorOpen] = useState(false);
  const [otherEditorId, setOtherEditorId] = useState(null);

  // Extract certifications from onboarding data
  const certifications = useMemo(
    () => onboardingData?.data?.profile?.certifications || [],
    [onboardingData]
  );
  const otherCertifications = useMemo(
    () => onboardingData?.data?.profile?.otherCertifications || [],
    [onboardingData]
  );

  // Use custom hooks
  const {
    expiredCertifications,
    rejectedCertifications,
    expiringSoonCertifications
  } = useCertificationFilters(certifications, otherCertifications);

  const {
    prefetchOnboarding,
    handleDeleteOtherCertification,
    triggerRefresh
  } = useCertificationActions();

  // Debug logging (can be removed in production)
  useEffect(() => {
    if (certifications.length === 0 && otherCertifications.length === 0) return;
    
    console.group('🔍 Certification Status Debug');
    console.log('=== ALL CERTIFICATIONS ===');
    [...certifications, ...otherCertifications].forEach((cert, index) => {
      const apiStatus = cert?.verificationStatus || 'N/A';
      const computedStatus = getComputedStatus(cert);
      
      console.log(`\n📋 Certification ${index + 1}:`, {
        name: cert?.certificationType?.name || cert?.certificationTitle || 'Unknown',
        apiStatus,
        computedStatus,
        expiryDate: cert?.expiryDate || 'N/A',
        rawCert: cert
      });
    });
    console.groupEnd();
  }, [certifications, otherCertifications]);

  // Handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEdit = (cert, type) => {
    if (type === 'professional') {
      const typeId = cert?.certificationType?._id || cert?.certificationType;
      if (typeId) {
        setEditorTypeId(typeId);
        setEditorOpen(true);
      }
    } else {
      const oid = cert?._id || cert?.id;
      if (oid) {
        setOtherEditorId(oid);
        setOtherEditorOpen(true);
      }
    }
  };

  const handleDelete = (cert) => {
    const oid = cert?._id || cert?.id;
    if (oid) {
      handleDeleteOtherCertification(oid);
    }
  };

  const handlePreviewDocument = (doc, cert) => {
    setSelectedDocument(doc);
    setSelectedCertificate(cert);
    setPreviewOpen(true);
  };

  const handleAddOtherCertification = () => {
    setOtherEditorId(null);
    setOtherEditorOpen(true);
  };

  const handleEditorSaved = () => {
    triggerRefresh();
  };

  const handleOtherEditorSaved = () => {
    triggerRefresh();
  };

  // Determine certification type for filtered lists
  const getCertificationType = (certList) => {
    return certList[0]?.certificationType ? 'professional' : 'other';
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 0, sm: 1, md: 0 },
      }}
    >
      <Fade in timeout={800}>
        <Box sx={{ mt: { xs: 2, md: 4 } }}>
          {/* Header Section */}
          <CertificationHeader
            professionalCount={certifications.length}
            otherCount={otherCertifications.length}
          />

          {/* Navigation Tabs */}
          <CertificationTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            certificationsCount={certifications.length}
            otherCertificationsCount={otherCertifications.length}
            expiredCount={expiredCertifications.length}
            expiringSoonCount={expiringSoonCertifications.length}
            rejectedCount={rejectedCertifications.length}
          />

          {/* Tab Content */}
          <TabPanel value={activeTab} index={0}>
            {certifications.length > 0 ? (
              isDesktop ? (
                <DesktopCertificationTable
                  certifications={certifications}
                  type="professional"
                  onEdit={handleEdit}
                  onPreviewDocument={handlePreviewDocument}
                  prefetchOnboarding={prefetchOnboarding}
                />
              ) : (
                <Box>
                  {certifications.map((cert, index) => (
                    <MobileCertificationCard
                      key={cert.id || cert._id || index}
                      cert={cert}
                      index={index}
                      type="professional"
                      onEdit={handleEdit}
                      onPreviewDocument={handlePreviewDocument}
                      prefetchOnboarding={prefetchOnboarding}
                    />
                  ))}
                </Box>
              )
            ) : (
              <EmptyState type="professional" onAdd={() => navigate('/onboarding')} />
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            {/* Add New Certification Button - Always visible */}
            <AddOtherCertificationButton onClick={handleAddOtherCertification} />
            
            {otherCertifications.length > 0 ? (
              isDesktop ? (
                <DesktopCertificationTable
                  certifications={otherCertifications}
                  type="other"
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPreviewDocument={handlePreviewDocument}
                  prefetchOnboarding={prefetchOnboarding}
                  triggerRefresh={triggerRefresh}
                />
              ) : (
                <Box>
                  {otherCertifications.map((cert, index) => (
                    <MobileCertificationCard
                      key={cert.id || cert._id || index}
                      cert={cert}
                      index={index}
                      type="other"
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onPreviewDocument={handlePreviewDocument}
                      prefetchOnboarding={prefetchOnboarding}
                    />
                  ))}
                </Box>
              )
            ) : (
              <EmptyState type="other" />
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            {expiredCertifications.length > 0 ? (
              isDesktop ? (
                <DesktopCertificationTable
                  certifications={expiredCertifications}
                  type={getCertificationType(expiredCertifications)}
                  onEdit={handleEdit}
                  onPreviewDocument={handlePreviewDocument}
                  prefetchOnboarding={prefetchOnboarding}
                />
              ) : (
                <Box>
                  {expiredCertifications.map((cert, index) => (
                    <MobileCertificationCard
                      key={cert.id || cert._id || `exp-${index}`}
                      cert={cert}
                      index={index}
                      type={cert?.certificationType ? 'professional' : 'other'}
                      onEdit={handleEdit}
                      onPreviewDocument={handlePreviewDocument}
                      prefetchOnboarding={prefetchOnboarding}
                    />
                  ))}
                </Box>
              )
            ) : (
              <EmptyState type="professional" />
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            {expiringSoonCertifications.length > 0 ? (
              isDesktop ? (
                <DesktopCertificationTable
                  certifications={expiringSoonCertifications}
                  type={getCertificationType(expiringSoonCertifications)}
                  onEdit={handleEdit}
                  onPreviewDocument={handlePreviewDocument}
                  prefetchOnboarding={prefetchOnboarding}
                />
              ) : (
                <Box>
                  {expiringSoonCertifications.map((cert, index) => (
                    <MobileCertificationCard
                      key={cert.id || cert._id || `expiring-${index}`}
                      cert={cert}
                      index={index}
                      type={cert?.certificationType ? 'professional' : 'other'}
                      onEdit={handleEdit}
                      onPreviewDocument={handlePreviewDocument}
                      prefetchOnboarding={prefetchOnboarding}
                    />
                  ))}
                </Box>
              )
            ) : (
              <EmptyState type="expiring soon" />
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            {rejectedCertifications.length > 0 ? (
              isDesktop ? (
                <DesktopCertificationTable
                  certifications={rejectedCertifications}
                  type={getCertificationType(rejectedCertifications)}
                  showRejectionDetails={true}
                  onEdit={handleEdit}
                  onPreviewDocument={handlePreviewDocument}
                  prefetchOnboarding={prefetchOnboarding}
                />
              ) : (
                <Box>
                  {rejectedCertifications.map((cert, index) => (
                    <MobileCertificationCard
                      key={cert.id || cert._id || `rej-${index}`}
                      cert={cert}
                      index={index}
                      type={cert?.certificationType ? 'professional' : 'other'}
                      showRejectionDetails={true}
                      onEdit={handleEdit}
                      onPreviewDocument={handlePreviewDocument}
                      prefetchOnboarding={prefetchOnboarding}
                    />
                  ))}
                </Box>
              )
            ) : (
              <EmptyState type="rejected" />
            )}
          </TabPanel>
        </Box>
      </Fade>

      {/* Document Preview Modal - Rendered via Portal, always on top */}
      {previewOpen && selectedDocument && (
        <DocumentPreview
          document={selectedDocument}
          onClose={() => {
            setPreviewOpen(false);
            setSelectedDocument(null);
            setSelectedCertificate(null);
          }}
          certificateData={selectedCertificate}
        />
      )}

      {/* Certification Editor Drawer */}
      <CertificationEditorDrawer
        open={editorOpen}
        typeId={editorTypeId}
        onClose={() => setEditorOpen(false)}
        onSaved={handleEditorSaved}
      />

      {/* Other Certification Editor Drawer */}
      <OtherCertificationEditorDrawer
        open={otherEditorOpen}
        id={otherEditorId}
        mode={otherEditorId ? 'edit' : 'create'}
        onClose={() => setOtherEditorOpen(false)}
        onSaved={handleOtherEditorSaved}
      />
    </Container>
  );
};

DashboardCertification.propTypes = {
  onboardingData: PropTypes.object.isRequired
};

export default DashboardCertification;
