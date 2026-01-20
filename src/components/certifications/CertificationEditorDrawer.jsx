import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Drawer, Form, Input, DatePicker, Select, Button, Alert, Space, Upload, Tooltip, Typography, message, Skeleton, Spin, Tag } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { EyeOutlined, DeleteOutlined, PlusOutlined, FileTextOutlined, FileImageOutlined, FilePdfOutlined } from '@ant-design/icons';
import { fetchCertificationByType, updateCertificationByType, deleteCertificationDocument } from '../../api/axios';
import RenderEducationFields from '../WorkerCertificateOnboarding/RenderEducationFields';
import RenderInsuranceField from '../WorkerCertificateOnboarding/RenderInsuranceField';
import DocumentPreview from '../workerForm/Modals/DocumentPreview';
import { deleteCloudinaryImage } from '../../api/cloudinary';

const { Text } = Typography;
const { Option } = Select;

const allowedFileTypes = ['application/pdf', 'image/jpeg', 'image/png'];
const maxFileSize = 5 * 1024 * 1024; // 5MB
const maxFiles = 2;

// LocalStorage tracking key used elsewhere in the app for uploaded documents
const DOCUMENT_TRACKING_KEY = 'certification_documents_tracking';

// Remove a document (by publicId) from localStorage tracking immediately
function removeDocumentFromLocalStorage(publicId) {
  if (!publicId || typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(DOCUMENT_TRACKING_KEY);
    if (!stored) return;
    const tracked = JSON.parse(stored);
    if (tracked && typeof tracked === 'object' && tracked[publicId]) {
      delete tracked[publicId];
      localStorage.setItem(DOCUMENT_TRACKING_KEY, JSON.stringify(tracked));
    }
  } catch (_) {}
}

export default function CertificationEditorDrawer({
  open,
  typeId,
  onClose,
  onSaved,
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState(null);
  const [cert, setCert] = useState(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [deletingIds, setDeletingIds] = useState(new Set());
  const queryClient = useQueryClient();
  const isDeletingAny = useMemo(() => deletingIds.size > 0, [deletingIds]);

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

  // Live missing field detection (auto-hides when filled)
  const watchedValues = Form.useWatch([], form);
  const missingFields = useMemo(() => {
    const m = [];
    const type = cert?.certificationType || {};
    const requiredFields = Array.isArray(type.requiredFields) ? type.requiredFields : [];
    // simple required fields
    for (const f of requiredFields) {
      if (f === 'degree' || f === 'insuranceType') continue;
      if (!watchedValues || !watchedValues[f]) m.push(f);
    }
    // education
    if (type.isEducation) {
      const deg = watchedValues?.degree ?? (cert?.degree);
      const degOk = Array.isArray(deg) ? deg.length > 0 : !!deg;
      if (!degOk) m.push('degree');
    }
    // insurance
    if (requiredFields.includes('insuranceType') && !watchedValues?.insuranceType) {
      m.push('insuranceType');
    }
    // documents
    if (type.documentRequired) {
      const docs = watchedValues?.documents ?? cert?.documents;
      if (!Array.isArray(docs) || docs.length === 0) m.push('documents');
    }
    return m;
  }, [cert, watchedValues]);

  const { data: certData, isLoading: certLoading, error: certQueryError } = useQuery({
    queryKey: ['certificationByType', typeId],
    queryFn: async () => {
      const res = await fetchCertificationByType(typeId);
      if (!res?.data?.success) throw new Error('Failed to fetch certification');
      return res.data.data;
    },
    enabled: !!open && !!typeId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  // Track initial snapshot for dirty-check
  const initialSnapshotRef = useRef(null);

  useEffect(() => {
    if (certQueryError) setError(certQueryError.message || 'Failed to load certification');
  }, [certQueryError]);

  // hydrate form when data arrives
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setCert(null);
      setError(null);
      setSaving(false);
      return;
    }
    if (certData) {
      // Normalize education field for form
      let normalizedDegree;
      let normalizedDegreeSelect;
      if (certData?.certificationType?.isEducation) {
        const options = certData?.certificationType?.educationSetting?.degreeOptions || [];
        let raw = Array.isArray(certData.degree) ? (certData.degree[0] || '') : (certData.degree || '');
        if (raw) {
          if (typeof raw === 'string' && !raw.startsWith('Other|')) {
            normalizedDegree = options.includes(raw) ? raw : `Other|${raw}`;
            normalizedDegreeSelect = options.includes(raw) ? raw : 'Other';
          } else {
            normalizedDegree = raw;
            normalizedDegreeSelect = 'Other';
          }
        }
      }

      const initial = {
        ...certData,
        issuedDate: certData.issuedDate ? dayjs(certData.issuedDate) : null,
        expiryDate: certData.expiryDate ? dayjs(certData.expiryDate) : null,
        dateOfCompletion: certData.dateOfCompletion ? dayjs(certData.dateOfCompletion) : null,
        degree: normalizedDegree,
        degreeSelect: normalizedDegreeSelect,
      };
      setCert(certData);
      form.setFieldsValue(initial);
      // store initial snapshot for dirty detection
      initialSnapshotRef.current = initial;
    }
  }, [open, certData, form]);

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
        isNew: true,
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
    const formDocs = form.getFieldValue('documents');
    const current = (Array.isArray(formDocs) ? formDocs : null) || (Array.isArray(cert?.documents) ? cert?.documents : []) || [];
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
        await queryClient.invalidateQueries({ predicate: (q) => {
          if (!Array.isArray(q.queryKey)) return false;
          const key = q.queryKey.join('|');
          return key.includes('certifications') && (typeId ? key.includes(String(typeId)) : true);
        }});
        if (typeId) await queryClient.invalidateQueries({ queryKey: ['certificationByType', typeId] });
      } catch (_) {}
    }
    setUploading(false);
    return Upload.LIST_IGNORE;
  };

  const onRemove = async (file) => {
    // Block starting another deletion while one is in progress (unless it's the same file re-triggered)
    if (isDeletingAny && !(file?.publicId && deletingIds.has(file.publicId))) {
      message.info('Please wait for the current deletion to complete');
      return;
    }
    if (file?.publicId && deletingIds.has(file.publicId)) return;
    if (file?.publicId) setDeletingIds(prev => new Set(prev).add(file.publicId));
    const formDocs = form.getFieldValue('documents');
    const current = (Array.isArray(formDocs) ? formDocs : null) || (Array.isArray(cert?.documents) ? cert?.documents : []) || [];
    const next = current.filter((d) => d.uid !== file.uid && d.publicId !== file.publicId);
    form.setFieldsValue({ documents: next });
    // Immediately remove from localStorage tracking if present
    if (file?.publicId) removeDocumentFromLocalStorage(file.publicId);
    if (file?.publicId) {
      const hide = message.loading('Removing document...', 0);
      try {
        if (file?.isNew) {
          // Newly added but not persisted to server: try cloud delete, but don't warn on failure
          try {
            await deleteCloudinaryImage(file.publicId);
          } catch (_) {}
          hide();
          message.success('Document removed');
          try {
            if (typeId) await queryClient.invalidateQueries({ queryKey: ['certificationByType', typeId] });
          } catch (_) {}
          return;
        }
        if (typeId) {
          const res = await deleteCertificationDocument(typeId, file.publicId);
          if (res?.data?.data) {
            const updated = res.data.data;
            form.setFieldsValue({ documents: updated.documents || [] });
          }
        } else {
          await deleteCloudinaryImage(file.publicId);
        }
        hide();
        message.success('Document removed');
        try {
          await queryClient.invalidateQueries({ predicate: (q) => {
            if (!Array.isArray(q.queryKey)) return false;
            const key = q.queryKey.join('|');
            return key.includes('certifications') && (typeId ? key.includes(String(typeId)) : true);
          }});
          if (typeId) await queryClient.invalidateQueries({ queryKey: ['certificationByType', typeId] });
        } catch (_) {}
      } catch (e) {
        hide();
        // If the file was newly added, silently succeed; otherwise, warn
        if (file?.isNew) {
          message.success('Document removed');
        } else {
          message.warning('Removed locally but failed to delete in cloud');
        }
      } finally {
        if (file?.publicId) setDeletingIds(prev => { const s = new Set(prev); s.delete(file.publicId); return s; });
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      // Sanitize documents (strip client-only fields like isNew)
      const docs = Array.isArray(values.documents)
        ? values.documents.map(d => ({
            uid: d.uid,
            url: d.url,
            publicId: d.publicId,
            fileName: d.fileName,
            fileType: d.fileType,
            uploadedAt: d.uploadedAt,
            status: d.status,
          }))
        : undefined;
      const payload = {
        ...values,
        issuedDate: values.issuedDate ? values.issuedDate.toISOString() : undefined,
        expiryDate: values.expiryDate ? values.expiryDate.toISOString() : undefined,
        dateOfCompletion: values.dateOfCompletion ? values.dateOfCompletion.toISOString() : undefined,
        // Persist degree as array like onboarding submit
        degree: values.degree ? [values.degree] : [],
        documents: docs,
      };
      // Optimistic updates: cache snapshots
      const prevCert = queryClient.getQueryData(['certificationByType', typeId]);
      const prevOnboarding = queryClient.getQueryData(['onboarding']);
      // apply optimistic cache for detail
      queryClient.setQueryData(['certificationByType', typeId], (old) => ({ ...(old || {}), ...payload }));
      // apply optimistic patch to onboarding if present
      if (prevOnboarding?.success && prevOnboarding.data?.profile?.certifications) {
        queryClient.setQueryData(['onboarding'], (old) => {
          if (!old?.data?.profile?.certifications) return old;
          const next = { ...old, data: { ...old.data, profile: { ...old.data.profile } } };
          next.data.profile.certifications = old.data.profile.certifications.map((c) => {
            const id = c?.certificationType?._id || c?.certificationType;
            return id === typeId ? { ...c, ...payload, verificationStatus: 'Pending', rejectionReason: undefined, verificationDate: undefined, verifiedBy: undefined } : c;
          });
          return next;
        });
      }
      await updateCertificationByType(typeId, payload);
      message.success('Certification updated');
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1500);
      try {
        await queryClient.invalidateQueries({ queryKey: ['onboarding'] });
        if (typeId) await queryClient.invalidateQueries({ queryKey: ['certificationByType', typeId] });
      } catch (_) {}
      try {
        const evt = typeof window.CustomEvent === 'function'
          ? new CustomEvent('onboarding:refresh')
          : (function(){ const e = document.createEvent('Event'); e.initEvent('onboarding:refresh', true, true); return e; })();
        window.dispatchEvent(evt);
      } catch (_) {}
      if (onSaved) onSaved();
      onClose?.();
    } catch (e) {
      // rollback optimistic caches on error
      try { queryClient.setQueryData(['certificationByType', typeId], prevCert); } catch (_) {}
      try { if (prevOnboarding) queryClient.setQueryData(['onboarding'], prevOnboarding); } catch (_) {}
      if (e?.errorFields) return; // antd validation
      message.error(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const requiredFields = Array.isArray(cert?.certificationType?.requiredFields) ? cert.certificationType.requiredFields : [];
  const documentRequired = !!cert?.certificationType?.documentRequired;
  const isLoadingComputed = loading || certLoading;

  return (
    <Drawer
      title={isLoadingComputed ? 'Loading certification...' : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{cert?.certificationType?.name || 'Edit Certification'}</span>
          {Array.isArray(missingFields) && missingFields.length > 0 && (
            <Tooltip title={`Missing: ${missingFields.map(formatFieldLabel).join(', ')}`}>
              <Tag color="red">Missing {missingFields.length}</Tag>
            </Tooltip>
          )}
          {justSaved && (
            <Tag color="green">Saved</Tag>
          )}
        </div>
      )}
      width={600}
      open={open}
      onClose={() => {
        setPreviewOpen(false);
        setPreviewDoc(null);
        onClose();
      }}
      destroyOnClose
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={() => {
            setPreviewOpen(false);
            setPreviewDoc(null);
            onClose();
          }} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSave} loading={saving} disabled={isLoadingComputed}>
            Save
          </Button>
        </div>
      }
      bodyStyle={{ paddingBottom: 80 }}
    >
      {isLoadingComputed && !uploading && (
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

      {Array.isArray(missingFields) && missingFields.length > 0 && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="Some required fields are missing"
          description={
            <div>
              <Text>Please complete:</Text>
              <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
                {missingFields.map((f) => (
                  <li key={f}>
                    <Text strong>{formatFieldLabel(f)}</Text>
                  </li>
                ))}
              </ul>
            </div>
          }
        />
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
            label={
              <span style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                color: '#1f2937',
                letterSpacing: '-0.01em'
              }}>
                Documents
              </span>
            }
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
            <div style={{
            }}>
              {/* Custom Document List with Thumbnails */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: '12px',
                marginBottom: '16px',
                '@media (max-width: 480px)': {
                  gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                  gap: '10px'
                }
              }}>
                {(() => {
                  const formDocs = form.getFieldValue('documents');
                  const certDocs = cert?.documents;
                  return Array.isArray(formDocs) ? formDocs : (Array.isArray(certDocs) ? certDocs : []);
                })().map((doc, index) => {
                  const isPdf = doc?.fileType === 'application/pdf' || doc?.url?.includes('.pdf');
                  const isImage = doc?.fileType?.includes('image') || /\.(jpg|jpeg|png|gif)$/i.test(doc?.url || '');
                  const isDeleting = doc?.publicId && deletingIds.has(doc.publicId);
                  
                  return (
                    <div
                      key={doc.uid || doc.publicId || index}
                      style={{
                        position: 'relative',
                        border: '1px solid #e8e8e8',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#fff',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        aspectRatio: '1',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#1890ff';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(24, 144, 255, 0.15), 0 2px 8px rgba(24, 144, 255, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e8e8e8';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      }}
                    >
                      {/* Thumbnail or File Icon */}
                      <div style={{
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isImage ? 'transparent' : (isPdf ? '#fff5f5' : '#f0f7ff'),
                        overflow: 'hidden'
                      }}>
                        {isImage ? (
                          <img
                            src={doc.url}
                            alt="Document thumbnail"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />
                        ) : (
                          <div style={{
                            fontSize: '36px',
                            color: isPdf ? '#ff4d4f' : '#1890ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {isPdf ? <FilePdfOutlined /> : <FileTextOutlined />}
                          </div>
                        )}
                        
                        {/* Overlay with Action Buttons */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                          padding: '8px',
                          gap: '6px',
                          opacity: 0,
                          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          backdropFilter: 'blur(2px)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '0';
                        }}
                        >
                          <Tooltip title="Preview" placement="top">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewDoc(doc);
                                setPreviewOpen(true);
                              }}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: 'none',
                              background: 'rgba(24, 144, 255, 0.95)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                              backdropFilter: 'blur(8px)',
                              boxShadow: '0 2px 12px rgba(24, 144, 255, 0.4)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(24, 144, 255, 1)';
                              e.currentTarget.style.transform = 'scale(1.15)';
                              e.currentTarget.style.boxShadow = '0 4px 16px rgba(24, 144, 255, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(24, 144, 255, 0.95)';
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = '0 2px 12px rgba(24, 144, 255, 0.4)';
                            }}
                            >
                              <EyeOutlined style={{ fontSize: '16px' }} />
                            </button>
                          </Tooltip>
                          <Tooltip title={isDeleting ? 'Deleting...' : 'Delete'} placement="top">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isDeletingAny && !isDeleting) {
                                  message.info('Please wait for the current deletion to complete');
                                  return;
                                }
                                if (isDeleting) return;
                                onRemove(doc);
                              }}
                              disabled={isDeletingAny}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: 'none',
                                background: isDeleting ? 'rgba(255, 204, 199, 0.95)' : 'rgba(255, 77, 79, 0.95)',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: isDeletingAny ? 'not-allowed' : 'pointer',
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                backdropFilter: 'blur(8px)',
                                boxShadow: '0 2px 12px rgba(255, 77, 79, 0.4)'
                              }}
                              onMouseEnter={(e) => {
                                if (!isDeletingAny) {
                                  e.currentTarget.style.background = 'rgba(255, 77, 79, 1)';
                                  e.currentTarget.style.transform = 'scale(1.15)';
                                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 77, 79, 0.5)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = isDeleting ? 'rgba(255, 204, 199, 0.95)' : 'rgba(255, 77, 79, 0.95)';
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 2px 12px rgba(255, 77, 79, 0.4)';
                              }}
                            >
                              {isDeleting ? (
                                <Spin size="small" style={{ color: '#fff' }} />
                              ) : (
                                <DeleteOutlined style={{ fontSize: '16px' }} />
                              )}
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Premium Upload Section */}
                {(
                  (
                    (Array.isArray(form.getFieldValue('documents')) ? form.getFieldValue('documents') : [])?.length ||
                    (Array.isArray(cert?.documents) ? cert?.documents : [])?.length ||
                    0
                  ) < maxFiles
                ) && (
                  <Upload
                    accept=".pdf,.jpg,.jpeg,.png"
                    beforeUpload={handleBeforeUpload}
                    multiple
                    showUploadList={false}
                    disabled={uploading || isDeletingAny}
                  >
                    <div
                      style={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: 14,
                        background: uploading || isDeletingAny ? '#f3f4f6' : '#ffffff',
                        border: '1.5px dashed #d1d5db',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '12px',
                        cursor: uploading || isDeletingAny ? 'not-allowed' : 'pointer',
                        transition: 'all 220ms cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        color: '#374151'
                      }}
                      onMouseEnter={(e) => {
                        if (!uploading && !isDeletingAny) {
                          e.currentTarget.style.borderColor = '#2563eb';
                          e.currentTarget.style.background = '#f8fafc';
                          e.currentTarget.style.boxShadow =
                            '0 8px 28px rgba(37, 99, 235, 0.12)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Icon - Clean, no background */}
                      {uploading ? (
                        <Spin size="small" style={{ color: '#6b7280' }} />
                      ) : (
                        <PlusOutlined 
                          style={{ 
                            fontSize: 24, 
                            color: uploading || isDeletingAny ? '#9ca3af' : '#2563eb', 
                            lineHeight: 1,
                            transition: 'all 200ms ease'
                          }} 
                        />
                      )}

                      {/* Text Container */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          width: '100%',
                          flex: 1,
                          minHeight: 0
                        }}
                      >
                        {/* Text */}
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: uploading || isDeletingAny ? '#9ca3af' : '#374151',
                            letterSpacing: '-0.01em',
                            textAlign: 'center',
                            lineHeight: 1.3,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {uploading ? 'Uploading…' : 'Add document'}
                        </div>

                        {/* Subtle helper */}
                        <div
                          style={{
                            fontSize: 10,
                            color: '#9ca3af',
                            textAlign: 'center',
                            lineHeight: 1.3,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          PDF, JPG or PNG
                        </div>
                      </div>
                    </div>
                  </Upload>
                )}
              </div>
              
              <Text 
                type="secondary" 
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px', 
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #e5e7eb',
                  color: '#6b7280',
                  lineHeight: '1.5',
                  fontWeight: 400
                }}
              >
                <span style={{ fontSize: '11px' }}>📄</span>
                <span>Accepted: PDF, JPG, PNG (Max 5MB each, up to {maxFiles})</span>
              </Text>
            </div>
          </Form.Item>
        )}
      </Form>
      {previewOpen && previewDoc && (
        <DocumentPreview
          document={previewDoc}
          onClose={() => {
            setPreviewOpen(false);
            setPreviewDoc(null);
          }}
          certificateData={cert}
        onDelete={async () => {
          if (!previewDoc) return;
          if (isDeletingAny && !(previewDoc?.publicId && deletingIds.has(previewDoc.publicId))) {
            message.info('Please wait for the current deletion to complete');
            return;
          }
          if (previewDoc?.publicId && deletingIds.has(previewDoc.publicId)) return;
          if (previewDoc?.publicId) setDeletingIds(prev => new Set(prev).add(previewDoc.publicId));
          const formDocs = form.getFieldValue('documents');
    const current = (Array.isArray(formDocs) ? formDocs : null) || (Array.isArray(cert?.documents) ? cert?.documents : []) || [];
          const next = current.filter((d) => d.publicId !== previewDoc.publicId);
          form.setFieldsValue({ documents: next });
          setPreviewOpen(false);
          setPreviewDoc(null);
          // Immediately remove from localStorage tracking if present
          if (previewDoc?.publicId) removeDocumentFromLocalStorage(previewDoc.publicId);
          try {
            const hide = message.loading('Removing document...', 0);
            if (previewDoc?.isNew) {
              try { await deleteCloudinaryImage(previewDoc.publicId); } catch (_) {}
            } else if (typeId) {
              const res = await deleteCertificationDocument(typeId, previewDoc.publicId);
              if (res?.data?.data) {
                const updated = res.data.data;
                form.setFieldsValue({ documents: updated.documents || [] });
              }
            } else {
              await deleteCloudinaryImage(previewDoc.publicId);
            }
            hide();
            message.success('Document removed');
            try { 
              await queryClient.invalidateQueries({ predicate: (q) => {
                if (!Array.isArray(q.queryKey)) return false;
                const key = q.queryKey.join('|');
                return key.includes('certifications') && (typeId ? key.includes(String(typeId)) : true);
              }}); 
              if (typeId) await queryClient.invalidateQueries({ queryKey: ['certificationByType', typeId] });
            } catch (_) {}
          } catch (_) {
            // For newly added, silently succeed; otherwise warn
            if (previewDoc?.isNew) {
              message.success('Document removed');
            } else {
              message.warning('Removed locally but failed to delete in cloud');
            }
          } finally {
            if (previewDoc?.publicId) setDeletingIds(prev => { const s = new Set(prev); s.delete(previewDoc.publicId); return s; });
          }
        }}
        />
      )}
    </Drawer>
  );
}


