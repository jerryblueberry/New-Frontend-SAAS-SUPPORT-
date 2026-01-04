import React, { useMemo } from 'react';
import { Card, List, Typography, Space, Tag, Button, Divider, Progress, Alert } from 'antd';
import { EditOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import AddOtherCertificate from '../../../../WorkerCertificateOnboarding/AddOtherCertificate';
import {
  formatFieldLabel,
  isDegreeMissing,
  isWorkingWithChildrenCheckType
} from '../utils/certificationHelpers';

const { Text } = Typography;

/**
 * Review & Submit Step Component
 * Final step where users review and submit their certifications
 */
const ReviewSubmitStep = ({
  selectedCerts,
  certificationTypes,
  requiredCerts,
  progress,
  otherCertifications,
  isCertComplete,
  allRequiredCertsAdded,
  getRequiredCertsAddedCount,
  requiredCertsCount,
  onEditCertification,
  onRemoveCertification,
  onSubmit,
  submitLoading,
  onDocumentPreview,
  onEditOtherCertificate,
  onNavigateToStep, // Add navigation callback
  // Other certificate props
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
  return (
    <Card
      title={<Text strong style={{ fontSize: 18 }}>Review & Submit</Text>}
      style={{ maxWidth: 1200, margin: '0 auto', borderRadius: 8 }}
      bodyStyle={{ padding: '24px' }}
    >
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong style={{ fontSize: 16 }}>Submission Progress</Text>
          <Text strong style={{ color: progress === 100 ? '#52c41a' : '#faad14' }}>
            {progress}% Complete
          </Text>
        </div>
        <Progress
          percent={progress}
          status={progress < 100 ? 'active' : 'success'}
          strokeColor={progress === 100 ? '#52c41a' : '#1890ff'}
          style={{ marginBottom: 16 }}
        />
        {progress < 100 ? (
          <Alert
            message="Incomplete Information"
            description={
              <div>
                <p>Some certifications are missing required information.</p>
                <Button
                  type="link"
                  onClick={() => onNavigateToStep && onNavigateToStep(1)}
                  style={{ padding: 0 }}
                >
                  Go back to complete missing information
                </Button>
              </div>
            }
            type="warning"
            showIcon
          />
        ) : (
          <Alert
            message="Ready to Submit"
            description="All required information has been provided. Review your certifications below before submitting."
            type="success"
            showIcon
          />
        )}
      </div>

      <div>
        <List
          itemLayout="vertical"
          dataSource={selectedCerts}
          renderItem={(cert, index) => {
            const type = certificationTypes.find(t => t._id === cert.certificationType);
            const isComplete = isCertComplete(cert);
            const isRequired = requiredCerts.some(rc => rc._id === cert.certificationType);

            return (
              <Card
                key={index}
                style={{ marginBottom: 16, borderRadius: 8 }}
                title={
                  <Space>
                    <Text strong>{cert.certTypeName}</Text>
                  </Space>
                }
                extra={
                  <Space>
                    <Tag color={isComplete ? 'success' : 'warning'}>
                      {isComplete ? 'Complete' : 'Incomplete'}
                    </Tag>
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => onEditCertification(index)}
                    >
                      Edit
                    </Button>
                  </Space>
                }
              >
                <div style={{ marginTop: 8 }}>
                  {type?.requiredFields.map(field => (
                    <div key={field} style={{ marginBottom: 8, display: 'flex' }}>
                      <div style={{ width: 150, fontWeight: 'bold' }}>
                        {formatFieldLabel(field)}:
                      </div>
                      <div>
                        {field === 'degree' ? (
                          isDegreeMissing(cert[field]) ? (
                            <Text type="danger">Missing</Text>
                          ) : (
                            Array.isArray(cert[field]) ? cert[field].join(', ') : cert[field]
                          )
                        ) : cert[field] ? (
                          field.toLowerCase().includes('date') ? (
                            <Text>{dayjs(cert[field]).format('DD/MM/YYYY')}</Text>
                          ) : (
                            <Text>{cert[field]}</Text>
                          )
                        ) : (
                          <Text type="danger">Missing</Text>
                        )}
                      </div>
                    </div>
                  ))}
                  {type?.documentRequired && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Documents:</div>
                      {cert.documents?.length ? (
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          {cert.documents.map((doc, i) => (
                            <li key={i}>
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  onDocumentPreview(doc);
                                }}
                              >
                                {doc.fileName || doc.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <Text type="danger">No documents uploaded</Text>
                      )}
                    </div>
                  )}
                  {/* WWCC incomplete logic */}
                  {isWorkingWithChildrenCheckType(type) && !isComplete && (
                    <div style={{ marginTop: 16, background: '#fffbe6', padding: 16, borderRadius: 8, border: '1px solid #ffe58f' }}>
                      <Text type="danger">
                        This certification is incomplete. Please complete all fields or remove this certification.
                      </Text>
                      <div style={{ marginTop: 8 }}>
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => onEditCertification(index)}
                          style={{ marginRight: 8 }}
                        >
                          Complete
                        </Button>
                        <Button
                          danger
                          size="small"
                          onClick={() => onRemoveCertification(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          }}
        />

        {/* Other Certifications Section */}
        <Card
          title={
            <Space size={8}>
              <SafetyCertificateOutlined style={{ color: '#1890ff' }} />
              <Text strong style={{ fontSize: 16 }}>Other Certifications</Text>
              <Tag color="blue" style={{ borderRadius: 12 }}>{otherCertifications?.length || 0}</Tag>
            </Space>
          }
          style={{ marginTop: 24, borderRadius: 8, border: '1px solid #f0f0f0', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}
          bodyStyle={{ padding: 16 }}
        >
          {otherCertifications && otherCertifications.length > 0 ? (
            <List
              dataSource={otherCertifications}
              renderItem={(cert, idx) => {
                const isComplete = Array.isArray(cert.documents) && cert.documents.length > 0;
                return (
                  <Card
                    key={idx}
                    style={{ marginBottom: 12, borderRadius: 8 }}
                    title={
                      <Space>
                        <Text strong>{cert.certificationTitle}</Text>
                      </Space>
                    }
                    extra={
                      <Space>
                        <Tag color={isComplete ? 'success' : 'warning'}>
                          {isComplete ? 'Complete' : 'Incomplete'}
                        </Tag>
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => onEditOtherCertificate(idx)}
                          style={{ cursor: 'pointer' }}
                        >
                          Edit
                        </Button>
                      </Space>
                    }
                  >
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Documents:</div>
                      {isComplete ? (
                        <Space size={6} wrap>
                          <Text type="secondary">{cert.documents.length} document{cert.documents.length > 1 ? 's' : ''}</Text>
                        </Space>
                      ) : (
                        <Text type="danger">No documents uploaded</Text>
                      )}
                    </div>
                  </Card>
                );
              }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <Text type="secondary">No other certifications added.</Text>
            </div>
          )}
          {/* Mount drawer for Other Certificates in Review step context */}
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
        </Card>
      </div>

      <Divider />
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Button
          type="primary"
          size="large"
          onClick={onSubmit}
          loading={submitLoading}
          disabled={selectedCerts.length === 0 || progress < 100 || !allRequiredCertsAdded() || submitLoading}
          style={{ minWidth: 200, height: 48 }}
        >
          {submitLoading ? 'Submitting...' : 'Submit Certifications'}
        </Button>
        {(progress < 100 || !allRequiredCertsAdded()) && (
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">
              {!allRequiredCertsAdded()
                ? `Please add ${requiredCertsCount - getRequiredCertsAddedCount()} more required certifications before submitting`
                : 'Please complete all required information before submitting'}
            </Text>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ReviewSubmitStep;

