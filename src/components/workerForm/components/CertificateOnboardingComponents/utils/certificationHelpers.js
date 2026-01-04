/**
 * Helper functions for certification components
 */

/**
 * Normalize certification type (handles both object and string formats)
 * @param {Object} certType - Certification type object
 * @returns {Object} Normalized certification type
 */
export const normalizeCertificationType = (certType) => {
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

/**
 * Get field tooltip text
 * @param {string} field - Field name
 * @returns {string|null} Tooltip text or null
 */
export const getFieldTooltip = (field) => {
  const tooltips = {
    number: 'The unique identifier on your certificate or document',
    policeRefNo: 'The unique identifier on your certificate or document',
    dateOfCompletion: 'The date when this certification was completed',
    workerScreeningId: "The unique identifier for your worker screening id",
    insuranceType: "Any Insurance Type you have",
    issuedDate: 'The date when this certification was issued',
    expiryDate: 'The date when this certification will expire',
    country: 'The country that issued this certification',
    state: 'The state or territory that issued this certification',
    subclass: 'The visa subclass number',
    visaConditions: 'Any specific conditions attached to this visa'
  };
  return tooltips[field] || null;
};

/**
 * Check if a certification is the Working With Children Check
 * @param {Object} cert - Certification object
 * @returns {boolean}
 */
export const isWorkingWithChildrenCheck = (cert) => {
  const name = cert?.name || cert?.certTypeName;
  return name && name.trim().toLowerCase() === 'working with children check';
};

/**
 * Check if a certification type is the Working With Children Check
 * @param {Object} certType - Certification type object
 * @returns {boolean}
 */
export const isWorkingWithChildrenCheckType = (certType) => {
  return certType && certType.name && certType.name.trim().toLowerCase() === 'working with children check';
};

/**
 * Check if degree field is missing
 * @param {string|Array} degree - Degree value
 * @returns {boolean}
 */
export const isDegreeMissing = (degree) => {
  if (Array.isArray(degree)) return degree.length === 0;
  return !degree || degree === '';
};

/**
 * Format field label for display
 * @param {string} field - Field name
 * @returns {string}
 */
export const formatFieldLabel = (field) => {
  return field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
};

/**
 * Check if certification is fully complete
 * @param {Object} certType - Certification type
 * @param {Array} selectedCerts - Selected certifications
 * @returns {boolean}
 */
export const isCertFullyComplete = (certType, selectedCerts) => {
  const cert = selectedCerts.find(c => c.certificationType === certType._id);
  if (!cert) return false;
  
  // Check all required fields
  const allFieldsFilled = certType.requiredFields.every(f => {
    if (f === 'degree') {
      return !isDegreeMissing(cert[f]);
    }
    return !!cert[f];
  });
  
  // Check document requirement
  const docsFilled = !certType.documentRequired || (cert.documents && cert.documents.length > 0);
  
  return allFieldsFilled && docsFilled;
};

/**
 * Get missing fields for a certification
 * @param {Object} certType - Certification type
 * @param {Object} userCert - User's certification data
 * @param {boolean} documentRequired - Whether document is required
 * @returns {Array} Array of missing field names
 */
export const getMissingFields = (certType, userCert, documentRequired) => {
  const missingFields = [];
  
  if (!userCert) {
    return certType.requiredFields.concat(documentRequired ? ['documents'] : []);
  }
  
  certType.requiredFields.forEach(field => {
    if (field === 'degree') {
      if (isDegreeMissing(userCert.degree)) {
        missingFields.push(field);
      }
    } else if (!userCert[field]) {
      missingFields.push(field);
    }
  });
  
  if (documentRequired && (!userCert.documents || userCert.documents.length === 0)) {
    missingFields.push('documents');
  }
  
  return missingFields;
};

/**
 * Get user certification data considering form state
 * @param {Object} params - Parameters object
 * @param {boolean} params.certDetailsVisible - Whether cert details drawer is visible
 * @param {boolean} params.isEditing - Whether editing mode
 * @param {number} params.currentCertIndex - Current certification index
 * @param {Array} params.selectedCerts - Selected certifications
 * @param {string} params.pendingCertTypeId - Pending certification type ID
 * @param {Object} params.certForm - Form instance
 * @param {Array} params.certifications - Certifications from store
 * @param {string} params.certId - Certification ID to find
 * @returns {Object|null} User certification data
 */
export const getUserCertData = ({
  certDetailsVisible,
  isEditing,
  currentCertIndex,
  selectedCerts,
  pendingCertTypeId,
  certForm,
  certifications,
  certId
}) => {
  if (
    certDetailsVisible &&
    ((isEditing && selectedCerts[currentCertIndex]?.certificationType === certId) ||
      (!isEditing && pendingCertTypeId === certId))
  ) {
    // Get live form values
    return certForm.getFieldsValue();
  } else {
    // Use saved state
    return certifications.find(sel => sel.certificationType === certId);
  }
};

