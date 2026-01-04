/**
 * Certificate Onboarding Components
 * 
 * Main export file for certificate onboarding components
 */

// Step Components
export { default as AddCertificationsStep } from './components/AddCertificationsStep';
export { default as PersonalInfoStep } from './components/PersonalInfoStep';
export { default as ReviewSubmitStep } from './components/ReviewSubmitStep';
export { default as CertificationFormDrawer } from './components/CertificationFormDrawer';

// Sub-components
export { default as RequiredCertificationsTab } from './components/RequiredCertificationsTab';
export { default as YourCertificationsCard } from './components/YourCertificationsCard';
export { default as RequiredCertificationListItem } from './components/RequiredCertificationListItem';
export { default as YourCertificationListItem } from './components/YourCertificationListItem';

// Export utilities
export * from './utils/certificationHelpers';
export { DocumentTrackingService, setZustandSyncCallback, clearZustandSyncCallback } from './utils/documentTrackingService';

// Export constants
export * from './constants';

