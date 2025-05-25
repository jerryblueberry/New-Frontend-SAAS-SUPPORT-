import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  Collapse,
  Badge,
  Tabs,
  Radio,
  Row,
  Col,
  Image
} from 'antd';
import { 
  PlusOutlined, 
  UploadOutlined, 
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  QuestionCircleOutlined,
  FileDoneOutlined,
  IdcardOutlined,
  SolutionOutlined,
  FileTextOutlined,
  CarOutlined,
  MedicineBoxOutlined,
  BankOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import debounce from 'lodash/debounce';
import api from '../../api/axios';
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Option } = Select;
const { Panel } = Collapse;
const { TabPane } = Tabs;

// API configuration
const API_CONFIG = {
  BASE_URL:  'http://localhost:8000/api/v1',
  ENDPOINTS: {
    CERTIFICATION_TYPES: '/certification/worker',
    SUBMIT_CERTIFICATIONS: '/onboarding/step/certifications'
  },
  TIMEOUT: 30000,
  RETRIES: 2,
  
};

// Cache for API responses
const apiCache = new Map();

// Helper functions
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

const CertificationManager = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [certificationTypes, setCertificationTypes] = useState([]);
  const [nationality, setNationality] = useState('');
  const [residencyStatus, setResidencyStatus] = useState('');
  const [selectedCerts, setSelectedCerts] = useState([]);
  const [currentCertIndex, setCurrentCertIndex] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [certDetailsVisible, setCertDetailsVisible] = useState(false);
  const [requiredCerts, setRequiredCerts] = useState([]);
  const [progress, setProgress] = useState(0);
  const [certForm] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState('');
  const [activePanels, setActivePanels] = useState(['required']);
  const [activeTab, setActiveTab] = useState('required');

  // Document category icons
  const CATEGORY_ICONS = {
    'Citizenship': <IdcardOutlined />,
    'Identity': <FileTextOutlined />,
    'Visa': <GlobalOutlined />,
    'Training': <SafetyCertificateOutlined />,
    'Industry': <SafetyOutlined />,
    'License': <CarOutlined />,
    'Health': <MedicineBoxOutlined />,
    'Financial': <BankOutlined />
  };

  // Constants
  const NATIONALITIES = useMemo(() => [
    { value: 'AU', label: 'Australia', flag: '🇦🇺' },
    { value: 'NZ', label: 'New Zealand', flag: '🇳🇿' },
    { value: 'US', label: 'United States', flag: '🇺🇸' },
    { value: 'UK', label: 'United Kingdom', flag: '🇬🇧' },
    { value: 'CA', label: 'Canada', flag: '🇨🇦' },
    { value: 'IN', label: 'India', flag: '🇮🇳' },
    { value: 'CN', label: 'China', flag: '🇨🇳' },
    { value: 'JP', label: 'Japan', flag: '🇯🇵' }
  ], []);

  const RESIDENCY_STATUSES = useMemo(() => [
    { value: 'Citizen', label: 'Citizen', icon: <IdcardOutlined />, color: 'green' },
    { value: 'PermanentResident', label: 'Permanent Resident', icon: <FileDoneOutlined />, color: 'blue' },
    { value: 'TemporaryVisa', label: 'Temporary Visa', icon: <SolutionOutlined />, color: 'orange' },
    { value: 'StudentVisa', label: 'Student Visa', icon: <SolutionOutlined />, color: 'purple' },
    { value: 'Temporary Graduate Visa', label: ' Temporary Graduate Visa (Subclass 485)', icon: <SolutionOutlined />, color: 'purple' }
  ], []);

  // Memoized filtered certification types grouped by category
  const groupedCertificationTypes = useMemo(() => {
    if (!certificationTypes.length) return {};
    
    const groups = {};
    certificationTypes.forEach(cert => {
      if (!groups[cert.category]) {
        groups[cert.category] = [];
      }
      groups[cert.category].push(cert);
    });
    
    return groups;
  }, [certificationTypes]);

  // Memoized filtered certification types
  const filteredCertificationTypes = useMemo(() => {
    if (!searchQuery) return certificationTypes;
    const query = searchQuery.toLowerCase();
    return certificationTypes.filter(cert => 
      cert.name.toLowerCase().includes(query) ||
      cert.description.toLowerCase().includes(query) ||
      cert.category.toLowerCase().includes(query)
    );
  }, [certificationTypes, searchQuery]);

  // Enhanced API call with retries and caching
  const fetchWithRetry = useCallback(async (url, options = {}, retries = API_CONFIG.RETRIES) => {
    const cacheKey = JSON.stringify({ url, options });
    
    if (apiCache.has(cacheKey)) {
      return apiCache.get(cacheKey);
    }

    try {
      const response = await axios({
        url: `${API_CONFIG.BASE_URL}${url}`,
        method: options.method || 'GET',
        data: options.data,
        timeout: API_CONFIG.TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      apiCache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }, []);

  // Fetch certification types with error handling
  const fetchCertTypes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchWithRetry(API_CONFIG.ENDPOINTS.CERTIFICATION_TYPES);
      setCertificationTypes(data.data || []);
    } catch (error) {
      message.error('Failed to load certification requirements');
      console.error('Error fetching certification types:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchWithRetry]);

  // Determine required certifications based on nationality and residency
// Determine required certifications based on nationality and residency
const getCountryName = (code) => {
  const countryMap = {
    'AU': 'Australian',
    'NZ': 'New Zealand',
    'US': 'United States',
    'UK': 'United Kingdom',
    'CA': 'Canadian',
    'IN': 'Indian',
    'CN': 'Chinese',
    'JP': 'Japanese',
    // Add more countries as needed based on your NATIONALITIES array
  };
  return countryMap[code] || code;
};

// Enhanced determineRequiredCerts with better performance and error handling
const determineRequiredCerts = useCallback(() => {
  // Early return if we don't have required data
  if (!nationality || !residencyStatus || !certificationTypes.length) return [];
  
  // Use Set to track IDs and prevent duplicates more efficiently
  const requiredCertIds = new Set();
  const required = [];
  
  try {
    /** STEP 1: PRIMARY DOCUMENTS BASED ON RESIDENCY STATUS **/
    switch (residencyStatus) {
      case 'Citizen':
        // Australian Citizens
        if (nationality === 'AU') {
          certificationTypes.forEach(cert => {
            if (cert.isCitizenshipProof && cert.acceptableFor === 'Citizens' && !requiredCertIds.has(cert._id)) {
              required.push(cert);
              requiredCertIds.add(cert._id);
            }
          });
        } 
        else if(nationality !== 'NZ' && nationality !=='AU'){
          certificationTypes.forEach(cert => {
            if(cert.isCitizenshipProof && cert.acceptableFor === "Citizens" && !requiredCertIds.has(cert._id))
              required.push(cert);
              requiredCertIds.add(cert._id);
          })
        }
        // New Zealand Citizens
        else if (nationality === 'NZ') {
          certificationTypes.forEach(cert => {
            if ((cert.name === 'Special Category Visa (Subclass 444)' || 
                (cert.isCitizenshipProof && cert.acceptableFor === 'NZCitizens')) && 
                !requiredCertIds.has(cert._id)) {
              required.push(cert);
              requiredCertIds.add(cert._id);
            }
          });
        } 
       

        // Other foreign citizens
        else {
          certificationTypes.forEach(cert => {
            if (cert.isCitizenshipProof && cert.acceptableFor === 'Foreigners' && !requiredCertIds.has(cert._id)) {
              required.push(cert);
              requiredCertIds.add(cert._id);
            }
          });
        }
        break;
        
      case 'PermanentResident':
        // Define PR visa types for lookup
        const prVisaTypes = [
          'Skilled Independent Visa (Subclass 189)', 
          // 'Distinguished Talent Visa (Subclass 858)',
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
        
      // Specific visa cases
      case 'StudentVisa':
        addSpecificVisaType('Student Visa (Subclass 500)');
        break;
        
      case 'Temporary Graduate Visa':
        addSpecificVisaType('Temporary Graduate Visa (Subclass 485)');
        break;
      
      case 'WorkingHolidayVisa':
        handleWorkingHolidayVisa();
        break;
        
      case 'SkilledWorkVisa':
        addSpecificVisaType('Temporary Skill Shortage Visa (Subclass 482)');
        break;
        
      case 'PartnerVisa':
        addSpecificVisaType('Partner Visa (Subclass 820/801)');
        break;
        
      case 'BridgingVisa':
        addSpecificVisaType('Bridging Visa');
        break;
        
      // Default case for other visa types
      case 'TemporaryResident':
      case 'WorkVisa':
      case 'Other':
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
        break;
    }

    /** STEP 2: IDENTITY DOCUMENTS **/
    if (nationality && nationality !== 'AU') {
      // Foreign nationals need passport and other ID
      const passportName = `${getCountryName(nationality)} Passport`;
      
      certificationTypes.forEach(cert => {
        if (cert.category === 'Identity' && 
            (cert.acceptableFor === 'AllResidents' || 
             cert.acceptableFor === 'Foreigners' || 
             cert.name === passportName) && 
            !requiredCertIds.has(cert._id)) {
          required.push(cert);
          requiredCertIds.add(cert._id);
        }
      });
    } else {
      // Australian citizens/residents
      certificationTypes.forEach(cert => {
        if (cert.category === 'Identity' && 
            cert.acceptableFor === 'AllResidents' && 
            !requiredCertIds.has(cert._id)) {
          required.push(cert);
          requiredCertIds.add(cert._id);
        }
      });
    }
    
    /** STEP 3-4: PROFESSIONAL AND TRAINING CERTIFICATIONS **/
    certificationTypes.forEach(cert => {
      if (((cert.category === 'Professional' || cert.category === 'Training') && 
           cert.acceptableFor === 'AllResidents') && 
          !requiredCertIds.has(cert._id)) {
        required.push(cert);
        requiredCertIds.add(cert._id);
      }
    });
    
    /** STEP 5: COUNTRY-SPECIFIC INDUSTRY REQUIREMENTS **/
    // For Australia
    if (nationality === 'AU' || (residencyStatus === 'PermanentResident' && ['AU', 'NZ'].includes(nationality))) {
      certificationTypes.forEach(cert => {
        if (cert.category === 'Industry' && 
            cert.applicableCountries?.includes('AU') && 
            !requiredCertIds.has(cert._id)) {
          required.push(cert);
          requiredCertIds.add(cert._id);
        }
      });
    }
    
    // For other countries with specific requirements
    if (nationality !== 'AU' && nationality !== 'NZ') {
      // Country-specific requirements
      certificationTypes.forEach(cert => {
        if ((cert.category === 'Industry' && cert.applicableCountries?.includes(nationality)) || 
            (cert.category === 'Background Check' && cert.acceptableFor === 'Foreigners') &&
            !requiredCertIds.has(cert._id)) {
          required.push(cert);
          requiredCertIds.add(cert._id);
        }
      });
    }
    
    return required;
  } catch (error) {
    console.error('Error determining required certifications:', error);
    return [];
  }
  
  // Helper function to add a specific visa type
  function addSpecificVisaType(visaName) {
    certificationTypes.forEach(cert => {
      if (cert.name === visaName && !requiredCertIds.has(cert._id)) {
        required.push(cert);
        requiredCertIds.add(cert._id);
      }
    });
  }
  
  // Helper function specifically for Working Holiday visa logic
  function handleWorkingHolidayVisa() {
    // Find the visa definitions
    const visa417 = certificationTypes.find(t => t.name === 'Working Holiday Visa (Subclass 417)');
    const visa462 = certificationTypes.find(t => t.name === 'Work and Holiday Visa (Subclass 462)');
    
    // Get country eligibility lists with null safety
    const workingHolidayCountries = visa417?.visaSettings?.allowedCountries || [];
    const workAndHolidayCountries = visa462?.visaSettings?.allowedCountries || [];
    
    // Check eligibility and add appropriate visa
    if (workingHolidayCountries.includes(nationality)) {
      addSpecificVisaType('Working Holiday Visa (Subclass 417)');
    } else if (workAndHolidayCountries.includes(nationality)) {
      addSpecificVisaType('Work and Holiday Visa (Subclass 462)');
    } else {
      // If nationality not eligible for either, show both as options with a warning
      certificationTypes.forEach(cert => {
        if ((cert.name === 'Working Holiday Visa (Subclass 417)' || 
             cert.name === 'Work and Holiday Visa (Subclass 462)') && 
            !requiredCertIds.has(cert._id)) {
          required.push(cert);
          requiredCertIds.add(cert._id);
        }
      });
    }
  }
}, [nationality, residencyStatus, certificationTypes]);
  // Calculate completion progress
  const calculateProgress = useCallback(() => {
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
  }, [selectedCerts, certificationTypes]);

  // Effect for initial data loading
  useEffect(() => {
    fetchCertTypes();
  }, [fetchCertTypes]);

  // Effect for required certifications
  useEffect(() => {
    setRequiredCerts(determineRequiredCerts());
  }, [determineRequiredCerts]);

  // Effect for progress calculation
  useEffect(() => {
    setProgress(calculateProgress());
  }, [calculateProgress]);

  // Debounced search handler
  const handleSearch = debounce((value) => {
    setSearchQuery(value);
  }, 300);

  // Enhanced submit handler
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Validate all certifications are complete
      if (!allRequiredCertsAdded() || progress < 100) {
        message.warning('Please complete all required certifications before submitting');
        return;
      }

      const payload = {
        nationality,
        residencyStatus,
        certifications: selectedCerts.map(cert => {
          const formattedCert = { ...cert };
          if (formattedCert.issuedDate) {
            formattedCert.issuedDate = dayjs(formattedCert.issuedDate).format('YYYY-MM-DD');
          }
          if (formattedCert.expiryDate) {
            formattedCert.expiryDate = dayjs(formattedCert.expiryDate).format('YYYY-MM-DD');
          }
          const { certTypeName, ...apiCert } = formattedCert;
          return apiCert;
        })
      };

   
  const response = await api.post('/onboarding/step/certifications', payload, { withCredentials: true });

      message.success(response.message || 'Certifications submitted successfully!');
      navigate('/profile');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                      'An error occurred while submitting your certifications';
      message.error(errorMsg);
      console.error('Submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Certification management functions
  const addCertification = useCallback((certTypeId) => {
    const certType = certificationTypes.find(t => t._id === certTypeId);

    if (!certType) return;

    setSelectedCerts(prev => [...prev, {
      certificationType: certTypeId,
      certTypeName: certType.name,
      documents: []
    }]);
    setCurrentCertIndex(selectedCerts.length);
    certForm.resetFields();
    setCertDetailsVisible(true);
  }, [certificationTypes, selectedCerts.length, certForm]);

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
    setSelectedCerts(prev => {
      const updated = [...prev];
      values.documents = updated[currentCertIndex]?.documents || [];
      
      updated[currentCertIndex] = { 
        ...updated[currentCertIndex],
        ...values,
        certTypeName: certificationTypes.find(t => t._id === updated[currentCertIndex].certificationType)?.name
      };
      
      return updated;
    });
    
    setCertDetailsVisible(false);
    message.success('Certification details updated');
  }, [currentCertIndex, certificationTypes]);

  const removeCertification = useCallback((index) => {
    const certName = selectedCerts[index].certTypeName;
    setSelectedCerts(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    
    if (currentCertIndex >= selectedCerts.length - 1) {
      setCurrentCertIndex(Math.max(0, selectedCerts.length - 2));
    }
    
    message.info(`${certName} removed`);
  }, [currentCertIndex, selectedCerts.length]);

  // Document handling
  const handleDocumentUpload = useCallback((file) => {
    if (file.size > 5 * 1024 * 1024) {
      message.error('File must be smaller than 5MB');
      return false;
    }
    
    const acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!acceptedTypes.includes(file.type)) {
      message.error('Only PDF, JPEG and PNG files are allowed');
      return false;
    }
    
    setSelectedCerts(prev => {
      const updated = [...prev];
      if (!updated[currentCertIndex].documents) {
        updated[currentCertIndex].documents = [];
      }
      
      updated[currentCertIndex].documents = [
        ...updated[currentCertIndex].documents,
        {
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
          size: file.size,
          file
        }
      ];
      return updated;
    });
    
    message.success(`${file.name} uploaded successfully`);
    return false;
  }, [currentCertIndex]);

  const removeDocument = useCallback((docIndex) => {
    setSelectedCerts(prev => {
      const updated = [...prev];
      const docName = updated[currentCertIndex].documents[docIndex].name;
      updated[currentCertIndex].documents.splice(docIndex, 1);
      message.info(`${docName} removed`);
      return updated;
    });
  }, [currentCertIndex]);

  // Utility functions
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

  // Step validation
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

  // Step components
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
              setNationality(value);
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
              setResidencyStatus(value);
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
  ), [nationality, residencyStatus, formErrors, NATIONALITIES, RESIDENCY_STATUSES]);

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
                {requiredCerts.length > 0 ? (
                  <List
                    dataSource={requiredCerts}
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

              {/* {Object.entries(groupedCertificationTypes).map(([category, certs]) => (
                <TabPane 
                  tab={
                    <span>
                      {CATEGORY_ICONS[category] || <FileTextOutlined />}
                      {category}
                    </span>
                  } 
                  key={category}
                >
                  <List
                    dataSource={certs.filter(cert => 
                      !requiredCerts.some(req => req._id === cert._id)
                    )}
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
                                type="dashed"
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
                                  backgroundColor: isAdded ? '#52c41a' : '#d9d9d9',
                                  color: isAdded ? '#fff' : '#000'
                                }}
                              />
                            }
                            title={<Text strong>{cert.name}</Text>}
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
                </TabPane>
              ))} */}
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
                          onClick={() => removeCertification(index)}
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
    nationality, 
    residencyStatus,
    activeTab,
    filteredCertificationTypes,
    groupedCertificationTypes,
    allRequiredCertsAdded,
    getRequiredCertsAddedCount,
    isCertComplete,
    addCertification,
    editCertification,
    removeCertification,
    CATEGORY_ICONS
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
                              >
                                {doc.name}
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
          loading={submitting}
          disabled={selectedCerts.length === 0 || progress < 100 || !allRequiredCertsAdded()}
          style={{ minWidth: 200, height: 48 }}
        >
          {submitting ? 'Submitting...' : 'Submit Certifications'}
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
    submitting, 
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
                beforeUpload={handleDocumentUpload}
                accept=".pdf,.jpg,.jpeg,.png"
                fileList={cert.documents?.map((doc, i) => ({
                  uid: i,
                  name: doc.name,
                  status: 'done',
                  url: doc.url
                })) || []}
                onRemove={(file) => {
                  const index = cert.documents.findIndex(doc => doc.name === file.name);
                  if (index > -1) {
                    removeDocument(index);
                  }
                }}
                multiple={false}
                listType="picture"
              >
                <Button icon={<UploadOutlined />}>Upload Document</Button>
              </Upload>
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                Accepted formats: PDF, JPG, PNG (Max 5MB)
              </Text>
            </Form.Item>
          )}

          {certType.visaSettings?.requiresConditions && (
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
          )}
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
    removeDocument,
    NATIONALITIES,
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

  return (
    <div style={{ padding: '24px 16px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          Certification Manager
        </Title>
        <Text type="secondary">
          Complete your profile by adding the required certifications based on your nationality and residency status.
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
    </div>
  );
};

export default CertificationManager;