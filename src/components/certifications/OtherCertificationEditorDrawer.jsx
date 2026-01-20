import React, { useCallback, useEffect, useState } from 'react';
import { Drawer, Form, Input, Upload, Button, Tooltip, Typography, message, Skeleton, Spin } from 'antd';
import { EyeOutlined, DeleteOutlined, PlusOutlined, FileTextOutlined, FileImageOutlined, FilePdfOutlined } from '@ant-design/icons';
import { fetchOtherCertificationById, updateOtherCertificationById, createOtherCertification } from '../../api/axios';
import DocumentPreview from '../workerForm/Modals/DocumentPreview';
import { deleteCloudinaryImage } from '../../api/cloudinary';

const { Text } = Typography;

const allowedFileTypes = ['application/pdf', 'image/jpeg', 'image/png'];
const maxFileSize = 5 * 1024 * 1024;
const maxFiles = 4;

export default function OtherCertificationEditorDrawer({ open, id, mode = 'edit', onClose, onSaved }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState(null);
  const [docs, setDocs] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);

  const load = useCallback(async () => {
    if (!open) return;
    if (mode === 'create') {
      form.resetFields();
      setData({});
      return;
    }
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetchOtherCertificationById(id);
      if (!res?.data?.success) throw new Error('Failed to load');
      setData(res.data.data);
      const loadedDocs = res.data.data.documents || [];
      setDocs(loadedDocs);
      form.setFieldsValue({
        certificationTitle: res.data.data.certificationTitle,
        documents: loadedDocs
      });
    } catch (e) {
      message.error(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [open, id, form]);

  useEffect(() => {
    load();
    if (!open) {
      form.resetFields();
      setDocs([]);
      setData(null);
    }
  }, [open, id, load, form]);

  // Emit drawer open/close events and manage body scroll like the main editor
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

  // Optional lightweight image compression for speed
  const compressImage = (file, { maxWidth = 1800, quality = 0.82 } = {}) => new Promise((resolve) => {
    try {
      if (!file.type || !file.type.startsWith('image/')) return resolve(file);
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
          const out = new File([blob], file.name, { type: 'image/jpeg' });
          resolve(out);
        }, 'image/jpeg', quality);
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    } catch (_) { resolve(file); }
  });

  const uploadToCloudinary = async (file) => {
    try {
      const toSend = await compressImage(file);
      const formData = new FormData();
      formData.append('file', toSend);
      formData.append('upload_preset', 'Certificate(Saas)');
      formData.append('folder', 'SAAS(Other Certificates)');
      const cloudName = 'dgsphdhns';
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Upload failed');
      const d = await response.json();
      return { uid: d.public_id, url: d.secure_url, publicId: d.public_id, fileName: toSend.name || file.name, fileType: toSend.type || file.type, uploadedAt: new Date().toISOString(), status: 'done' };
    } catch (e) {
      message.error(e.message || 'Upload failed');
      return null;
    }
  };

  // Optimistic, multi-file upload with immediate UI feedback
  const beforeUpload = async (file, fileList) => {
    const current = docs || [];
    const remaining = maxFiles - current.length;
    const toProcess = fileList.slice(0, remaining).filter(f => allowedFileTypes.includes(f.type) && f.size <= maxFileSize);
    const invalid = fileList.length - toProcess.length;
    if (invalid > 0) message.warning(`${invalid} file(s) skipped (type/size limits)`);

    // Add temporary items to UI immediately
    const tempItems = toProcess.map(f => ({ uid: f.uid, fileName: f.name, fileType: f.type, status: 'uploading' }));
    const optimistic = [...current, ...tempItems].slice(0, maxFiles);
    setDocs(optimistic);
    form.setFieldsValue({ documents: optimistic });
    setUploading(true);

    // Upload concurrently
    try {
      const results = await Promise.all(toProcess.map(f => uploadToCloudinary(f)));

      // Replace temp items with uploaded ones
      const uploaded = results.filter(Boolean);
      const after = (docs || []).filter(d => !tempItems.some(t => t.uid === d.uid));
      const finalDocs = [...after, ...uploaded].slice(0, maxFiles);
      setDocs(finalDocs);
      form.setFieldsValue({ documents: finalDocs });
      if (uploaded.length) message.success(`${uploaded.length} document(s) uploaded`);
    } catch (error) {
      message.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
    return Upload.LIST_IGNORE;
  };

  const removeDoc = async (file) => {
    const current = docs || [];
    const next = current.filter(d => (d.uid || d.publicId) !== (file.uid || file.publicId));
    setDocs(next);
    form.setFieldsValue({ documents: next });
    if (file?.publicId) {
      const hide = message.loading('Removing document...', 0);
      try { await deleteCloudinaryImage(file.publicId); hide(); message.success('Document removed'); } catch (_) { hide(); message.warning('Removed locally but failed to delete in cloud'); }
    }
  };

  const save = async () => {
    try {
      setSaving(true);
      // Ensure we save the latest docs state
      form.setFieldsValue({ documents: docs });
      const values = await form.validateFields();
      const payload = { ...values, documents: docs };
      let saved;
      if (mode === 'create') {
        const res = await createOtherCertification(payload);
        saved = res?.data?.data;
        message.success('Other certification created');
      } else {
        const res = await updateOtherCertificationById(id, payload);
        saved = res?.data?.data;
        message.success('Other certification updated');
      }
      onSaved?.(saved);
      onClose?.();
    } catch (e) {
      if (!e?.errorFields) message.error(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Drawer
      title={mode === 'create' ? 'Add Other Certification' : (data?.certificationTitle || 'Edit Other Certification')}
      width={520}
      open={open}
      onClose={() => {
        setPreviewDoc(null);
        onClose();
      }}
      destroyOnClose
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={() => {
            setPreviewDoc(null);
            onClose();
          }} style={{ marginRight: 8 }}>Cancel</Button>
          <Button type="primary" onClick={save} loading={saving}>Save</Button>
        </div>
      }
    >
      {loading && (
        <div style={{ display: 'grid', gap: 12 }}>
          <Skeleton active title={{ width: '70%' }} paragraph={{ rows: 0 }} />
          <Skeleton.Input active style={{ width: '100%', height: 40 }} />
          <Skeleton active title={{ width: '40%' }} paragraph={{ rows: 2 }} />
        </div>
      )}
      <Form form={form} layout="vertical" disabled={loading}>
        <Form.Item name="certificationTitle" label="Title" rules={[{ required: true, message: 'Please enter a title' }]}>
          <Input placeholder="e.g., Manual Handling Training" maxLength={80} />
        </Form.Item>
        <Form.Item 
          name="documents" 
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
          rules={[{ validator:(_,v)=> ((docs && docs.length>0) || (v && v.length>0))? Promise.resolve(): Promise.reject('Please upload at least one document') }]}
        >
          <div>
            {/* Custom Document List with Thumbnails */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '12px',
              marginBottom: '16px'
            }}>
              {(() => {
                const formDocs = form.getFieldValue('documents');
                const docsArray = Array.isArray(formDocs) ? formDocs : (Array.isArray(docs) ? docs : []);
                return docsArray;
              })().map((doc, index) => {
                const isPdf = doc?.fileType === 'application/pdf' || doc?.url?.includes('.pdf');
                const isImage = doc?.fileType?.includes('image') || /\.(jpg|jpeg|png|gif)$/i.test(doc?.url || '');
                
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
                              const formDocs = form.getFieldValue('documents');
                              const list = (Array.isArray(docs) ? docs : []) || (Array.isArray(formDocs) ? formDocs : []) || [];
                              const found = list.find(d => (d.uid || d.publicId) === (doc.uid || doc.publicId));
                              if (found) setPreviewDoc(found);
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
                        <Tooltip title="Delete" placement="top">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeDoc(doc);
                            }}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: 'none',
                              background: 'rgba(255, 77, 79, 0.95)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                              backdropFilter: 'blur(8px)',
                              boxShadow: '0 2px 12px rgba(255, 77, 79, 0.4)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 77, 79, 1)';
                              e.currentTarget.style.transform = 'scale(1.15)';
                              e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 77, 79, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 77, 79, 0.95)';
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = '0 2px 12px rgba(255, 77, 79, 0.4)';
                            }}
                          >
                            <DeleteOutlined style={{ fontSize: '16px' }} />
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
                  (Array.isArray(docs) ? docs : [])?.length ||
                  0
                ) < maxFiles
              ) && (
                <Upload
                  accept=".pdf,.jpg,.jpeg,.png"
                  beforeUpload={beforeUpload}
                  multiple
                  showUploadList={false}
                  disabled={uploading}
                >
                  <div
                    style={{
                      position: 'relative',
                      aspectRatio: '1',
                      borderRadius: 14,
                      background: uploading ? '#f3f4f6' : '#ffffff',
                      border: '1.5px dashed #d1d5db',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '12px',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      transition: 'all 220ms cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      color: '#374151'
                    }}
                    onMouseEnter={(e) => {
                      if (!uploading) {
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
                          color: uploading ? '#9ca3af' : '#2563eb', 
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
                          color: uploading ? '#9ca3af' : '#374151',
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
      </Form>
      {previewDoc && (
        <DocumentPreview
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
          certificateData={data}
          onDelete={async () => {
            const formDocs = form.getFieldValue('documents');
            const current = (Array.isArray(formDocs) ? formDocs : []) || [];
            if (!previewDoc) return;
            form.setFieldsValue({ documents: current.filter(d => d.publicId !== previewDoc.publicId) });
            try { 
              await deleteCloudinaryImage(previewDoc.publicId); 
              message.success('Document removed'); 
            } catch { 
              message.warning('Removed locally but failed to delete in cloud'); 
            }
            setPreviewDoc(null);
          }}
        />
      )}
    </Drawer>
  )
}


