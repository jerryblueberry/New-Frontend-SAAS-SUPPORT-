import React from 'react'

const HealthInformation = () => {
  return (
    <div>HealthRelatedInfo</div>
  )
}

export default HealthInformation




// import React,{useMemo,useState,useEffect} from 'react'


//   const HealthInformation = useMemo(() => {
// const [newVaccine, setNewVaccine] = useState({ name: '', date: '' });

//     const addVaccination = useOnboardingStore((state) => state.addVaccination);
//   const removeVaccination = useOnboardingStore((state) => state.removeVaccination);
//   const updateHealthInformation = useOnboardingStore((state) => state.updateHealthInformation);

//       const healthInfo = profile.healthInformation || {};
//     const vaccinations = healthInfo.otherVaccinations || [];


//      const handleHealthChange = useCallback((e) => {
//         const { name, value, type, checked } = e.target;
//         const val = type === 'checkbox' ? checked : value;
        
//         updateHealthInformation({ [name]: val });
//       }, [updateHealthInformation]);
    
//       // Handle vaccine date change
//       const handleVaccineDateChange = (e) => {
//         setNewVaccine({ ...newVaccine, date: e.target.value });
//       };
    
//       // Handle vaccine name change
//       const handleVaccineNameChange = (e) => {
//         setNewVaccine({ ...newVaccine, name: e.target.value });
//       };
    
//       // Add new vaccination
//       const handleAddVaccination = () => {
//         if (newVaccine.name.trim()) {
//           addVaccination({
//             name: newVaccine.name.trim(),
//             vaccinated: true,
//             date: newVaccine.date || undefined
//           });
//           setNewVaccine({ name: '', date: '' });
//         }
//       };
    
    
//       // Handle form submission
//       const handleSubmit = useCallback(
//         (e) => {
//           e.preventDefault();
//           console.log('Submitting profile:', {
//             biography: profile.biography,
//             skillTags: profile.skillTags,
//             expectedHourlyRate: profile.expectedHourlyRate,
//             languages: profile.languages,
//           });
//           saveProfile(profile);
//         },
//         [profile, saveProfile]
//       );
    


//     return(
//       <div className="profile_wrkr_basic_form_section">
//         <h3 className="profile_wrkr_basic_section_title">Health Information</h3>
        
//         {/* Medical Conditions */}
//         <div className="profile_wrkr_basic_form_group">
//           <label className="profile_wrkr_basic_form_label">
//             Do you have any medical conditions that may impact your ability to work?
//           </label>
//           <div className="profile_wrkr_basic_radio_group">
//             <label className="profile_wrkr_basic_radio_label">
//               <input
//                 type="radio"
//                 name="hasMedicalConditions"
//                 checked={healthInfo.hasMedicalConditions === true}
//                 onChange={handleHealthChange}
//                 value="true"
//               />
//               <span>Yes</span>
//             </label>
//             <label className="profile_wrkr_basic_radio_label">
//               <input
//                 type="radio"
//                 name="hasMedicalConditions"
//                 checked={healthInfo.hasMedicalConditions === false}
//                 onChange={handleHealthChange}
//                 value="false"
//               />
//               <span>No</span>
//             </label>
//           </div>
          
//           {healthInfo.hasMedicalConditions && (
//             <div className="profile_wrkr_basic_form_group">
//               <label className="profile_wrkr_basic_form_label">
//                 If yes, please describe:
//               </label>
//               <textarea
//                 name="medicalConditionsDescription"
//                 className="profile_wrkr_basic_form_textarea"
//                 value={healthInfo.medicalConditionsDescription || ''}
//                 onChange={handleHealthChange}
//                 rows={3}
//                 placeholder="Describe any medical conditions..."
//               />
//             </div>
//           )}
//         </div>

//         {/* Workers Compensation */}
//         <div className="profile_wrkr_basic_form_group">
//           <label className="profile_wrkr_basic_form_label">
//             Are you covered by workers' compensation insurance?
//           </label>
//           <div className="profile_wrkr_basic_radio_group">
//             <label className="profile_wrkr_basic_radio_label">
//               <input
//                 type="radio"
//                 name="hasWorkersCompensation"
//                 checked={healthInfo.hasWorkersCompensation === true}
//                 onChange={handleHealthChange}
//                 value="true"
//               />
//               <span>Yes</span>
//             </label>
//             <label className="profile_wrkr_basic_radio_label">
//               <input
//                 type="radio"
//                 name="hasWorkersCompensation"
//                 checked={healthInfo.hasWorkersCompensation === false}
//                 onChange={handleHealthChange}
//                 value="false"
//               />
//               <span>No</span>
//             </label>
//           </div>
          
//           {healthInfo.hasWorkersCompensation && (
//             <div className="profile_wrkr_basic_form_group">
//               <label className="profile_wrkr_basic_form_label">
//                 Details (if applicable):
//               </label>
//               <input
//                 type="text"
//                 name="workersCompensationDetails"
//                 className="profile_wrkr_basic_form_input"
//                 value={healthInfo.workersCompensationDetails || ''}
//                 onChange={handleHealthChange}
//                 placeholder="Policy number or details"
//               />
//             </div>
//           )}
//         </div>

//         {/* Vaccinations */}
//         <div className="profile_wrkr_basic_form_group">
//           <h4 className="profile_wrkr_basic_subtitle">Vaccinations</h4>
          
//           <div className="profile_wrkr_basic_form_group">
//             <label className="profile_wrkr_basic_form_label">
//               Have you been vaccinated for COVID-19?
//             </label>
//             <div className="profile_wrkr_basic_radio_group">
//               <label className="profile_wrkr_basic_radio_label">
//                 <input
//                   type="radio"
//                   name="covidVaccinated"
//                   checked={healthInfo.covidVaccinated === true}
//                   onChange={handleHealthChange}
//                   value="true"
//                 />
//                 <span>Yes</span>
//               </label>
//               <label className="profile_wrkr_basic_radio_label">
//                 <input
//                   type="radio"
//                   name="covidVaccinated"
//                   checked={healthInfo.covidVaccinated === false}
//                   onChange={handleHealthChange}
//                   value="false"
//                 />
//                 <span>No</span>
//               </label>
//             </div>
//           </div>
          
//           <div className="profile_wrkr_basic_form_group">
//             <label className="profile_wrkr_basic_form_label">
//               Have you had your seasonal flu vaccination?
//             </label>
//             <div className="profile_wrkr_basic_radio_group">
//               <label className="profile_wrkr_basic_radio_label">
//                 <input
//                   type="radio"
//                   name="fluVaccinated"
//                   checked={healthInfo.fluVaccinated === true}
//                   onChange={handleHealthChange}
//                   value="true"
//                 />
//                 <span>Yes</span>
//               </label>
//               <label className="profile_wrkr_basic_radio_label">
//                 <input
//                   type="radio"
//                   name="fluVaccinated"
//                   checked={healthInfo.fluVaccinated === false}
//                   onChange={handleHealthChange}
//                   value="false"
//                 />
//                 <span>No</span>
//               </label>
//             </div>
//           </div>
          
//           <div className="profile_wrkr_basic_form_group">
//             <label className="profile_wrkr_basic_form_label">
//               Other Vaccinations
//             </label>
//             <div className="profile_wrkr_basic_input_group">
//               <input
//                 type="text"
//                 value={newVaccine.name}
//                 onChange={handleVaccineNameChange}
//                 className="profile_wrkr_basic_form_input"
//                 placeholder="Vaccine name"
//               />
//               <input
//                 type="date"
//                 value={newVaccine.date}
//                 onChange={handleVaccineDateChange}
//                 className="profile_wrkr_basic_form_input"
//               />
//               <button
//                 type="button"
//                 onClick={handleAddVaccination}
//                 className="profile_wrkr_basic_btn_add"
//                 disabled={isPending}
//               >
//                 Add
//               </button>
//             </div>
            
//             {vaccinations.length > 0 && (
//               <div className="profile_wrkr_basic_vaccination_list">
//                 {vaccinations.map((vax, index) => (
//                   <div key={index} className="profile_wrkr_basic_vaccination_item">
//                     <span>
//                       {vax.name} - {vax.date || 'No date specified'}
//                     </span>
//                     <button
//                       type="button"
//                       onClick={() => removeVaccination(index)}
//                       className="profile_wrkr_basic_vaccination_remove"
//                       disabled={isPending}
//                     >
//                       &times;
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Physical Abilities */}
//         <div className="profile_wrkr_basic_form_group">
//           <h4 className="profile_wrkr_basic_subtitle">Physical Abilities</h4>
          
//           <div className="profile_wrkr_basic_form_group">
//             <label className="profile_wrkr_basic_form_label">
//               Are you able to lift patients or perform physical tasks?
//             </label>
//             <div className="profile_wrkr_basic_radio_group">
//               <label className="profile_wrkr_basic_radio_label">
//                 <input
//                   type="radio"
//                   name="canLiftPatients"
//                   checked={healthInfo.canLiftPatients === true}
//                   onChange={handleHealthChange}
//                   value="true"
//                 />
//                 <span>Yes</span>
//               </label>
//               <label className="profile_wrkr_basic_radio_label">
//                 <input
//                   type="radio"
//                   name="canLiftPatients"
//                   checked={healthInfo.canLiftPatients === false}
//                   onChange={handleHealthChange}
//                   value="false"
//                 />
//                 <span>No</span>
//               </label>
//             </div>
//           </div>
          
//           <div className="profile_wrkr_basic_form_group">
//             <label className="profile_wrkr_basic_form_label">
//               Do you have any mobility issues?
//             </label>
//             <div className="profile_wrkr_basic_radio_group">
//               <label className="profile_wrkr_basic_radio_label">
//                 <input
//                   type="radio"
//                   name="hasMobilityIssues"
//                   checked={healthInfo.hasMobilityIssues === true}
//                   onChange={handleHealthChange}
//                   value="true"
//                 />
//                 <span>Yes</span>
//               </label>
//               <label className="profile_wrkr_basic_radio_label">
//                 <input
//                   type="radio"
//                   name="hasMobilityIssues"
//                   checked={healthInfo.hasMobilityIssues === false}
//                   onChange={handleHealthChange}
//                   value="false"
//                 />
//                 <span>No</span>
//               </label>
//             </div>
//           </div>
          
//           <div className="profile_wrkr_basic_form_group">
//             <label className="profile_wrkr_basic_form_label">
//               Do you require any special accommodations at work?
//             </label>
//             <div className="profile_wrkr_basic_radio_group">
//               <label className="profile_wrkr_basic_radio_label">
//                 <input
//                   type="radio"
//                   name="requiresSpecialAccomodation"
//                   checked={healthInfo.requiresSpecialAccomodation === true}
//                   onChange={handleHealthChange}
//                   value="true"
//                 />
//                 <span>Yes</span>
//               </label>
//               <label className="profile_wrkr_basic_radio_label">
//                 <input
//                   type="radio"
//                   name="requiresSpecialAccomodation"
//                   checked={healthInfo.requiresSpecialAccomodation === false}
//                   onChange={handleHealthChange}
//                   value="false"
//                 />
//                 <span>No</span>
//               </label>
//             </div>
            
//             {healthInfo.requiresSpecialAccomodation && (
//               <div className="profile_wrkr_basic_form_group">
//                 <label className="profile_wrkr_basic_form_label">
//                   If yes, please describe:
//                 </label>
//                 <textarea
//                   name="conditionsAffectingWork"
//                   className="profile_wrkr_basic_form_textarea"
//                   value={healthInfo.conditionsAffectingWork || ''}
//                   onChange={handleHealthChange}
//                   rows={3}
//                   placeholder="Describe any accommodations needed..."
//                 />
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Mental Health */}
//         <div className="profile_wrkr_basic_form_group">
//           <label className="profile_wrkr_basic_form_label">
//             Are there any mental health conditions we should be aware of?
//           </label>
//           <div className="profile_wrkr_basic_radio_group">
//             <label className="profile_wrkr_basic_radio_label">
//               <input
//                 type="radio"
//                 name="hasMentalHealthCocerns"
//                 checked={healthInfo.hasMentalHealthCocerns === true}
//                 onChange={handleHealthChange}
//                 value="true"
//               />
//               <span>Yes</span>
//             </label>
//             <label className="profile_wrkr_basic_radio_label">
//               <input
//                 type="radio"
//                 name="hasMentalHealthCocerns"
//                 checked={healthInfo.hasMentalHealthCocerns === false}
//                 onChange={handleHealthChange}
//                 value="false"
//               />
//               <span>No</span>
//             </label>
//           </div>
          
//           {healthInfo.hasMentalHealthCocerns && (
//             <div className="profile_wrkr_basic_form_group">
//               <label className="profile_wrkr_basic_form_label">
//                 If yes, how might this impact your work?
//               </label>
//               <textarea
//                 name="mentalHealthImpactonWork"
//                 className="profile_wrkr_basic_form_textarea"
//                 value={healthInfo.mentalHealthImpactonWork || ''}
//                 onChange={handleHealthChange}
//                 rows={3}
//                 placeholder="Describe any impacts..."
//               />
//             </div>
//           )}
//         </div>

//         {/* Health Clearance */}
//         <div className="profile_wrkr_basic_form_group">
//           <label className="profile_wrkr_basic_form_label">
//             Do you have any health clearances or medical checks?
//           </label>
//           <div className="profile_wrkr_basic_radio_group">
//             <label className="profile_wrkr_basic_radio_label">
//               <input
//                 type="radio"
//                 name="hasHealthClearance"
//                 checked={healthInfo.hasHealthClearance === true}
//                 onChange={handleHealthChange}
//                 value="true"
//               />
//               <span>Yes</span>
//             </label>
//             <label className="profile_wrkr_basic_radio_label">
//               <input
//                 type="radio"
//                 name="hasHealthClearance"
//                 checked={healthInfo.hasHealthClearance === false}
//                 onChange={handleHealthChange}
//                 value="false"
//               />
//               <span>No</span>
//             </label>
//           </div>
          
//           {healthInfo.hasHealthClearance && (
//             <>
//               <div className="profile_wrkr_basic_form_group">
//                 <label className="profile_wrkr_basic_form_label">
//                   Clearance date (if applicable):
//                 </label>
//                 <input
//                   type="date"
//                   name="healthClearanceDate"
//                   className="profile_wrkr_basic_form_input"
//                   value={healthInfo.healthClearanceDate || ''}
//                   onChange={handleHealthChange}
//                 />
//               </div>
              
//               <div className="profile_wrkr_basic_form_group">
//                 <label className="profile_wrkr_basic_form_label">
//                   Notes (if applicable):
//                 </label>
//                 <textarea
//                   name="hasClearanceNotes"
//                   className="profile_wrkr_basic_form_textarea"
//                   value={healthInfo.hasClearanceNotes || ''}
//                   onChange={handleHealthChange}
//                   rows={2}
//                   placeholder="Any notes about your health clearance..."
//                 />
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//     )
//   }, [profile.healthInformation, newVaccine, isPending, handleHealthChange, handleVaccineNameChange, handleVaccineDateChange, handleAddVaccination, removeVaccination])


// export default HealthInformation

