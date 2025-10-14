import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Drawer, Form, Input, DatePicker, Select, Button, Alert, Space, Upload, Tooltip, Typography, message, Skeleton, Spin } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { EyeOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { fetchCertificationByType, updateCertificationByType } from '../../api/axios';
import RenderEducationFields from '../WorkerCertificateOnboarding/RenderEducationFields';
import RenderInsuranceField from '../WorkerCertificateOnboarding/RenderInsuranceField';
import DocumentPreview from '../workerForm/Modals/DocumentPreview';
import { deleteCloudinaryImage } from '../../api/cloudinary';

const { Text } = Typography;
const { Option } = Select;

const allowedFileTypes = ['application/pdf', 'image/jpeg', 'image/png'];
const maxFileSize = 5 * 1024 * 1024; // 5MB
const maxFiles = 2;

export default function CertificationEditorDrawer({
  open,
  typeId,
  onClose,
  onSaved,
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [cert, setCert] = useState(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const queryClient = useQueryClient();

  // Local UI helpers reused from onboarding
  const [showCustomDegree, setShowCustomDegree] = useState(false);
  const [customDegreeValue, setCustomDegreeValue] = useState('');
  const customDegreeInputRef = useRef(null);
  const degreeSelectRef = useRef(null);

  const [showCustomInsurance, setShowCustomInsurance] = useState(false);
  const [customInsuranceValue, setCustomInsuranceValue] = useState('');
  const customInsuranceInputRef = useRef(null);
  const insuranceSelectRef = useRef(null);

  const isDateField = (field) => field.toLowerCase().includes('date');
  const formatFieldLabel = (field) => field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');

  const fetchData = useCallback(async () => {
    if (!open || !typeId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCertificationByType(typeId);
      if (!res?.data?.success) throw new Error('Failed to fetch certification');
      const data = res.data.data;
      // Normalize dates for form
      // Normalize education degree to onboarding format: string 'Other|value' or a known option
      let normalizedDegree;
      let normalizedDegreeSelect;
      if (data?.certificationType?.isEducation) {
        const options = data?.certificationType?.educationSetting?.degreeOptions || [];
        let raw = Array.isArray(data.degree) ? (data.degree[0] || '') : (data.degree || '');
        if (raw) {
          if (typeof raw === 'string' && !raw.startsWith('Other|')) {
            normalizedDegree = options.includes(raw) ? raw : `Other|${raw}`;
            normalizedDegreeSelect = options.includes(raw) ? raw : 'Other';
          } else {
            normalizedDegree = raw;
            normalizedDegreeSelect = 'Other';
          }
        } else {
          normalizedDegree = undefined;
          normalizedDegreeSelect = undefined;
        }
      }

      const initial = {
        ...data,
        issuedDate: data.issuedDate ? dayjs(data.issuedDate) : null,
        expiryDate: data.expiryDate ? dayjs(data.expiryDate) : null,
        dateOfCompletion: data.dateOfCompletion ? dayjs(data.dateOfCompletion) : null,
        degree: normalizedDegree,
        degreeSelect: normalizedDegreeSelect,
      };
      setCert(data);
      form.setFieldsValue(initial);
    } catch (e) {
      setError(e.message || 'Failed to load certification');
    } finally {
      setLoading(false);
    }
  }, [open, typeId, form]);

  useEffect(() => {
    fetchData();
    // reset when closed
    if (!open) {
      form.resetFields();
      setCert(null);
      setError(null);
      setSaving(false);
    }
  }, [open, typeId, fetchData, form]);

  // Manage global UI when drawer is open: prevent body scroll and notify layout
  useEffect(() => {
    try {
      if (open) {
        document.body.style.overflow = 'hidden';
        const evt = typeof window.CustomEvent === 'function'
          ? new CustomEvent('drawer:open')
          : (function(){ const e = document.createEvent('Event'); e.initEvent('drawer:open', true, true); return e; })();
        window.dispatchEvent(evt);
      } else {
        document.body.style.overflow = '';
        const evt = typeof window.CustomEvent === 'function'
          ? new CustomEvent('drawer:close')
          : (function(){ const e = document.createEvent('Event'); e.initEvent('drawer:close', true, true); return e; })();
        window.dispatchEvent(evt);
      }
    } catch (_) {}
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const uploadToCloudinary = async (file) => {
    try {
      // Optional: compress images before upload for speed and size
      const processed = file.type.startsWith('image/')
        ? await compressImage(file, { maxWidth: 1800, quality: 0.82 })
        : file;

      const formData = new FormData();
      formData.append('file', processed);
      formData.append('upload_preset', 'Certificate(Saas)');
      formData.append('folder', 'SAAS(Support Worker)');
      const cloudName = 'dgsphdhns';
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      return {
        uid: data.public_id,
        url: data.secure_url,
        publicId: data.public_id,
        fileName: processed.name || file.name,
        fileType: processed.type || file.type,
        uploadedAt: new Date().toISOString(),
        status: 'done',
      };
    } catch (e) {
      message.error(e.message || 'Upload failed');
      return null;
    }
  };

  // Lightweight client-side image compression using canvas
  const compressImage = (file, { maxWidth = 1920, quality = 0.85 } = {}) => new Promise((resolve) => {
    try {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (!blob) return resolve(file);
          const compressed = new File([blob], file.name, { type: 'image/jpeg' });
          resolve(compressed);
        }, 'image/jpeg', quality);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    } catch (_) {
      resolve(file);
    }
  });

  const handleBeforeUpload = async (file, fileList) => {
    const current = form.getFieldValue('documents') || cert?.documents || [];
    const remaining = maxFiles - current.length;
    if (fileList.length > remaining) {
      message.error(`You can only upload ${remaining} more document(s)`);
      return Upload.LIST_IGNORE;
    }
    if (!allowedFileTypes.includes(file.type)) {
      message.error('Only PDF, JPG, PNG files are allowed');
      return Upload.LIST_IGNORE;
    }
    if (file.size > maxFileSize) {
      message.error('Each file must be less than 5MB');
      return Upload.LIST_IGNORE;
    }
    setUploading(true);
    const hide = message.loading('Uploading document...', 0);
    const uploaded = await uploadToCloudinary(file);
    hide();
    if (uploaded) {
      const next = [...current, uploaded].slice(0, maxFiles);
      form.setFieldsValue({ documents: next });
      message.success('Document uploaded successfully');
      try {
        await queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey.join('|').includes('onboarding') });
      } catch (_) {}
    }
    setUploading(false);
    return Upload.LIST_IGNORE;
  };

  const onRemove = async (file) => {
    const current = form.getFieldValue('documents') || cert?.documents || [];
    const next = current.filter((d) => d.uid !== file.uid && d.publicId !== file.publicId);
    form.setFieldsValue({ documents: next });
    if (file?.publicId) {
      const hide = message.loading('Removing document...', 0);
      try {
        await deleteCloudinaryImage(file.publicId);
        hide();
        message.success('Document removed');
        try {
          await queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey.join('|').includes('onboarding') });
        } catch (_) {}
      } catch (e) {
        hide();
        message.warning('Removed locally but failed to delete in cloud');
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      const payload = {
        ...values,
        issuedDate: values.issuedDate ? values.issuedDate.toISOString() : undefined,
        expiryDate: values.expiryDate ? values.expiryDate.toISOString() : undefined,
        dateOfCompletion: values.dateOfCompletion ? values.dateOfCompletion.toISOString() : undefined,
        // Persist degree as array like onboarding submit
        degree: values.degree ? [values.degree] : [],
      };
      await updateCertificationByType(typeId, payload);
      message.success('Certification updated');
      if (onSaved) onSaved();
      onClose?.();
    } catch (e) {
      if (e?.errorFields) return; // antd validation
      message.error(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const requiredFields = Array.isArray(cert?.certificationType?.requiredFields) ? cert.certificationType.requiredFields : [];
  const documentRequired = !!cert?.certificationType?.documentRequired;

  return (
    <Drawer
      title={loading ? 'Loading certification...' : (cert?.certificationType?.name || 'Edit Certification')}
      width={600}
      open={open}
      onClose={onClose}
      destroyOnClose
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSave} loading={saving} disabled={loading}>
            Save
          </Button>
        </div>
      }
      bodyStyle={{ paddingBottom: 80 }}
    >
      {loading && !uploading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} />
          {/* Simulate 4 required fields */}
          <Skeleton.Input active style={{ width: '100%', height: 40 }} />
          <Skeleton.Input active style={{ width: '100%', height: 40 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Skeleton.Input active style={{ width: '100%', height: 40 }} />
            <Skeleton.Input active style={{ width: '100%', height: 40 }} />
          </div>
          {/* Documents area */}
          <Skeleton active paragraph={{ rows: 2 }} title={{ width: '30%' }} style={{ width: '100%' }} />
        </div>
      )}

      {cert?.certificationType?.instructions ? (
        <Alert
          message="Instructions"
          description={cert?.certificationType?.instructions}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : null}

      {error && (
        <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
      )}

      <Form
        layout="vertical"
        form={form}
        disabled={loading}
      >
        {/* Education fields */}
        {cert?.certificationType?.isEducation ? (
          <RenderEducationFields
            certType={cert.certificationType}
            certIndex={0}
            showCustomDegree={showCustomDegree}
            setShowCustomDegree={setShowCustomDegree}
            customDegreeValue={customDegreeValue}
            setCustomDegreeValue={setCustomDegreeValue}
            certForm={form}
            customDegreeInputRef={customDegreeInputRef}
            degreeSelectRef={degreeSelectRef}
          />
        ) : null}

        {/* Insurance field */}
        {requiredFields.includes('insuranceType') ? (
          <RenderInsuranceField
            showCustomInsurance={showCustomInsurance}
            setShowCustomInsurance={setShowCustomInsurance}
            customInsuranceValue={customInsuranceValue}
            setCustomInsuranceValue={setCustomInsuranceValue}
            certForm={form}
            customInsuranceInputRef={customInsuranceInputRef}
            insuranceSelectRef={insuranceSelectRef}
          />
        ) : null}

        {requiredFields.map((field) => {
          if (field === 'degree' || field === 'insuranceType') return null;
          const label = formatFieldLabel(field);
          return (
            <Form.Item key={field} name={field} label={label} rules={[{ required: true, message: `Please enter ${label}` }]}>
              {isDateField(field) ? (
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              ) : field === 'state' ? (
                <Select placeholder="Select state">
                  <Option value="NSW">New South Wales</Option>
                  <Option value="VIC">Victoria</Option>
                  <Option value="QLD">Queensland</Option>
                  <Option value="WA">Western Australia</Option>
                  <Option value="SA">South Australia</Option>
                  <Option value="TAS">Tasmania</Option>
                  <Option value="ACT">Australian Capital Territory</Option>
                  <Option value="NT">Northern Territory</Option>
                </Select>
              ) : (
                <Input placeholder={`Enter ${label}`} maxLength={field === 'number' ? 50 : 100} />
              )}
            </Form.Item>
          );
        })}

        {documentRequired && (
          <Form.Item
            label="Documents"
            name="documents"
            rules={[{
              validator: (_, value) => {
                const list = value || cert?.documents || [];
                if (documentRequired && (!list || list.length === 0)) {
                  return Promise.reject('Please upload at least one document');
                }
                return Promise.resolve();
              }
            }]}
          >
            <Upload
              accept=".pdf,.jpg,.jpeg,.png"
              fileList={form.getFieldValue('documents') || cert?.documents || []}
              beforeUpload={handleBeforeUpload}
              onRemove={onRemove}
              multiple
              listType="picture-card"
              disabled={uploading}
              onPreview={(file) => {
                const list = form.getFieldValue('documents') || cert?.documents || [];
                const found = list.find((d) => d.uid === file.uid || d.publicId === file.publicId);
                if (found) {
                  setPreviewDoc(found);
                  setPreviewOpen(true);
                }
              }}
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: true,
                previewIcon: () => (
                  <Tooltip title="Preview Document">
                    <button type="button" style={{ border: 'none', background: '#1890ff', color: '#fff', borderRadius: '50%', width: 28, height: 28 }}>
                      <EyeOutlined />
                    </button>
                  </Tooltip>
                ),
                removeIcon: () => (
                  <Tooltip title="Delete Document">
                    <button type="button" style={{ border: 'none', background: '#ff4d4f', color: '#fff', borderRadius: '50%', width: 28, height: 28 }}>
                      <DeleteOutlined />
                    </button>
                  </Tooltip>
                ),
              }}
            >
              {(form.getFieldValue('documents')?.length || cert?.documents?.length || 0) >= maxFiles ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              Accepted formats: PDF, JPG, PNG (Max 5MB each, up to 2)
            </Text>
          </Form.Item>
        )}
      </Form>
      <DocumentPreview
        document={previewDoc}
        visible={!!previewOpen}
        onClose={() => setPreviewOpen(false)}
        onDelete={async () => {
          if (!previewDoc) return;
          const current = form.getFieldValue('documents') || cert?.documents || [];
          const next = current.filter((d) => d.publicId !== previewDoc.publicId);
          form.setFieldsValue({ documents: next });
          setPreviewOpen(false);
          try {
            const hide = message.loading('Removing document...', 0);
            await deleteCloudinaryImage(previewDoc.publicId);
            hide();
            message.success('Document removed');
            try { await queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey.join('|').includes('onboarding') }); } catch (_) {}
          } catch (_) {
            message.warning('Removed locally but failed to delete in cloud');
          }
        }}
      />
    </Drawer>
  );
}


