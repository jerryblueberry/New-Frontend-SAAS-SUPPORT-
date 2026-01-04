import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Form,
  Select,
  DatePicker,
  Input,
  Upload,
  Typography,
  Steps,
  message,
  Spin,
  List,
  Avatar,
  Drawer,
  Progress,
  Tag,
  Space,
  Tooltip,
  Divider,
  Tabs,
  Badge,
  Image,
  Modal,
  Grid
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  GlobalOutlined,
  IdcardOutlined,
  FileDoneOutlined,
  SolutionOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
  CarOutlined,
  MedicineBoxOutlined,
  BankOutlined,
  ExclamationCircleOutlined,
  ReadOutlined,
  ClockCircleOutlined,
  FileOutlined,
  EyeOutlined,
  TagOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
const { useBreakpoint } = Grid;
import debounce from 'lodash/debounce';
import useOnboardingStore, { useCertificationsMutation, useOtherCertificatesMutation } from '../../stores/useOnboardingStore';
import { useOnboardingQuery } from '../../stores/useOnboardingStore';
import DocumentPreview from '../../components/workerForm/Modals/DocumentPreview';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { deleteCloudinaryImage } from '../../api/cloudinary';
import { NATIONALITIES } from '../../utils/constants';
import RenderEducationFields from '../../components/WorkerCertificateOnboarding/RenderEducationFields';
import RenderInsuranceField from '../../components/WorkerCertificateOnboarding/RenderInsuranceField';
import AddOtherCertificate from '../../components/WorkerCertificateOnboarding/AddOtherCertificate';
import {
  AddCertificationsStep,
  PersonalInfoStep,
  ReviewSubmitStep,
  CertificationFormDrawer,
  DocumentTrackingService,
  setZustandSyncCallback,
  clearZustandSyncCallback,
  normalizeCertificationType,
  isWorkingWithChildrenCheck,
  isWorkingWithChildrenCheckType,
  isDegreeMissing,
  formatFieldLabel,
  isCertFullyComplete,
  getFieldTooltip
} from '../../components/workerForm/components/CertificateOnboardingComponents';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Option } = Select;
const { TabPane } = Tabs;
const { confirm } = Modal;


// Constants moved to CertificateOnboardingComponents/constants.js





// DocumentTrackingService moved to CertificateOnboardingComponents/utils/documentTrackingService.js

// normalizeCertificationType moved to CertificateOnboardingComponents/utils/certificationHelpers.js
// PREDEFINED_INSURANCE_TYPES moved to CertificateOnboardingComponents/constants.js

const CertificateSecond = ({ initialStep = 0 }) => {
  const customDegreeInputRef = useRef(null);
  const customInsuranceInputRef = useRef(null);
  const degreeSelectRef = useRef(null);
  const insuranceSelectRef = useRef(null); // <-- Add this line
  const navigate = useNavigate();
  const {
    currentStep: onboardingStep,
    nextStep: onboardingNextStep,
    prevStep: onboardingPrevStep,
    certifications,

    residencyStatus,
    updateCertificationAtIndex,
    removeCertification,
    removeCertificationDocument,

    updateResidencyStatus,
    updateCertifications,
    otherCertifications,
    addOtherCertificate,
    removeOtherCertificate,
    updateOtherCertificates,


  } = useOnboardingStore();

  const { data: onboardingData, isLoading: isLoadingOnboardingData, isError: isOnboardingError } = useOnboardingQuery();
  const { mutate: submitCertifications, isLoading: isSubmitting } = useCertificationsMutation();
  const { mutate: saveOtherCertificate } = useOtherCertificatesMutation();

  // Local state
  const [customDegrees, setCustomDegrees] = useState([]);
  const [customDegreeInput, setCustomDegreeInput] = useState('');

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [loading, setLoading] = useState(false);
  const [certificationTypes, setCertificationTypes] = useState([]);
  const [selectedCerts, setSelectedCerts] = useState([]);
  const [currentCertIndex, setCurrentCertIndex] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [certDetailsVisible, setCertDetailsVisible] = useState(false);
  const [requiredCerts, setRequiredCerts] = useState([]);
  const [progress, setProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('required');
  const [isUploading, setIsUploading] = useState({});
  const [previewDocument, setPreviewDocument] = useState(null);
  const [hasExistingCertifications, setHasExistingCertifications] = useState(false);
  const [certForm] = Form.useForm();
  const [isFormValid, setIsFormValid] = useState(true); // Track Drawer form validity

  // Add these to CertificateSecond component's state (with the other useState hooks)
  const [showCustomDegree, setShowCustomDegree] = useState(false);
  const [customDegreeValue, setCustomDegreeValue] = useState('');
  // Add for insurance type
  const [showCustomInsurance, setShowCustomInsurance] = useState(false);
  const [customInsuranceValue, setCustomInsuranceValue] = useState('');

  // Add at the top of CertificateSecond (with other useState hooks)
  const [otherCertDrawerOpen, setOtherCertDrawerOpen] = useState(false);
  const [editingOtherCertIndex, setEditingOtherCertIndex] = useState(null);

  const handleEditOtherCertificateFromReview = (idx) => {
    setEditingOtherCertIndex(idx);
    setOtherCertDrawerOpen(true);
  };

  const fileInputRefs = useRef([]);
  console.log("Required Certrs Value", requiredCerts)
  console.log("Has existing ", hasExistingCertifications);
  console.log("Normalized Certs", onboardingData)
  console.log("Onboarding Data", onboardingData?.data?.profile);
  // Initialize with store data from backend
  useEffect(() => {
    if (!isLoadingOnboardingData && onboardingData?.data?.profile) {
      const profile = onboardingData.data.profile;
      const initialCerts = profile.certifications || [];
      // Normalize the certifications data to ensure consistent format
      const normalizedCerts = initialCerts.map(cert => ({
        ...cert,
        certificationType: normalizeCertificationType(cert.certificationType)._id,
        certTypeName: normalizeCertificationType(cert.certificationType).name
      }));

      // --- Ensure otherCertifications have _id ---
      const normalizedOtherCerts = (profile.otherCertifications || []).map(cert => ({
        ...cert,
        _id: cert._id || cert.id,
      }));
      // Set to state/store if you have a setter, e.g. setOtherCertifications(normalizedOtherCerts)
      // If using Zustand or props, update accordingly
      if (typeof updateOtherCertificates === 'function') {
        updateOtherCertificates(normalizedOtherCerts);
      }

      // Check if user has existing certifications
      if (normalizedCerts.length > 0) {
        setHasExistingCertifications(true);
        setSelectedCerts(normalizedCerts);
        updateCertifications(normalizedCerts);
        if (profile.residencyStatus) {
          updateResidencyStatus(profile.residencyStatus);
        }
      } else {
        setHasExistingCertifications(false);
      }
    }
  }, [onboardingData, isLoadingOnboardingData, updateCertifications, updateResidencyStatus, updateOtherCertificates]);

  // SaaS-Level: Backend Server as Source of Truth
  // Load document tracking from backend first, then sync to localStorage
  useEffect(() => {
    // Create sync callback that updates Zustand store
    const syncCallback = async (action, publicId, data) => {
      try {
        const store = useOnboardingStore.getState();
        
        switch (action) {
          case 'add':
            if (store.addTrackedDocument && data) {
              await store.addTrackedDocument(publicId, data);
            }
            break;
          case 'remove':
            if (store.removeTrackedDocument) {
              await store.removeTrackedDocument(publicId);
            }
            break;
          case 'markUsed':
            if (store.documentTracking?.trackedDocuments?.[publicId] && data) {
              const updatedTracking = {
                ...store.documentTracking.trackedDocuments,
                [publicId]: {
                  ...store.documentTracking.trackedDocuments[publicId],
                  ...data
                }
              };
              useOnboardingStore.setState({
                documentTracking: {
                  ...store.documentTracking,
                  trackedDocuments: updatedTracking
                }
              });
            }
            break;
        }
      } catch (error) {
        console.debug('Zustand sync error:', error);
      }
    };
    
    // Set the callback
    setZustandSyncCallback(syncCallback);
    
    // SaaS-Level: Load from backend first (source of truth)
    const loadFromBackendAndSync = async () => {
      try {
        console.log('🔄 Loading document tracking from backend (source of truth)...');
        
        // Step 1: Load from backend via Zustand store
        const { loadDocumentTrackingFromDatabase } = useOnboardingStore.getState();
        await loadDocumentTrackingFromDatabase();
        
        // Step 2: Get backend data from Zustand store (now populated from backend)
        const { documentTracking } = useOnboardingStore.getState();
        const backendDocs = documentTracking?.trackedDocuments || {};
        const backendPublicIds = Object.keys(backendDocs);
        
        console.log(`✅ Loaded ${backendPublicIds.length} documents from backend`);
        
        // Step 3: Get current localStorage data
        const localStorageDocs = DocumentTrackingService.getTrackedDocuments();
        const localStoragePublicIds = Object.keys(localStorageDocs);
        
        // Step 4: Backend is source of truth - overwrite localStorage with backend data
        if (backendPublicIds.length > 0) {
          // Clear localStorage and repopulate with backend data
          DocumentTrackingService.clearAllTrackedDocuments();
          
          // Populate localStorage with backend data
          let syncedCount = 0;
          for (const publicId of backendPublicIds) {
            const backendDoc = backendDocs[publicId];
            if (backendDoc) {
              DocumentTrackingService.addTrackedDocument(publicId, {
                url: backendDoc.url || '',
                fileName: backendDoc.fileName || '',
                fileType: backendDoc.fileType || '',
                documentName: backendDoc.documentName || `Document ${publicId}`,
                documentType: backendDoc.documentType || 'Support Worker',
                trackedAt: backendDoc.trackedAt || new Date().toISOString(),
                isUsed: backendDoc.isUsed || false,
                ...backendDoc
              });
              syncedCount++;
            }
          }
          console.log(`✅ Synced ${syncedCount} documents from backend to localStorage`);
        } else {
          // No backend data - check if localStorage has orphaned data
          if (localStoragePublicIds.length > 0) {
            console.warn(`⚠️ Backend has no documents, but localStorage has ${localStoragePublicIds.length}. Keeping localStorage as fallback.`);
          }
        }
        
        // Step 5: Find documents in localStorage that don't exist in backend (orphaned)
        const orphanedInLocalStorage = localStoragePublicIds.filter(
          id => !backendPublicIds.includes(id)
        );
        
        if (orphanedInLocalStorage.length > 0) {
          console.warn(`⚠️ Found ${orphanedInLocalStorage.length} orphaned documents in localStorage (not in backend). These will be cleaned up.`);
          // Optionally: Remove orphaned documents from localStorage
          // Or keep them as fallback until backend sync
        }
        
      } catch (error) {
        console.error('❌ Error loading document tracking from backend:', error);
        // Fallback: Use localStorage if backend fails
        console.warn('⚠️ Falling back to localStorage due to backend error');
        const localStorageDocs = DocumentTrackingService.getTrackedDocuments();
        const localStoragePublicIds = Object.keys(localStorageDocs);
        
        if (localStoragePublicIds.length > 0) {
          // Sync localStorage to Zustand as fallback
          localStoragePublicIds.forEach(publicId => {
            const doc = localStorageDocs[publicId];
            if (doc) {
              useOnboardingStore.getState().addTrackedDocument(publicId, doc);
            }
          });
          console.log(`✅ Fallback: Synced ${localStoragePublicIds.length} documents from localStorage to Zustand store`);
        }
      }
    };

    // Load from backend on mount (backend is source of truth)
    loadFromBackendAndSync();
    
    // Cleanup: remove callback on unmount
    return () => {
      clearZustandSyncCallback();
    };
  }, []);

  // Fetch certification types from API
  const fetchCertTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/certification/worker');
      console.log('Raw certification types response:', response.data);

      if (response.data.success) {
        const normalizedTypes = response.data.data.map(normalizeCertificationType);
        console.log('Normalized certification types:', normalizedTypes);

        // Find the NDIS certification type
        const ndisCert = normalizedTypes.find(t => t.name === 'NDIS Support Worker Qualification');
        console.log('NDIS certification type:', ndisCert);

        setCertificationTypes(normalizedTypes);

        // Update certTypeName for existing certifications if needed
        setSelectedCerts(prevCerts =>
          prevCerts.map(cert => {
            const certType = normalizedTypes.find(t => t._id === cert.certificationType);
            return {
              ...cert,
              certTypeName: certType?.name || cert.certTypeName || 'Unknown'
            };
          })
        );
      } else {
        throw new Error('Failed to load certification requirements');
      }
    } catch (error) {
      message.error(error.message);
      console.error('Error fetching certification types:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertTypes();
  }, []);





  // Synchronize local state with Zustand store
  useEffect(() => {
    if (certifications && certifications.length > 0) {
      setSelectedCerts(certifications);
    }
  }, [certifications]);



  // Determine required certifications based on residency status
  useEffect(() => {
    if (!residencyStatus || !certificationTypes.length) {
      setRequiredCerts([]);
      return;
    }

    const required = [];
    const requiredCertIds = new Set();

    // Helper to add a specific visa type by name
    const addSpecificVisaType = (visaName) => {
      const visaCert = certificationTypes.find(cert => cert.name === visaName && cert.isVisa);
      if (visaCert && !requiredCertIds.has(visaCert._id)) {
        required.push(visaCert);
        requiredCertIds.add(visaCert._id);
      }
    };

    // Add education certifications first
    certificationTypes.forEach(cert => {
      if (cert.isEducation && !requiredCertIds.has(cert._id)) {
        required.push(cert);
        requiredCertIds.add(cert._id);
      }
    });

    // Residency-specific certifications
    switch (residencyStatus) {
      case 'Citizen':
        certificationTypes.forEach(cert => {
          if (cert.isCitizenshipProof && cert.acceptableFor === 'Citizens' && !requiredCertIds.has(cert._id)) {
            required.push(cert);
            requiredCertIds.add(cert._id);
          }
        });
        break;

      case 'NZCitizen':
        certificationTypes.forEach(cert => {
          if (cert.isCitizenshipProof && cert.acceptableFor === 'NZCitizens' && !requiredCertIds.has(cert._id)) {
            required.push(cert);
            requiredCertIds.add(cert._id);
          }
        });
        addSpecificVisaType('Special Category Visa (Subclass 444)');
        break;

      case 'PermanentResident':
        certificationTypes.forEach(cert => {
          if (cert.acceptableFor === 'PermanentResidents' && !requiredCertIds.has(cert._id)) {
            required.push(cert);
            requiredCertIds.add(cert._id);
          }
        });
        break;

      case 'StudentVisa':
        addSpecificVisaType('Student Visa (Subclass 500)');
        break;

      case 'TemporaryGraduateVisa':
        addSpecificVisaType('Temporary Graduate Visa (Subclass 485)');
        break;

      case 'TSS':
        addSpecificVisaType('Temporary Skill Shortage Visa (Subclass 482)');
        break;

      case 'BridgingVisa':
        addSpecificVisaType('Bridging Visa');
        break;

      case 'OtherTemporaryVisa':
        // For other visa types, show all visa options that might be applicable
        certificationTypes.forEach(cert => {
          if (cert.isVisa &&
            !['Student Visa (Subclass 500)',
              'Temporary Graduate Visa (Subclass 485)',
              'Temporary Skill Shortage Visa (Subclass 482)',
              'Bridging Visa'].includes(cert.name) &&
            !requiredCertIds.has(cert._id)) {
            required.push(cert);
            requiredCertIds.add(cert._id);
          }
        });
        break;
    }


    // Add appropriate identity documents based on residency status
    certificationTypes.forEach(cert => {
      if (cert.category === 'Identity') {
        const isAcceptable =
          cert.acceptableFor === 'AllResidents' ||
          (residencyStatus === 'Citizen' && cert.acceptableFor === 'Citizens') ||
          (residencyStatus === 'NZCitizen' && cert.acceptableFor === 'NZCitizens') ||
          (residencyStatus === 'PermanentResident' && cert.acceptableFor === 'PermanentResidents') ||
          (['StudentVisa', 'TemporaryGraduateVisa', 'TSS', 'BridgingVisa', 'OtherTemporaryVisa'].includes(residencyStatus) &&
            cert.acceptableFor === 'Foreigners');

        if (isAcceptable && !requiredCertIds.has(cert._id)) {
          required.push(cert);
          requiredCertIds.add(cert._id);
        }
      }
    });

    // Add standard certifications required for all applicants regardless of residency
    certificationTypes.forEach(cert => {
      if ((cert.category === 'Professional' ||
        cert.category === 'Training' ||
        cert.category === 'Background Check' ||
        cert.category === 'Insurance') &&
        cert.acceptableFor === 'AllResidents' &&
        !requiredCertIds.has(cert._id)) {
        required.push(cert);
        requiredCertIds.add(cert._id);
      }
    });

    console.log('Required certifications:', required); // Add logging
    setRequiredCerts(required);
  }, [residencyStatus, certificationTypes]);


  // Calculate completion progress
  useEffect(() => {
    const calculateProgress = () => {
      if (!selectedCerts.length) return 0;

      const totalFields = selectedCerts.reduce((total, cert) => {
        const type = certificationTypes.find(t => t._id === cert.certificationType);
        if (!type) return total;
        return total + type.requiredFields.length + (type.documentRequired ? 1 : 0);
      }, 0);

      const completedFields = selectedCerts.reduce((completed, cert) => {
        const type = certificationTypes.find(t => t._id === cert.certificationType);
        if (!type) return completed;

        const fieldCompletions = type.requiredFields.filter(f => cert[f]).length;
        const docCompletion = type.documentRequired && cert.documents?.length ? 1 : 0;
        return completed + fieldCompletions + docCompletion;
      }, 0);

      return totalFields ? Math.round((completedFields / totalFields) * 100) : 0;
    };

    setProgress(calculateProgress());
  }, [selectedCerts, certificationTypes]);

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 300);

  const [submitLoading, setSubmitLoading] = useState(false);

  // Function to save document tracking data to database (best practice: send full doc objects)
  const saveDocumentTrackingToDatabase = async (documents) => {
    if (!Array.isArray(documents) || documents.length === 0) {
      throw new Error('No documents to save');
    }
    // Transform to backend-expected format
    const transformedDocs = documents.map((doc, idx) => {
      // If already in correct format, use as is
      if (typeof doc === 'object' && typeof doc.documentUrl === 'string') {
        return doc;
      }
      // If doc is a tracked object with publicId
      if (doc.publicId) {
        return {
          documentName: doc.fileName || `Document ${idx + 1}`,
          documentType: 'Support Worker',
          documentUrl: doc.url || doc.publicId, // must be a string
          publicId: doc.publicId,
          fileName: doc.fileName || '',
          fileType: doc.fileType || '',
          uploadDate: doc.uploadedAt || doc.trackedAt || new Date(),
          isVerified: false,
          additionalInfo: {}
        };
      }
      // If doc is a string (publicId)
      if (typeof doc === 'string') {
        return {
          documentName: `Document ${idx + 1}`,
          documentType: 'Support Worker',
          documentUrl: doc,
          publicId: doc,
          fileName: '',
          fileType: '',
          uploadDate: new Date(),
          isVerified: false,
          additionalInfo: {}
        };
      }
      // Fallback: skip
      return null;
    }).filter(Boolean);

    if (transformedDocs.length === 0) {
      throw new Error('No valid documents found');
    }
    const response = await api.post('/documents-tracking/save', {
      documents: transformedDocs
    });
    if (!response || !response.data || !response.data.success) {
      throw new Error(response?.data?.message || 'Failed to save document tracking');
    }
    return response.data;
  };

  const handleSubmit = async () => {
    if (!allRequiredCertsAdded() || progress < 100) {
      message.warning('Please complete all required certifications before submitting');
      return;
    }
    setSubmitLoading(true);

    // Extract all active document publicIds from certifications
    const activePublicIds = selectedCerts.flatMap(cert => 
      cert.documents?.map(doc => doc.publicId || doc.uid).filter(Boolean) || []
    );

    // Clean up orphaned documents (in tracking but not in active certifications)
    const orphanedCount = DocumentTrackingService.cleanupOrphanedDocuments(activePublicIds);
    if (orphanedCount > 0) {
      console.log(`✅ Cleaned up ${orphanedCount} orphaned documents before submission`);
    }

    // Clean up unused documents (marked as unused)
    const unusedCount = DocumentTrackingService.cleanupUnusedDocuments();
    if (unusedCount > 0) {
      console.log(`✅ Cleaned up ${unusedCount} unused documents before submission`);
    }

    // Gather tracked document objects from localStorage
    const trackedDocsObj = DocumentTrackingService.getTrackedDocuments();
    const trackedDocs = Object.values(trackedDocsObj);

    // Helper: upload other certificates sequentially
    const uploadOtherCertificates = async () => {
      for (const cert of otherCertifications) {
        await new Promise((resolve) => {
          saveOtherCertificate(cert, {
            onSuccess: () => {
              // Remove tracked docs for this cert from localStorage
              if (Array.isArray(cert.documents)) {
                cert.documents.forEach(doc => {
                  if (doc.publicId) {
                    DocumentTrackingService.removeTrackedDocument(doc.publicId);
                  }
                });
              }
              resolve();
            },
            onError: () => resolve(), // Don't block main submit
          });
        });
      }
    };

    // Helper: upload main certifications
    const uploadCertifications = () => {
      return new Promise((resolve, reject) => {
        submitCertifications({
          certifications: selectedCerts.map(cert => ({
            ...cert,
            degree: cert.degree ? (Array.isArray(cert.degree) ? cert.degree : [cert.degree]) : [],
            insuranceType: cert.insuranceType ? (Array.isArray(cert.insuranceType) ? cert.insuranceType : [cert.insuranceType]) : [],
            subclass: Array.isArray(cert.subclass) ? cert.subclass[0] : cert.subclass,
            certificationType: cert.certificationType
          })),
          residencyStatus,
          allCertificationTypes: certificationTypes,
        }, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      });
    };

    // Helper: upload tracked documents
    const uploadTrackedDocuments = async () => {
      if (trackedDocs.length > 0) {
        await saveDocumentTrackingToDatabase(trackedDocs);
        DocumentTrackingService.clearAllTrackedDocuments();
      }
    };

    try {
      // Run all three in parallel
      const results = await Promise.allSettled([
        uploadOtherCertificates(),
        uploadCertifications(),
        uploadTrackedDocuments()
      ]);

      // User feedback for each
      if (results[0].status === 'fulfilled') {
        message.success('Other certificates uploaded successfully!');
      } else {
        message.error('Failed to upload some other certificates.');
      }
      if (results[1].status === 'fulfilled') {
        message.success('Certifications submitted successfully!');
      } else {
        message.error(results[1].reason?.message || 'Failed to submit certifications');
      }
      if (results[2].status === 'fulfilled') {
        message.success('Tracked documents uploaded and cleared from localStorage.');
      } else {
        message.error('Failed to upload tracked documents: ' + (results[2].reason?.message || results[2].reason));
      }

      // Final overall success if all succeeded
      if (results.every(r => r.status === 'fulfilled')) {
        message.success('All onboarding data submitted successfully!');
      }
    } catch (error) {
      message.error(error.message || 'Failed to submit onboarding data');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Add new state for pending add/edit
  const [pendingCertTypeId, setPendingCertTypeId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  // Add WWCC draft state
  const [wwccDraft, setWwccDraft] = useState(null);

  // isWorkingWithChildrenCheckType imported from utils

  const addCertification = useCallback((certTypeId) => {
    const certType = certificationTypes.find(t => t._id === certTypeId);
    if (!certType) return;

    if (isWorkingWithChildrenCheckType(certType)) {
      setPendingCertTypeId(certTypeId);
      setIsEditing(false);
      setWwccDraft({
        certificationType: certTypeId,
        certTypeName: certType.name,
        documents: [],
      });
      certForm.resetFields(); // Reset form for WWCC
      setCertDetailsVisible(true);
    } else {
      const newCert = {
        certificationType: certTypeId,
        certTypeName: certType.name,
        documents: []
      };
      const updatedCerts = [...selectedCerts, newCert];
      setSelectedCerts(updatedCerts);
      updateCertifications(updatedCerts);
      setCurrentCertIndex(updatedCerts.length - 1);
      setIsEditing(true);
      setPendingCertTypeId(null);
      certForm.resetFields(); // Reset form before setting new values
      certForm.setFieldsValue(newCert);
      setCertDetailsVisible(true);
    }
  }, [certificationTypes, selectedCerts, updateCertifications, certForm]);

  const editCertification = useCallback((index) => {
    setCurrentCertIndex(index);
    setIsEditing(true);
    setPendingCertTypeId(null);
    const cert = selectedCerts[index];
    const formValues = { ...cert };
    if (cert.issuedDate) formValues.issuedDate = dayjs(cert.issuedDate);
    if (cert.expiryDate) formValues.expiryDate = dayjs(cert.expiryDate);
    certForm.setFieldsValue(formValues);
    setCertDetailsVisible(true);
  }, [selectedCerts, certForm]);

  // Centralized document validation helper
  const validateDocuments = (documents, certType) => {
    if (certType.documentRequired) {
      if (!documents || documents.length < 1) {
        return 'Please upload at least one document';
      }
    }
    return null;
  };

  const updateCertification = useCallback((values) => {
    let certType;
    let documents;
    if (isEditing) {
      certType = certificationTypes.find(t => t._id === selectedCerts[currentCertIndex].certificationType);
      documents = selectedCerts[currentCertIndex]?.documents || [];
    } else if (pendingCertTypeId) {
      certType = certificationTypes.find(t => t._id === pendingCertTypeId);
      documents = wwccDraft?.documents || [];
    }
    const docError = validateDocuments(documents, certType);
    if (docError) {
      message.error(docError);
      setIsFormValid(false);
      return;
    }
    setIsFormValid(true);
    if (isEditing) {
      // Update existing
      const updatedCerts = [...selectedCerts];
      values.documents = updatedCerts[currentCertIndex]?.documents || [];
      updatedCerts[currentCertIndex] = {
        ...updatedCerts[currentCertIndex],
        ...values,
        certTypeName: certificationTypes.find(t => t._id === updatedCerts[currentCertIndex].certificationType)?.name
      };
      setSelectedCerts(updatedCerts);
      updateCertifications(updatedCerts);
      setCertDetailsVisible(false);
      message.success('Certification details updated');
    } else if (pendingCertTypeId) {
      // Only for WWCC
      if (isWorkingWithChildrenCheckType(certType)) {
        // Use wwccDraft for documents
        const newCert = {
          certificationType: pendingCertTypeId,
          certTypeName: certType?.name,
          ...values,
          documents: wwccDraft?.documents || []
        };
        const updatedCerts = [...selectedCerts, newCert];
        setSelectedCerts(updatedCerts);
        updateCertifications(updatedCerts);
        setCertDetailsVisible(false);
        setPendingCertTypeId(null);
        setWwccDraft(null);
        message.success('Certification added');
      }
    }
  }, [isEditing, currentCertIndex, selectedCerts, certificationTypes, updateCertifications, pendingCertTypeId, wwccDraft]);

  // Update Drawer open/close logic
  const handleDrawerClose = () => {
    // Get current form values
    const formValues = certForm.getFieldsValue();
    // Determine which cert is being edited
    let certIndex = -1;
    if (isEditing && currentCertIndex >= 0) {
      certIndex = currentCertIndex;
    } else if (pendingCertTypeId) {
      certIndex = selectedCerts.findIndex(c => c.certificationType === pendingCertTypeId);
    }
    // If editing an existing cert, update it with partial values
    if (certIndex >= 0) {
      const updatedCerts = [...selectedCerts];
      updatedCerts[certIndex] = {
        ...updatedCerts[certIndex],
        ...formValues,
      };
      setSelectedCerts(updatedCerts);
      updateCertifications(updatedCerts); // Update Zustand store
    }
    setCertDetailsVisible(false);
    setPendingCertTypeId(null);
    setWwccDraft(null);
    certForm.resetFields();
  };

  const handleRemoveCertification = useCallback((index) => {
    const cert = selectedCerts[index];
    const isRequired = requiredCerts.some(rc => rc._id === cert.certificationType._id);

    if (isRequired) {
      confirm({
        title: `Remove Required Certification?`,
        icon: <ExclamationCircleOutlined />,
        content: `This certification is required. Are you sure you want to remove it?`,
        okText: 'Yes, remove it',
        okType: 'danger',
        cancelText: 'No, keep it',
        onOk() {
          performRemoveCertification(index);
        }
      });
    } else {
      performRemoveCertification(index);
    }

    function performRemoveCertification(index) {
      const certName = selectedCerts[index].certTypeName;
      const updatedCerts = [...selectedCerts];
      updatedCerts.splice(index, 1);

      setSelectedCerts(updatedCerts);
      updateCertifications(updatedCerts);

      if (currentCertIndex >= updatedCerts.length) {
        setCurrentCertIndex(Math.max(0, updatedCerts.length - 1));
      }

      message.info(`${certName} removed`);
    }
  }, [currentCertIndex, selectedCerts, updateCertifications, requiredCerts]);

  // Document upload validation (max 2 files, allowed types, max 5MB each)
  const allowedFileTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const maxFiles = 2;

  const handleDocumentUpload = async (files, certIndex, isWWCCDraft = false) => {
    try {
      setIsUploading(prev => ({ ...prev, [certIndex]: true }));
      // For WWCC draft, use wwccDraft state
      let currentDocs = 0;
      if (isWWCCDraft) {
        currentDocs = wwccDraft?.documents?.length || 0;
      } else {
        currentDocs = selectedCerts[certIndex]?.documents?.length || 0;
      }
      const remainingSlots = maxFiles - currentDocs;
      if (files.length > remainingSlots) {
        toast.error(`You can only upload ${remainingSlots} more document(s)`);
        return false;
      }
      // Validate file type and size
      const invalidFiles = files.filter(file => !allowedFileTypes.includes(file.type) || file.size > maxFileSize);
      if (invalidFiles.length > 0) {
        toast.error(`Invalid file(s): Only PDF, JPG, PNG up to 5MB allowed.`);
        return false;
      }
      // Check for duplicate uploads
      const duplicateFiles = [];
      const uniqueFiles = [];
      files.forEach(file => {
        const isDuplicate = isWWCCDraft
          ? wwccDraft?.documents?.some(doc => doc.fileName === file.name && doc.fileSize === file.size)
          : selectedCerts[certIndex]?.documents?.some(doc => doc.fileName === file.name && doc.fileSize === file.size);
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
      // Process all uploads in parallel
      const uploadPromises = uniqueFiles.map(file => uploadToCloudinary(file, certIndex));
      const results = await Promise.all(uploadPromises);
      // Filter out any failed uploads
      const successfulUploads = results.filter(result => result !== null);
      if (successfulUploads.length === 0) {
        toast.error('No documents were uploaded successfully');
        return false;
      }
      // Update state with new documents
      if (isWWCCDraft) {
        setWwccDraft(prev => ({
          ...prev,
          documents: [
            ...(prev?.documents || []),
            ...successfulUploads
          ].slice(0, maxFiles)
        }));
      } else {
        const updatedCerts = [...selectedCerts];
        updatedCerts[certIndex] = {
          ...updatedCerts[certIndex],
          documents: [
            ...(updatedCerts[certIndex].documents || []),
            ...successfulUploads
          ].slice(0, maxFiles)
        };
        setSelectedCerts(updatedCerts);
        updateCertifications(updatedCerts);

        // Mark uploaded documents as used in tracking
        successfulUploads.forEach(doc => {
          if (doc.publicId) {
            DocumentTrackingService.markDocumentAsUsed(doc.publicId);
          }
        });
      }
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
      console.error('Upload error:', error);
      toast.error('Failed to upload some documents');
      return false;
    } finally {
      setIsUploading(prev => ({ ...prev, [certIndex]: false }));
    }
  };

  const uploadToCloudinary = async (file, certIndex) => {
    if (!file) return null;
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'Certificate(Saas)');
      formData.append('folder', 'SAAS(Support Worker)');
      const cloudName = 'dgsphdhns';
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      const data = await response.json();

      // Console log the uploaded document details
      console.log('=== Cloudinary Upload Success ===');
      console.log('File Name:', file.name);
      console.log('File Type:', file.type);
      console.log('File Size:', file.size, 'bytes');
      console.log('Public ID:', data.public_id);
      console.log('Secure URL:', data.secure_url);
      console.log('Upload Date:', new Date().toISOString());
      console.log('Certificate Index:', certIndex);
      console.log('================================');

      // Track document in localStorage with full metadata
      // DocumentTrackingService.addTrackedDocument now syncs with Zustand store automatically
      const trackingSuccess = DocumentTrackingService.addTrackedDocument(data.public_id, {
        url: data.secure_url,
        fileName: file.name,
        fileType: file.type,
        documentName: file.name,
        documentType: 'Support Worker',
        uploadedAt: new Date().toISOString()
      });
      
      // Also add to Zustand store's documentTracking for consistency
      try {
        const { addTrackedDocument } = useOnboardingStore.getState();
        if (addTrackedDocument) {
          await addTrackedDocument(data.public_id, {
            url: data.secure_url,
            fileName: file.name,
            fileType: file.type,
            documentName: file.name,
            documentType: 'Support Worker',
            uploadedAt: new Date().toISOString()
          });
        }
      } catch (storeError) {
        console.debug('Zustand store tracking skipped:', storeError.message);
      }
      
      if (trackingSuccess) {
        console.log(`✅ Document ${data.public_id} tracked in localStorage and Zustand store`);
      } else {
        console.warn(`⚠️ Failed to track document ${data.public_id} in localStorage`);
      }

      return {
        uid: data.public_id, // Use public_id as unique identifier
        url: data.secure_url,
        publicId: data.public_id,
        fileName: file.name,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
        status: 'done'
      };
    } catch (error) {
      console.error('Upload failed:', error);
      console.log('=== Cloudinary Upload Failed ===');
      console.log('File Name:', file.name);
      console.log('Error:', error.message);
      console.log('Certificate Index:', certIndex);
      console.log('================================');
      return null;
    }
  };

  /**
   * Extract publicId from Cloudinary URL
   * Helper function for document removal
   */
  const extractPublicIdFromUrl = useCallback((url) => {
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
  }, []);

  // Centralized document removal function
  // SaaS-level best practice: Atomic operations with proper error handling and cleanup
  const removeDocumentFromAllStates = useCallback(async (certIndex, docIndex, publicId = null) => {
    try {
      // Validate inputs
      if (certIndex < 0 || certIndex >= selectedCerts.length) {
        throw new Error('Invalid certification index');
      }
      
      const cert = selectedCerts[certIndex];
      if (!cert || !cert.documents || docIndex < 0 || docIndex >= cert.documents.length) {
        throw new Error('Invalid document index');
      }
      
      const document = cert.documents[docIndex];
      
      // Extract publicId from multiple possible sources
      const docPublicId = publicId || 
                         document?.publicId || 
                         document?.uid || 
                         (document?.url ? extractPublicIdFromUrl(document.url) : null);
      
      if (!docPublicId) {
        console.warn('⚠️ No publicId found for document, proceeding with local removal only');
      }

      // Step 1: Remove from Zustand store certifications array (immediate UI update)
      removeCertificationDocument(certIndex, docIndex);

      // Step 2: Update local component state immediately (optimistic update)
      const updatedCerts = [...selectedCerts];
      const updatedDocuments = updatedCerts[certIndex].documents.filter((_, i) => i !== docIndex);
      updatedCerts[certIndex] = {
        ...updatedCerts[certIndex],
        documents: updatedDocuments
      };
      setSelectedCerts(updatedCerts);
      updateCertifications(updatedCerts); // Sync with Zustand
      
      // Step 2.5: Update form if drawer is open and editing this cert
      // This ensures the form reflects the deletion immediately
      // Use setTimeout to ensure state has updated first
      setTimeout(() => {
        if (certDetailsVisible && isEditing && currentCertIndex === certIndex) {
          // Update form with new document list
          certForm.setFieldsValue({
            documents: updatedDocuments
          });
          
          // Trigger form validation to update UI
          certForm.validateFields(['documents']).catch(() => {});
        }
      }, 0);

      // Step 3: Remove from localStorage tracking (DocumentTrackingService)
      // This also syncs with Zustand store's documentTracking if available
      if (docPublicId) {
        const removedFromTracking = DocumentTrackingService.removeTrackedDocument(docPublicId);
        if (!removedFromTracking) {
          console.warn(`⚠️ Document ${docPublicId} was not found in tracking - may have been already removed`);
        }
      }

      // Step 4: Remove from Zustand store's documentTracking (if exists)
      // This ensures complete cleanup across all storage layers
      // Note: DocumentTrackingService.removeTrackedDocument already handles this via sync callback
      // But we do it explicitly here as well for redundancy
      try {
        const { documentTracking, removeTrackedDocument } = useOnboardingStore.getState();
        if (docPublicId && documentTracking?.trackedDocuments?.[docPublicId]) {
          await removeTrackedDocument(docPublicId);
        }
      } catch (storeError) {
        console.debug('Zustand documentTracking cleanup skipped:', storeError.message);
      }

      // Step 5: Delete from Cloudinary in background (non-blocking, non-critical)
      // Cloudinary deletion is fire-and-forget - don't block on it
      // Even if it fails, the document is already removed from UI and storage
      if (docPublicId) {
        // Don't await - let it run in background without blocking
        deleteCloudinaryImage(docPublicId)
          .then(() => {
            console.log(`✅ Document ${docPublicId} deleted from Cloudinary`);
          })
          .catch((error) => {
            // Log warning but don't throw - document is already removed from UI/storage
            // Cloudinary deletion failure is non-critical
            console.warn(`⚠️ Failed to delete ${docPublicId} from Cloudinary (non-critical):`, error.message);
            // Could queue for retry in production, but don't fail the operation
          });
      }
      
      // Return success - local removal is complete
      // Cloudinary deletion is non-critical and happens in background
      return { success: true, publicId: docPublicId };
    } catch (error) {
      console.error('❌ Error in removeDocumentFromAllStates:', error);
      // Only throw if critical operations failed (state updates, localStorage)
      // Cloudinary errors are non-critical and shouldn't cause failure
      throw error;
    }
  }, [selectedCerts, removeCertificationDocument, updateCertifications, certDetailsVisible, isEditing, currentCertIndex, certForm, extractPublicIdFromUrl]);

  const handleRemoveDocument = useCallback((certIndex, docIndex) => {
    // Validate indices
    if (certIndex < 0 || certIndex >= selectedCerts.length) {
      toast.error('Invalid certification index');
      return Promise.reject(new Error('Invalid certification index'));
    }
    
    const cert = selectedCerts[certIndex];
    if (!cert || !cert.documents || docIndex < 0 || docIndex >= cert.documents.length) {
      toast.error('Invalid document index');
      return Promise.reject(new Error('Invalid document index'));
    }
    
    const document = cert.documents[docIndex];
    const documentName = document?.fileName || document?.name || 'this document';
    
    return new Promise((resolve, reject) => {
      confirm({
        title: 'Remove Document?',
        icon: <ExclamationCircleOutlined />,
        content: `Are you sure you want to remove "${documentName}"? This action cannot be undone.`,
        okText: 'Yes, remove it',
        okType: 'danger',
        cancelText: 'No, keep it',
        onOk() {
          performDocumentRemoval(certIndex, docIndex, document)
            .then(resolve)
            .catch(reject);
        },
        onCancel() {
          reject(new Error('User cancelled'));
        }
      });
    });

    async function performDocumentRemoval(certIndex, docIndex, document) {
      // Extract publicId from document
      const publicId = document?.publicId || document?.uid || null;
      
      try {
        // Use centralized removal function (optimized - handles all cleanup)
        await removeDocumentFromAllStates(certIndex, docIndex, publicId);
        
        // Single success toast
        toast.success('Document removed successfully');
      } catch (error) {
        console.error('Error removing document:', error);
        toast.error('Failed to remove document. Please try again.');
        throw error; // Re-throw for caller to handle
      }
    }
  }, [selectedCerts, removeDocumentFromAllStates]);

  const isCertComplete = useCallback((cert) => {
    const type = certificationTypes.find(t => t._id === cert.certificationType);
    if (!type) return false;

    const fieldsComplete = type.requiredFields.every(f => cert[f]);
    const docsComplete = !type.documentRequired || (cert.documents?.length > 0);

    return fieldsComplete && docsComplete;
  }, [certificationTypes]);

  // isWorkingWithChildrenCheck imported from utils

  const getRequiredCertsAddedCount = useCallback(() => {
    // Only count truly required certs (exclude Working With Children Check)
    return requiredCerts.filter(req =>
      !isWorkingWithChildrenCheck(req) &&
      selectedCerts.some(sel => sel.certificationType === req._id)
    ).length;
  }, [requiredCerts, selectedCerts]);

  const allRequiredCertsAdded = useCallback(() => {
    // Only count truly required certs (exclude Working With Children Check)
    const requiredCount = requiredCerts.filter(req => !isWorkingWithChildrenCheck(req)).length;
    return getRequiredCertsAddedCount() === requiredCount;
  }, [getRequiredCertsAddedCount, requiredCerts]);

  // formatFieldLabel and getFieldTooltip imported from utils
  console.log("CertForm", certForm)
  const validateCurrentStep = useCallback(() => {
    if (currentStep === 0) {
      const errors = {};
      // if (!nationality) errors.nationality = 'Please select your nationality';
      if (!residencyStatus) errors.residencyStatus = 'Please select your residency status';

      if (Object.keys(errors).length) {
        setFormErrors(errors);
        return false;
      }
      return true;
    }

    if (currentStep === 1 && !allRequiredCertsAdded()) {
      message.warning('Please add all required certifications before proceeding');
      return false;
    }

    return true;
  }, [currentStep,
    //  nationality,
    residencyStatus, allRequiredCertsAdded]);

  const nextStep = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    }
  }, [validateCurrentStep]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => prev - 1);
  }, []);

  // Filter certifications based on search query
  const filteredRequiredCerts = useMemo(() => {
    if (!searchQuery) return requiredCerts;

    const query = searchQuery.toLowerCase();
    return requiredCerts.filter(cert =>
      cert.name.toLowerCase().includes(query) ||
      cert.description.toLowerCase().includes(query) ||
      cert.category.toLowerCase().includes(query)
    );
  }, [requiredCerts, searchQuery]);

  const handleResidencyStatusChange = (newStatus) => {
    updateResidencyStatus(newStatus);

    // Find required certs for the new status
    const newRequiredCertIds = new Set(
      certificationTypes
        .filter(cert => {
          // Your residency logic here, e.g.:
          if (newStatus === 'Citizen') return cert.acceptableFor === 'Citizens';
          if (newStatus === 'NZCitizen') return cert.acceptableFor === 'NZCitizens';
          // ...other cases
          return false;
        })
        .map(cert => cert._id)
    );

    // Filter out certs not required for the new status
    const filteredCerts = selectedCerts.filter(cert =>
      newRequiredCertIds.has(cert.certificationType)
    );

    setSelectedCerts(filteredCerts);
    updateCertifications(filteredCerts);
  };

  // Returns an array of { certIndex, certTypeName, missingFields: [field, ...] }
  const getIncompleteRequiredCerts = useCallback(() => {
    // Only validate truly required certs (exclude Working With Children Check)
    return requiredCerts
      .filter(reqCert => !isWorkingWithChildrenCheck(reqCert))
      .map((reqCert) => {
        const certIndex = selectedCerts.findIndex(sel => sel.certificationType === reqCert._id);
        if (certIndex === -1) {
          return {
            certIndex: null,
            certTypeName: reqCert.name,
            missingFields: reqCert.requiredFields.concat(reqCert.documentRequired ? ['documents'] : [])
          };
        }
        const cert = selectedCerts[certIndex];
        const missingFields = reqCert.requiredFields.filter(f => {
          if (f === 'degree') return isDegreeMissing(cert.degree);
          return !cert[f];
        });
        if (reqCert.documentRequired && (!cert.documents || cert.documents.length === 0)) {
          missingFields.push('documents');
        }
        return missingFields.length > 0
          ? { certIndex, certTypeName: reqCert.name, missingFields }
          : null;
      }).filter(Boolean);
  }, [requiredCerts, selectedCerts]);

  // Render functions for each step
  const renderPersonalInfoStep = useMemo(() => (
    <PersonalInfoStep
      residencyStatus={residencyStatus}
      formErrors={formErrors}
      onResidencyStatusChange={handleResidencyStatusChange}
    />
  ), [residencyStatus, formErrors, handleResidencyStatusChange]);

  const renderAddCertificationsStep = useMemo(() => (
    <AddCertificationsStep
      loading={loading}
      requiredCerts={requiredCerts}
      selectedCerts={selectedCerts}
      certificationTypes={certificationTypes}
      filteredRequiredCerts={filteredRequiredCerts}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      progress={progress}
      hasExistingCertifications={hasExistingCertifications}
      allRequiredCertsAdded={allRequiredCertsAdded}
      getRequiredCertsAddedCount={getRequiredCertsAddedCount}
      isCertComplete={isCertComplete}
      addCertification={addCertification}
      editCertification={editCertification}
      certDetailsVisible={certDetailsVisible}
      isEditing={isEditing}
      currentCertIndex={currentCertIndex}
      pendingCertTypeId={pendingCertTypeId}
      certForm={certForm}
      certifications={certifications}
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
      onboardingData={onboardingData}
    />
  ), [
    loading,
    requiredCerts,
    selectedCerts,
    certificationTypes,
    progress,
    activeTab,
    allRequiredCertsAdded,
    getRequiredCertsAddedCount,
    isCertComplete,
    addCertification,
    editCertification,
    hasExistingCertifications,
    filteredRequiredCerts,
    certDetailsVisible,
    isEditing,
    currentCertIndex,
    pendingCertTypeId,
    certForm,
    certifications,
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
    onboardingData
  ]);

  // Function to handle document preview with tracking
  const handleDocumentPreview = useCallback((document) => {
    setPreviewDocument(document);
  }, []);

  const renderReviewSubmitStep = useMemo(() => (
    <ReviewSubmitStep
      selectedCerts={selectedCerts}
      certificationTypes={certificationTypes}
      requiredCerts={requiredCerts}
      progress={progress}
      otherCertifications={otherCertifications}
      isCertComplete={isCertComplete}
      allRequiredCertsAdded={allRequiredCertsAdded}
      getRequiredCertsAddedCount={getRequiredCertsAddedCount}
      requiredCertsCount={requiredCerts.length}
      onEditCertification={editCertification}
      onRemoveCertification={handleRemoveCertification}
      onSubmit={handleSubmit}
      submitLoading={submitLoading}
      onDocumentPreview={handleDocumentPreview}
      onEditOtherCertificate={handleEditOtherCertificateFromReview}
      onNavigateToStep={setCurrentStep}
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
  ), [
    selectedCerts,
    certificationTypes,
    requiredCerts,
    progress,
    otherCertifications,
    isCertComplete,
    allRequiredCertsAdded,
    getRequiredCertsAddedCount,
    editCertification,
    handleRemoveCertification,
    handleSubmit,
    submitLoading,
    handleDocumentPreview,
    handleEditOtherCertificateFromReview,
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
  ]);




  const renderCertificationForm = useMemo(() => {
    if (!certDetailsVisible) {
      return null;
    }
    let cert;
    let certType;
    let isWWCC = false;
    if (isEditing && currentCertIndex >= 0 && currentCertIndex < selectedCerts.length) {
      cert = selectedCerts[currentCertIndex];
      certType = certificationTypes.find(t => t._id === cert.certificationType);
    } else if (pendingCertTypeId) {
      certType = certificationTypes.find(t => t._id === pendingCertTypeId);
      isWWCC = isWorkingWithChildrenCheckType(certType);
      cert = isWWCC ? (wwccDraft || { certificationType: pendingCertTypeId, certTypeName: certType?.name, documents: [] }) : { certificationType: pendingCertTypeId, certTypeName: certType?.name, documents: [] };
    } else {
      return null;
    }
    if (!certType) return null;
    // For WWCC, bind Upload to wwccDraft
    // Always get fresh data from selectedCerts to ensure we have the latest state after deletion
    const currentCert = isEditing && currentCertIndex >= 0 && currentCertIndex < selectedCerts.length
      ? selectedCerts[currentCertIndex]
      : cert;
    const uploadFileList = isWWCC ? (wwccDraft?.documents || []) : (currentCert?.documents || []);
    const uploadDisabled = isUploading[currentCertIndex] || (isWWCC && isUploading['wwcc']);
    
    return (
      <CertificationFormDrawer
        visible={certDetailsVisible}
        cert={currentCert}
        certType={certType}
        isEditing={isEditing}
        isWWCC={isWWCC}
        wwccDraft={wwccDraft}
        setWwccDraft={setWwccDraft}
        certForm={certForm}
        isFormValid={isFormValid}
        setIsFormValid={setIsFormValid}
        uploadFileList={uploadFileList}
        uploadDisabled={uploadDisabled}
        onClose={handleDrawerClose}
        onFinish={updateCertification}
        onDocumentUpload={handleDocumentUpload}
        onRemoveDocument={handleRemoveDocument}
        onDocumentPreview={handleDocumentPreview}
        currentCertIndex={currentCertIndex}
        DocumentTrackingService={DocumentTrackingService}
        showCustomDegree={showCustomDegree}
        setShowCustomDegree={setShowCustomDegree}
        customDegreeValue={customDegreeValue}
        setCustomDegreeValue={setCustomDegreeValue}
        customDegreeInputRef={customDegreeInputRef}
        degreeSelectRef={degreeSelectRef}
        showCustomInsurance={showCustomInsurance}
        setShowCustomInsurance={setShowCustomInsurance}
        customInsuranceValue={customInsuranceValue}
        setCustomInsuranceValue={setCustomInsuranceValue}
        customInsuranceInputRef={customInsuranceInputRef}
        insuranceSelectRef={insuranceSelectRef}
      />
    );
  }, [
    certDetailsVisible,
    isEditing,
    currentCertIndex,
    selectedCerts,
    certificationTypes,
    certForm,
    updateCertification,
    handleDocumentUpload,
    handleRemoveDocument,
    handleDocumentPreview,
    isUploading,
    handleDrawerClose,
    pendingCertTypeId,
    setIsFormValid,
    wwccDraft,
    setWwccDraft,
    isFormValid,
    showCustomDegree,
    setShowCustomDegree,
    customDegreeValue,
    setCustomDegreeValue,
    customDegreeInputRef,
    degreeSelectRef,
    showCustomInsurance,
    setShowCustomInsurance,
    customInsuranceValue,
    setCustomInsuranceValue,
    customInsuranceInputRef,
    insuranceSelectRef
  ]);


  const steps = useMemo(() => [
    {
      title: 'Personal Info',
      content: renderPersonalInfoStep,
      icon: <IdcardOutlined />
    },
    {
      title: 'Add Certifications',
      content: renderAddCertificationsStep,
      icon: <FileDoneOutlined />
    },
    {
      title: 'Review & Submit',
      content: renderReviewSubmitStep,
      icon: <SolutionOutlined />
    },
  ], [renderPersonalInfoStep, renderAddCertificationsStep, renderReviewSubmitStep]);

  // Function to handle document deletion from preview with tracking
  const handleDocumentDeleteFromPreview = useCallback(async () => {
    if (!previewDocument) return;
    
    try {
      const certIndex = selectedCerts.findIndex(cert =>
        cert.documents?.some(doc => doc.url === previewDocument.url)
      );
      
      if (certIndex >= 0) {
        const docIndex = selectedCerts[certIndex].documents.findIndex(
          doc => doc.url === previewDocument.url
        );
        
        if (docIndex >= 0) {
          const publicId = selectedCerts[certIndex].documents[docIndex].publicId;

          // Use centralized removal function (handles all cleanup and shows single toast)
          await removeDocumentFromAllStates(certIndex, docIndex, publicId);
          
          // Close preview after successful removal
          setPreviewDocument(null);
        } else {
          toast.error('Document not found');
        }
      } else {
        toast.error('Certification not found');
      }
    } catch (error) {
      console.error('Error deleting document from preview:', error);
      // Error toast already shown by removeDocumentFromAllStates
    }
  }, [previewDocument, selectedCerts, removeDocumentFromAllStates]);



  // Utility function to display tracking information (for debugging)
  const displayTrackingInfo = useCallback(() => {
    const stats = DocumentTrackingService.getTrackingStats();
    const trackedDocs = DocumentTrackingService.getTrackedDocuments();

    console.log('=== Document Tracking Information ===');
    console.log('Total tracked documents:', stats.totalTracked);
    console.log('Used documents:', stats.usedDocuments);
    console.log('Unused documents:', stats.unusedDocuments);
    console.log('All tracked documents:', trackedDocs);
    console.log('Used public IDs:', stats.usedPublicIds);
    console.log('Unused public IDs:', stats.unusedPublicIds);
    console.log('=====================================');

    return stats;
  }, []);

  // Function to clear all tracking data (for testing/cleanup)
  const clearAllTracking = useCallback(() => {
    const success = DocumentTrackingService.clearAllTrackedDocuments();
    if (success) {
      console.log('All document tracking data cleared');
      toast.success('Document tracking data cleared');
    } else {
      console.error('Failed to clear document tracking data');
      toast.error('Failed to clear tracking data');
    }
  }, []);

  // Function to export tracking data (for debugging)
  const exportTrackingData = useCallback(() => {
    const exportData = DocumentTrackingService.exportTrackingData();
    if (exportData) {
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `document-tracking-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      console.log('Document tracking data exported');
    } else {
      toast.error('Failed to export tracking data');
    }
  }, []);

  // Debug function to show current state vs tracking state
  const debugDocumentState = useCallback(() => {
    const trackedDocs = DocumentTrackingService.getTrackedDocuments();
    const allCurrentDocs = selectedCerts.flatMap(cert =>
      cert.documents?.map(doc => doc.publicId).filter(Boolean) || []
    );

    console.log('=== Document State Debug ===');
    console.log('Current documents in state:', allCurrentDocs);
    console.log('Tracked documents in localStorage:', Object.keys(trackedDocs));
    console.log('Orphaned documents:', Object.keys(trackedDocs).filter(
      publicId => !allCurrentDocs.includes(publicId)
    ));
    console.log('Missing from tracking:', allCurrentDocs.filter(
      publicId => !trackedDocs[publicId]
    ));
    console.log('===========================');
  }, [selectedCerts]);

  // Force refresh UI state
  const forceRefreshUI = useCallback(() => {
    // Re-synchronize with store
    if (certifications && certifications.length > 0) {
      setSelectedCerts(certifications);
    }
    // Show debug info
    debugDocumentState();
    message.info('UI state refreshed');
  }, [certifications, debugDocumentState]);

  // Function to manually save document tracking (for testing/development)
  const manuallySaveDocumentTracking = useCallback(async () => {
    try {
      const stats = DocumentTrackingService.getTrackingStats();
      if (stats.totalTracked === 0) {
        toast.error('No documents to save. Please upload some documents first.');
        return;
      }

      toast.loading('Saving document tracking to database...');
      const trackedDocs = DocumentTrackingService.getTrackedDocuments();
      const documents = Object.values(trackedDocs);
      await saveDocumentTrackingToDatabase(documents);
      toast.dismiss();
      toast.success('Document tracking saved to database successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to save document tracking: ' + error.message);
      console.error('Manual save error:', error);
    }
  }, []);

  // Function to test document tracking API (for debugging)
  const testDocumentTrackingAPI = useCallback(async () => {
    try {
      const stats = DocumentTrackingService.getTrackingStats();
      if (stats.totalTracked === 0) {
        toast.error('No documents to test with. Please upload some documents first.');
        return;
      }

      toast.loading('Testing document tracking API...');
      const trackedDocs = DocumentTrackingService.getTrackedDocuments();
      const documents = Object.values(trackedDocs);
      await saveDocumentTrackingToDatabase(documents);
      toast.dismiss();
      toast.success('Document tracking API test successful!');
    } catch (error) {
      toast.dismiss();
      toast.error('Document tracking API test failed: ' + error.message);
      console.error('API test error:', error);
    }
  }, []);

  // Add this useEffect above renderCertificationForm (inside CertificateSecond)
  useEffect(() => {
    if (!certDetailsVisible) return;
    // Get the current documents list
    let docs = [];
    if (isEditing && currentCertIndex >= 0 && currentCertIndex < selectedCerts.length) {
      docs = selectedCerts[currentCertIndex]?.documents || [];
    } else if (pendingCertTypeId) {
      docs = wwccDraft?.documents || [];
    }
    // If documentRequired, validate
    const certType = isEditing
      ? certificationTypes.find(t => t._id === selectedCerts[currentCertIndex]?.certificationType)
      : certificationTypes.find(t => t._id === pendingCertTypeId);
    if (certType?.documentRequired) {
      certForm.validateFields(['documents']);
    }
    certForm
      .validateFields()
      .then(() => setIsFormValid(true))
      .catch(() => setIsFormValid(false));
  }, [certDetailsVisible, certForm, isEditing, currentCertIndex, selectedCerts, pendingCertTypeId, wwccDraft, certificationTypes]);

  // Trigger validation when Drawer opens to show missing fields immediately
  useEffect(() => {
    if (certDetailsVisible) {
      certForm.validateFields().catch(() => { }); // Show errors for missing fields
    }
  }, [certDetailsVisible, certForm]);

  if (isOnboardingError) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Alert
          message="Error Loading Profile Data"
          description="Failed to load your profile information. Please try again later."
          type="error"
          showIcon
        />
        <Button
          type="primary"
          style={{ marginTop: 16 }}
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 16px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Development Debug Section - Remove in production
      {process.env.NODE_ENV === 'development' && (
        <Card
          title="Document Tracking Debug Info"
          style={{ marginBottom: 16, backgroundColor: '#f0f8ff' }}
          size="small"
        >
          <Space wrap>
            <Button
              size="small"
              onClick={displayTrackingInfo}
              icon={<InfoCircleOutlined />}
            >
              Log Tracking Info
            </Button>
            <Button
              size="small"
              onClick={exportTrackingData}
              icon={<FileOutlined />}
            >
              Export Data
            </Button>
            <Button
              size="small"
              onClick={testDocumentTrackingAPI}
              icon={<SafetyCertificateOutlined />}
            >
              Test API
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={manuallySaveDocumentTracking}
              icon={<FileDoneOutlined />}
            >
              Save Tracking
            </Button>
            <Button
              size="small"
              danger
              onClick={clearAllTracking}
              icon={<DeleteOutlined />}
            >
              Clear All
            </Button>
            <Text type="secondary">
              Tracked: {DocumentTrackingService.getTrackingStats().totalTracked} documents |
              Used: {DocumentTrackingService.getTrackingStats().usedDocuments} |
              Unused: {DocumentTrackingService.getTrackingStats().unusedDocuments}
            </Text>
          </Space>
        </Card>
      )} */}



      <Steps current={currentStep} style={{ marginBottom: 48, marginTop: 40, padding: 10 }}>
        {steps.map((item) => (
          <Step
            key={item.title}
            title={item.title}
            icon={item.icon}
          />
        ))}
      </Steps>

      <div className="steps-content" style={{}}>
        {steps[currentStep].content}
      </div>

      <div className="steps-action" style={{ marginTop: 24, textAlign: 'center' }}>
        {currentStep > 0 && (
          <Button
            style={{ marginRight: 8 }}
            onClick={prevStep}
            size="large"
          >
            Previous
          </Button>
        )}
        {currentStep < steps.length - 1 && (
          <Button
            type="primary"
            onClick={nextStep}
            disabled={
              (currentStep === 0 && (!residencyStatus)) ||
              (currentStep === 1 && (getIncompleteRequiredCerts().length > 0))
            }
            size="large"
          >
            Next
          </Button>
        )}
      </div>

      {renderCertificationForm}
      <DocumentPreview
        document={previewDocument}
        visible={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
        onDelete={handleDocumentDeleteFromPreview}
      />
    </div>
  );
};
export default CertificateSecond