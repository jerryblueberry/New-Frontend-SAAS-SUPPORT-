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
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import debounce from 'lodash/debounce';
import useOnboardingStore, { useCertificationsMutation } from '../../stores/useOnboardingStore';
import { useOnboardingQuery } from '../../stores/useOnboardingStore';
import DocumentPreview from '../../components/workerForm/Modals/DocumentPreview';
import { toast } from 'react-hot-toast';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Option } = Select;
const { TabPane } = Tabs;
const { confirm } = Modal;

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

const RESIDENCY_STATUSES = [
  { value: 'Citizen', label: 'Citizen', icon: <IdcardOutlined />, color: 'green' },
  { value: 'PermanentResident', label: 'Permanent Resident', icon: <FileDoneOutlined />, color: 'blue' },
  { value: 'TemporaryVisa', label: 'Temporary Visa', icon: <SolutionOutlined />, color: 'orange' },
  { value: 'StudentVisa', label: 'Student Visa', icon: <SolutionOutlined />, color: 'purple' },
  { value: 'Temporary Graduate Visa', label: 'Temporary Graduate Visa (Subclass 485)', icon: <SolutionOutlined />, color: 'purple' }
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

// Helper function to normalize certification type (handles both object and string formats)
const normalizeCertificationType = (certType) => {
  if (!certType) return null;
  if (typeof certType === 'object' && certType._id) {
    return {
      id: certType._id,
      name: certType.name || certType.certTypeName || 'Unknown'
    };
  }
  return {
    id: certType,
    name: 'Unknown' // We'll fill this in later when we have the full certification types
  };
};

const CertificateSecond = () => {
  const navigate = useNavigate();
  const {
    currentStep: onboardingStep,
    nextStep: onboardingNextStep,
    prevStep: onboardingPrevStep,
    certifications,
    nationality,
    residencyStatus,
    updateCertificationAtIndex,
    removeCertification,
    removeCertificationDocument,
    updateNationality,
    updateResidencyStatus,
    updateCertifications
  } = useOnboardingStore();
  
  const { data: onboardingData, isLoading: isLoadingOnboardingData, isError: isOnboardingError } = useOnboardingQuery();
  const { mutate: submitCertifications, isLoading: isSubmitting } = useCertificationsMutation();
  
  // Local state
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
  
  const fileInputRefs = useRef([]);

  // Initialize with store data from backend
  useEffect(() => {
    if (!isLoadingOnboardingData && onboardingData?.data?.profile) {
      const profile = onboardingData.data.profile;
      const initialCerts = profile.certifications || [];
      
      // Normalize the certifications data to ensure consistent format
      const normalizedCerts = initialCerts.map(cert => ({
        ...cert,
        certificationType: normalizeCertificationType(cert.certificationType).id,
        certTypeName: normalizeCertificationType(cert.certificationType).name
      }));
      
      // Check if user has existing certifications
      if (normalizedCerts.length > 0) {
        setHasExistingCertifications(true);
        setSelectedCerts(normalizedCerts);
        updateCertifications(normalizedCerts);
        
        // Show success message if all required certs are already added
        if (profile.nationality && profile.residencyStatus) {
          updateNationality(profile.nationality);
          updateResidencyStatus(profile.residencyStatus);
        }
      } else {
        setHasExistingCertifications(false);
      }
    }
  }, [onboardingData, isLoadingOnboardingData, updateCertifications, updateNationality, updateResidencyStatus]);

  // Fetch certification types from API
  useEffect(() => {
    const fetchCertTypes = async () => {
      try {
        setLoading(true);
        // const response = await fetch('https://backend-for-the-saas-short-job-finder.vercel.app/api/v1/certification/worker');
        const response = await fetch('http://localhost:8000/api/v1/certification/worker');
        if (response.ok) {
          const data = await response.json();
          setCertificationTypes(data.data || []);
          
          // Update certTypeName for existing certifications if needed
          setSelectedCerts(prevCerts => 
            prevCerts.map(cert => {
              const certType = data.data.find(t => t._id === cert.certificationType);
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

    fetchCertTypes();
  }, []);

  // Determine required certifications based on nationality and residency status
  useEffect(() => {
    if (!nationality || !residencyStatus || !certificationTypes.length) {
      setRequiredCerts([]);
      return;
    }

    const required = [];
    const requiredCertIds = new Set();

    // Residency-based requirements
    switch (residencyStatus) {
      case 'Citizen':
        if (nationality === 'AU') {
          certificationTypes.forEach(cert => {
            if (cert.isCitizenshipProof && cert.acceptableFor === 'Citizens' && !requiredCertIds.has(cert._id)) {
              required.push(cert);
              requiredCertIds.add(cert._id);
            }
          });
        } else if (nationality === 'NZ') {
          certificationTypes.forEach(cert => {
            if ((cert.name === 'Special Category Visa (Subclass 444)' || 
                (cert.isCitizenshipProof && cert.acceptableFor === 'NZCitizens')) && 
                !requiredCertIds.has(cert._id)) {
              required.push(cert);
              requiredCertIds.add(cert._id);
            }
          });
        } else {
          certificationTypes.forEach(cert => {
            if (cert.isCitizenshipProof && cert.acceptableFor === 'Foreigners' && !requiredCertIds.has(cert._id)) {
              required.push(cert);
              requiredCertIds.add(cert._id);
            }
          });
        }
        break;
        
      case 'PermanentResident':
        const prVisaTypes = [
          'Skilled Independent Visa (Subclass 189)', 
          'Resident Return Visa (Subclass 155/157)'
        ];
        
        certificationTypes.forEach(cert => {
          if ((prVisaTypes.includes(cert.name) || 
              (cert.acceptableFor === 'PermanentResidents' && !cert.isCitizenshipProof)) && 
              !requiredCertIds.has(cert._id)) {
            required.push(cert);
            requiredCertIds.add(cert._id);
          }
        });
        break;
        
      case 'StudentVisa':
        addSpecificVisaType('Student Visa (Subclass 500)');
        break;
        
      case 'Temporary Graduate Visa':
        addSpecificVisaType('Temporary Graduate Visa (Subclass 485)');
        break;
        
      default:
        certificationTypes.forEach(cert => {
          if (cert.isVisa && 
              (!cert.visaSettings?.allowedCountries?.length || 
               cert.visaSettings.allowedCountries.includes(nationality) ||
               cert.visaSettings.allowedCountries.includes('ALL')) && 
              !requiredCertIds.has(cert._id)) {
            required.push(cert);
            requiredCertIds.add(cert._id);
          }
        });
    }

    // Identity documents
    certificationTypes.forEach(cert => {
      if (cert.category === 'Identity' && 
          (cert.acceptableFor === 'AllResidents' || 
           cert.acceptableFor === 'Foreigners') && 
          !requiredCertIds.has(cert._id)) {
        required.push(cert);
        requiredCertIds.add(cert._id);
      }
    });
    
    // Professional and training certifications
    certificationTypes.forEach(cert => {
      if (((cert.category === 'Professional' || cert.category === 'Training') && 
           cert.acceptableFor === 'AllResidents') && 
          !requiredCertIds.has(cert._id)) {
        required.push(cert);
        requiredCertIds.add(cert._id);
      }
    });
    
    setRequiredCerts(required);
    
    function addSpecificVisaType(visaName) {
      certificationTypes.forEach(cert => {
        if (cert.name === visaName && !requiredCertIds.has(cert._id)) {
          required.push(cert);
          requiredCertIds.add(cert._id);
        }
      });
    }
  }, [nationality, residencyStatus, certificationTypes]);

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

    submitCertifications({
      certifications: certsToSubmit,
      nationality,
      residencyStatus
    }, {
      onSuccess: () => {
        message.success('Certifications submitted successfully!');
        onboardingNextStep();
        navigate('/profile');
      },
      onError: (error) => {
        message.error(error.message || 'Failed to submit certifications');
      }
    });
  };

  const addCertification = useCallback((certTypeId) => {
    const certType = certificationTypes.find(t => t._id === certTypeId);
    if (!certType) return;

    const newCert = {
      certificationType: certTypeId, // Store just the ID
      certTypeName: certType.name,
      documents: []
    };

    const updatedCerts = [...selectedCerts, newCert];
    setSelectedCerts(updatedCerts);
    updateCertifications(updatedCerts);
    setCurrentCertIndex(updatedCerts.length - 1);
    certForm.resetFields();
    setCertDetailsVisible(true);
  }, [certificationTypes, selectedCerts, updateCertifications, certForm]);

  const editCertification = useCallback((index) => {
    setCurrentCertIndex(index);
    const cert = selectedCerts[index];
    const formValues = { ...cert };
    
    if (cert.issuedDate) formValues.issuedDate = dayjs(cert.issuedDate);
    if (cert.expiryDate) formValues.expiryDate = dayjs(cert.expiryDate);
    
    certForm.setFieldsValue(formValues);
    setCertDetailsVisible(true);
  }, [selectedCerts, certForm]);

  const updateCertification = useCallback((values) => {
    const updatedCerts = [...selectedCerts];
    
    // Preserve existing documents if they exist
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
  }, [currentCertIndex, selectedCerts, certificationTypes, updateCertifications]);

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

  const uploadToCloudinary = async (file, certIndex) => {
    if (!file) return null;
    
    try {
      setIsUploading(prev => ({ ...prev, [certIndex]: true }));
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'Certificate(Saas)');
      formData.append('folder', 'SAAS(Support Worker)');
      
      // If replacing an existing document, pass the publicId
      const existingPublicId = selectedCerts[certIndex]?.documents?.[0]?.publicId;
      if (existingPublicId) {
        formData.append('public_id', existingPublicId);
        formData.append('overwrite', 'true');
      }
      
      const cloudName = 'dgsphdhns';
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      return {
        url: data.secure_url,
        publicId: data.public_id,
        fileName: file.name,
        fileType: file.type,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    } finally {
      setIsUploading(prev => ({ ...prev, [certIndex]: false }));
    }
  };

  const handleDocumentUpload = async (file, certIndex) => {
    try {
      const result = await uploadToCloudinary(file, certIndex);
      
      const updatedCerts = [...selectedCerts];
      updatedCerts[certIndex] = { 
        ...updatedCerts[certIndex],
        documents: [result] // Replace existing document with new one
      };
      
      setSelectedCerts(updatedCerts);
      updateCertifications(updatedCerts);
      message.success(`${file.name} uploaded successfully`);
      return false;
    } catch (error) {
      message.error('Failed to upload document');
      return false;
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
      const updatedCerts = [...selectedCerts];
      const docName = updatedCerts[certIndex].documents[docIndex].fileName;
      
      updatedCerts[certIndex].documents.splice(docIndex, 1);
      
      setSelectedCerts(updatedCerts);
      updateCertifications(updatedCerts);
      message.info(`${docName} removed`);
    }
  }, [selectedCerts, updateCertifications]);

  const isCertComplete = useCallback((cert) => {
    const type = certificationTypes.find(t => t._id === cert.certificationType);
    if (!type) return false;

    const fieldsComplete = type.requiredFields.every(f => cert[f]);
    const docsComplete = !type.documentRequired || (cert.documents?.length > 0);
    
    return fieldsComplete && docsComplete;
  }, [certificationTypes]);

  const getRequiredCertsAddedCount = useCallback(() => {
    return requiredCerts.filter(req => 
      selectedCerts.some(sel => sel.certificationType === req._id)
    ).length;
  }, [requiredCerts, selectedCerts]);

  const allRequiredCertsAdded = useCallback(() => {
    return getRequiredCertsAddedCount() === requiredCerts.length;
  }, [getRequiredCertsAddedCount, requiredCerts.length]);

  const formatFieldLabel = (field) => {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const getFieldTooltip = (field) => {
    const tooltips = {
      number: 'The unique identifier on your certificate or document',
      issuedDate: 'The date when this certification was issued',
      expiryDate: 'The date when this certification will expire',
      country: 'The country that issued this certification',
      state: 'The state or territory that issued this certification',
      subclass: 'The visa subclass number',
      visaConditions: 'Any specific conditions attached to this visa'
    };
    return tooltips[field] || null;
  };

  const validateCurrentStep = useCallback(() => {
    if (currentStep === 0) {
      const errors = {};
      if (!nationality) errors.nationality = 'Please select your nationality';
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
  }, [currentStep, nationality, residencyStatus, allRequiredCertsAdded]);

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
        <Form.Item 
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
        </Form.Item>
        
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
            onChange={(value) => {
              updateResidencyStatus(value);
              setFormErrors(prev => ({ ...prev, residencyStatus: undefined }));
            }}
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
      
      {nationality && residencyStatus && (
        <Alert 
          message="Profile Information Saved" 
          description="Your nationality and residency information has been saved. Click Next to continue to certification selection."
          type="success" 
          showIcon 
          style={{ marginTop: 24, maxWidth: 600 }}
        />
      )}
    </Card>
  ), [nationality, residencyStatus, formErrors, updateNationality, updateResidencyStatus]);

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
          
          <Card 
            title={<Title level={4} style={{ margin: 0 }}>Available Certifications</Title>}
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
                      const isAdded = selectedCerts.some(c => c.certificationType === cert._id);
                      return (
                        <List.Item
                          style={{ padding: '12px 24px' }}
                          actions={[
                            isAdded ? (
                              <Button 
                                icon={<CheckCircleOutlined />} 
                                type="text" 
                                style={{ color: '#52c41a' }}
                                disabled
                              >
                                Added
                              </Button>
                            ) : (
                              <Button 
                                type="primary"
                                icon={<PlusOutlined />} 
                                onClick={() => addCertification(cert._id)}
                                size="small"
                              >
                                Add
                              </Button>
                            )
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar 
                                icon={cert.isVisa ? <GlobalOutlined /> : CATEGORY_ICONS[cert.category] || <SafetyCertificateOutlined />} 
                                style={{ 
                                  backgroundColor: isAdded ? '#52c41a' : '#1890ff',
                                  color: '#fff'
                                }}
                              />
                            }
                            title={
                              <Space>
                                <Text strong>{cert.name}</Text>
                                <Tag color="red">Required</Tag>
                              </Space>
                            }
                            description={
                              <div>
                                <Paragraph>{cert.description}</Paragraph>
                                <Space wrap>
                                  {cert.category && (
                                    <Tag icon={CATEGORY_ICONS[cert.category]} color="blue">
                                      {cert.category}
                                    </Tag>
                                  )}
                                  {cert.validityPeriod && <Tag color="purple">Valid for {cert.validityPeriod}</Tag>}
                                  {cert.isVisa && <Tag color="orange">Visa</Tag>}
                                  {cert.documentRequired && <Tag color="cyan">Document Required</Tag>}
                                </Space>
                              </div>
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

          <Card 
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
            {selectedCerts.length > 0 ? (
              <List
                dataSource={selectedCerts}
                renderItem={(cert, index) => {
                  const type = certificationTypes.find(t => t._id === cert.certificationType);
                  const isComplete = isCertComplete(cert);
                  const isRequired = requiredCerts.some(rc => rc._id === cert.certificationType);
                  
                  return (
                    <List.Item
                      style={{ padding: '12px 24px' }}
                      actions={[
                        <Button 
                          icon={<EditOutlined />} 
                          onClick={() => editCertification(index)}
                          size="small"
                        >
                          Edit
                        </Button>,
                        <Button 
                          icon={<DeleteOutlined />} 
                          danger 
                          onClick={() => handleRemoveCertification(index)}
                          disabled={isRequired && requiredCerts.length === 1}
                          size="small"
                        >
                          Remove
                        </Button>
                      ]}
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
                          <Space>
                            <Text strong>{cert.certTypeName}</Text>
                            {isRequired && <Tag color="red">Required</Tag>}
                            {isComplete ? (
                              <Tag icon={<CheckCircleOutlined />} color="success">
                                Complete
                              </Tag>
                            ) : (
                              <Tag icon={<WarningOutlined />} color="warning">
                                Incomplete
                              </Tag>
                            )}
                          </Space>
                        }
                        description={
                          !isComplete && (
                            <div style={{ marginTop: 4 }}>
                              <Text type="secondary">
                                <Space>
                                  <WarningOutlined />
                                  Missing: 
                                  {type?.requiredFields
                                    .filter(field => !cert[field])
                                    .map(field => formatFieldLabel(field))
                                    .join(', ')} 
                                  {type?.documentRequired && !cert.documents?.length ? 
                                    (type?.requiredFields.some(field => !cert[field]) ? ', documents' : 'documents') : ''}
                                </Space>
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
            
            {!allRequiredCertsAdded() && selectedCerts.length > 0 && (
              <Alert 
                message="Required Certifications Missing" 
                description={
                  <div>
                    <p>You still need to add {requiredCerts.length - getRequiredCertsAddedCount()} required certifications.</p>
                    <Button 
                      type="link" 
                      onClick={() => setActiveTab('required')}
                      style={{ padding: 0 }}
                    >
                      View required certifications
                    </Button>
                  </div>
                } 
                type="warning" 
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </Card>
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
                    {isRequired && <Tag color="red">Required</Tag>}
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
                        {cert[field] ? (
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
                                  setPreviewDocument(doc);
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
    handleSubmit
  ]);

  const renderCertificationForm = useMemo(() => {
    if (!certDetailsVisible || currentCertIndex < 0 || currentCertIndex >= selectedCerts.length) {
      return null;
    }

    const cert = selectedCerts[currentCertIndex];
    const certType = certificationTypes.find(t => t._id === cert.certificationType);
    
    if (!certType) return null;

    return (
      <Drawer
        title={
          <Space>
            <span>{cert.certTypeName || 'Certification'} Details</span>
            {requiredCerts.some(rc => rc._id === cert.certificationType) && <Tag color="red">Required</Tag>}
          </Space>
        }
        width={600}
        open={certDetailsVisible}
        onClose={() => setCertDetailsVisible(false)}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setCertDetailsVisible(false)} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" onClick={() => certForm.submit()}>
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
        >
          {certType.requiredFields.map(field => {
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
                ) : field === 'subclass' && certType.visaSettings?.subclassOptions?.length ? (
                  <Select placeholder="Select visa subclass">
                    {certType.visaSettings.subclassOptions.map(option => (
                      <Option key={option} value={option}>{option}</Option>
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
              label="Documents"
              required
              tooltip="Upload supporting documents in PDF, JPEG or PNG format (max 5MB)"
              rules={[{ 
                required: true, 
                validator: () => {
                  if (!cert.documents?.length) {
                    return Promise.reject('Please upload at least one document');
                  }
                  return Promise.resolve();
                }
              }]}
            >
              <Upload
                accept=".pdf,.jpg,.jpeg,.png"
                fileList={cert.documents?.map((doc, i) => ({
                  uid: i,
                  name: doc.fileName || doc.name,
                  status: 'done',
                  url: doc.url
                })) || []}
                onRemove={() => {
                  handleRemoveDocument(currentCertIndex, 0);
                }}
                beforeUpload={(file) => {
                  handleDocumentUpload(file, currentCertIndex);
                  return false; // Prevent default upload
                }}
                multiple={false}
                listType="picture"
              >
                <Button icon={<UploadOutlined />} loading={isUploading[currentCertIndex]}>
                  {isUploading[currentCertIndex] ? 'Uploading...' : 'Upload Document'}
                </Button>
              </Upload>
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                Accepted formats: PDF, JPG, PNG (Max 5MB)
              </Text>
            </Form.Item>
          )}

          {/* {certType.visaSettings?.requiresConditions && (
            <Form.Item
              name="visaConditions"
              label="Visa Conditions"
              rules={[{ required: true, message: 'Please specify any visa conditions' }]}
              tooltip="Any specific conditions attached to this visa"
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Enter any conditions specified on your visa grant notice"
              />
            </Form.Item>
          )} */}
        </Form>
      </Drawer>
    );
  }, [
    certDetailsVisible, 
    currentCertIndex, 
    selectedCerts, 
    certificationTypes, 
    certForm, 
    updateCertification, 
    handleDocumentUpload,
    handleRemoveDocument,
    isUploading,
    requiredCerts
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
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Certification Manager
        </Title>
        <Text type="secondary">
          {hasExistingCertifications 
            ? 'Review and update your existing certifications or add new ones as needed.'
            : 'Complete your profile by adding the required certifications based on your nationality and residency status.'}
        </Text>
      </div>
      
      <Steps current={currentStep} style={{ marginBottom: 48 }}>
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
              (currentStep === 0 && (!nationality || !residencyStatus)) ||
              (currentStep === 1 && !allRequiredCertsAdded())
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
        onDelete={() => {
          if (previewDocument) {
            const certIndex = selectedCerts.findIndex(cert => 
              cert.documents?.some(doc => doc.url === previewDocument.url)
            );
            if (certIndex >= 0) {
              const docIndex = selectedCerts[certIndex].documents.findIndex(
                doc => doc.url === previewDocument.url
              );
              if (docIndex >= 0) {
                handleRemoveDocument(certIndex, docIndex);
              }
            }
            setPreviewDocument(null);
          }
        }}
      />
    </div>
  );
};

export default CertificateSecond;