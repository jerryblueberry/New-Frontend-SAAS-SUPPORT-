# Quick Fixes Guide - Certificate Onboarding

## 🚀 Immediate Improvements (Copy & Paste Ready)

### 1. Remove Console Logs - Create Logger Utility

**File:** `Frontend/src/utils/logger.js`
```javascript
/**
 * Centralized logging utility
 * Automatically disabled in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (...args) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },
  
  warn: (...args) => {
    console.warn('[WARN]', ...args);
  },
  
  error: (...args) => {
    console.error('[ERROR]', ...args);
    // TODO: Send to error tracking service (e.g., Sentry)
  },
  
  group: (label, fn) => {
    if (isDevelopment) {
      console.group(label);
      fn();
      console.groupEnd();
    }
  }
};

export default logger;
```

**Usage in CertificateSecond.jsx:**
```javascript
// Replace all console.log with logger.debug
import logger from '../../utils/logger';

// Before:
console.log("Required Certrs Value", requiredCerts)

// After:
logger.debug("Required Certs Value", requiredCerts);
```

---

### 2. Extract Constants

**File:** `Frontend/src/components/workerForm/components/CertificateOnboardingComponents/constants.js`
```javascript
// Add to existing constants.js

// File Upload Constants
export const FILE_UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 2,
  ALLOWED_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  ALLOWED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png']
};

// Cloudinary Configuration
export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: 'dgsphdhns',
  UPLOAD_PRESET: 'Certificate(Saas)',
  FOLDER: 'SAAS(Support Worker)',
  API_URL: 'https://api.cloudinary.com/v1_1'
};

// Step Configuration
export const ONBOARDING_STEPS = {
  PERSONAL_INFO: 0,
  ADD_CERTIFICATIONS: 1,
  REVIEW_SUBMIT: 2
};
```

---

### 3. Add PropTypes to Components

**Example for PersonalInfoStep.jsx:**
```javascript
import PropTypes from 'prop-types';

// Add at the end of the file:
PersonalInfoStep.propTypes = {
  residencyStatus: PropTypes.string,
  formErrors: PropTypes.shape({
    residencyStatus: PropTypes.string
  }),
  onResidencyStatusChange: PropTypes.func.isRequired
};

PersonalInfoStep.defaultProps = {
  residencyStatus: null,
  formErrors: {}
};
```

---

### 4. Optimize Component with React.memo

**Example for YourCertificationListItem.jsx:**
```javascript
import React, { memo } from 'react';

const YourCertificationListItem = memo(({ cert, certType, onEdit, isComplete }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.cert._id === nextProps.cert._id &&
    prevProps.isComplete === nextProps.isComplete &&
    prevProps.cert.documents?.length === nextProps.cert.documents?.length
  );
});

YourCertificationListItem.displayName = 'YourCertificationListItem';

export default YourCertificationListItem;
```

---

### 5. Create Custom Hook for Certification Data

**File:** `Frontend/src/components/workerForm/components/CertificateOnboardingComponents/hooks/useCertificationData.js`
```javascript
import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import api from '../../../../../api/axios';
import { normalizeCertificationType } from '../utils/certificationHelpers';
import logger from '../../../../../utils/logger';

export const useCertificationData = () => {
  const [certificationTypes, setCertificationTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCertTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/certification/worker');
      
      if (response.data.success) {
        const normalizedTypes = response.data.data.map(normalizeCertificationType);
        setCertificationTypes(normalizedTypes);
        logger.debug('Certification types loaded:', normalizedTypes);
      } else {
        throw new Error('Failed to load certification requirements');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to load certification types';
      setError(errorMessage);
      message.error(errorMessage);
      logger.error('Error fetching certification types:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertTypes();
  }, [fetchCertTypes]);

  return {
    certificationTypes,
    loading,
    error,
    refetch: fetchCertTypes
  };
};
```

**Usage in CertificateSecond.jsx:**
```javascript
// Replace the fetchCertTypes logic with:
import { useCertificationData } from '../../components/workerForm/components/CertificateOnboardingComponents/hooks/useCertificationData';

const CertificateSecond = ({ initialStep = 0 }) => {
  const { certificationTypes, loading: certTypesLoading, error: certTypesError } = useCertificationData();
  
  // Remove the old fetchCertTypes function and useEffect
};
```

---

### 6. Centralized Error Handler

**File:** `Frontend/src/utils/errorHandler.js`
```javascript
import { message } from 'antd';
import logger from './logger';

/**
 * Centralized error handler
 * @param {Error} error - The error object
 * @param {Object} context - Additional context information
 * @param {string} context.action - The action that caused the error
 * @param {string} context.component - The component where error occurred
 */
export const handleError = (error, context = {}) => {
  const errorMessage = error?.message || 'An unexpected error occurred';
  const { action, component } = context;

  // Log error
  logger.error(`[${component || 'Unknown'}] ${action || 'Error'}:`, error);

  // Send to error tracking service (if available)
  if (window.Sentry) {
    window.Sentry.captureException(error, {
      tags: context
    });
  }

  // Show user-friendly message
  message.error(errorMessage);

  return errorMessage;
};

/**
 * Handle API errors specifically
 */
export const handleApiError = (error, defaultMessage = 'Request failed') => {
  const message = error?.response?.data?.message || 
                  error?.message || 
                  defaultMessage;
  
  return handleError(new Error(message), {
    action: 'API Request',
    statusCode: error?.response?.status
  });
};
```

**Usage:**
```javascript
import { handleError, handleApiError } from '../../utils/errorHandler';

try {
  // ... code
} catch (error) {
  handleError(error, { action: 'fetchCertTypes', component: 'CertificateSecond' });
  // or for API errors:
  handleApiError(error, 'Failed to load certifications');
}
```

---

### 7. Add Error Boundary

**File:** `Frontend/src/components/ErrorBoundary.jsx`
```javascript
import React from 'react';
import { Alert, Button, Card } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import logger from '../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Send to error tracking service
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: { react: errorInfo }
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card style={{ margin: 24 }}>
          <Alert
            message="Something went wrong"
            description={
              <div>
                <p>An unexpected error occurred. Please try refreshing the page.</p>
                {process.env.NODE_ENV === 'development' && (
                  <pre style={{ marginTop: 16, fontSize: 12 }}>
                    {this.state.error?.toString()}
                  </pre>
                )}
              </div>
            }
            type="error"
            showIcon
            action={
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={this.handleReset}
              >
                Try Again
              </Button>
            }
          />
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Usage in App or parent component:**
```javascript
import ErrorBoundary from './components/ErrorBoundary';

<ErrorBoundary>
  <CertificateSecond />
</ErrorBoundary>
```

---

### 8. Optimize useMemo Dependencies

**Before:**
```javascript
const renderAddCertificationsStep = useMemo(() => (
  <RenderAddCertificationsStep ... />
), [
  loading, allRequiredCertsAdded, selectedCerts, requiredCerts,
  // ... 30+ dependencies
]);
```

**After:**
```javascript
// Use React.memo on the component instead
// In renderAddCertificationsStep.jsx:
export default React.memo(RenderAddCertificationsStep);

// In CertificateSecond.jsx:
const renderAddCertificationsStep = (
  <RenderAddCertificationsStep ... />
);
```

---

### 9. Extract File Upload Logic to Custom Hook

**File:** `Frontend/src/components/workerForm/components/CertificateOnboardingComponents/hooks/useDocumentUpload.js`
```javascript
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { FILE_UPLOAD_LIMITS, CLOUDINARY_CONFIG } from '../constants';
import { DocumentTrackingService } from '../utils/documentTrackingService';
import logger from '../../../../../utils/logger';

export const useDocumentUpload = () => {
  const [isUploading, setIsUploading] = useState({});

  const uploadToCloudinary = useCallback(async (file, certIndex) => {
    if (!file) return null;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      formData.append('folder', CLOUDINARY_CONFIG.FOLDER);
      
      const response = await fetch(
        `${CLOUDINARY_CONFIG.API_URL}/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      // Track document
      DocumentTrackingService.addTrackedDocument(data.public_id, {
        url: data.secure_url,
        fileName: file.name,
        fileType: file.type,
        documentName: file.name,
        documentType: 'Support Worker',
        uploadedAt: new Date().toISOString()
      });

      logger.debug('Document uploaded:', {
        fileName: file.name,
        publicId: data.public_id,
        certIndex
      });

      return {
        uid: data.public_id,
        url: data.secure_url,
        publicId: data.public_id,
        fileName: file.name,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
        status: 'done'
      };
    } catch (error) {
      logger.error('Upload failed:', error);
      return null;
    }
  }, []);

  const validateFile = useCallback((file) => {
    if (!FILE_UPLOAD_LIMITS.ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'Only PDF, JPG, PNG files are allowed' };
    }
    
    if (file.size > FILE_UPLOAD_LIMITS.MAX_FILE_SIZE) {
      return { valid: false, error: 'Each file must be less than 5MB' };
    }
    
    return { valid: true };
  }, []);

  return {
    isUploading,
    setIsUploading,
    uploadToCloudinary,
    validateFile,
    MAX_FILES: FILE_UPLOAD_LIMITS.MAX_FILES
  };
};
```

---

## 📋 Implementation Checklist

### Phase 1: Quick Wins (1-2 hours)
- [ ] Create logger utility and replace console.logs
- [ ] Extract constants to constants.js
- [ ] Add PropTypes to at least 3 main components

### Phase 2: Performance (2-3 hours)
- [ ] Add React.memo to child components
- [ ] Create useCertificationData hook
- [ ] Create useDocumentUpload hook
- [ ] Optimize useMemo dependencies

### Phase 3: Error Handling (1-2 hours)
- [ ] Create error handler utility
- [ ] Add ErrorBoundary component
- [ ] Update all try-catch blocks to use error handler

### Phase 4: Code Organization (3-4 hours)
- [ ] Split CertificateSecond.jsx into smaller components
- [ ] Extract custom hooks
- [ ] Create container component

---

## 🎯 Priority Order

1. **Logger Utility** - Removes 50+ console.logs
2. **Error Handler** - Improves error handling consistency
3. **React.memo** - Quick performance win
4. **Custom Hooks** - Reduces code duplication
5. **Error Boundary** - Prevents app crashes
6. **PropTypes** - Catches bugs early
7. **Split Large Files** - Improves maintainability

---

**Note:** These are ready-to-use code snippets. Copy and adapt them to your codebase!

