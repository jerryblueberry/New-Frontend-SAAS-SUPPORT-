import React from 'react';
import { Card, List, Typography, Space, Tooltip, Badge, Progress, Button, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import AddOtherCertificate from '../../../../WorkerCertificateOnboarding/AddOtherCertificate';
import YourCertificationListItem from './YourCertificationListItem';
import { formatFieldLabel } from '../utils/certificationHelpers';

const { Title, Text } = Typography;

/**
 * Your Certifications Card Component
 */
const YourCertificationsCard = ({
  selectedCerts,
  certificationTypes,
  requiredCerts,
  progress,
  onboardingData,
  onEditCertification,
  isCertComplete,
  activeTab,
  setActiveTab,
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
  const hasCertifications = onboardingData?.data?.profile?.certifications?.length > 0;

  if (!hasCertifications) {
    return null;
  }

  return (
    <Card
      title={<Title level={4} style={{ margin: 0 }}>Your Certifications</Title>}
      style={{ borderRadius: 8 }}
      extra={
        <Space>
          <Tooltip title="Overall completion status">
            <Badge
              count={`${progress}%`}
              color={progress === 100 ? '#52c41a' : '#faad14'}
              style={{ 
                backgroundColor: 'transparent', 
                color: progress === 100 ? '#52c41a' : '#faad14' 
              }}
            />
          </Tooltip>
          <Progress
            percent={progress}
            status={progress < 100 ? 'active' : 'success'}
            showInfo={false}
            strokeWidth={10}
            style={{ width: 100 }}
          />
        </Space>
      }
    >
      {hasCertifications ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          <List
            dataSource={selectedCerts}
            renderItem={(cert, index) => {
              const type = certificationTypes.find(t => t._id === cert.certificationType);
              const isComplete = isCertComplete(cert);
              const isRequired = requiredCerts.some(rc => rc._id === cert.certificationType);

              return (
                <YourCertificationListItem
                  key={index}
                  cert={cert}
                  certType={type}
                  isComplete={isComplete}
                  onEdit={() => onEditCertification(index)}
                />
              );
            }}
          />
          
          <Divider style={{ margin: '16px 0', height: '1.2px', backgroundColor: '#f2f2f2' }} />
          
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
      ) : (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Text type="secondary">No certifications added yet</Text>
          <div style={{ marginTop: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setActiveTab('required')}
            >
              Add Required Certifications
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default YourCertificationsCard;

