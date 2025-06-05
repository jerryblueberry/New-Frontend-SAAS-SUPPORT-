import React, { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import useOnboardingStore, { useHealthInfoMutation } from '../../stores/useOnboardingStore';
import './css/HealthInformation.css';

const HealthInformation = () => {
  const healthInformation = useOnboardingStore((state) => state.healthInformation);
  const updateHealthInformation = useOnboardingStore((state) => state.updateHealthInformation);
  const addVaccination = useOnboardingStore((state) => state.addVaccination);
  const removeVaccination = useOnboardingStore((state) => state.removeVaccination);
  const prevStep = useOnboardingStore((state) => state.prevStep);
  const nextStep = useOnboardingStore((state) => state.nextStep);
  const isLoading = useOnboardingStore((state) => state.isLoading);

  const [newVaccine, setNewVaccine] = useState({ 
    name: '', 
    vaccinated: false, 
    date: '' 
  });

  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  const { mutate: saveHealthInfo, isPending: isSaving } = useHealthInfoMutation();

  // Initialize form with default values if empty
useEffect(() => {
  if (!healthInformation) {
    updateHealthInformation({
      hasWorkersCompensation: false,
      workersCompensationDetails: '',
      hasMedicalConditions: false,
      medicalConditionsDescription: '',
      conditionsAffectingWork: '',
      covidVaccinated: false,
      fluVaccinated: false,
      otherVaccinations: [],
      hasHealthClearance: false,
      healthClearanceDate: null,
      clearanceNotes: '',
      canLiftPatients: true,
      hasMobilityIssues: false,
      requiresSpecialAccommodation: false,
      hasMentalHealthConcerns: false,
      mentalHealthImpactOnWork: '',
    });
  }
}, [healthInformation, updateHealthInformation]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    updateHealthInformation({ 
      [name]: type === 'checkbox' ? checked : value 
    });

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, [updateHealthInformation, formErrors]);

  const handleVaccineChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setNewVaccine(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleAddVaccine = useCallback(() => {
    const trimmedName = newVaccine.name.trim();
    
    if (!trimmedName) {
      toast.error('Please enter a vaccine name');
      return;
    }

    const isDuplicate = healthInformation.otherVaccinations?.some(
      vax => vax.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      toast.error('This vaccination has already been added');
      return;
    }

    const vaccinationData = {
      name: trimmedName,
      vaccinated: newVaccine.vaccinated,
      ...(newVaccine.vaccinated && newVaccine.date && { date: newVaccine.date })
    };

    addVaccination(vaccinationData);
    setNewVaccine({ name: '', vaccinated: false, date: '' });
  }, [newVaccine, healthInformation?.otherVaccinations, addVaccination]);

  const handleRemoveVaccination = useCallback((index, vaccineName) => {
    if (window.confirm(`Are you sure you want to remove ${vaccineName}?`)) {
      removeVaccination(index);
    }
  }, [removeVaccination]);

const validateForm = useCallback(() => {
  const errors = {};
  const healthInfo = healthInformation;

  // Required boolean fields validation
  const requiredBooleanFields = [
    'hasWorkersCompensation',
    'hasMedicalConditions',
    'covidVaccinated',
    'fluVaccinated',
    'hasHealthClearance',
    'canLiftPatients',
    'hasMobilityIssues',
    'requiresSpecialAccommodation',
    'hasMentalHealthConcerns'
  ];

  requiredBooleanFields.forEach(field => {
    if (healthInfo[field] === null || healthInfo[field] === undefined) {
      errors[field] = 'This field is required';
    }
  });

  // Conditional validation
  if (healthInfo.hasMedicalConditions === true && 
      (!healthInfo.medicalConditionsDescription || 
       !healthInfo.medicalConditionsDescription.trim())) {
    errors.medicalConditionsDescription = 'Please describe your medical conditions';
  }

  if (healthInfo.hasWorkersCompensation === true && 
      (!healthInfo.workersCompensationDetails || 
       !healthInfo.workersCompensationDetails.trim())) {
    errors.workersCompensationDetails = 'Please provide workers compensation details';
  }

  if (healthInfo.requiresSpecialAccommodation === true && 
      (!healthInfo.conditionsAffectingWork || 
       !healthInfo.conditionsAffectingWork.trim())) {
    errors.conditionsAffectingWork = 'Please describe the accommodations needed';
  }

  if (healthInfo.hasMentalHealthConcerns === true && 
      (!healthInfo.mentalHealthImpactOnWork || 
       !healthInfo.mentalHealthImpactOnWork.trim())) {
    errors.mentalHealthImpactOnWork = 'Please describe how this might impact your work';
  }

  if (healthInfo.hasHealthClearance === true && !healthInfo.healthClearanceDate) {
    errors.healthClearanceDate = 'Please provide the clearance date';
  }

  return errors;
}, [healthInformation]);


const handleSubmit = useCallback((e) => {
  e.preventDefault();
  
  const errors = validateForm();
  setFormErrors(errors);

  if (Object.keys(errors).length > 0) {
    const firstErrorField = Object.keys(errors)[0];
    const element = document.querySelector(`[name="${firstErrorField}"]`);
    if (element) {
      element.focus();
    }
    return;
  }

  // Create payload with proper structure
  const dataToSend = {
    ...healthInformation,
    // Ensure all boolean fields are properly set
    hasWorkersCompensation: healthInformation.hasWorkersCompensation !== undefined 
      ? healthInformation.hasWorkersCompensation 
      : false,
    hasMedicalConditions: healthInformation.hasMedicalConditions !== undefined 
      ? healthInformation.hasMedicalConditions 
      : false,
    covidVaccinated: healthInformation.covidVaccinated !== undefined 
      ? healthInformation.covidVaccinated 
      : false,
    fluVaccinated: healthInformation.fluVaccinated !== undefined 
      ? healthInformation.fluVaccinated 
      : false,
    hasHealthClearance: healthInformation.hasHealthClearance !== undefined 
      ? healthInformation.hasHealthClearance 
      : false,
    canLiftPatients: healthInformation.canLiftPatients !== undefined 
      ? healthInformation.canLiftPatients 
      : true,
    hasMobilityIssues: healthInformation.hasMobilityIssues !== undefined 
      ? healthInformation.hasMobilityIssues 
      : false,
    requiresSpecialAccommodation: healthInformation.requiresSpecialAccommodation !== undefined 
      ? healthInformation.requiresSpecialAccommodation 
      : false,
    hasMentalHealthConcerns: healthInformation.hasMentalHealthConcerns !== undefined 
      ? healthInformation.hasMentalHealthConcerns 
      : false,
  };

  console.log('Submitting health data:', dataToSend);

  saveHealthInfo(dataToSend, {
    onSuccess: () => {
      console.log('Health info saved successfully');
      nextStep();
    },
    onError: (error) => {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to save health information');
    }
  });
}, [validateForm, healthInformation, saveHealthInfo, nextStep]);


  const renderFieldError = (fieldName) => {
    if (formErrors[fieldName] && (touched[fieldName] || Object.keys(formErrors).length > 0)) {
      return <span className="wkr-onboard-health-error-message">{formErrors[fieldName]}</span>;
    }
    return null;
  };

  if (!healthInformation) {
    return (
      <div className="wkr-onboard-health-loading-container">
        <div className="wkr-onboard-health-spinner"></div>
        <p>Loading health information...</p>
      </div>
    );
  }

  return (
    <div className="wkr-onboard-health-form">
      <div className="wkr-onboard-health-form-header">
        <h2>Health Information</h2>
        <p className="wkr-onboard-health-form-description">
          Please provide accurate health information to ensure we can match you with appropriate opportunities.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Medical Conditions Section */}
        <div className="wkr-onboard-health-form-section">
          <h3>Medical Conditions</h3>
          <div className="wkr-onboard-health-form-group">
            <fieldset>
              <legend>Do you have any medical conditions that may affect your work?</legend>
              <div className="wkr-onboard-health-radio-group">
                <label className="wkr-onboard-health-radio-label">
                  <input
                    type="radio"
                    name="hasMedicalConditions"
                    checked={healthInformation.hasMedicalConditions === true}
                    onChange={() => updateHealthInformation({ hasMedicalConditions: true })}
                  />
                  <span>Yes</span>
                </label>
                <label className="wkr-onboard-health-radio-label">
                  <input
                    type="radio"
                    name="hasMedicalConditions"
                    checked={healthInformation.hasMedicalConditions === false}
                    onChange={() => updateHealthInformation({ hasMedicalConditions: false })}
                  />
                  <span>No</span>
                </label>
              </div>
              {renderFieldError('hasMedicalConditions')}
            </fieldset>
            
            {healthInformation.hasMedicalConditions === true && (
              <div className="wkr-onboard-health-form-group wkr-onboard-health-conditional-field">
                <label htmlFor="medicalConditionsDescription">
                  Please describe your medical conditions: *
                </label>
                <textarea
                  id="medicalConditionsDescription"
                  name="medicalConditionsDescription"
                  value={healthInformation.medicalConditionsDescription || ''}
                  onChange={handleChange}
                  className={formErrors.medicalConditionsDescription ? 'wkr-onboard-health-error' : ''}
                />
                {renderFieldError('medicalConditionsDescription')}
              </div>
            )}
          </div>
        </div>

        {/* Workers Compensation Section */}
        <div className="wkr-onboard-health-form-section">
          <h3>Workers Compensation</h3>
          <div className="wkr-onboard-health-form-group">
            <fieldset>
              <legend>Are you covered by workers' compensation insurance?</legend>
              <div className="wkr-onboard-health-radio-group">
                <label className="wkr-onboard-health-radio-label">
                  <input
                    type="radio"
                    name="hasWorkersCompensation"
                    checked={healthInformation.hasWorkersCompensation === true}
                    onChange={() => updateHealthInformation({ hasWorkersCompensation: true })}
                  />
                  <span>Yes</span>
                </label>
                <label className="wkr-onboard-health-radio-label">
                  <input
                    type="radio"
                    name="hasWorkersCompensation"
                    checked={healthInformation.hasWorkersCompensation === false}
                    onChange={() => updateHealthInformation({ hasWorkersCompensation: false })}
                  />
                  <span>No</span>
                </label>
              </div>
              {renderFieldError('hasWorkersCompensation')}
            </fieldset>
            
            {healthInformation.hasWorkersCompensation === true && (
              <div className="wkr-onboard-health-form-group wkr-onboard-health-conditional-field">
                <label htmlFor="workersCompensationDetails">
                  Workers compensation details: *
                </label>
                <input
                  type="text"
                  id="workersCompensationDetails"
                  name="workersCompensationDetails"
                  value={healthInformation.workersCompensationDetails || ''}
                  onChange={handleChange}
                  className={formErrors.workersCompensationDetails ? 'wkr-onboard-health-error' : ''}
                />
                {renderFieldError('workersCompensationDetails')}
              </div>
            )}
          </div>
        </div>

        {/* Vaccinations Section */}
        <div className="wkr-onboard-health-form-section">
          <h3>Vaccinations</h3>
          
          <div className="wkr-onboard-health-form-group">
            <fieldset>
              <legend>COVID-19 Vaccination Status:</legend>
              <div className="wkr-onboard-health-radio-group">
                <label className="wkr-onboard-health-radio-label">
                  <input
                    type="radio"
                    name="covidVaccinated"
                    checked={healthInformation.covidVaccinated === true}
                    onChange={() => updateHealthInformation({ covidVaccinated: true })}
                  />
                  <span>Vaccinated</span>
                </label>
                <label className="wkr-onboard-health-radio-label">
                  <input
                    type="radio"
                    name="covidVaccinated"
                    checked={healthInformation.covidVaccinated === false}
                    onChange={() => updateHealthInformation({ covidVaccinated: false })}
                  />
                  <span>Not Vaccinated</span>
                </label>
              </div>
              {renderFieldError('covidVaccinated')}
            </fieldset>
          </div>
          
          <div className="wkr-onboard-health-form-group">
            <fieldset>
              <legend>Flu Vaccination Status:</legend>
              <div className="wkr-onboard-health-radio-group">
                <label className="wkr-onboard-health-radio-label">
                  <input
                    type="radio"
                    name="fluVaccinated"
                    checked={healthInformation.fluVaccinated === true}
                    onChange={() => updateHealthInformation({ fluVaccinated: true })}
                  />
                  <span>Vaccinated</span>
                </label>
                <label className="wkr-onboard-health-radio-label">
                  <input
                    type="radio"
                    name="fluVaccinated"
                    checked={healthInformation.fluVaccinated === false}
                    onChange={() => updateHealthInformation({ fluVaccinated: false })}
                  />
                  <span>Not Vaccinated</span>
                </label>
              </div>
              {renderFieldError('fluVaccinated')}
            </fieldset>
          </div>
          
          <div className="wkr-onboard-health-form-group">
            <h4>Additional Vaccinations</h4>
            <div className="wkr-onboard-health-vaccine-input-group">
              <div className="wkr-onboard-health-input-row">
                <input
                  type="text"
                  name="name"
                  value={newVaccine.name}
                  onChange={handleVaccineChange}
                  placeholder="Vaccine name (e.g., Hepatitis B, Tetanus)"
                />
                <label className="wkr-onboard-health-checkbox-label">
                  <input
                    type="checkbox"
                    name="vaccinated"
                    checked={newVaccine.vaccinated}
                    onChange={handleVaccineChange}
                  />
                  <span>Vaccinated</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={newVaccine.date}
                  onChange={handleVaccineChange}
                  disabled={!newVaccine.vaccinated}
                />
                <button
                  type="button"
                  onClick={handleAddVaccine}
                  disabled={!newVaccine.name.trim()}
                >
                  Add Vaccination
                </button>
              </div>
            </div>
            
            {healthInformation.otherVaccinations?.length > 0 && (
              <div className="wkr-onboard-health-vaccine-list">
                <h5>Added Vaccinations:</h5>
                {healthInformation.otherVaccinations.map((vax, index) => (
                  <div key={index} className="wkr-onboard-health-vaccine-item">
                    <div className="wkr-onboard-health-vaccine-info">
                      <span>{vax.name}</span>
                      <span>{vax.vaccinated ? 'Vaccinated' : 'Not Vaccinated'}</span>
                      {vax.date && (
                        <span>on {new Date(vax.date).toLocaleDateString()}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveVaccination(index, vax.name)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Physical Abilities Section */}
        <div className="wkr-onboard-health-form-section">
          <h3>Physical Abilities</h3>
          
          <div className="wkr-onboard-health-form-group">
            <fieldset>
              <legend>Can you lift patients or heavy objects (up to 50lbs)?</legend>
              <div className="wkr-onboard-health-radio-group">
                <label className="wkr-onboard-health-radio-label">
                  <input
                    type="radio"
                    name="canLiftPatients"
                    checked={healthInformation.canLiftPatients === true}
                    onChange={() => updateHealthInformation({ canLiftPatients: true })}
                  />
                  <span>Yes</span>
                </label>
                <label className="wkr-onboard-health-radio-label">
                  <input
                    type="radio"
                    name="canLiftPatients"
                    checked={healthInformation.canLiftPatients === false}
                    onChange={() => updateHealthInformation({ canLiftPatients: false })}
                  />
                  <span>No</span>
                </label>
              </div>
              {renderFieldError('canLiftPatients')}
            </fieldset>
          </div>
          
          <div className="wkr-onboard-health-form-group">
            <fieldset>
              <legend>Do you have any mobility issues?</legend>
              <div className="wkr-onboard-health-radio-group">
                <label className="wkr-onboard-health-radio-label">
                  <input
                    type="radio"
                    name="hasMobilityIssues"
                    checked={healthInformation.hasMobilityIssues === true}
                    onChange={() => updateHealthInformation({ hasMobilityIssues: true })}
                  />
                  <span>Yes</span>
                </label>
                <label className="wkr-onboard-health-radio-label">
                  <input
                    type="radio"
                    name="hasMobilityIssues"
                    checked={healthInformation.hasMobilityIssues === false}
                    onChange={() => updateHealthInformation({ hasMobilityIssues: false })}
                  />
                  <span>No</span>
                </label>
              </div>
              {renderFieldError('hasMobilityIssues')}
            </fieldset>
          </div>
          
          <div className="wkr-onboard-health-form-group">
            <fieldset>
              <legend>Do you require any special accommodations for work?</legend>
              <div className="wkr-onboard-health-radio-group">
                <label className="wkr-onboard-health-radio-label">
                  <input
                    type="radio"
                    name="requiresSpecialAccommodation"
                    checked={healthInformation.requiresSpecialAccommodation === true}
                    onChange={() => updateHealthInformation({ requiresSpecialAccommodation: true })}
                  />
                  <span>Yes</span>
                </label>
                <label className="wkr-onboard-health-radio-label">
                  <input
                    type="radio"
                    name="requiresSpecialAccommodation"
                    checked={healthInformation.requiresSpecialAccommodation === false}
                    onChange={() => updateHealthInformation({ requiresSpecialAccommodation: false })}
                  />
                  <span>No</span>
                </label>
              </div>
              {renderFieldError('requiresSpecialAccommodation')}
            </fieldset>
            
            {healthInformation.requiresSpecialAccommodation === true && (
              <div className="wkr-onboard-health-form-group wkr-onboard-health-conditional-field">
                <label htmlFor="conditionsAffectingWork">
                  Please describe the accommodations needed: *
                </label>
                <textarea
                  id="conditionsAffectingWork"
                  name="conditionsAffectingWork"
                  value={healthInformation.conditionsAffectingWork || ''}
                  onChange={handleChange}
                  className={formErrors.conditionsAffectingWork ? 'wkr-onboard-health-error' : ''}
                />
                {renderFieldError('conditionsAffectingWork')}
              </div>
            )}
          </div>
        </div>

        {/* Mental Health Section */}
        <div className="wkr-onboard-health-form-section">
          <h3>Mental Health Considerations</h3>
          <div className="wkr-onboard-health-form-group">
            <fieldset>
              <legend>Do you have any mental health concerns that might affect your work performance?</legend>
              <div className="wkr-onboard-health-radio-group">
                <label className="wkr-onboard-health-radio-label">
                  <input
                    type="radio"
                    name="hasMentalHealthConcerns"
                    checked={healthInformation.hasMentalHealthConcerns === true}
                    onChange={() => updateHealthInformation({ hasMentalHealthConcerns: true })}
                  />
                  <span>Yes</span>
                </label>
                <label className="wkr-onboard-health-radio-label">
                  <input
                    type="radio"
                    name="hasMentalHealthConcerns"
                    checked={healthInformation.hasMentalHealthConcerns === false}
                    onChange={() => updateHealthInformation({ hasMentalHealthConcerns: false })}
                  />
                  <span>No</span>
                </label>
              </div>
              {renderFieldError('hasMentalHealthConcerns')}
            </fieldset>
            
            {healthInformation.hasMentalHealthConcerns === true && (
              <div className="wkr-onboard-health-form-group wkr-onboard-health-conditional-field">
                <label htmlFor="mentalHealthImpactOnWork">
                  How might this impact your work? *
                </label>
                <textarea
                  id="mentalHealthImpactOnWork"
                  name="mentalHealthImpactOnWork"
                  value={healthInformation.mentalHealthImpactOnWork || ''}
                  onChange={handleChange}
                  className={formErrors.mentalHealthImpactOnWork ? 'wkr-onboard-health-error' : ''}
                />
                {renderFieldError('mentalHealthImpactOnWork')}
              </div>
            )}
          </div>
        </div>

        {/* Health Clearance Section */}
        <div className="wkr-onboard-health-form-section">
          <h3>Health Clearance</h3>
          <div className="wkr-onboard-health-form-group">
            <fieldset>
              <legend>Do you have a current health clearance certificate?</legend>
              <div className="wkr-onboard-health-radio-group">
                <label className="wkr-onboard-health-radio-label">
                  <input
                    type="radio"
                    name="hasHealthClearance"
                    checked={healthInformation.hasHealthClearance === true}
                    onChange={() => updateHealthInformation({ hasHealthClearance: true })}
                  />
                  <span>Yes</span>
                </label>
                <label className="wkr-onboard-health-radio-label">
                  <input
                    type="radio"
                    name="hasHealthClearance"
                    checked={healthInformation.hasHealthClearance === false}
                    onChange={() => updateHealthInformation({ hasHealthClearance: false })}
                  />
                  <span>No</span>
                </label>
              </div>
              {renderFieldError('hasHealthClearance')}
            </fieldset>
            
            {healthInformation.hasHealthClearance === true && (
              <div className="wkr-onboard-health-conditional-fields">
                <div className="wkr-onboard-health-form-group">
                  <label htmlFor="healthClearanceDate">
                    Clearance date: *
                  </label>
                  <input
                    type="date"
                    id="healthClearanceDate"
                    name="healthClearanceDate"
                    value={healthInformation.healthClearanceDate || ''}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className={formErrors.healthClearanceDate ? 'wkr-onboard-health-error' : ''}
                  />
                  {renderFieldError('healthClearanceDate')}
                </div>
                <div className="wkr-onboard-health-form-group">
                  <label htmlFor="clearanceNotes">
                    Additional notes about your clearance:
                  </label>
                  <textarea
                    id="clearanceNotes"
                    name="clearanceNotes"
                    value={healthInformation.clearanceNotes || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="wkr-onboard-health-form-actions">
          <button 
            type="button" 
            onClick={prevStep}
            disabled={isSaving || isLoading}
          >
            Back
          </button>
          <button 
            type="submit" 
            disabled={isSaving || isLoading}
          >
            {isSaving ? 'Saving...' : 'Save and Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HealthInformation;