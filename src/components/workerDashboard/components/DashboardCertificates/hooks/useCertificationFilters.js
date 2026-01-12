import { useMemo, useCallback } from 'react';
import { 
  isExpired, 
  isRejected, 
  getComputedStatus, 
  isExpiringSoon 
} from '../utils/certificationUtils';

/**
 * Custom hook for filtering certifications by status
 */
export const useCertificationFilters = (certifications, otherCertifications) => {
  const today = useMemo(() => new Date(), []);

  // Filter expired certifications
  const expiredCertifications = useMemo(
    () => [...certifications, ...otherCertifications].filter(cert => isExpired(cert, today)),
    [certifications, otherCertifications, today]
  );

  // Filter rejected certifications
  const rejectedCertifications = useMemo(
    () => [...certifications, ...otherCertifications].filter(isRejected),
    [certifications, otherCertifications]
  );

  // Filter expiring soon certifications
  const expiringSoonCertifications = useMemo(
    () => [...certifications, ...otherCertifications].filter((cert) => {
      if (isExpired(cert, today)) return false;
      const status = getComputedStatus(cert, today);
      // Include if API status is "expiring soon"
      if (status === 'expiring soon') return true;
      // OR if verified and frontend computed as expiring soon
      if (status === 'verified' && isExpiringSoon(cert.expiryDate)) return true;
      return false;
    }),
    [certifications, otherCertifications, today]
  );

  return {
    expiredCertifications,
    rejectedCertifications,
    expiringSoonCertifications
  };
};
