import React, { useEffect } from 'react';
import WorkExperienceEditDrawer from './WorkExperienceEditDrawer';
import ProfessionalReferencesEditDrawer from './ProfessionalReferencesEditDrawer';
import CVEditDrawer from './CVEditDrawer';

/**
 * DynamicEditDrawer Component
 * Smart router component that renders the appropriate drawer based on section type
 * Supports: Work Experience, Professional References, Resume/CV
 * Emits drawer events for sidebar visibility management
 */
const DynamicEditDrawer = ({
  open,
  onClose,
  sectionType,
  initialData = null,
  onSaveSuccess = null
}) => {
  // Emit drawer events for sidebar visibility (similar to MyCertifications)
  useEffect(() => {
    if (open) {
      window.dispatchEvent(new Event('drawer:open'));
    } else {
      window.dispatchEvent(new Event('drawer:close'));
    }
    
    return () => {
      if (open) {
        window.dispatchEvent(new Event('drawer:close'));
      }
    };
  }, [open]);

  // Route to appropriate drawer component
  if (sectionType === 'work-experience') {
    return (
      <WorkExperienceEditDrawer
        open={open}
        onClose={onClose}
        initialWorkHistory={Array.isArray(initialData) ? initialData : (initialData ? [initialData] : [])}
        onSaveSuccess={onSaveSuccess}
      />
    );
  }

  if (sectionType === 'professional-references') {
    return (
      <ProfessionalReferencesEditDrawer
        open={open}
        onClose={onClose}
        initialReferences={Array.isArray(initialData) ? initialData : (initialData ? [initialData] : [])}
        onSaveSuccess={onSaveSuccess}
      />
    );
  }

  if (sectionType === 'resume-cv') {
    return (
      <CVEditDrawer
        open={open}
        onClose={onClose}
        initialCV={typeof initialData === 'string' ? initialData : (initialData?.url || null)}
        onSaveSuccess={onSaveSuccess}
      />
    );
  }

  return null;
};

export default DynamicEditDrawer;
