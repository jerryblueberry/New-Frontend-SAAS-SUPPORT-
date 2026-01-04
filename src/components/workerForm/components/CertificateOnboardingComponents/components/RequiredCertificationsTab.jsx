import React from 'react';
import { List, Alert, Typography } from 'antd';
import { IdcardOutlined } from '@ant-design/icons';
import AddOtherCertificate from '../../../../WorkerCertificateOnboarding/AddOtherCertificate';
import RequiredCertificationListItem from './RequiredCertificationListItem';
import { isCertFullyComplete } from '../utils/certificationHelpers';

const { Text } = Typography;

/**
 * Required Certifications Tab Content
 */
const RequiredCertificationsTab = ({
  filteredRequiredCerts,
  selectedCerts,
  hasExistingCertifications,
  allRequiredCertsAdded,
  onAddCertification,
  onEditCertification,
  // Form state for live validation
  certDetailsVisible,
  isEditing,
  currentCertIndex,
  pendingCertTypeId,
  certForm,
  certifications,
  // Other certificate props
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
  setEditingOtherCertIndex
}) => {
  if (hasExistingCertifications && allRequiredCertsAdded()) {
    return (
      <Alert
        message="Required Certifications Complete"
        description="You have already added all required certifications. You can add additional optional certifications if needed."
        type="success"
        showIcon
        style={{ margin: 16 }}
      />
    );
  }

  if (filteredRequiredCerts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 24 }}>
        <Text type="secondary">
          No required certifications found based on your profile
        </Text>
      </div>
    );
  }

  return (
    <div>
      <List
        dataSource={filteredRequiredCerts}
        renderItem={cert => {
          const certIsComplete = isCertFullyComplete(cert, selectedCerts);
          const certInList = selectedCerts.some(c => c.certificationType === cert._id);

          return (
            <RequiredCertificationListItem
              key={cert._id}
              cert={cert}
              selectedCerts={selectedCerts}
              certIsComplete={certIsComplete}
              certInList={certInList}
              onAddCertification={onAddCertification}
              onEditCertification={onEditCertification}
              certDetailsVisible={certDetailsVisible}
              isEditing={isEditing}
              currentCertIndex={currentCertIndex}
              pendingCertTypeId={pendingCertTypeId}
              certForm={certForm}
              certifications={certifications}
            />
          );
        }}
      />

      <AddOtherCertificate
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
    </div>
  );
};

export default RequiredCertificationsTab;

