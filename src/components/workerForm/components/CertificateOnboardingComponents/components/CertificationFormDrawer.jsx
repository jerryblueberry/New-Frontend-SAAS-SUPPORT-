import React, { useMemo } from 'react';
import {
  Drawer,
  Form,
  Button,
  Alert,
  DatePicker,
  Select,
  Input,
  Upload,
  Typography,
  Space,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { toast } from 'react-hot-toast';
import RenderEducationFields from '../../../../WorkerCertificateOnboarding/RenderEducationFields';
import RenderInsuranceField from '../../../../WorkerCertificateOnboarding/RenderInsuranceField';
import { NATIONALITIES } from '../../../../../utils/constants';
import { AUSTRALIAN_STATES } from '../constants';
import {
  formatFieldLabel,
  getFieldTooltip,
  isWorkingWithChildrenCheck
} from '../utils/certificationHelpers';

const { Option } = Select;
const { Text } = Typography;

// File upload constants
const allowedFileTypes = ['application/pdf', 'image/jpeg', 'image/png'];
const maxFileSize = 5 * 1024 * 1024; // 5MB
const maxFiles = 2;

/**
 * Extract publicId from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} Public ID or null
 */
const extractPublicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  try {
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
    
    // Fallback: if URL contains publicId directly
    const publicIdMatch = url.match(/public[Ii]d[=:]([^&]+)/);
    if (publicIdMatch && publicIdMatch[1]) {
      return decodeURIComponent(publicIdMatch[1]);
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting publicId from URL:', error);
    return null;
  }
};

/**
 * Certification Form Drawer Component
 * Drawer for adding/editing certification details
 */
const CertificationFormDrawer = ({
  visible,
  cert,
  certType,
  isEditing,
  isWWCC,
  wwccDraft,
  setWwccDraft, // Add callback to update wwccDraft
  certForm,
  isFormValid,
  setIsFormValid,
  uploadFileList,
  uploadDisabled,
  onClose,
  onFinish,
  onDocumentUpload,
  onRemoveDocument,
  onDocumentPreview,
  currentCertIndex,
  DocumentTrackingService, // Add DocumentTrackingService as prop
  // Degree state
  showCustomDegree,
  setShowCustomDegree,
  customDegreeValue,
  setCustomDegreeValue,
  customDegreeInputRef,
  degreeSelectRef,
  // Insurance state
  showCustomInsurance,
  setShowCustomInsurance,
  customInsuranceValue,
  setCustomInsuranceValue,
  customInsuranceInputRef,
  insuranceSelectRef
}) => {
  if (!visible || !certType) return null;

  const handleFieldsChange = (_, allFields) => {
    const hasErrors = allFields.some(field => field.errors.length > 0);
    setIsFormValid(!hasErrors);
  };

  return (
    <Drawer
      title={
        <Space>
          <span>{cert?.certTypeName || certType?.name || 'Certification'} </span>
          {!isWorkingWithChildrenCheck(cert) && <span style={{ color: 'red' }}>*</span>}
        </Space>
      }
      width={600}
      open={visible}
      onClose={onClose}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={() => certForm.submit()}
            disabled={!isFormValid}
          >
            Save
          </Button>
        </div>
      }
      bodyStyle={{ paddingBottom: 80 }}
    >
      {certType.instructions && (
        <Alert
          message="Instructions"
          description={certType.instructions}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={certForm}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          ...cert,
          issuedDate: cert?.issuedDate ? dayjs(cert.issuedDate) : null,
          expiryDate: cert?.expiryDate ? dayjs(cert.expiryDate) : null,
          degree: Array.isArray(cert?.degree) ? cert.degree : (cert?.degree ? [cert.degree] : [])
        }}
        onFieldsChange={handleFieldsChange}
      >
        <RenderEducationFields
          certType={certType}
          certIndex={currentCertIndex}
          showCustomDegree={showCustomDegree}
          setShowCustomDegree={setShowCustomDegree}
          customDegreeValue={customDegreeValue}
          setCustomDegreeValue={setCustomDegreeValue}
          certForm={certForm}
          customDegreeInputRef={customDegreeInputRef}
          degreeSelectRef={degreeSelectRef}
        />

        {/* Insurance Type Field */}
        {certType.requiredFields.includes('insuranceType') && (
          <RenderInsuranceField
            showCustomInsurance={showCustomInsurance}
            setShowCustomInsurance={setShowCustomInsurance}
            customInsuranceValue={customInsuranceValue}
            setCustomInsuranceValue={setCustomInsuranceValue}
            certForm={certForm}
            customInsuranceInputRef={customInsuranceInputRef}
            insuranceSelectRef={insuranceSelectRef}
          />
        )}

        {/* Other required fields */}
        {certType.requiredFields.map(field => {
          if (field === 'degree' || field === 'insuranceType') return null;
          
          const isDateField = field.toLowerCase().includes('date');
          const fieldLabel = formatFieldLabel(field);
          const fieldTooltip = getFieldTooltip(field);

          return (
            <Form.Item
              key={field}
              name={field}
              label={fieldLabel}
              rules={[{ required: true, message: `Please enter ${fieldLabel}` }]}
              tooltip={fieldTooltip}
              style={{ marginBottom: 16 }}
            >
              {isDateField ? (
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  disabledDate={(current) => {
                    if (field === 'issuedDate') {
                      return current && current > dayjs().endOf('day');
                    } else if (field === 'expiryDate') {
                      return current && current < dayjs().startOf('day');
                    }
                    return false;
                  }}
                />
              ) : field === 'country' ? (
                <Select
                  placeholder="Select country"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {NATIONALITIES.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              ) : field === 'state' ? (
                <Select placeholder="Select state">
                  {AUSTRALIAN_STATES.map(state => (
                    <Option key={state.value} value={state.value}>
                      {state.label}
                    </Option>
                  ))}
                </Select>
              ) : field === 'subclass' ? (
                <Select
                  placeholder="Select or enter visa subclass"
                  showSearch
                  allowClear
                  value={cert?.[field] || undefined}
                  onChange={value => certForm.setFieldsValue({ subclass: value })}
                  style={{ width: '100%' }}
                  optionFilterProp="children"
                  dropdownRender={menu => (
                    <>
                      {menu}
                      <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
                        <Input
                          style={{ flex: 'auto' }}
                          placeholder="Enter custom subclass"
                          onPressEnter={e => {
                            const val = e.target.value;
                            if (val) {
                              certForm.setFieldsValue({ subclass: val });
                            }
                          }}
                        />
                      </div>
                    </>
                  )}
                >
                  {certType.visaSettings?.subclassOptions?.map(option => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
              ) : (
                <Input
                  placeholder={`Enter ${fieldLabel}`}
                  maxLength={field === 'number' ? 50 : 100}
                  pattern={field === 'number' && certType.numberPattern ? certType.numberPattern : undefined}
                />
              )}
            </Form.Item>
          );
        })}

        {/* Document Upload */}
        {certType.documentRequired && (
          <Form.Item
            label={<span>Documents</span>}
            name="documents"
            required={certType.documentRequired}
            rules={[
              {
                validator: (_, value) => {
                  if (certType.documentRequired && (!uploadFileList || uploadFileList.length === 0)) {
                    return Promise.reject('Please upload at least one document');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Upload
              accept=".pdf,.jpg,.jpeg,.png"
              fileList={uploadFileList}
              onRemove={async (file) => {
                try {
                  // Extract publicId from file object (could be uid, publicId, or url)
                  const publicId = file.publicId || file.uid || (file.url ? extractPublicIdFromUrl(file.url) : null);
                  
                  if (isWWCC && wwccDraft && setWwccDraft) {
                    // For WWCC draft, update wwccDraft state
                    const newUploadFileList = (wwccDraft?.documents || []).filter(d => d.uid !== file.uid);
                    setWwccDraft(prev => ({
                      ...prev,
                      documents: newUploadFileList
                    }));
                    certForm.setFieldsValue({ documents: newUploadFileList });
                    
                    // Remove from localStorage tracking if publicId exists
                    if (publicId && DocumentTrackingService) {
                      DocumentTrackingService.removeTrackedDocument(publicId);
                    }
                    
                    // Note: For WWCC drafts, we don't delete from Cloudinary until saved
                    // The parent component will handle cleanup if draft is discarded
                  } else {
                    // For regular certifications, use the centralized removal function
                    const docIndex = cert?.documents?.findIndex(d => 
                      d.uid === file.uid || d.publicId === publicId || d.url === file.url
                    );
                    if (docIndex >= 0) {
                      // Immediately update form UI for better UX (optimistic update)
                      const currentFormDocs = certForm.getFieldValue('documents') || uploadFileList || [];
                      const updatedDocs = currentFormDocs.filter(d => 
                        d.uid !== file.uid && d.publicId !== publicId && d.url !== file.url
                      );
                      certForm.setFieldsValue({ documents: updatedDocs });
                      
                      // Call the removal function (optimized - handles all cleanup and shows single toast)
                      // Don't show error here - parent component handles it
                      onRemoveDocument(currentCertIndex, docIndex)
                        .then(() => {
                          // Form already updated above, just validate
                          certForm.validateFields(['documents']).catch(() => {});
                        })
                        .catch((error) => {
                          // Only revert if it's not a user cancellation
                          if (error.message !== 'User cancelled') {
                            console.error('Error removing document:', error);
                            // Revert form on error (parent already showed error toast)
                            certForm.setFieldsValue({ documents: currentFormDocs });
                          }
                        });
                    } else {
                      // Fallback: if document not found in cert, still clean up tracking and form
                      if (publicId && DocumentTrackingService) {
                        DocumentTrackingService.removeTrackedDocument(publicId);
                      }
                      
                      // Remove from form even if not found in cert
                      const currentFormDocs = certForm.getFieldValue('documents') || uploadFileList || [];
                      const updatedDocs = currentFormDocs.filter(d => 
                        d.uid !== file.uid && d.publicId !== publicId && d.url !== file.url
                      );
                      certForm.setFieldsValue({ documents: updatedDocs });
                      
                      toast.error('Document not found in certification');
                    }
                  }
                } catch (error) {
                  console.error('Error removing document:', error);
                  toast.error('Failed to remove document');
                }
              }}
              beforeUpload={async (file, fileList) => {
                // Validation
                const currentCount = uploadFileList.length;
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
                
                // Show loading toast
                const loadingToast = toast.loading(`Uploading ${fileList.length} document(s)...`);
                
                try {
                  // Upload documents - parent component handles the actual upload
                  const uploadResult = await onDocumentUpload(fileList, isWWCC ? 'wwcc' : currentCertIndex, isWWCC);
                  
                  if (uploadResult) {
                    toast.dismiss(loadingToast);
                    toast.success(`Successfully uploaded ${fileList.length} document(s)`);
                    
                    // Update form value with latest documents from state
                    // The parent component updates the state, so we sync here
                    setTimeout(() => {
                      let newUploadFileList;
                      if (isWWCC && wwccDraft) {
                        newUploadFileList = wwccDraft?.documents || [];
                      } else {
                        newUploadFileList = cert?.documents || [];
                      }
                      certForm.setFieldsValue({ documents: newUploadFileList });
                    }, 100);
                  } else {
                    toast.dismiss(loadingToast);
                    toast.error('Failed to upload document(s)');
                  }
                } catch (error) {
                  toast.dismiss(loadingToast);
                  console.error('Upload error:', error);
                  toast.error(error.message || 'Failed to upload document(s)');
                }
                
                // Prevent default upload behavior
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
                      onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(24,144,255,0.28)'}
                      onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(24,144,255,0.18)'}
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
                      onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(255,77,79,0.28)'}
                      onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,77,79,0.18)'}
                    >
                      <DeleteOutlined />
                    </button>
                  </Tooltip>
                ),
              }}
              onPreview={(file) => {
                const doc = uploadFileList.find(d => d.uid === file.uid);
                if (doc) onDocumentPreview(doc);
              }}
              disabled={uploadDisabled}
            >
              {uploadFileList.length >= maxFiles ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              Accepted formats: PDF, JPG, PNG (Max 5MB each, 1-2 documents required)
            </Text>
          </Form.Item>
        )}
      </Form>
    </Drawer>
  );
};

export default CertificationFormDrawer;

