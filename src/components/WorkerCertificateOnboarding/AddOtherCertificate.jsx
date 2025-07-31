import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Button,
  Drawer,
  Input,
  Upload,
  Typography,
  Space,
  Tooltip,
  Modal,
  message,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileOutlined,
  EyeOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { toast } from 'react-hot-toast';
import DocumentPreview from '../../components/workerForm/Modals/DocumentPreview';
import { deleteOtherCertification } from '../../api/otherCertifications';

const { Text } = Typography;
const { confirm } = Modal;

const maxFiles = 2;
const allowedFileTypes = ['application/pdf', 'image/jpeg', 'image/png'];
const maxFileSize = 5 * 1024 * 1024; // 5MB

const AddOtherCertificate = ({
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
  onEditOtherCertificate
}) => {
  const [otherCertTitle, setOtherCertTitle] = useState('');
  const [otherCertDocs, setOtherCertDocs] = useState([]);
  const [isSavingOtherCert, setIsSavingOtherCert] = useState(false);
  const [isUploadingOtherCert, setIsUploadingOtherCert] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);

  useEffect(() => {
    if (
      otherCertDrawerOpen &&
      editingOtherCertIndex !== null &&
      otherCertifications[editingOtherCertIndex]
    ) {
      const cert = otherCertifications[editingOtherCertIndex];
      setOtherCertTitle(cert.certificationTitle || '');
      setOtherCertDocs(cert.documents || []);
    } else if (otherCertDrawerOpen && editingOtherCertIndex === null) {
      // Reset for add mode
      setOtherCertTitle('');
      setOtherCertDocs([]);
    }
  }, [otherCertDrawerOpen, editingOtherCertIndex, otherCertifications]);

  // Open drawer for add
  const openAddDrawer = () => {
    setEditingOtherCertIndex(null);
    setOtherCertTitle('');
    setOtherCertDocs([]);
    setOtherCertDrawerOpen(true);
  };

  // Open drawer for edit
  const handleEditOtherCertificate = (index) => {
    const cert = otherCertifications[index];
    setEditingOtherCertIndex(index);
    setOtherCertTitle(cert.certificationTitle);
    setOtherCertDocs(cert.documents || []);
    setOtherCertDrawerOpen(true);
    if (onEditOtherCertificate) onEditOtherCertificate(index);
  };

  // Remove other certificate
  const handleRemoveOtherCertificate = (index) => {
    const cert = otherCertifications[index];
    confirm({
      title: 'Remove Other Certificate?',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to remove "${cert.certificationTitle}"? This will also delete all associated documents from cloud storage.`,
      okText: 'Yes, remove it',
      okType: 'danger',
      cancelText: 'No, keep it',
      async onOk() {
        if (cert._id) {
          try {
            await deleteOtherCertification(cert._id);
            removeOtherCertificate(index);
            message.success('Other certificate removed successfully');
          } catch (error) {
            if (error?.response?.status === 404) {
              removeOtherCertificate(index);
              message.info('Certificate not found on server, removed locally.');
            } else {
              message.error('Failed to remove certificate from server');
            }
          }
        } else {
          // Remove documents from Cloudinary if they have publicId
          if (Array.isArray(cert.documents) && cert.documents.length > 0) {
            const deletePromises = cert.documents
              .filter(doc => doc.publicId)
              .map(doc => deleteCloudinaryImage(doc.publicId));
            await Promise.allSettled(deletePromises);
          }
          removeOtherCertificate(index);
          message.success('Other certificate removed locally');
        }
      }
    });
  };

  // Upload logic for other certificate documents
  const handleOtherCertDocumentUpload = async (files) => {
    try {
      setIsUploadingOtherCert(true);
      const duplicateFiles = [];
      const uniqueFiles = [];
      files.forEach(file => {
        const isDuplicate = otherCertDocs.some(doc => doc.fileName === file.name && doc.fileSize === file.size);
        if (isDuplicate) {
          duplicateFiles.push(file.name);
        } else {
          uniqueFiles.push(file);
        }
      });
      if (duplicateFiles.length > 0) {
        toast.error(`Duplicate files detected: ${duplicateFiles.join(', ')}`);
        if (uniqueFiles.length === 0) {
          return false;
        }
      }
      const uploadPromises = uniqueFiles.map(file => uploadToCloudinary(file, 'otherCert'));
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result !== null);
      if (successfulUploads.length === 0) {
        toast.error('No documents were uploaded successfully');
        return false;
      }
      setOtherCertDocs(prev => [
        ...prev,
        ...successfulUploads
      ].slice(0, maxFiles));
      successfulUploads.forEach(doc => {
        if (doc.publicId) {
          DocumentTrackingService.markDocumentAsUsed(doc.publicId);
        }
      });
      const uploadMessage = successfulUploads.length === 1 ?
        `Uploaded ${successfulUploads.length} document` :
        `Uploaded ${successfulUploads.length} documents`;
      if (duplicateFiles.length > 0) {
        toast.success(`${uploadMessage} (${duplicateFiles.length} duplicate(s) skipped)`);
      } else {
        toast.success(uploadMessage);
      }
      return true;
    } catch (error) {
      toast.error('Failed to upload some documents');
      return false;
    } finally {
      setIsUploadingOtherCert(false);
    }
  };

  // Drawer close handler
  const handleDrawerClose = () => {
    setOtherCertDrawerOpen(false);
    setOtherCertTitle('');
    setOtherCertDocs([]);
    setEditingOtherCertIndex(null);
  };

  // Document preview
  const handleDocumentPreview = (doc) => setPreviewDocument(doc);
  const handleDocumentDeleteFromPreview = () => setPreviewDocument(null);

  // Drawer save handler
  const handleDrawerSave = async () => {
    if (!otherCertTitle.trim()) {
      message.error('Certificate title is required');
      return;
    }
    if (!otherCertDocs.length) {
      message.error('At least one document is required');
      return;
    }
    setIsSavingOtherCert(true);
    if (editingOtherCertIndex !== null) {
      const updatedCert = { certificationTitle: otherCertTitle, documents: otherCertDocs };
      removeOtherCertificate(editingOtherCertIndex);
      addOtherCertificate(updatedCert);
      message.success('Other certificate updated successfully');
    } else {
      addOtherCertificate({ certificationTitle: otherCertTitle, documents: otherCertDocs });
      message.success('Other certificate added successfully');
    }
    handleDrawerClose();
    setIsSavingOtherCert(false);
  };

  // Filter out the certificate that is currently being edited
  const filteredCertifications = otherCertifications.filter((cert, index) => 
    editingOtherCertIndex === null || index !== editingOtherCertIndex
  );

  return (
    <>
      {/* Only show Add button on step 1, with badge for count */}
      {currentStep === 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16, marginTop: 16 }}>
          <Badge count={otherCertifications.length} offset={[10, 0]} showZero>
            <Button
              type="dashed"
              onClick={openAddDrawer}
              icon={<PlusOutlined />}
              style={{
                whiteSpace: 'nowrap',
                height: 40,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#f0f8ff',
                borderColor: '#1890ff',
                color: '#1890ff',
                fontWeight: 500,
                marginBottom: 16
              }}
            >
              Add Other Certificate
            </Button>
          </Badge>
        </div>
      )}
      {/* Drawer for add/edit: always rendered, controlled by open prop */}
      <Drawer
        title={editingOtherCertIndex !== null ? 'Edit Other Certificate' : 'Add Other Certificate'}
        open={otherCertDrawerOpen}
        onClose={handleDrawerClose}
        width={480}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={handleDrawerClose} style={{ marginRight: 8 }}>Cancel</Button>
            <Button type="primary" loading={isSavingOtherCert} onClick={handleDrawerSave}>
              {editingOtherCertIndex !== null ? 'Update' : 'Save'}
            </Button>
          </div>
        }
      >
        {/* Form fields */}
        <Input
          placeholder="Certificate Title"
          value={otherCertTitle}
          onChange={e => setOtherCertTitle(e.target.value)}
          maxLength={100}
          style={{ marginBottom: 16 }}
        />
        <Upload
          accept=".pdf,.jpg,.jpeg,.png"
          fileList={otherCertDocs}
          onRemove={(file) => {
            confirm({
              title: 'Remove Document?',
              icon: <ExclamationCircleOutlined />,
              content: 'Are you sure you want to remove this document?',
              okText: 'Yes, remove it',
              okType: 'danger',
              cancelText: 'No, keep it',
              onOk() {
                if (file.publicId) {
                  deleteCloudinaryImage(file.publicId)
                    .then(() => {
                      DocumentTrackingService.removeTrackedDocument(file.publicId);
                      setOtherCertDocs(prev => prev.filter(d => d.uid !== file.uid));
                      message.success('Document removed successfully');
                    })
                    .catch(() => {
                      DocumentTrackingService.removeTrackedDocument(file.publicId);
                      setOtherCertDocs(prev => prev.filter(d => d.uid !== file.uid));
                      message.warning('Document removed locally but failed to delete from cloud storage');
                    });
                } else {
                  setOtherCertDocs(prev => prev.filter(d => d.uid !== file.uid));
                  message.info('Document removed');
                }
              }
            });
          }}
          beforeUpload={(file, fileList) => {
            const currentCount = otherCertDocs.length;
            const newCount = currentCount + fileList.length;
            if (newCount > maxFiles) {
              toast.error(`You can only upload ${maxFiles - currentCount} more document(s)`);
              return Upload.LIST_IGNORE;
            }
            if (!allowedFileTypes.includes(file.type)) {
              toast.error('Only PDF, JPG, PNG files are allowed');
              return Upload.LIST_IGNORE;
            }
            if (file.size > maxFileSize) {
              toast.error('Each file must be less than 5MB');
              return Upload.LIST_IGNORE;
            }
            toast.loading(`Uploading ${fileList.length} document(s)...`);
            handleOtherCertDocumentUpload(fileList)
              .then(() => {
                toast.dismiss();
              })
              .catch(() => toast.dismiss());
            return false;
          }}
          multiple
          listType="picture-card"
          showUploadList={{
            showPreviewIcon: true,
            showRemoveIcon: true,
            previewIcon: (file) => (
              <Tooltip title="Preview Document">
                <button
                  type="button"
                  aria-label="Preview Document"
                  tabIndex={0}
                  style={{
                    color: '#fff',
                    background: 'linear-gradient(135deg, #1890ff 60%, #40a9ff 100%)',
                    fontSize: 28,
                    border: 'none',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    marginRight: 10,
                    boxShadow: '0 4px 16px rgba(24,144,255,0.18)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'box-shadow 0.2s, background 0.2s',
                  }}
                  className="upload-action-btn preview-btn"
                >
                  <EyeOutlined />
                </button>
              </Tooltip>
            ),
            removeIcon: (file) => (
              <Tooltip title="Delete Document">
                <button
                  type="button"
                  aria-label="Delete Document"
                  tabIndex={0}
                  style={{
                    color: '#fff',
                    background: 'linear-gradient(135deg, #ff4d4f 60%, #ff7875 100%)',
                    fontSize: 28,
                    border: 'none',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    marginLeft: 10,
                    boxShadow: '0 4px 16px rgba(255,77,79,0.18)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'box-shadow 0.2s, background 0.2s',
                  }}
                  className="upload-action-btn delete-btn"
                >
                  <DeleteOutlined />
                </button>
              </Tooltip>
            ),
          }}
          onPreview={(file) => {
            const doc = otherCertDocs.find(d => d.uid === file.uid);
            if (doc) handleDocumentPreview(doc);
          }}
          disabled={isUploadingOtherCert}
        >
          {otherCertDocs.length >= 2 ? null : (
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          )}
        </Upload>
        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
          Accepted formats: PDF, JPG, PNG (Max 5MB each, 1-2 documents required)
        </Text>
        <DocumentPreview
          document={previewDocument}
          visible={!!previewDocument}
          onClose={handleDocumentDeleteFromPreview}
          onDelete={handleDocumentDeleteFromPreview}
        />
        {/* List of other certifications inside the drawer - exclude the one being edited */}
        {filteredCertifications.length > 0 && (
          <Card
            title="Other Certifications"
            style={{
              marginTop: 24,
              marginBottom: 16,
              borderRadius: 4,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <List
              dataSource={filteredCertifications}
              renderItem={(cert, filteredIdx) => {
                // Get the original index from the full array
                const originalIndex = otherCertifications.findIndex(
                  (originalCert, originalIdx) => 
                    originalCert === cert && 
                    (editingOtherCertIndex === null || originalIdx !== editingOtherCertIndex)
                );
                
                return (
                  <List.Item
                    actions={[
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => handleEditOtherCertificate(originalIndex)}
                        icon={<EditOutlined />}
                        style={{ marginRight: 8 }}
                      >
                        Edit
                      </Button>,
                      <Button
                        danger
                        size="small"
                        onClick={() => handleRemoveOtherCertificate(originalIndex)}
                        icon={<DeleteOutlined />}
                      >
                        Remove
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Text strong style={{ fontSize: 16 }}>
                          {cert.certificationTitle}
                        </Text>
                      }
                      description={
                        <Space>
                          <FileOutlined />
                          <Text type="secondary">
                            {cert.documents && cert.documents.length > 0
                              ? `${cert.documents.length} document(s) uploaded`
                              : 'No documents uploaded'}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        )}
      </Drawer>
    </>
  );
};

export default AddOtherCertificate;