import React, { useState, useEffect, useCallback, useRef } from 'react';
import useOnboardingStore, { useCertificationsMutation } from '../../stores/useOnboardingStore';
import { Toaster, toast } from 'react-hot-toast';
import DocumentPreview from './Modals/DocumentPreview'; // Import the new component
import './css/CertificationsForm.css';
import axios from 'axios';
import api from '../../api/axios';
const CertificationsForm = () => {
  // Get state from store
  const certifications = useOnboardingStore(state => state.certifications);

  // Get actions from store
  const updateCertificationAtIndex = useOnboardingStore(state => state.updateCertificationAtIndex);
  const removeCertification = useOnboardingStore(state => state.removeCertification);
  const removeCertificationDocument = useOnboardingStore(state => state.removeCertificationDocument)
  const nextStep = useOnboardingStore(state => state.nextStep);
  const prevStep = useOnboardingStore(state => state.prevStep);

  // Setup mutation
  const { mutate: saveCertifications, isPending, isError, isSuccess } = useCertificationsMutation();

  // Local state
  const [localCertifications, setLocalCertifications] = useState(certifications || []);
  const [expandedCard, setExpandedCard] = useState(null);
  const [isUploading, setIsUploading] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [hasAnimation, setHasAnimation] = useState(false);
  const [dragActive, setDragActive] = useState(null);
  const fileInputRefs = useRef([]);
  
  // State for document preview
  const [previewDocument, setPreviewDocument] = useState(null);

  // Update local state when store changes
  useEffect(() => {
    setLocalCertifications(certifications || []);
  }, [certifications]);

  // Handle toast notification for success/error
  useEffect(() => {
    if (isSuccess) {
      toast.success('Certifications saved successfully', {
        duration: 3000,
        position: 'top-right',
      });
    } else if (isError) {
      toast.error('Failed to save certifications. Please try again.', {
        duration: 4000,
        position: 'top-right',
      });
    }
  }, [isSuccess, isError]);

  const certificationType = [
    'First Aid',
    'Driving License',
    'Visa',
    'Health Insurance',
    'Police Check',
    'Working With Children Check',
    'Certificate III in Individual Support',
    'Certificate IV in Aged Care',
    'Registered Nurse Certification',
    'Other',
  ];

  const addCertification = useCallback(() => {
    const newCert = {
      type: certificationType[0],
      number: '',
      issuedDate: '',
      expiryDate: '',
      documents: [],
      verificationStatus: 'Pending',
    };

    setLocalCertifications(prev => [...prev, newCert]);
    setHasAnimation(true);
    
    // Automatically expand the newly added card
    setTimeout(() => {
      setExpandedCard(localCertifications.length);
      // Scroll to the new card
      document.getElementById(`cert-card-${localCertifications.length}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 100);
  }, [localCertifications.length]);

  const handleRemoveCertification = useCallback((index) => {
    const certToRemove = localCertifications[index];
    
    // Delete all images from Cloudinary if they exist
    if (certToRemove.documents && certToRemove.documents.length > 0) {
      certToRemove.documents.forEach(doc => {
        if (doc.url && doc.url.includes('cloudinary')) {
          deleteImageFromCloudinary(doc.url);
        }
      });
    }
    
    removeCertification(index);
    setLocalCertifications(prev => prev.filter((_, i) => i !== index));
    setExpandedCard(null);
    
    toast.success('Certification removed', {
      icon: '🗑️',
      duration: 2000,
      position: 'top-right',
    });
  }, [localCertifications, removeCertification]);

  const handleUpdateCertification = useCallback((index, field, value) => {
    updateCertificationAtIndex(index, field, value);
    setLocalCertifications(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, [updateCertificationAtIndex]);

  const handleRemoveDocument = useCallback((certIndex, docIndex) => {
    const cert = localCertifications[certIndex];
    const docToRemove = cert.documents[docIndex];
    
    // Update UI state immediately for better UX
    removeCertificationDocument(certIndex, docIndex);
    
    // Update local state for immediate UI update
    setLocalCertifications(prev => {
      const updated = [...prev];
      updated[certIndex] = { 
        ...updated[certIndex], 
        documents: updated[certIndex].documents.filter((_, i) => i !== docIndex) 
      };
      return updated;
    });
    
    // Show immediate feedback
    toast.success('Document removed from view', {
      icon: '🗑️',
      duration: 2000,
      position: 'top-right',
    });
    
    // Delete from Cloudinary in the background if needed
    if (docToRemove.url && docToRemove.url.includes('cloudinary')) {
      deleteImageFromCloudinary(docToRemove.url)
        .then(() => {
          toast.success('Document also removed from cloud storage', {
            icon: '☁️',
            duration: 2000,
            position: 'top-right',
          });
        })
        .catch((error) => {
          console.error('Failed to delete from Cloudinary:', error);
          toast.error('Document removed locally but failed to delete from cloud storage', {
            duration: 3000,
            position: 'top-right',
          });
        });
    }
  }, [localCertifications, removeCertificationDocument]);

  const deleteImageFromCloudinary = async (url) => {
    try {
      // Correct extraction of publicId
      const parts = url.split('/upload/')[1].split('/');
      parts.shift(); // Remove version (like v1234567)
  
      let publicIdWithExtension = parts.join('/');
      const publicId = decodeURIComponent(publicIdWithExtension).split('.')[0];
      console.log("Got Public ID", publicId);
  
      // Make an API call to your backend to delete from Cloudinary using the custom axios instance
      const response = await api.post(
        '/onboarding/delete-cloudinary',  // Use relative path here
        { publicId },
      );
  
      if (response.status === 200) {
        toast.success(  'Document deleted successfully ')
        console.log('Document deleted successfully ');
      } else {
        throw new Error('Failed to delete image from Cloudinary');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to remove document from cloud storage');
    }
  };
  
  const uploadToCloudinary = async (file, certIndex) => {
    if (!file) return null;
    
    try {
      // Update uploading state
      setIsUploading(prev => ({ ...prev, [certIndex]: true }));
      setUploadProgress(prev => ({ ...prev, [certIndex]: 0 }));
      
      // Create a FormData instance
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'Certificate(Saas)');  // Your Cloudinary upload preset
      formData.append('folder', 'SAAS(Support Worker)');  // Optional folder in Cloudinary
      
      // Get current progress for simulating upload
      const updateUploadProgress = (progress) => {
        setUploadProgress(prev => ({ ...prev, [certIndex]: progress }));
      };
      
      // Simulate upload progress while actual upload happens
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[certIndex] || 0;
          if (currentProgress >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, [certIndex]: currentProgress + 5 };
        });
      }, 200);
      
      // Make API call to Cloudinary
      const cloudName = 'dgsphdhns';  // Replace with your Cloudinary cloud name
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      updateUploadProgress(100);
      
      // Complete upload
      setTimeout(() => {
        setIsUploading(prev => ({ ...prev, [certIndex]: false }));
      }, 500);
      
      return {
        url: data.secure_url,
        publicId: data.public_id,
        fileName: file.name,
        fileType: file.type,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(prev => ({ ...prev, [certIndex]: false }));
      toast.error('File upload failed. Please try again.');
      return null;
    }
  };

  const handleFileUpload = useCallback(async (certIndex, files) => {
    // Convert FileList to array
    const fileArray = Array.from(files);
    
    // Validate max files
    const cert = localCertifications[certIndex];
    const currentDocCount = cert.documents?.length || 0;
    
    if (currentDocCount + fileArray.length > 3) {
      toast.error('Maximum 3 documents allowed per certification');
      return;
    }
    
    // Validate each file
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    const validFiles = fileArray.filter(file => {
      if (!validTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Please upload JPG, PNG, or PDF files only.`);
        return false;
      }
      
      if (file.size > maxSize) {
        toast.error(`File size exceeds 5MB limit: ${file.name}`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    try {
      // Upload each file
      const uploadPromises = validFiles.map(file => uploadToCloudinary(file, certIndex));
      const results = await Promise.all(uploadPromises);
      
      // Filter out failed uploads
      const successfulUploads = results.filter(result => result !== null);
      
      if (successfulUploads.length > 0) {
        // Update certification with new documents
        const updatedDocuments = [...(cert.documents || []), ...successfulUploads];
        handleUpdateCertification(certIndex, 'documents', updatedDocuments);
        
        toast.success(`${successfulUploads.length} document(s) uploaded successfully!`);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload documents. Please try again.');
    }
  }, [localCertifications, handleUpdateCertification]);

  const toggleExpand = useCallback((index) => {
    setExpandedCard(expandedCard === index ? null : index);
  }, [expandedCard]);

  const handleDragEnter = (index) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(index);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (index) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(index, e.dataTransfer.files);
    }
  };

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    // Validate required fields
    let isValid = true;
    let errorMessage = '';
    
    if (localCertifications.length === 0) {
      errorMessage = 'Please add at least one certification';
      isValid = false;
    } else {
      for (let i = 0; i < localCertifications.length; i++) {
        const cert = localCertifications[i];
        if (!cert.number || !cert.issuedDate) {
          errorMessage = `Certification #${i + 1} is missing required fields`;
          isValid = false;
          break;
        }
      }
    }
    
    if (!isValid) {
      toast.error(errorMessage);
      return;
    }
    
    // Check if any uploads are in progress
    if (Object.values(isUploading).some(value => value)) {
      toast.error('Please wait for all uploads to complete');
      return;
    }
    
    // Prepare certifications data with properly structured documents
    const certificationsToSave = localCertifications.map(cert => ({
      type: cert.type,
      number: cert.number,
      issuedDate: cert.issuedDate,
      expiryDate: cert.expiryDate || null,
      documents: cert.documents ? cert.documents.map(doc => ({
        url: doc.url,
        publicId: doc.publicId,
        fileName: doc.fileName,
        fileType: doc.fileType,
        uploadedAt: doc.uploadedAt
      })) : [],
      verificationStatus: cert.verificationStatus || 'Pending'
    }));
    
    saveCertifications(certificationsToSave);
  }, [localCertifications, saveCertifications, isUploading]);

  // Check if certification is about to expire (within 60 days)
  const isAboutToExpire = useCallback((expiryDate) => {
    if (!expiryDate) return false;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const differenceInDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    return differenceInDays > 0 && differenceInDays <= 60;
  }, []);

  // Check if certification has expired
  const hasExpired = useCallback((expiryDate) => {
    if (!expiryDate) return false;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    
    return expiry < today;
  }, []);

  // Modified: Handle clicking on a document to preview
  const handleDocumentPreviewClick = (doc) => {
    setPreviewDocument(doc);
  };

  // Close the document preview modal
  const closeDocumentPreview = () => {
    setPreviewDocument(null);
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return null;
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      );
    } else if (extension === 'pdf') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      );
    } else {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
          <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="c-cert-form">
      <Toaster />
      <div className="c-cert-form__section">
        <h3 className="c-cert-form__title">Certifications & Documents</h3>
        <p className="c-cert-form__description">
          Add your professional certifications, licenses, and other documents to verify your qualifications
        </p>

        {localCertifications.length === 0 && (
          <div className={`c-cert-form__empty-state ${hasAnimation ? 'c-cert-form__empty-state--animate' : ''}`}>
            <div className="c-cert-form__empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
                <path d="M9 9h1" />
                <path d="M9 13h6" />
                <path d="M9 17h6" />
              </svg>
            </div>
            <h4>No Certifications Added</h4>
            <p>Add your certifications and documents to continue</p>
            <button
              type="button"
              className="c-cert-form__first-add-btn"
              onClick={addCertification}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              Add Certification
            </button>
          </div>
        )}

        <div className="c-cert-form__list">
          {localCertifications.map((cert, index) => (
            <div 
              key={index}
              id={`cert-card-${index}`}
              className={`c-cert-form__card ${expandedCard === index ? 'c-cert-form__card--expanded' : ''} ${
                hasExpired(cert.expiryDate) ? 'c-cert-form__card--expired' : 
                isAboutToExpire(cert.expiryDate) ? 'c-cert-form__card--expiring' : ''
              } ${hasAnimation ? 'c-cert-form__card--animate' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div 
                className="c-cert-form__card-header"
                onClick={() => toggleExpand(index)}
              >
                <div className="c-cert-form__card-title">
                  <h4>{cert.type || 'New Certification'}</h4>
                  {cert.number && <span className="c-cert-form__card-number">{cert.number}</span>}
                </div>
                
                <div className="c-cert-form__card-status">
                  {hasExpired(cert.expiryDate) && (
                    <span className="c-cert-form__status c-cert-form__status--expired">Expired</span>
                  )}
                  {isAboutToExpire(cert.expiryDate) && !hasExpired(cert.expiryDate) && (
                    <span className="c-cert-form__status c-cert-form__status--expiring">Expiring Soon</span>
                  )}
                  <span className="c-cert-form__status">{cert.verificationStatus}</span>
                  <button
                    type="button"
                    className="c-cert-form__expand-btn"
                    aria-label={expandedCard === index ? "Collapse" : "Expand"}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points={expandedCard === index ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}></polyline>
                    </svg>
                  </button>
                </div>
                </div>

              {expandedCard === index && (
                <div className="c-cert-form__card-content">
                  <div className="c-cert-form__grid">
                    <div className="c-cert-form__field">
                      <label className="c-cert-form__label">Certification Type <span className="c-cert-form__required">*</span></label>
                      <select
                        className="c-cert-form__select"
                        value={cert.type}
                        onChange={(e) => handleUpdateCertification(index, 'type', e.target.value)}
                      >
                        {certificationType.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="c-cert-form__field">
                      <label className="c-cert-form__label">Certification Number <span className="c-cert-form__required">*</span></label>
                      <input
                        type="text"
                        className="c-cert-form__input"
                        value={cert.number}
                        onChange={(e) => handleUpdateCertification(index, 'number', e.target.value)}
                        placeholder="e.g. FA-12345"
                        required
                      />
                    </div>
                  </div>

                  <div className="c-cert-form__grid">
                    <div className="c-cert-form__field">
                      <label className="c-cert-form__label">Issue Date <span className="c-cert-form__required">*</span></label>
                      <input
                        type="date"
                        className="c-cert-form__input"
                        value={cert.issuedDate}
                        onChange={(e) => handleUpdateCertification(index, 'issuedDate', e.target.value)}
                        required
                      />
                    </div>

                    <div className="c-cert-form__field">
                      <label className="c-cert-form__label">Expiry Date</label>
                      <input
                        type="date"
                        className="c-cert-form__input"
                        value={cert.expiryDate}
                        onChange={(e) => handleUpdateCertification(index, 'expiryDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="c-cert-form__field">
                    <label className="c-cert-form__label">Upload Documents <span className="c-cert-form__helper-text">(Max 3)</span></label>
                    
                    {/* Document Gallery */}
                    {cert.documents && cert.documents.length > 0 && (
                      <div className="c-cert-form__document-gallery">
                        {cert.documents.map((doc, docIndex) => (
                          <div key={docIndex} className="c-cert-form__document-item">
                            <div 
                              className="c-cert-form__document-preview"
                              onClick={() => handleDocumentPreviewClick(doc)}
                            >
                              {doc.fileType.includes('image') ? (
                                <div className="c-cert-form__thumbnail-container">
                                  <img 
                                    src={doc.url} 
                                    alt={doc.fileName} 
                                    className="c-cert-form__thumbnail" 
                                  />
                                </div>
                              ) : (
                                <div className="c-cert-form__icon-container">
                                  {getFileIcon(doc.fileName)}
                                </div>
                              )}
                              <span className="c-cert-form__file-name">{doc.fileName}</span>
                            </div>
                            <div className="c-cert-form__document-actions">
                              <button
                                type="button"
                                className="c-cert-form__document-action-btn c-cert-form__document-view-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDocumentPreviewClick(doc);
                                }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                              </button>
                              <button
                                type="button"
                                className="c-cert-form__document-action-btn c-cert-form__document-delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveDocument(index, docIndex);
                                }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        {/* Add More Button (if less than 3 documents) */}
                        {cert.documents.length < 3 && (
                          <div className="c-cert-form__document-item c-cert-form__document-add">
                            <button
                              type="button"
                              className="c-cert-form__document-add-btn"
                              onClick={() => fileInputRefs.current[index]?.click()}
                            >
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="16"></line>
                                <line x1="8" y1="12" x2="16" y2="12"></line>
                              </svg>
                              <span>Add More</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Upload Area (if no documents or less than 3) */}
                    {(!cert.documents || cert.documents.length < 3) && (
                      <div 
                        className={`c-cert-form__dropzone ${dragActive === index ? 'c-cert-form__dropzone--active' : ''} ${cert.documents && cert.documents.length > 0 ? 'c-cert-form__dropzone--compact' : ''}`}
                        onDragEnter={handleDragEnter(index)}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop(index)}
                      >
                        <input
                          type="file"
                          id={`cert-file-${index}`}
                          className="c-cert-form__file-input"
                          ref={el => fileInputRefs.current[index] = el}
                          onChange={(e) => handleFileUpload(index, e.target.files)}
                          accept=".pdf,.jpg,.jpeg,.png"
                          multiple
                        />
                        
                        {isUploading[index] ? (
                          <div className="c-cert-form__upload-progress">
                            <div className="c-cert-form__progress-bar">
                              <div 
                                className="c-cert-form__progress-fill" 
                                style={{ width: `${uploadProgress[index] || 0}%` }}
                              ></div>
                            </div>
                            <span className="c-cert-form__progress-text">Uploading {uploadProgress[index] || 0}%</span>
                          </div>
                        ) : (
                          <label htmlFor={`cert-file-${index}`} className="c-cert-form__dropzone-content">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="17 8 12 3 7 8"></polyline>
                              <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            <span className="c-cert-form__dropzone-title">
                              {cert.documents && cert.documents.length > 0 
                                ? 'Add more documents' 
                                : 'Drag & Drop your documents here'}
                            </span>
                            <span className="c-cert-form__dropzone-subtitle">
                              or <span className="c-cert-form__browse">browse files</span>
                            </span>
                            <span className="c-cert-form__dropzone-hint">
                              Supported formats: PDF, JPG, PNG (max 5MB) • Maximum 3 documents per certification
                            </span>
                          </label>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="c-cert-form__actions">
                    <button
                      type="button"
                      className="c-cert-form__remove-btn"
                      onClick={() => handleRemoveCertification(index)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          className="c-cert-form__add-btn"
          onClick={addCertification}
          disabled={isPending}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          Add New Certification
        </button>
      </div>

      <div className="c-cert-form__nav">
        <button 
          type="button" 
          className="c-cert-form__btn c-cert-form__btn--outline" 
          onClick={prevStep}
          disabled={isPending}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <button 
          type="submit" 
          className={`c-cert-form__btn c-cert-form__btn--primary ${isPending ? 'c-cert-form__btn--loading' : ''}`}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <span className="c-cert-form__spinner"></span>
              Saving...
            </>
          ) : (
            <>
              Next: Work History
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Document Preview Modal */}
      {previewDocument && (
        <DocumentPreview 
          document={previewDocument} 
          onClose={closeDocumentPreview} 
        />
      )}
    </form>
  );
};

export default CertificationsForm;