/**
 * Certification Utility Functions
 * Pure functions for certification data processing and formatting
 */

/**
 * Check if a certification is expired
 */
export const isExpired = (item, today = new Date()) => {
  if (!item) return false;
  const status = (item?.verificationStatus || '').toLowerCase();
  // If backend already marks it expired, treat as expired even without expiryDate
  if (status === 'expired') return true;
  if (!item?.expiryDate) return false;
  try {
    return new Date(item.expiryDate) < today;
  } catch (_) {
    return false;
  }
};

/**
 * Check if a certification is rejected
 */
export const isRejected = (item) => {
  return (item?.verificationStatus || '').toLowerCase() === 'rejected';
};

/**
 * Check if a certification is expiring soon (within 90 days)
 */
export const isExpiringSoon = (expiryDate) => {
  if (!expiryDate) return false;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 90 && diffDays > 0;
};

/**
 * Get computed status for a certification
 */
export const getComputedStatus = (cert, today = new Date()) => {
  if (!cert) return 'pending';
  if (isExpired(cert, today)) return 'expired';
  const s = (cert?.verificationStatus || '').toLowerCase();
  // Handle "expiring soon" status from API (case-insensitive)
  if (s === 'expiring soon') return 'expiring soon';
  return s || 'pending';
};

/**
 * Get status color for Material-UI Chip
 */
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'verified': return 'success';
    case 'pending': return 'warning';
    case 'expired': return 'error';
    case 'expiring soon': return 'warning';
    default: return 'default';
  }
};

/**
 * Format date to readable string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format degree string (handles "Other|" prefix)
 */
export const formatDegree = (degree) => {
  // Ensure it's always a string before processing
  if (typeof degree !== "string") {
    return {
      isOther: false,
      value: "",
    };
  }

  if (degree.startsWith("Other|")) {
    return {
      isOther: true,
      value: degree.split("|")[1] || "", // take part after "|"
    };
  }

  return {
    isOther: false,
    value: degree,
  };
};

/**
 * Compute missing fields for a certification
 */
export const computeMissingFields = (cert) => {
  if (!cert) return [];
  const missing = [];
  const type = cert.certificationType || {};
  const requiredFields = Array.isArray(type.requiredFields) ? type.requiredFields : [];
  
  // Required simple fields
  for (const field of requiredFields) {
    if (field === 'degree' || field === 'insuranceType') continue; // handled separately
    if (!cert[field]) missing.push(field);
  }
  
  // Education
  if (type.isEducation) {
    if (!Array.isArray(cert.degree) || cert.degree.length === 0) {
      missing.push('degree');
    }
  }
  
  // Insurance
  if (requiredFields.includes('insuranceType') && !cert.insuranceType) {
    missing.push('insuranceType');
  }
  
  // Documents
  if (type.documentRequired && (!Array.isArray(cert.documents) || cert.documents.length === 0)) {
    missing.push('documents');
  }
  
  return missing;
};

/**
 * Determine if edit button should be shown
 */
export const shouldShowEdit = (cert) => {
  if (!cert) return false;
  
  const status = getComputedStatus(cert);
  const expiryDate = cert.expiryDate;
  const isExpiring = isExpiringSoon(expiryDate);
  
  // Show for rejected, expired, pending, or expiring soon (from API)
  if (['rejected', 'expired', 'pending', 'expiring soon'].includes(status)) {
    return true;
  }
  
  // Show for verified certifications that are expiring soon (frontend computed)
  if (status === 'verified' && isExpiring) {
    return true;
  }
  
  return false;
};
