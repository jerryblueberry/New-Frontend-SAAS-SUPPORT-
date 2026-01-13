# CarePreferences Component Architecture

## Overview
The CarePreferences component has been refactored from a monolithic 1602-line component into a modular, maintainable architecture following React best practices and SaaS-level folder structure.

## 📁 Folder Structure

```
CarePreferences/
├── CarePreferences.jsx          # Main orchestrator component (~150 lines)
├── index.js                     # Centralized exports
├── README.md                    # This file
├── components/                  # UI Components
│   ├── index.js
│   ├── HeaderCard.jsx           # Page header with edit button
│   ├── SupportCategoriesSection.jsx  # Support categories selection
│   ├── ServiceRegionsSection.jsx    # Service regions with add/remove
│   ├── WorkerPreferencesSection.jsx # Worker preferences (gender, age)
│   ├── CulturalPreferencesSection.jsx # Cultural preferences (dietary, religious, lifestyle)
│   ├── AvailabilitySection.jsx  # Availability schedule
│   ├── ServiceDeliverySection.jsx # Service delivery options
│   ├── SpecialRequirementsSection.jsx # Special requirements
│   ├── ActionButtons.jsx        # Save/Cancel buttons
│   ├── ErrorState.jsx           # Error display
│   └── OrganizationRestriction.jsx # Organization restriction message
├── hooks/                       # Custom Hooks
│   ├── index.js
│   ├── useCarePreferences.js    # Main form logic hook
│   ├── useArrayInput.js         # Array input management
│   └── useAvailability.js        # Availability management
└── utils/                       # Utilities & Constants
    ├── index.js
    ├── validation.js            # Zod validation schemas
    └── formHelpers.js           # Form utility functions
```

## 🎯 Key Benefits

### 1. **Separation of Concerns**
- **Components**: UI-only, receive props and callbacks
- **Hooks**: Business logic and state management
- **Utils**: Pure functions, no side effects

### 2. **Reusability**
- Components can be reused across the application
- Hooks can be shared with other preference-related features
- Utilities are framework-agnostic

### 3. **Maintainability**
- Each file has a single responsibility
- Easy to locate and fix bugs
- Clear import paths with index files

### 4. **Testability**
- Pure utility functions are easy to unit test
- Components can be tested in isolation
- Hooks can be tested independently

## 📝 Component Details

### Main Component (`CarePreferences.jsx`)
- Orchestrates all sub-components
- Handles form submission
- Manages edit/view mode state

### Hooks
- **useCarePreferences**: Main form logic, validation, submission
- **useArrayInput**: Generic array add/remove functionality
- **useAvailability**: Day/time slot toggle management

### Components
- **HeaderCard**: Page header with title and edit button
- **SupportCategoriesSection**: Multi-select support categories
- **ServiceRegionsSection**: Dynamic service regions with add/remove
- **WorkerPreferencesSection**: Worker gender, age group, notes
- **CulturalPreferencesSection**: Dietary, religious, lifestyle preferences
- **AvailabilitySection**: Weekly availability schedule
- **ServiceDeliverySection**: In-person/remote, start date, duration
- **SpecialRequirementsSection**: Special requirements text area
- **ActionButtons**: Save and cancel actions
- **ErrorState/OrganizationRestriction**: State displays

### Utils
- **validation.js**: Zod schemas for form validation
- **formHelpers.js**: Form value formatting, defaults, and payload building

## 🔄 Usage

```jsx
import CarePreferences from '@/components/ClientComponents/ClientProfile/CarePreferences'

// In page component
<CarePreferences />
```

## 🚀 Future Enhancements
- Add unit tests for hooks and utils
- Add Storybook stories for components
- Add accessibility improvements
- Add form auto-save functionality
- Add validation error highlighting
