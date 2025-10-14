import React, { useCallback, useEffect, useState } from 'react';
import { Drawer, Form, Input, Upload, Button, Tooltip, Typography, message, Skeleton } from 'antd';
import { EyeOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
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

    // Upload concurrently
    const hide = message.loading('Uploading documents...', 0);
    const results = await Promise.all(toProcess.map(f => uploadToCloudinary(f)));
    hide();

    // Replace temp items with uploaded ones
    const uploaded = results.filter(Boolean);
    const after = (docs || []).filter(d => !tempItems.some(t => t.uid === d.uid));
    const finalDocs = [...after, ...uploaded].slice(0, maxFiles);
    setDocs(finalDocs);
    form.setFieldsValue({ documents: finalDocs });
    if (uploaded.length) message.success(`${uploaded.length} document(s) uploaded`);
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
      onClose={onClose}
      destroyOnClose
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>Cancel</Button>
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
        <Form.Item name="documents" label="Documents" rules={[{ validator:(_,v)=> ((docs && docs.length>0) || (v && v.length>0))? Promise.resolve(): Promise.reject('Please upload at least one document') }]}>
          <Upload
            accept=".pdf,.jpg,.jpeg,.png"
            listType="picture-card"
            fileList={docs}
            beforeUpload={beforeUpload}
            onRemove={removeDoc}
            onPreview={(file)=>{
              const list = docs || [];
              const found = list.find(d=> (d.uid||d.publicId)===(file.uid||file.publicId));
              if (found){ setPreviewDoc(found); }
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
            multiple
          >
            {(form.getFieldValue('documents')?.length || 0) >= maxFiles ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
          <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
            Accepted formats: PDF, JPG, PNG (Max 5MB each)
          </Text>
        </Form.Item>
      </Form>
      <DocumentPreview
        document={previewDoc}
        visible={!!previewDoc}
        onClose={()=> setPreviewDoc(null)}
        onDelete={async ()=>{
          const current = form.getFieldValue('documents')||[];
          if (!previewDoc) return;
          form.setFieldsValue({ documents: current.filter(d=> d.publicId !== previewDoc.publicId) });
          try { await deleteCloudinaryImage(previewDoc.publicId); message.success('Document removed'); }
          catch { message.warning('Removed locally but failed to delete in cloud'); }
          setPreviewDoc(null);
        }}
      />
    </Drawer>
  )
}


