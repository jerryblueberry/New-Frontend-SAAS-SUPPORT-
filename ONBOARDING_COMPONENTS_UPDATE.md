# Onboarding Components - Optimized Store Migration

## ✅ Status: In Progress

### **Components Updated**

1. ✅ **CertificateSecond.jsx** (Step 4 - Certifications)
   - Updated to use `useOnboardingData()` from optimized store
   - Reads from React Query cache (server state)
   - Uses local state for temporary form data (not persisted)
   - Maintains all existing logic

### **Key Changes**

#### **CertificateSecond.jsx**

**Before:**
```javascript
const {
  certifications,
  residencyStatus,
  updateCertifications,
  updateResidencyStatus,
  // ... many store methods
} = useOnboardingStore();

const { data: onboardingData } = useOnboardingQuery();
```

**After:**
```javascript
// UI navigation from Zustand (optimized)
const {
  currentStep: onboardingStep,
  nextStep: onboardingNextStep,
  prevStep: onboardingPrevStep,
} = useOnboardingStore();

// Server data from React Query cache (optimized)
const { 
  certifications,
  otherCertifications,
  residencyStatus,
  // ... all server data
} = useOnboardingData();

// Local state for temporary form data (not persisted)
const [localCertifications, setLocalCertifications] = useState(certifications || []);
const [localResidencyStatus, setLocalResidencyStatus] = useState(residencyStatus || '');
const [localOtherCertifications, setLocalOtherCertifications] = useState(otherCertifications || []);
```

### **Benefits**

✅ **Single source of truth**: Server data from React Query  
✅ **No localStorage bloat**: Form data not persisted  
✅ **Better performance**: Direct cache access  
✅ **Maintains logic**: All existing functionality preserved  

### **Remaining Components**

- [ ] WorkerProfileForm (Step 1)
- [ ] WorkHistoryForm (Step 2)
- [ ] AvailabilityForm (Step 3)
- [ ] HealthInformation (Step 5)

### **Migration Pattern**

For each component:

1. **Replace store data access**:
   ```javascript
   // OLD
   const profile = useOnboardingStore((state) => state.profile);
   
   // NEW
   const { profile } = useOnboardingData();
   ```

2. **Use local state for form edits**:
   ```javascript
   const [localFormData, setLocalFormData] = useState(profile || {});
   ```

3. **Submit via mutations**:
   ```javascript
   const { mutate } = useProfileMutation();
   mutate(localFormData);
   ```

4. **Keep all existing logic**: No refactoring, just data source change

---

**Status**: CertificateSecond updated, other components pending  
**Risk**: Low (backward compatible pattern)

