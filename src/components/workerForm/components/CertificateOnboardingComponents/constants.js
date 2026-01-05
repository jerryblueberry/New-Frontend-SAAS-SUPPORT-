/**
 * Constants for certification components
 */
import React from 'react';
import {
  IdcardOutlined,
  FileDoneOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
  CarOutlined,
  MedicineBoxOutlined,
  BankOutlined,
  ReadOutlined,
  SolutionOutlined,
  ClockCircleOutlined,
  FileOutlined
} from '@ant-design/icons';

// Category icon components mapping
export const CATEGORY_ICONS = {
  'Citizenship': IdcardOutlined,
  'Identity': FileDoneOutlined,
  'Visa': GlobalOutlined,
  'Training': SafetyCertificateOutlined,
  'Industry': SafetyOutlined,
  'License': CarOutlined,
  'Health': MedicineBoxOutlined,
  'Financial': BankOutlined
};

/**
 * Get category icon component
 * @param {string} category - Category name
 * @param {React.Component} defaultIcon - Default icon component if category not found
 * @returns {React.Component} Icon component
 */
export const getCategoryIcon = (category, defaultIcon = SafetyCertificateOutlined) => {
  const IconComponent = CATEGORY_ICONS[category] || defaultIcon;
  return React.createElement(IconComponent);
};

/**
 * Residency status options
 * Note: icon stores the component reference, not JSX element
 * SaaS-level: Includes descriptions for better UX and clarity
 */
export const RESIDENCY_STATUSES = [
  { 
    value: 'Citizen', 
    label: 'Australian Citizen', 
    icon: IdcardOutlined, 
    color: 'green',
    description: 'Standard certification flow'
  },
  { 
    value: 'NZCitizen', 
    label: 'New Zealand Citizen', 
    icon: IdcardOutlined, 
    color: 'teal',
    description: 'Special Category Visa holder'
  },
  { 
    value: 'PermanentResident', 
    label: 'Permanent Resident', 
    icon: FileDoneOutlined, 
    color: 'blue',
    description: 'Additional residency verification required'
  },
  { 
    value: 'StudentVisa', 
    label: 'Student Visa (Subclass 500)', 
    icon: ReadOutlined, 
    color: 'purple',
    description: 'Student visa documentation required'
  },
  { 
    value: 'TemporaryGraduateVisa', 
    label: 'Temporary Graduate Visa (485)', 
    icon: SolutionOutlined, 
    color: 'geekblue',
    description: 'Graduate visa documentation required'
  },
  { 
    value: 'TSS', 
    label: 'Temporary Skill Shortage (482)', 
    icon: FileOutlined, 
    color: 'orange',
    description: 'Work visa documentation required'
  },
  { 
    value: 'BridgingVisa', 
    label: 'Bridging Visa', 
    icon: ClockCircleOutlined, 
    color: 'gold',
    description: 'Bridging visa documentation required'
  },
  { 
    value: 'OtherTemporaryVisa', 
    label: 'Other Temporary Visa', 
    icon: FileOutlined, 
    color: 'cyan',
    description: 'Expanded compliance checks required'
  }
];

/**
 * Predefined insurance types
 */
export const PREDEFINED_INSURANCE_TYPES = [
  "Comprehensive",
  "Third Party Property",
  "CTP (Compulsory Third Party)",
];

/**
 * Australian states
 */
export const AUSTRALIAN_STATES = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'SA', label: 'South Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'ACT', label: 'Australian Capital Territory' },
  { value: 'NT', label: 'Northern Territory' }
];

