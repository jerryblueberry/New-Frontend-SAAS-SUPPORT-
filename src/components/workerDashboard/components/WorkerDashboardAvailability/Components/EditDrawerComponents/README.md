# Edit Drawer Components

This directory contains modular, reusable components for the Edit Availability Drawer feature, following industry best practices for React development.

## 📁 Structure

```
EditDrawerComponents/
├── hooks/
│   └── useAvailabilityForm.js      # Custom hook for form state & logic
├── constants.js                     # Day themes and constants
├── timeUtils.js                     # Time formatting and calculation utilities
├── validationUtils.js               # Form and time slot validation logic
├── DrawerHeader.jsx                 # Header with stats and close button
├── AddTimeSlotForm.jsx             # Form to add/edit time slots
├── TimeSlotsList.jsx               # Display grouped time slots
├── DrawerFooter.jsx                # Save and cancel action buttons
├── index.js                        # Central export file
└── README.md                       # This file
```

## 🎯 Key Benefits

### 1. **Separation of Concerns**
- Each component has a single, well-defined responsibility
- Business logic separated from UI components
- Utilities isolated for reusability

### 2. **Maintainability**
- Small, focused files (~200-400 lines each)
- Easy to locate and fix bugs
- Clear dependencies

### 3. **Reusability**
- Components can be used independently
- Utilities can be imported anywhere
- Custom hook can be reused in other forms

### 4. **Testability**
- Each component can be unit tested
- Utilities have pure functions
- Mock dependencies easily

### 5. **Performance**
- Components can be memoized independently
- Code splitting friendly
- Lazy loading support

### 6. **Scalability**
- Easy to add new features
- Simple to modify existing functionality
- Clear patterns to follow

## 🧩 Components

### DrawerHeader
**Purpose:** Display drawer title, stats, and close button

**Props:**
```javascript
{
  onClose: func.isRequired,
  totalHours: number.isRequired,
  availableDaysCount: number.isRequired,
  slotsCount: number.isRequired,
  hasUnsavedChanges: bool
}
```

### AddTimeSlotForm
**Purpose:** Form for adding and editing time slots

**Props:**
```javascript
{
  newSlot: object.isRequired,
  onSlotChange: func.isRequired,
  isAddingSlot: bool.isRequired,
  setIsAddingSlot: func.isRequired,
  isEditingSlot: bool.isRequired,
  onAddSlot: func.isRequired,
  onUpdateSlot: func.isRequired,
  onCancelEdit: func.isRequired,
  customTimeSlots: array.isRequired,
  groupedSlots: object.isRequired,
  editingSlotIndex: number,
  fieldErrors: object.isRequired,
  disabled: bool
}
```

### TimeSlotsList
**Purpose:** Display all added time slots grouped by day

**Props:**
```javascript
{
  customTimeSlots: array.isRequired,
  groupedSlots: object.isRequired,
  totalHours: number.isRequired,
  availableDays: array.isRequired,
  onEditSlot: func.isRequired,
  onDeleteSlot: func.isRequired,
  isEditingSlot: bool.isRequired,
  editingSlotIndex: number,
  fieldErrors: object.isRequired,
  disabled: bool
}
```

### DrawerFooter
**Purpose:** Action buttons for saving or canceling

**Props:**
```javascript
{
  onSave: func.isRequired,
  onCancel: func.isRequired,
  isLoading: bool,
  isSaveDisabled: bool,
  saveButtonText: string,
  cancelButtonText: string
}
```

## 🪝 Custom Hook

### useAvailabilityForm
**Purpose:** Encapsulate all form state, validation, and business logic

**Parameters:**
```javascript
useAvailabilityForm(initialData, onClose, onSave)
```

**Returns:**
```javascript
{
  // Form data
  suburb, setSuburb,
  kmWillingToTravel, setKmWillingToTravel,
  customTimeSlots, setCustomTimeSlots,
  
  // Time slot form
  newSlot, setNewSlot,
  isAddingSlot, setIsAddingSlot,
  isEditingSlot, editingSlotIndex,
  
  // Calculations
  totalHours, availableDays, groupedSlots,
  
  // Validation
  error, fieldErrors, validationMessages, hasUnsavedChanges,
  
  // Loading states
  isLoading, mutationError,
  
  // Actions
  handleAddSlot, handleEditSlot, handleUpdateSlot,
  handleCancelEdit, handleDeleteSlot, handleSave, handleClose
}
```

## 🛠️ Utilities

### timeUtils.js
Time-related utility functions:
- `formatTimeDisplay(time)` - Format time to human-readable string
- `calculateDuration(startTime, endTime)` - Calculate duration between times
- `isTimeEqual(timeA, timeB)` - Compare if two times are equal
- `isTimeBefore(timeA, timeB)` - Check if timeA is before timeB
- `isTimeAfter(timeA, timeB)` - Check if timeA is after timeB
- `parseTimeString(timeString)` - Parse string to dayjs object
- `formatTimeToString(time)` - Format dayjs to HH:mm string

### validationUtils.js
Validation utility functions:
- `validateTimeRange(startTime, endTime)` - Validate time range
- `checkTimeOverlap(slots, newSlot, excludeIndex)` - Check for overlaps
- `validateAllTimeSlots(slots)` - Validate all time slots
- `validateFormFields(suburb, km, slots)` - Validate entire form

### constants.js
- `DAY_THEMES` - Color themes for each day of the week

## 📦 Usage Example

### Basic Import
```javascript
import EditAvailabilityDrawer from './EditAvailabilityDrawer';

function MyComponent() {
  return (
    <EditAvailabilityDrawer
      open={isOpen}
      onClose={handleClose}
      onSave={handleSave}
      initialData={data}
    />
  );
}
```

### Using Individual Components
```javascript
import { 
  DrawerHeader, 
  AddTimeSlotForm, 
  TimeSlotsList 
} from './Components/EditDrawerComponents';

import { useAvailabilityForm } from './Components/EditDrawerComponents/hooks/useAvailabilityForm';
```

### Using Utilities
```javascript
import { 
  formatTimeDisplay, 
  calculateDuration,
  validateTimeRange 
} from './Components/EditDrawerComponents';
```

## 🎨 Design Principles

1. **Component Composition** - Build complex UIs from simple components
2. **Single Responsibility** - Each component does one thing well
3. **Props Over State** - Pass data down, callbacks up
4. **DRY (Don't Repeat Yourself)** - Utilities prevent code duplication
5. **SOLID Principles** - Follow object-oriented design principles
6. **Clean Code** - Self-documenting code with clear naming

## 🔄 Data Flow

```
EditAvailabilityDrawer (Parent)
    ↓ (uses hook)
useAvailabilityForm
    ↓ (provides state & handlers)
┌───────────────────────────────┐
│ DrawerHeader                  │ ← Display-only, no state
├───────────────────────────────┤
│ LocationPreferenceCard        │ ← Controlled component
├───────────────────────────────┤
│ AddTimeSlotForm               │ ← Form with validation
├───────────────────────────────┤
│ TimeSlotsList                 │ ← Display list with actions
├───────────────────────────────┤
│ DrawerFooter                  │ ← Action buttons
└───────────────────────────────┘
```

## 🧪 Testing Strategy

### Unit Tests
- Test each utility function independently
- Mock props for component tests
- Test validation logic thoroughly

### Integration Tests
- Test component interactions
- Test form submission flow
- Test error handling

### Example Test
```javascript
import { validateTimeRange } from './validationUtils';

describe('validateTimeRange', () => {
  it('should validate correct time range', () => {
    const result = validateTimeRange('09:00', '17:00');
    expect(result.isValid).toBe(true);
  });
  
  it('should reject invalid time range', () => {
    const result = validateTimeRange('17:00', '09:00');
    expect(result.isValid).toBe(false);
  });
});
```

## 📈 Performance Optimizations

1. **Memoization** - Use `React.memo()` for expensive components
2. **useCallback** - Prevent unnecessary re-renders
3. **useMemo** - Cache expensive calculations
4. **Code Splitting** - Lazy load when needed
5. **Virtual Scrolling** - For large lists (if needed)

## 🔐 Best Practices

### Do's ✅
- Keep components under 300 lines
- Use PropTypes or TypeScript
- Write self-documenting code
- Handle all edge cases
- Provide meaningful error messages
- Use semantic HTML
- Follow accessibility guidelines

### Don'ts ❌
- Don't mix business logic with UI
- Don't create God components
- Don't ignore PropTypes warnings
- Don't hardcode values
- Don't skip error handling
- Don't forget loading states

## 🚀 Future Improvements

1. **TypeScript Migration** - Add type safety
2. **Storybook Integration** - Component documentation
3. **E2E Tests** - Cypress or Playwright
4. **Performance Monitoring** - React DevTools Profiler
5. **Accessibility Audit** - WCAG 2.1 compliance
6. **Internationalization** - i18n support

## 📚 Related Documentation

- [React Best Practices](https://react.dev/learn)
- [Material-UI Guidelines](https://mui.com/material-ui/getting-started/)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)

## 🤝 Contributing

When adding new features:
1. Follow existing patterns
2. Keep components small and focused
3. Add PropTypes validation
4. Update this README
5. Write tests
6. Document your code

---

**Last Updated:** 2026-01-09  
**Maintainer:** Development Team
