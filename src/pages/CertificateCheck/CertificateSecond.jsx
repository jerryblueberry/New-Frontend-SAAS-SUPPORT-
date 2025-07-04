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
  Modal
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
  EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import debounce from 'lodash/debounce';
import useOnboardingStore, { useCertificationsMutation } from '../../stores/useOnboardingStore';
import { useOnboardingQuery } from '../../stores/useOnboardingStore';
import DocumentPreview from '../../components/workerForm/Modals/DocumentPreview';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Option } = Select;
const { TabPane } = Tabs;
const { confirm } = Modal;


const RESIDENCY_STATUSES = [
  { value: 'Citizen', label: 'Australian Citizen', icon: <IdcardOutlined />, color: 'green' },
  { value: 'NZCitizen', label: 'New Zealand Citizen', icon: <IdcardOutlined />, color: 'teal' },
  { value: 'PermanentResident', label: 'Permanent Resident', icon: <FileDoneOutlined />, color: 'blue' },
  { value: 'StudentVisa', label: 'Student Visa (Subclass 500)', icon: <ReadOutlined />, color: 'purple' },
  { value: 'TemporaryGraduateVisa', label: 'Temporary Graduate Visa (485)', icon: <SolutionOutlined />, color: 'geekblue' },
  { value: 'TSS', label: 'Temporary Skill Shortage (482)', icon: <FileOutlined />, color: 'orange' },
  { value: 'BridgingVisa', label: 'Bridging Visa', icon: <ClockCircleOutlined />, color: 'gold' },
  { value: 'OtherTemporaryVisa', label: 'Other Temporary Visa', icon: <FileOutlined />, color: 'cyan' }
];

const CATEGORY_ICONS = {
  'Citizenship': <IdcardOutlined />,
  'Identity': <FileDoneOutlined />,
  'Visa': <GlobalOutlined />,
  'Training': <SafetyCertificateOutlined />,
  'Industry': <SafetyOutlined />,
  'License': <CarOutlined />,
  'Health': <MedicineBoxOutlined />,
  'Financial': <BankOutlined />
};
// Constants
const NATIONALITIES = [
  { value: 'AU', label: 'Australia', flag: '🇦🇺' },
  { value: 'NZ', label: 'New Zealand', flag: '🇳🇿' },
  { value: 'US', label: 'United States', flag: '🇺🇸' },
  { value: 'UK', label: 'United Kingdom', flag: '🇬🇧' },
  { value: 'CA', label: 'Canada', flag: '🇨🇦' },
  { value: 'IN', label: 'India', flag: '🇮🇳' },
  { value: 'CN', label: 'China', flag: '🇨🇳' },
  { value: 'JP', label: 'Japan', flag: '🇯🇵' }
];

// LocalStorage utility functions for document tracking
const DOCUMENT_TRACKING_KEY = 'certification_documents_tracking';

const DocumentTrackingService = {
  // Get all tracked document public IDs
  getTrackedDocuments: () => {
    try {
      const stored = localStorage.getItem(DOCUMENT_TRACKING_KEY);
      if (!stored) return {};
      
      const parsed = JSON.parse(stored);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch (error) {
      console.error('Error reading tracked documents from localStorage:', error);
      return {};
    }
  },

  // Add a document public ID to tracking
  addTrackedDocument: (publicId) => {
    try {
      const tracked = DocumentTrackingService.getTrackedDocuments();
      
      // Validate input
      if (!publicId || typeof publicId !== 'string') {
        console.error('Invalid publicId provided for document tracking');
        return false;
      }

      // Add only public ID with minimal metadata
      tracked[publicId] = {
        publicId,
        trackedAt: new Date().toISOString()
      };

      localStorage.setItem(DOCUMENT_TRACKING_KEY, JSON.stringify(tracked));
      console.log(`Document public ID tracked: ${publicId}`);
      return true;
    } catch (error) {
      console.error('Error adding document to tracking:', error);
      return false;
    }
  },

  // Check if document public ID is already tracked
  isDocumentTracked: (publicId) => {
    try {
      const tracked = DocumentTrackingService.getTrackedDocuments();
      return tracked.hasOwnProperty(publicId);
    } catch (error) {
      console.error('Error checking document tracking status:', error);
      return false;
    }
  },

  // Remove document public ID from tracking
  removeTrackedDocument: (publicId) => {
    try {
      const tracked = DocumentTrackingService.getTrackedDocuments();
      if (tracked[publicId]) {
        delete tracked[publicId];
        localStorage.setItem(DOCUMENT_TRACKING_KEY, JSON.stringify(tracked));
        console.log(`Document public ID removed from tracking: ${publicId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing document from tracking:', error);
      return false;
    }
  },

  // Get tracking statistics
  getTrackingStats: () => {
    try {
      const tracked = DocumentTrackingService.getTrackedDocuments();
      const publicIds = Object.keys(tracked);
      
      return {
        totalTracked: publicIds.length,
        publicIds: publicIds
      };
    } catch (error) {
      console.error('Error getting tracking statistics:', error);
      return { totalTracked: 0, publicIds: [] };
    }
  },

  // Clean up old documents (older than specified days)
  cleanupOldDocuments: (daysOld = 30) => {
    try {
      const tracked = DocumentTrackingService.getTrackedDocuments();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      let cleanedCount = 0;
      Object.keys(tracked).forEach(publicId => {
        const trackedAt = new Date(tracked[publicId].trackedAt);
        if (trackedAt < cutoffDate) {
          delete tracked[publicId];
          cleanedCount++;
        }
      });

      if (cleanedCount > 0) {
        localStorage.setItem(DOCUMENT_TRACKING_KEY, JSON.stringify(tracked));
        console.log(`Cleaned up ${cleanedCount} old document public IDs from tracking`);
      }
      
      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up old documents:', error);
      return 0;
    }
  },

  // Clear all tracked documents
  clearAllTrackedDocuments: () => {
    try {
      localStorage.removeItem(DOCUMENT_TRACKING_KEY);
      console.log('All tracked document public IDs cleared from localStorage');
      return true;
    } catch (error) {
      console.error('Error clearing tracked documents:', error);
      return false;
    }
  }
};

// Helper function to normalize certification type (handles both object and string formats)
const normalizeCertificationType = (certType) => {
  return {
    _id: certType._id,
    name: certType.name || certType.certTypeName || 'Unknown',
    requiredFields: certType.requiredFields || [],
    hasExpiryDate: certType.hasExpiryDate,
    documentRequired: certType.documentRequired,
    category: certType.category,
    description: certType.description,
    instructions: certType.instructions,
    isEducation: certType.isEducation,
    educationSetting: certType.isEducation ? {
      degreeOptions: certType.educationSetting?.degreeOptions || []
    } : undefined,
    isVisa: certType.isVisa,
    visaSettings: certType.isVisa ? {
      subclassOptions: certType.visaSettings?.subclassOptions || [],
      requiresWorkRights: certType.visaSettings?.requiresWorkRights !== false,
      requiresConditions: certType.visaSettings?.requiresConditions !== false,
      allowedCountries: certType.visaSettings?.allowedCountries || []
    } : undefined,
    isCitizenshipProof: certType.isCitizenshipProof,
    acceptableFor: certType.acceptableFor
  };
};

// Add this helper above the component
const isCertFullyComplete = (certType, selectedCerts) => {
  const cert = selectedCerts.find(c => c.certificationType === certType._id);
  if (!cert) return false;
  // Check all required fields
  const allFieldsFilled = certType.requiredFields.every(f => !!cert[f]);
  // Check document requirement
  const docsFilled = !certType.documentRequired || (cert.documents && cert.documents.length > 0);
  return allFieldsFilled && docsFilled;
};

const CertificateSecond = () => {
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
    updateCertifications
  } = useOnboardingStore();
  
  const { data: onboardingData, isLoading: isLoadingOnboardingData, isError: isOnboardingError } = useOnboardingQuery();
  const { mutate: submitCertifications, isLoading: isSubmitting } = useCertificationsMutation();
  
  // Local state
  const [customDegrees, setCustomDegrees] = useState([]);
  const [customDegreeInput, setCustomDegreeInput] = useState('');
  
  const [currentStep, setCurrentStep] = useState(0);
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
  
  const fileInputRefs = useRef([]);
console.log("Required Certrs Value",requiredCerts)
console.log("Has existing ",hasExistingCertifications);
console.log("Normalized Certs",onboardingData)
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
      
      // Check if user has existing certifications
      if (normalizedCerts.length > 0) {
        setHasExistingCertifications(true);
        setSelectedCerts(normalizedCerts);
        updateCertifications(normalizedCerts);
        
        // Show success message if all required certs are already added
        if ( profile.residencyStatus) {
          // updateNationality(profile.nationality);
          updateResidencyStatus(profile.residencyStatus);
        }
      } else {
        setHasExistingCertifications(false);
      }
    }
  }, [onboardingData, isLoadingOnboardingData, updateCertifications, updateResidencyStatus]);

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

  // Cleanup old documents on component mount
  useEffect(() => {
    // Clean up documents older than 30 days
    const cleanedCount = DocumentTrackingService.cleanupOldDocuments(30);
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} old documents from tracking`);
    }
    
    // Log tracking statistics
    const stats = DocumentTrackingService.getTrackingStats();
    console.log('Document tracking statistics:', stats);
  }, []);

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

  const handleSubmit = () => {
    if (!allRequiredCertsAdded() || progress < 100) {
      message.warning('Please complete all required certifications before submitting');
      return;
    }

    // Ensure we're sending just the ID for certificationType
    const certsToSubmit = selectedCerts.map(cert => ({
      ...cert,
      certificationType: cert.certificationType // Already normalized to just the ID
    }));

    // Get all tracked document public IDs from localStorage
    const trackedDocuments = DocumentTrackingService.getTrackedDocuments();
    const documentPublicIds = Object.keys(trackedDocuments);

    // Save document tracking to database first (if there are documents)
    const saveDocumentTracking = async () => {
      if (documentPublicIds.length > 0) {
        try {
          await saveDocumentTrackingToDatabase(documentPublicIds);
          console.log('Document tracking saved to database successfully');
          // Clear localStorage after successful database save
          DocumentTrackingService.clearAllTrackedDocuments();
        } catch (error) {
          console.error('Document tracking save failed:', error);
          // Don't block the main submission, just log the error
          message.warning('Certifications will be saved but document tracking failed. Please contact support.');
        }
      }
    };

    // Execute document tracking save in parallel with certification submission
    const documentTrackingPromise = saveDocumentTracking();

    // Submit certifications using the mutation
    submitCertifications({
      certifications: certsToSubmit,
      // nationality,
      residencyStatus,
      allCertificationTypes: certificationTypes, // Pass the full list of certification types
    }, {
      onSuccess: async (data) => {
        // Wait for document tracking to complete
        try {
          await documentTrackingPromise;
        } catch (error) {
          // Document tracking error already handled above
        }

        // Handle certification submission success
        if (data.success && data.data) {
          toast.success("Submitted Successfully");
          
          // Update profile completeness in the store
          const { updateProfileCompleteness } = useOnboardingStore.getState();
          updateProfileCompleteness(data.data);
          
          // Use the store's nextStep function instead of onboardingNextStep
          const { nextStep } = useOnboardingStore.getState();
          nextStep();
          
          message.success('Certifications submitted successfully!');
        } else {
          // Handle case where data.success is false but no error was thrown
          message.warning('Submission successful but profile update incomplete.');
        }
      },
      onError: (error) => {
        message.error(error.message || 'Failed to submit certifications');
      }
    });
  };

  // Function to save document tracking data to database
  const saveDocumentTrackingToDatabase = async (documentPublicIds) => {
    try {
      console.log('Saving document tracking to database:', documentPublicIds);
      
      // Validate input
      if (!Array.isArray(documentPublicIds) || documentPublicIds.length === 0) {
        throw new Error('No document public IDs to save');
      }

      // Filter out any invalid public IDs
      const validPublicIds = documentPublicIds.filter(id => 
        id && typeof id === 'string' && id.trim().length > 0
      );

      if (validPublicIds.length === 0) {
        throw new Error('No valid document public IDs found');
      }

      const response = await api.post('/documents-tracking/save', {
        documents: validPublicIds
      });

      // Validate response
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      if (response.data.success) {
        console.log('Document tracking saved successfully:', response.data);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to save document tracking');
      }
    } catch (error) {
      console.error('Error saving document tracking to database:', error);
      
      // Provide more specific error messages based on error type
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.message || 'Server error';
        
        if (status === 401) {
          throw new Error('Authentication required for document tracking');
        } else if (status === 403) {
          throw new Error('Permission denied for document tracking');
        } else if (status === 400) {
          throw new Error(`Invalid request: ${message}`);
        } else if (status >= 500) {
          throw new Error('Server error while saving document tracking');
        } else {
          throw new Error(`Document tracking failed: ${message}`);
        }
      } else if (error.request) {
        // Network error
        throw new Error('Network error while saving document tracking');
      } else {
        // Other error
        throw new Error('Document tracking save failed: ' + error.message);
      }
    }
  };

  console.log("REquired Certs",requiredCerts.map((certs) =>(
    certs.name
  )))
  // Add new state for pending add/edit
  const [pendingCertTypeId, setPendingCertTypeId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  // Add WWCC draft state
  const [wwccDraft, setWwccDraft] = useState(null);

  // Helper to check if a certType is the Working With Children Check
  const isWorkingWithChildrenCheckType = (certType) =>
    certType && certType.name && certType.name.trim().toLowerCase() === 'working with children check';

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
      
      // Track only the public ID in localStorage
      const trackingSuccess = DocumentTrackingService.addTrackedDocument(data.public_id);
      if (trackingSuccess) {
        console.log(`Document public ID ${data.public_id} tracked in localStorage`);
      } else {
        console.warn(`Failed to track document public ID ${data.public_id} in localStorage`);
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

  const handleRemoveDocument = useCallback((certIndex, docIndex) => {
    confirm({
      title: 'Remove Document?',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to remove this document?',
      okText: 'Yes, remove it',
      okType: 'danger',
      cancelText: 'No, keep it',
      onOk() {
        performDocumentRemoval(certIndex, docIndex);
      }
    });
    
    function performDocumentRemoval(certIndex, docIndex) {
      // Only update the Zustand store, do not touch localStorage tracking
      removeCertificationDocument(certIndex, docIndex);
      message.info(`Document removed`);
    }
  }, [removeCertificationDocument]);

  const isCertComplete = useCallback((cert) => {
    const type = certificationTypes.find(t => t._id === cert.certificationType);
    if (!type) return false;

    const fieldsComplete = type.requiredFields.every(f => cert[f]);
    const docsComplete = !type.documentRequired || (cert.documents?.length > 0);
    
    return fieldsComplete && docsComplete;
  }, [certificationTypes]);

  // Helper to check if a cert is the Working With Children Check (case-insensitive, trimmed)
  const isWorkingWithChildrenCheck = (cert) => {
    const name = cert.name || cert.certTypeName;
    return name && name.trim().toLowerCase() === 'working with children check';
  };

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

  const formatFieldLabel = (field) => {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const getFieldTooltip = (field) => {
    const tooltips = {
      number: 'The unique identifier on your certificate or document',
      policeRefNo: 'The unique identifier on your certificate or document',
      dateOfCompletion: 'The date when this certification was completed',
      workerScreeningId:"The unique identifier for your worker screening id",
      issuedDate: 'The date when this certification was issued',
      expiryDate: 'The date when this certification will expire',
      country: 'The country that issued this certification',
      state: 'The state or territory that issued this certification',
      subclass: 'The visa subclass number',
      visaConditions: 'Any specific conditions attached to this visa'
    };
    return tooltips[field] || null;
  };
  console.log("CertForm",certForm)
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
        const missingFields = reqCert.requiredFields.filter(f => !cert[f]);
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
    <Card 
      title={<Title level={4} style={{ margin: 0 }}>Personal Information</Title>}
      style={{ maxWidth: 800, margin: '0 auto', borderRadius: 8 }}
      headStyle={{ borderBottom: 'none', padding: '24px 24px 0' }}
      bodyStyle={{ padding: '16px 24px 24px' }}
    >
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Please provide your personal details so we can determine which certifications are required for you.
      </Text>
      
      <Form layout="vertical" style={{ maxWidth: 600 }}>
        {/* <Form.Item 
          label={
            <Space>
              <GlobalOutlined />
              <span>Nationality</span>
            </Space>
          }
          required
          validateStatus={formErrors.nationality ? 'error' : ''}
          help={formErrors.nationality}
        >
          <Select
            value={nationality}
            onChange={(value) => {
              updateNationality(value);
              setFormErrors(prev => ({ ...prev, nationality: undefined }));
            }}
            placeholder="Select your nationality"
            optionLabelProp="label"
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            style={{ width: '100%' }}
          >
            {NATIONALITIES.map(option => (
              <Option 
                key={option.value} 
                value={option.value}
                label={
                  <Space>
                    <span>{option.flag}</span>
                    <span>{option.label}</span>
                  </Space>
                }
              >
                <Space>
                  <span>{option.flag}</span>
                  <span>{option.label}</span>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item> */}


        <Form.Item 
          label={
            <Space>
              <IdcardOutlined />
              <span>Residency Status</span>
            </Space>
          }
          required
          validateStatus={formErrors.residencyStatus ? 'error' : ''}
          help={formErrors.residencyStatus}
        >
          <Select
            value={residencyStatus}
            onChange={handleResidencyStatusChange}
            placeholder="Select your status"
            optionLabelProp="label"
            style={{ width: '100%' }}
          >
            {RESIDENCY_STATUSES.map(option => (
              <Option 
                key={option.value} 
                value={option.value}
                label={
                  <Space>
                    {option.icon}
                    <span>{option.label}</span>
                  </Space>
                }
              >
                <Space>
                  {option.icon}
                  <span>{option.label}</span>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
      
      {residencyStatus && (
        <Alert 
          message="Profile Information Saved" 
          description="Your   residency information has been saved. Click Next to continue to certification selection."
          type="success" 
          showIcon 
          style={{ marginTop: 24, maxWidth: 600 }}
        />
      )}
    </Card>
  ), [residencyStatus, formErrors, updateResidencyStatus]);

  const renderAddCertificationsStep = useMemo(() => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
          <p>Loading certification requirements...</p>
        </div>
      ) : (
        <>
          <Card 
            title={<Title level={4} style={{ margin: 0 }}>Search Certifications</Title>}
            bordered={false}
            style={{ boxShadow: 'none', borderRadius: 8 }}
            bodyStyle={{ paddingBottom: 0 }}
          >
            <Input
              placeholder="Search certifications by name, description or category..."
              allowClear
              onChange={(e) => handleSearch(e.target.value)}
              style={{ maxWidth: 600 }}
              prefix={<InfoCircleOutlined />}
            />
          </Card>
          {/* {currentStep === 1 && getIncompleteRequiredCerts().length > 0 && (
            <Alert
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
              message="Some required certifications are incomplete"
              description={
                <div>
                  {getIncompleteRequiredCerts().map((item, idx) => (
                    <div key={idx} style={{ marginBottom: 8 }}>
                      <b>{item.certTypeName}:</b>
                      {item.missingFields.map((field, i) => (
                        <Tag color="red" key={i} style={{ marginLeft: 8 }}>
                          {formatFieldLabel(field)}
                        </Tag>
                      ))}
                      {item.certIndex !== null && (
                        <Button
                          type="link"
                          size="small"
                          onClick={() => editCertification(item.certIndex)}
                          style={{ marginLeft: 8, padding: 0 }}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              }
            />
          )} */}
          {!allRequiredCertsAdded() && selectedCerts.length > 0 && (
              <Alert 
                message="Required Certifications Missing" 
                description={
                  <div>
                    <p>You still need to add {requiredCerts.length - getRequiredCertsAddedCount()} required certifications.</p>
                    {/* <Button 
                      type="link" 
                      onClick={() => setActiveTab('required')}
                      style={{ padding: 0 }}
                    >
                      View required certifications
                    </Button> */}
                  </div>
                } 
                type="warning" 
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          <Card 
            // title={<Title level={4} style={{ margin: 0 }}>Available Certifications</Title>}
            style={{ borderRadius: 8 }}
            bodyStyle={{ padding: '16px 0' }}
          >
            <Tabs 
              activeKey={activeTab}
              onChange={setActiveTab}
              tabPosition="top"
              style={{ padding: '0 16px' }}
            >
              <TabPane 
                tab={
                  <span>
                    <IdcardOutlined />
                    Required Certifications
                    <Badge 
                      count={`${getRequiredCertsAddedCount()}/${requiredCerts.length}`} 
                      style={{ 
                        backgroundColor: allRequiredCertsAdded() ? '#52c41a' : '#faad14',
                        marginLeft: 8 
                      }}
                    />
                  </span>
                } 
                key="required"
              >
                {hasExistingCertifications && allRequiredCertsAdded() ? (
                  <Alert
                    message="Required Certifications Complete"
                    description="You have already added all required certifications. You can add additional optional certifications if needed."
                    type="success"
                    showIcon
                    style={{ margin: 16 }}
                  />
                ) : filteredRequiredCerts.length > 0 ? (
                  <List
                    dataSource={filteredRequiredCerts}
                    
                    renderItem={cert => {
                      const certIsComplete = isCertFullyComplete(cert, selectedCerts);
                      const certInList = selectedCerts.some(c => c.certificationType === cert._id);
                      
                      return (
                        <List.Item
                          style={{ padding: '12px 24px' }}
                          actions={[
                            certIsComplete ? (
                              <>
                                <Button 
                                  icon={<CheckCircleOutlined />} 
                                  type="text" 
                                  style={{ color: '#52c41a' }}
                                  disabled
                                >
                                  Completed
                                </Button>
                                {/* <Button
                                  icon={<EditOutlined />}
                                  type="link"
                                  onClick={() => {
                                    const idx = selectedCerts.findIndex(c => c.certificationType === cert._id);
                                    editCertification(idx);
                                  }}
                                  size="small"
                                  style={{ marginLeft: 8 }}
                                >
                                  Edit
                                </Button> */}
                              </>
                            ) : (
                              <Button 
                                type="primary"
                                icon={<PlusOutlined />} 
                                onClick={() => {
                                  if (!certInList) {
                                    addCertification(cert._id);
                                  } else {
                                    const idx = selectedCerts.findIndex(c => c.certificationType === cert._id);
                                    editCertification(idx);
                                  }
                                }}
                                size="small"
                              >
                                {certInList ? "Add" : "Add"}
                              </Button>
                            )
                          ]}
                        >
                          <List.Item.Meta 

                                onClick={() => {
                                  const idx = selectedCerts.findIndex(c => c.certificationType === cert._id);
                                  editCertification(idx);
                                }}
                            avatar={
                              <Avatar 
                                icon={cert.isVisa ? <GlobalOutlined /> : CATEGORY_ICONS[cert.category] || <SafetyCertificateOutlined />} 
                                style={{ 
                                  backgroundColor: certIsComplete ? '#52c41a' : '#faad14',
                                  color: '#fff'
                                }}
                              />
                            }
                            title={
                              <Space 
                        
                              >
                                <Text strong>{cert.name}</Text>
                                {!isWorkingWithChildrenCheck(cert) && <p style={{color:'red'}}>*</p>}
                              </Space>
                            }
                            description={
                              !certIsComplete && certInList && (
                                <div>
                                  <Text type="danger">
                                    <WarningOutlined /> Missing:&nbsp;
                                    {cert.requiredFields
                                      .filter(field => {
                                        // If this cert is being edited, use the form's current values
                                        let userCert;
                                        if (
                                          certDetailsVisible &&
                                          ((isEditing && selectedCerts[currentCertIndex]?.certificationType === cert._id) ||
                                           (!isEditing && pendingCertTypeId === cert._id))
                                        ) {
                                          // Get live form values
                                          userCert = certForm.getFieldsValue();
                                        } else {
                                          // Use saved state
                                          userCert = certifications.find(sel => sel.certificationType === cert._id);
                                        }
                                        if (!userCert) return true;
                                        // Special handling for degree (array)
                                        if (field === 'degree') {
                                          return !Array.isArray(userCert.degree) || userCert.degree.length === 0;
                                        }
                                        return !userCert[field];
                                      })
                                      .map(field => (
                                        <Tag color="red" key={field}>{formatFieldLabel(field)}</Tag>
                                      ))}
                                    {cert.documentRequired && (() => {
                                      let userCert;
                                      if (
                                        certDetailsVisible &&
                                        ((isEditing && selectedCerts[currentCertIndex]?.certificationType === cert._id) ||
                                         (!isEditing && pendingCertTypeId === cert._id))
                                      ) {
                                        userCert = certForm.getFieldsValue();
                                      } else {
                                        userCert = certifications.find(sel => sel.certificationType === cert._id);
                                      }
                                      return (!userCert || !userCert.documents || userCert.documents.length === 0) && (
                                        <Tag color="red">Documents</Tag>
                                      );
                                    })()}
                                  </Text>
                                </div>
                              )
                            }
                          />
                        </List.Item>
                      );
                    }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: 24 }}>
                    <Text type="secondary">No required certifications found based on your profile</Text>
                  </div>
                )}
              </TabPane>
            </Tabs>
          </Card>
          
          {
            onboardingData?.data?.profile?.certifications?.length> 0 ? ( <Card
              title={<Title level={4} style={{ margin: 0 }}>Your Certifications</Title>}
              style={{ borderRadius: 8 }}
              
              extra={
                <Space>
                  <Tooltip title="Overall completion status">
                    <Badge 
                      count={`${progress}%`} 
                      color={progress === 100 ? '#52c41a' : '#faad14'}
                      style={{ backgroundColor: 'transparent', color: progress === 100 ? '#52c41a' : '#faad14' }}
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
              {onboardingData?.data?.profile?.certifications?.length > 0 ? (
                <List  style={{}}
                  dataSource={selectedCerts}
                  renderItem={(cert, index) => {
                    const type = certificationTypes.find(t => t._id === cert.certificationType);
                    const isComplete = isCertComplete(cert);
                    const isRequired = requiredCerts.some(rc => rc._id === cert.certificationType);
                    return (
                      <List.Item 
                        onClick={() => editCertification(index)}
                        style={{ padding: '12px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              icon={type?.isVisa ? <GlobalOutlined /> : CATEGORY_ICONS[type?.category] || <SafetyCertificateOutlined />}
                              style={{ 
                                backgroundColor: isComplete ? '#52c41a' : '#faad14',
                                color: '#fff'
                              }}
                            />
                          }
                          title={
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }}>
                              <span style={{ fontWeight: 600, fontSize: 16, color: '#222' }} className="text_your_cert">{cert.certTypeName}</span>
                              {isComplete && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto', color: '#52c41a', fontWeight: 500, fontSize: 15 }}>
                                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                                  <span className="completed-label">Completed</span>
                                </span>
                              )}
                            </div>
                          }
                          description={
                            !isComplete && (
                              <div style={{ marginTop: 4 }}>
                                <Text type="danger">
                                  <WarningOutlined /> Missing:&nbsp;
                                  {type?.requiredFields
                                    .filter(field => !cert[field])
                                    .map(field => (
                                      <Tag color="red" key={field}>{formatFieldLabel(field)}</Tag>
                                    ))}
                                  {type?.documentRequired && (!cert.documents || cert.documents.length === 0) && (
                                    <Tag color="red">Documents</Tag>
                                  )}
                                </Text>
                              </div>
                            )
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
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
              
             
            </Card>): (null)
          }
         

       
        </>
      )}
    </div>
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
    handleRemoveCertification,
    handleSearch,
    hasExistingCertifications,
    filteredRequiredCerts
  ]);

  const renderReviewSubmitStep = useMemo(() => (
    <Card 
      title={<Title level={4} style={{ margin: 0 }}>Review & Submit</Title>}
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
                  onClick={() => setCurrentStep(1)}
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
      <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 8 }}>
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
                      onClick={() => editCertification(index)}
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
                          Array.isArray(cert[field]) ? cert[field].join(', ') : cert[field] || <Text type="danger">Missing</Text>
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
                                  handleDocumentPreview(doc);
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
                          onClick={() => editCertification(index)}
                          style={{ marginRight: 8 }}
                        >
                          Complete
                        </Button>
                        <Button
                          danger
                          size="small"
                          onClick={() => handleRemoveCertification(index)}
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
      </div>
      <Divider />
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Button 
          type="primary" 
          size="large"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={selectedCerts.length === 0 || progress < 100 || !allRequiredCertsAdded()}
          style={{ minWidth: 200, height: 48 }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Certifications'}
        </Button>
        {(progress < 100 || !allRequiredCertsAdded()) && (
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">
              {!allRequiredCertsAdded() 
                ? `Please add ${requiredCerts.length - getRequiredCertsAddedCount()} more required certifications before submitting` 
                : 'Please complete all required information before submitting'}
            </Text>
          </div>
        )}
      </div>
    </Card>
  ), [
    selectedCerts, 
    certificationTypes, 
    progress, 
    isSubmitting, 
    allRequiredCertsAdded, 
    getRequiredCertsAddedCount,
    requiredCerts.length,
    editCertification,
    isCertComplete,
    handleSubmit,
    handleRemoveCertification,
    isWorkingWithChildrenCheckType,
    formatFieldLabel
  ]);

 


  const addCustomDegree = () => {
    if (customDegreeInput.trim() && !customDegrees.includes(customDegreeInput.trim())) {
      const newDegree = customDegreeInput.trim();
      setCustomDegrees([...customDegrees, newDegree]);
      
      // Auto-select the newly added degree
      const currentValues = certForm.getFieldValue('degree') || [];
      certForm.setFieldsValue({
        degree: [...currentValues, newDegree]
      });
      
      setCustomDegreeInput('');
    }
  };
  
  const renderEducationFields = (certType, certIndex) => {
    if (!certType.isEducation) return null;
    const degreeOptions = certType.educationSetting?.degreeOptions || [];
    if (degreeOptions.length === 0) {
      console.warn(`No degree options found for education certification: ${certType.name}`);
      return null;
    }
  
    const allDegreeOptions = [...degreeOptions, ...customDegrees];
  
    return (
      <Form.Item
        label="Degree"
        name="degree"
        rules={[{ required: true, message: 'Please select at least one degree' }]}
        tooltip="Select your qualification(s) from the list of accepted degrees"
      >
        <Select
          placeholder="Select your degree(s)"
          showSearch
          mode="multiple"
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          dropdownRender={(menu) => (
            <div>
              {menu}
              <Divider style={{ margin: '8px 0' }} />
              <div
                style={{
                  padding: 12,
                  background: '#f6f8fa',
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <Input
                  placeholder="Enter custom degree"
                  value={customDegreeInput}
                  onChange={(e) => setCustomDegreeInput(e.target.value)}
                  onPressEnter={addCustomDegree}
                  style={{
                    marginBottom: 0,
                    borderRadius: 6,
                  }}
                  allowClear
                  maxLength={50}
                />
                <Button
                  type="primary"
                  onClick={addCustomDegree}
                  style={{
                    width: '100%',
                    borderRadius: 6,
                    fontWeight: 500,
                    letterSpacing: 0.5,
                  }}
                  size="middle"
                  icon={<PlusOutlined />}
                  disabled={
                    !customDegreeInput.trim() ||
                    allDegreeOptions.includes(customDegreeInput.trim())
                  }
                >
                  Add Custom Degree
                </Button>
                {customDegreeInput.trim() && allDegreeOptions.includes(customDegreeInput.trim()) && (
                  <Text type="danger" style={{ fontSize: 12 }}>
                    This degree is already in the list.
                  </Text>
                )}
              </div>
            </div>
          )}
        >
          {allDegreeOptions.map((degree) => (
            <Select.Option key={degree} value={degree}>
              {degree}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    );
  };


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
    // Handler to update form validity
    const handleFieldsChange = (_, allFields) => {
      const hasErrors = allFields.some(field => field.errors.length > 0);
      setIsFormValid(!hasErrors);
    };
    // For WWCC, bind Upload to wwccDraft
    const uploadFileList = isWWCC ? (wwccDraft?.documents || []) : (cert.documents || []);
    const uploadDisabled = isUploading[currentCertIndex] || (isWWCC && isUploading['wwcc']);
    return (
      <Drawer
        title={
          <Space>
            <span>{cert.certTypeName || certType?.name || 'Certification'} </span>

            {!isWorkingWithChildrenCheck(cert) && <p style={{color:'red'}}>*</p>}
          </Space>
        }
        width={600}
        open={certDetailsVisible}
        onClose={handleDrawerClose}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={handleDrawerClose} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" onClick={() => certForm.submit()} 
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
          onFinish={updateCertification}
          initialValues={{
            ...cert,
            issuedDate: cert.issuedDate ? dayjs(cert.issuedDate) : null,
            expiryDate: cert.expiryDate ? dayjs(cert.expiryDate) : null,
            degree: Array.isArray(cert.degree) ? cert.degree : (cert.degree ? [cert.degree] : [])
          }}
          onFieldsChange={handleFieldsChange}
        >
          {renderEducationFields(certType, currentCertIndex)}
          {certType.requiredFields.map(field => {
            if (field === 'degree') return null; // Skip degree as it's handled separately
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
                    <Option value="NSW">New South Wales</Option>
                    <Option value="VIC">Victoria</Option>
                    <Option value="QLD">Queensland</Option>
                    <Option value="WA">Western Australia</Option>
                    <Option value="SA">South Australia</Option>
                    <Option value="TAS">Tasmania</Option>
                    <Option value="ACT">Australian Capital Territory</Option>
                    <Option value="NT">Northern Territory</Option>
                  </Select>
                ) : field === 'subclass' ? (
                  <Select
                    mode="tags"
                    placeholder="Select or enter visa subclass"
                    tokenSeparators={[',']}
                    defaultValue={cert[field] ? [cert[field]] : []}
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
          {certType.documentRequired && (
            <Form.Item 
              label={
                <span>
                  Documents <span style={{ fontWeight: 'normal', color: '#888', fontSize: 13 }}>
                    ({uploadFileList.length}/2 uploaded)
                  </span>
                </span>
              }
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
                onRemove={(file) => {
                  let newUploadFileList;
                  if (isWWCC) {
                    newUploadFileList = (wwccDraft?.documents || []).filter(d => d.uid !== file.uid);
                    setWwccDraft(prev => ({
                      ...prev,
                      documents: newUploadFileList
                    }));
                  } else {
                    const docIndex = cert.documents.findIndex(d => d.uid === file.uid);
                    if (docIndex >= 0) {
                      removeCertificationDocument(currentCertIndex, docIndex);
                      // Sync local state with store so UI updates
                      const updatedCerts = useOnboardingStore.getState().certifications;
                      setSelectedCerts(updatedCerts);
                    }
                    newUploadFileList = cert.documents.filter(d => d.uid !== file.uid);
                  }
                  // Update form value for documents after every upload/remove
                  certForm.setFieldsValue({ documents: newUploadFileList });
                }}
                beforeUpload={(file, fileList) => {
                  // Calculate total files after upload
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
                  toast.loading(`Uploading ${fileList.length} document(s)...`);
                  handleDocumentUpload(fileList, isWWCC ? 'wwcc' : currentCertIndex, isWWCC)
                    .then(() => {
                      toast.dismiss();
                      // After upload, update form value for documents
                      let newUploadFileList;
                      if (isWWCC) {
                        newUploadFileList = (wwccDraft?.documents || []).concat([]); // force new array
                      } else {
                        newUploadFileList = (cert.documents || []).concat([]);
                      }
                      certForm.setFieldsValue({ documents: newUploadFileList });
                    })
                    .catch(() => toast.dismiss());
                  return false; // Prevent default upload
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
                  if (doc) handleDocumentPreview(doc);
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
    isUploading,
    requiredCerts,
    handleDrawerClose,
    pendingCertTypeId,
    renderEducationFields,
    setIsFormValid,
    wwccDraft,
    removeCertificationDocument
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

  // Function to handle document preview with tracking
  const handleDocumentPreview = useCallback((document) => {
    setPreviewDocument(document);
  }, []);

  // Function to handle document deletion from preview with tracking
  const handleDocumentDeleteFromPreview = useCallback(() => {
    if (previewDocument) {
      const certIndex = selectedCerts.findIndex(cert => 
        cert.documents?.some(doc => doc.url === previewDocument.url)
      );
      if (certIndex >= 0) {
        const docIndex = selectedCerts[certIndex].documents.findIndex(
          doc => doc.url === previewDocument.url
        );
        if (docIndex >= 0) {
          const publicId = selectedCerts[certIndex].documents[docIndex].publicId;
          
          // Remove from localStorage tracking
          if (publicId) {
            DocumentTrackingService.removeTrackedDocument(publicId);
          }
          
          handleRemoveDocument(certIndex, docIndex);
        }
      }
      setPreviewDocument(null);
    }
  }, [previewDocument, selectedCerts, handleRemoveDocument]);

  // Function to get tracking statistics
  const getDocumentTrackingStats = useCallback(() => {
    return DocumentTrackingService.getTrackingStats();
  }, []);

  // Utility function to display tracking information (for debugging)
  const displayTrackingInfo = useCallback(() => {
    const stats = DocumentTrackingService.getTrackingStats();
    const trackedDocs = DocumentTrackingService.getTrackedDocuments();
    
    console.log('=== Document Tracking Information ===');
    console.log('Total tracked public IDs:', stats.totalTracked);
    console.log('Public IDs:', stats.publicIds);
    console.log('All tracked documents:', trackedDocs);
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
    const trackedDocs = DocumentTrackingService.getTrackedDocuments();
    const dataStr = JSON.stringify(trackedDocs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `document-tracking-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    console.log('Document tracking data exported');
  }, []);

  // Function to manually save document tracking (for testing/development)
  const manuallySaveDocumentTracking = useCallback(async () => {
    try {
      const stats = DocumentTrackingService.getTrackingStats();
      if (stats.totalTracked === 0) {
        toast.error('No documents to save. Please upload some documents first.');
        return;
      }

      toast.loading('Saving document tracking...');
      const result = await saveDocumentTrackingToDatabase(stats.publicIds);
      toast.dismiss();
      
      if (result.success) {
        toast.success('Document tracking saved successfully!');
        // Clear localStorage after successful save
        DocumentTrackingService.clearAllTrackedDocuments();
        console.log('Document tracking saved and localStorage cleared');
      } else {
        toast.error('Failed to save document tracking');
      }
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
      const result = await saveDocumentTrackingToDatabase(stats.publicIds);
      toast.dismiss();
      toast.success('Document tracking API test successful!');
      console.log('API test result:', result);
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
      certForm.validateFields().catch(() => {}); // Show errors for missing fields
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
      {/* Development Debug Section - Remove in production */}
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
              Tracked: {getDocumentTrackingStats().totalTracked} documents
            </Text>
          </Space>
        </Card>
      )}
      
      {/* <div style={{ marginBottom: 32,display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center' }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Certification Manager
        </Title>
        <Text type="secondary">
          {hasExistingCertifications 
            ? 'Review and update your existing certifications or add new ones as needed.'
            : 'Complete your profile by adding the required certifications based on your nationality and residency status.'}
        </Text>
      </div> */}
      
      <Steps current={currentStep} style={{ marginBottom: 48,marginTop:40,padding:10 }}>
        {steps.map((item) => (
          <Step 
            key={item.title} 
            title={item.title} 
            icon={item.icon}
          />
        ))}
      </Steps>
      
      <div className="steps-content" style={{ minHeight: '60vh' }}>
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

export default CertificateSecond;