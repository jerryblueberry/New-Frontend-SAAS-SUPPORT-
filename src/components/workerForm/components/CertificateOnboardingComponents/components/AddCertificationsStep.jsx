import React, { useMemo } from 'react';
import { Alert, Card, Tabs, Typography, Badge, Spin } from 'antd';
import { IdcardOutlined } from '@ant-design/icons';
import RequiredCertificationsTab from './RequiredCertificationsTab';
import YourCertificationsCard from './YourCertificationsCard';

const { TabPane } = Tabs;

/**
 * Add Certifications Step Component
 * 
 * This component handles the display of the certification selection and management step.
 * It includes:
 * - Loading state
 * - Missing certifications alert
 * - Required certifications tab
 * - Your certifications card
 */
const AddCertificationsStep = ({
  // Loading state
  loading,
  
  // Certification data
  requiredCerts,
  selectedCerts,
  certificationTypes,
  filteredRequiredCerts,
  
  // State management
  activeTab,
  setActiveTab,
  progress,
  hasExistingCertifications,
  
  // Validation functions
  allRequiredCertsAdded,
  getRequiredCertsAddedCount,
  isCertComplete,
  
  // Action handlers
  addCertification,
  editCertification,
  
  // Form state for live validation
  certDetailsVisible,
  isEditing,
  currentCertIndex,
  pendingCertTypeId,
  certForm,
  certifications,
  
  // Other certifications
  otherCertifications,
  addOtherCertificate,
  removeOtherCertificate,
  uploadToCloudinary,
  DocumentTrackingService,
  deleteCloudinaryImage,
  currentStep,
  otherCertDrawerOpen,
  setOtherCertDrawerOpen,
  editingOtherCertIndex,
  setEditingOtherCertIndex,
  
  // Onboarding data
  onboardingData
}) => {
  const renderContent = useMemo(() => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
          <p>Loading certification requirements...</p>
        </div>
      );
    }

    return (
      <>
        {/* Missing Certifications Alert */}
        {!allRequiredCertsAdded() && selectedCerts.length > 0 && (
          <Alert
            message="Required Certifications Missing"
            description={
              <div>
                <p>
                  You still need to add {requiredCerts.length - getRequiredCertsAddedCount()} required certifications.
                </p>
              </div>
            }
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}

        {/* Certifications Tabs Card */}
        <Card
          style={{ borderRadius: 8 }}
          bodyStyle={{ padding: '16px 0' }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            tabPosition="top"
            style={{ padding: '0 16px' }}
          >
            <TabPane
              tab={
                <span>
                  <IdcardOutlined />
                  Required Certifications
                  <Badge
                    count={`${getRequiredCertsAddedCount()}/${requiredCerts.length}`}
                    style={{
                      backgroundColor: allRequiredCertsAdded() ? '#52c41a' : '#faad14',
                      marginLeft: 8
                    }}
                  />
                </span>
              }
              key="required"
            >
              <RequiredCertificationsTab
                filteredRequiredCerts={filteredRequiredCerts}
                selectedCerts={selectedCerts}
                hasExistingCertifications={hasExistingCertifications}
                allRequiredCertsAdded={allRequiredCertsAdded}
                onAddCertification={addCertification}
                onEditCertification={editCertification}
                certDetailsVisible={certDetailsVisible}
                isEditing={isEditing}
                currentCertIndex={currentCertIndex}
                pendingCertTypeId={pendingCertTypeId}
                certForm={certForm}
                certifications={certifications}
                otherCertifications={otherCertifications}
                addOtherCertificate={addOtherCertificate}
                removeOtherCertificate={removeOtherCertificate}
                uploadToCloudinary={uploadToCloudinary}
                DocumentTrackingService={DocumentTrackingService}
                deleteCloudinaryImage={deleteCloudinaryImage}
                currentStep={currentStep}
                otherCertDrawerOpen={otherCertDrawerOpen}
                setOtherCertDrawerOpen={setOtherCertDrawerOpen}
                editingOtherCertIndex={editingOtherCertIndex}
                setEditingOtherCertIndex={setEditingOtherCertIndex}
              />
            </TabPane>
          </Tabs>
        </Card>

        {/* Your Certifications Card */}
        <YourCertificationsCard
          selectedCerts={selectedCerts}
          certificationTypes={certificationTypes}
          requiredCerts={requiredCerts}
          progress={progress}
          onboardingData={onboardingData}
          onEditCertification={editCertification}
          isCertComplete={isCertComplete}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          otherCertifications={otherCertifications}
          addOtherCertificate={addOtherCertificate}
          removeOtherCertificate={removeOtherCertificate}
          uploadToCloudinary={uploadToCloudinary}
          DocumentTrackingService={DocumentTrackingService}
          deleteCloudinaryImage={deleteCloudinaryImage}
          currentStep={currentStep}
          otherCertDrawerOpen={otherCertDrawerOpen}
          setOtherCertDrawerOpen={setOtherCertDrawerOpen}
          editingOtherCertIndex={editingOtherCertIndex}
          setEditingOtherCertIndex={setEditingOtherCertIndex}
        />
      </>
    );
  }, [
    loading,
    allRequiredCertsAdded,
    selectedCerts,
    requiredCerts,
    getRequiredCertsAddedCount,
    activeTab,
    setActiveTab,
    filteredRequiredCerts,
    hasExistingCertifications,
    addCertification,
    editCertification,
    certDetailsVisible,
    isEditing,
    currentCertIndex,
    pendingCertTypeId,
    certForm,
    certifications,
    otherCertifications,
    addOtherCertificate,
    removeOtherCertificate,
    uploadToCloudinary,
    DocumentTrackingService,
    deleteCloudinaryImage,
    currentStep,
    otherCertDrawerOpen,
    setOtherCertDrawerOpen,
    editingOtherCertIndex,
    setEditingOtherCertIndex,
    onboardingData,
    selectedCerts,
    certificationTypes,
    requiredCerts,
    progress,
    isCertComplete
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {renderContent}
    </div>
  );
};

export default AddCertificationsStep;

