# BasicInformation Component Architecture

## Overview
The BasicInformation component has been refactored from a monolithic 1285-line component into a modular, maintainable architecture following React best practices and SaaS-level folder structure.

## 📁 Folder Structure

```
BasicInformation/
├── BasicInformation.jsx          # Main orchestrator component (~150 lines)
├── index.js                      # Centralized exports
├── README.md                     # This file
├── components/                  # UI Components
│   ├── index.js
│   ├── HeaderCard.jsx           # Page header with edit button
│   ├── AccountInformationSection.jsx  # Account type, org name, ABN
│   ├── AddressSection.jsx       # Address with GPS location
│   ├── OptionalFieldsSection.jsx # NDIS number, emergency contact
│   ├── ActionButtons.jsx        # Save/Cancel buttons
│   ├── EmptyState.jsx           # No profile found state
│   ├── ErrorState.jsx           # Error display
│   └── LoadingState.jsx        # Loading spinner
├── hooks/                       # Custom Hooks
│   ├── index.js
│   ├── useBasicInformation.js   # Main form logic hook
│   └── useGeolocation.js        # GPS location functionality
└── utils/                       # Utilities & Constants
    ├── index.js
    ├── constants.js             # Constants & configurations
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
- Hooks can be shared with other profile-related features
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

### Main Component (`BasicInformation.jsx`)
- Orchestrates all sub-components
- Handles form submission
- Manages edit/view mode state

### Hooks
- **useBasicInformation**: Main form logic, validation, submission
- **useGeolocation**: GPS location detection and address fetching

### Components
- **HeaderCard**: Page header with title and edit button
- **AccountInformationSection**: Account type, organization fields
- **AddressSection**: Address input with GPS/manual options
- **OptionalFieldsSection**: NDIS number and emergency contact
- **ActionButtons**: Save and cancel actions
- **EmptyState/ErrorState/LoadingState**: State displays

### Utils
- **constants.js**: Account types and labels
- **validation.js**: Zod schemas for form validation
- **formHelpers.js**: Form value formatting and defaults

## 🔄 Usage

```jsx
import BasicInformation from '@/components/ClientComponents/ClientProfile/BasicInformation'

// In page component
<BasicInformation />
```

## 🚀 Future Enhancements
- Add unit tests for hooks and utils
- Add Storybook stories for components
- Add accessibility improvements
- Add form auto-save functionality
