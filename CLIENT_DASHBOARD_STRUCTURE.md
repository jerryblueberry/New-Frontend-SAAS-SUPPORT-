# Client Dashboard - Page Structure & Component Plan

## Overview
This document outlines the complete page structure for the Client Dashboard based on the enterprise-grade client profile model. All pages should follow best practices for separation of concerns, real-time data, and appealing UI/UX.

---

## 📁 Directory Structure

```
Frontend/src/pages/ClientPages/
├── ClientDashboard/
│   └── ClientDashboard.jsx (✅ Enhanced)
├── Profile/
│   ├── BasicInformation/
│   │   └── BasicInformation.jsx
│   ├── CarePreferences/
│   │   └── CarePreferences.jsx
│   ├── CarePlanSummary/
│   │   └── CarePlanSummary.jsx
│   └── CommunicationPreferences/
│       └── CommunicationPreferences.jsx
├── Workforce/
│   ├── JobRequests/
│   │   └── JobRequests.jsx
│   ├── Messages/
│   │   └── Messages.jsx
│   └── Sessions/
│       └── Sessions.jsx
├── Documents/
│   ├── DocumentsList/
│   │   └── DocumentsList.jsx
│   ├── DocumentUpload/
│   │   └── DocumentUpload.jsx
│   ├── PendingVerification/
│   │   └── PendingVerification.jsx
│   └── ExpiringSoon/
│       └── ExpiringSoon.jsx
├── Billing/
│   ├── BillingPreferences/
│   │   └── BillingPreferences.jsx
│   ├── Invoices/
│   │   └── Invoices.jsx
│   └── PaymentMethods/
│       └── PaymentMethods.jsx
├── Team/ (Organization only)
│   ├── TeamMembers/
│   │   └── TeamMembers.jsx
│   ├── Invitations/
│   │   └── Invitations.jsx
│   └── Permissions/
│       └── Permissions.jsx
├── Analytics/
│   ├── EngagementMetrics/
│   │   └── EngagementMetrics.jsx
│   ├── ActivityHistory/
│   │   └── ActivityHistory.jsx
│   └── AuditLog/
│       └── AuditLog.jsx
└── Settings/
    ├── GeneralSettings/
    │   └── GeneralSettings.jsx
    ├── SecurityPrivacy/
    │   └── SecurityPrivacy.jsx
    ├── Notifications/
    │   └── Notifications.jsx
    ├── ConsentsPrivacy/
    │   └── ConsentsPrivacy.jsx
    └── LocaleSettings/
        └── LocaleSettings.jsx
```

---

## 🎯 Page Details

### 1. Profile Management Pages

#### 1.1 Basic Information (`/client/profile/basic`)
**Purpose**: Manage core profile information
**Fields from Model**:
- Account Type (individual/organization)
- Organization Name & ABN (if org)
- Address (street, suburb, state, postcode, coordinates)
- NDIS Number
- Emergency Contact

**Features**:
- Edit form with validation
- GPS location picker
- Real-time address validation
- Auto-save draft
- Change history tracking

**Components Needed**:
- `BasicInformationForm.jsx`
- `AddressSelector.jsx`
- `EmergencyContactForm.jsx`

---

#### 1.2 Care Preferences (`/client/profile/preferences`)
**Purpose**: Manage care and service preferences
**Fields from Model**:
- Support Categories (required)
- Service Regions (required)
- Worker Preferences (gender, age, experience)
- Cultural Preferences (dietary, religious)
- Service Delivery (in-person/remote)
- Availability (days, time slots)
- Special Requirements

**Features**:
- Multi-select for categories
- Region autocomplete
- Preference matching suggestions
- Save as draft or submit

**Components Needed**:
- `SupportCategoriesSelector.jsx`
- `ServiceRegionsSelector.jsx`
- `WorkerPreferencesForm.jsx`
- `CulturalPreferencesForm.jsx`
- `AvailabilityScheduler.jsx`

---

#### 1.3 Care Plan Summary (`/client/profile/care-plan`)
**Purpose**: Manage NDIS care plan details
**Fields from Model**:
- Plan Start/End Date
- Total Budget
- Used Budget (read-only, calculated)
- Remaining Budget (read-only, calculated)
- Goals (array)
- Notes

**Features**:
- Budget visualization (charts)
- Goal tracking
- Budget alerts (80%, 90%, 100%)
- Plan period calendar view
- Historical budget tracking

**Components Needed**:
- `CarePlanForm.jsx`
- `BudgetVisualization.jsx`
- `GoalsTracker.jsx`
- `BudgetAlerts.jsx`

---

#### 1.4 Communication Preferences (`/client/profile/communication`)
**Purpose**: Manage how client wants to be contacted
**Fields from Model**:
- Preferred Method (email, sms, phone, portal)
- Preferred Language
- Accessibility Needs (array)
- Communication Notes

**Features**:
- Method preference selector
- Language selector
- Accessibility checklist
- Test notification button
- Communication history

**Components Needed**:
- `CommunicationPreferencesForm.jsx`
- `AccessibilityNeedsSelector.jsx`
- `NotificationTester.jsx`

---

### 2. Workforce Management Pages

#### 2.1 Job Requests (`/client/workforce/requests`)
**Purpose**: Manage job postings and worker requests
**Features**:
- List active/pending/completed jobs
- Create new job posting
- View worker applications
- Accept/reject workers
- Job analytics

**Components Needed**:
- `JobRequestsList.jsx`
- `JobPostingForm.jsx`
- `WorkerApplicationsList.jsx`
- `JobAnalytics.jsx`

---

#### 2.2 Messages (`/client/workforce/messages`)
**Purpose**: Communication with workers
**Features**:
- Message inbox
- Real-time chat
- Message history
- File attachments
- Read receipts

**Components Needed**:
- `MessagesInbox.jsx`
- `ChatWindow.jsx`
- `MessageThread.jsx`

---

#### 2.3 Sessions (`/client/workforce/sessions`)
**Purpose**: Manage scheduled sessions
**Features**:
- Calendar view
- Session list
- Create/edit sessions
- Session history
- Attendance tracking

**Components Needed**:
- `SessionsCalendar.jsx`
- `SessionsList.jsx`
- `SessionForm.jsx`
- `AttendanceTracker.jsx`

---

### 3. Documents Management Pages

#### 3.1 Documents List (`/client/documents`)
**Purpose**: View and manage all documents
**Fields from Model**:
- Document array with: type, title, url, publicId, fileName, fileSize, mimeType
- Verification status (verified, verifiedBy, verifiedAt)
- Expiry tracking (expiresAt)
- Upload metadata (uploadedAt, uploadedBy)
- Notes

**Features**:
- Document grid/list view
- Upload new documents (Cloudinary)
- View/download documents
- Delete documents
- Filter by type, status, expiry
- Search documents
- Bulk operations

**Components Needed**:
- `DocumentsGrid.jsx`
- `DocumentUploader.jsx` (Cloudinary integration)
- `DocumentCard.jsx`
- `DocumentFilters.jsx`
- `DocumentViewer.jsx`

---

#### 3.2 Pending Verification (`/client/documents/pending`)
**Purpose**: View documents awaiting admin verification
**Features**:
- Filter unverified documents
- View verification status
- Resubmit if rejected
- Contact admin option

**Components Needed**:
- `PendingDocumentsList.jsx`
- `VerificationStatusCard.jsx`

---

#### 3.3 Expiring Soon (`/client/documents/expiring`)
**Purpose**: Track documents expiring within 30 days
**Features**:
- List expiring documents
- Days until expiry
- Renewal reminders
- Auto-renewal options

**Components Needed**:
- `ExpiringDocumentsList.jsx`
- `RenewalReminder.jsx`

---

### 4. Billing & Payments Pages

#### 4.1 Billing Preferences (`/client/billing/preferences`)
**Purpose**: Manage billing and payment settings
**Fields from Model**:
- Funding Type (self_funded, plan_managed, etc.)
- Payment Method (invoice, credit_card, etc.)
- Invoice Email
- Billing Address
- Notes

**Features**:
- Edit billing preferences
- Test invoice email
- Billing address validation
- Payment method management

**Components Needed**:
- `BillingPreferencesForm.jsx`
- `PaymentMethodSelector.jsx`
- `BillingAddressForm.jsx`

---

#### 4.2 Invoices (`/client/billing/invoices`)
**Purpose**: View and manage invoices
**Features**:
- Invoice list
- Filter by status, date
- Download PDF invoices
- Payment tracking
- Invoice history

**Components Needed**:
- `InvoicesList.jsx`
- `InvoiceDetail.jsx`
- `InvoiceFilters.jsx`
- `PaymentTracker.jsx`

---

#### 4.3 Payment Methods (`/client/billing/payment-methods`)
**Purpose**: Manage payment methods
**Features**:
- Add/edit payment methods
- Set default method
- Payment security
- Transaction history

**Components Needed**:
- `PaymentMethodsList.jsx`
- `PaymentMethodForm.jsx`
- `TransactionHistory.jsx`

---

### 5. Team Management Pages (Organization Only)

#### 5.1 Team Members (`/client/team/members`)
**Purpose**: Manage organization team members
**Fields from Model**:
- organizationMembers array
- User reference
- Role (owner, manager, staff, viewer)
- Permissions object
- Status (pending, active, inactive, removed)
- Invitation metadata

**Features**:
- Team member list
- Add/remove members
- Role management
- Permission editor
- Activity tracking

**Components Needed**:
- `TeamMembersList.jsx`
- `TeamMemberCard.jsx`
- `RoleSelector.jsx`
- `PermissionsEditor.jsx`
- `MemberActivity.jsx`

---

#### 5.2 Invitations (`/client/team/invitations`)
**Purpose**: Manage team invitations
**Features**:
- Pending invitations list
- Send new invitation
- Resend/cancel invitations
- Invitation history

**Components Needed**:
- `InvitationsList.jsx`
- `InvitationForm.jsx`
- `InvitationHistory.jsx`

---

#### 5.3 Permissions (`/client/team/permissions`)
**Purpose**: Manage role-based permissions
**Features**:
- Permission matrix
- Role templates
- Custom permissions
- Permission audit

**Components Needed**:
- `PermissionsMatrix.jsx`
- `RoleTemplates.jsx`
- `PermissionAudit.jsx`

---

### 6. Analytics & Insights Pages

#### 6.1 Engagement Metrics (`/client/analytics/engagement`)
**Purpose**: View engagement analytics
**Fields from Model**:
- lastLogin, totalLogins
- jobsPosted, jobsActive
- workersContacted
- messagesExchanged
- lastJobPostedAt, lastWorkerContactedAt
- profileViewCount
- averageResponseTime

**Features**:
- Engagement dashboard
- Charts and graphs
- Trend analysis
- Comparison with averages
- Export reports

**Components Needed**:
- `EngagementDashboard.jsx`
- `EngagementCharts.jsx`
- `TrendAnalysis.jsx`
- `EngagementReports.jsx`

---

#### 6.2 Activity History (`/client/analytics/activity`)
**Purpose**: View activity timeline
**Features**:
- Activity feed
- Filter by type, date
- Search activities
- Export activity log

**Components Needed**:
- `ActivityTimeline.jsx`
- `ActivityFilters.jsx`
- `ActivityExport.jsx`

---

#### 6.3 Audit Log (`/client/analytics/audit-log`)
**Purpose**: View change history
**Fields from Model**:
- changeHistory array
- Field, oldValue, newValue
- changedBy, changedAt
- Reason, changeType

**Features**:
- Audit log table
- Filter by field, user, date
- Change diff viewer
- Export audit log
- Compliance reports

**Components Needed**:
- `AuditLogTable.jsx`
- `ChangeDiffViewer.jsx`
- `AuditFilters.jsx`
- `ComplianceReports.jsx`

---

### 7. Settings Pages

#### 7.1 General Settings (`/client/settings/general`)
**Purpose**: General account settings
**Features**:
- Profile visibility
- Account preferences
- Display preferences
- Data export

**Components Needed**:
- `GeneralSettingsForm.jsx`
- `ProfileVisibilitySettings.jsx`
- `DataExport.jsx`

---

#### 7.2 Security & Privacy (`/client/settings/security`)
**Purpose**: Security and privacy settings
**Features**:
- Password change
- Two-factor authentication
- Active sessions
- Privacy controls
- Data deletion

**Components Needed**:
- `SecuritySettingsForm.jsx`
- `TwoFactorAuth.jsx`
- `ActiveSessions.jsx`
- `PrivacyControls.jsx`

---

#### 7.3 Notifications (`/client/settings/notifications`)
**Purpose**: Manage notification preferences
**Features**:
- Notification channels
- Notification types
- Quiet hours
- Notification history

**Components Needed**:
- `NotificationPreferencesForm.jsx`
- `NotificationChannels.jsx`
- `QuietHours.jsx`

---

#### 7.4 Consents & Privacy (`/client/settings/consents`)
**Purpose**: Manage legal consents
**Fields from Model**:
- dataSharing
- thirdPartyAccess
- marketingEmails
- analyticsTracking
- consentVersion
- lastUpdated

**Features**:
- Consent toggles
- Consent history
- Privacy policy links
- GDPR compliance

**Components Needed**:
- `ConsentsForm.jsx`
- `ConsentHistory.jsx`
- `PrivacyPolicyViewer.jsx`

---

#### 7.5 Language & Region (`/client/settings/locale`)
**Purpose**: Manage localization settings
**Fields from Model**:
- timezone
- currency
- locale
- dateFormat

**Features**:
- Timezone selector
- Currency selector
- Language selector
- Date format selector
- Preview changes

**Components Needed**:
- `LocaleSettingsForm.jsx`
- `TimezoneSelector.jsx`
- `CurrencySelector.jsx`
- `DateFormatSelector.jsx`

---

## 🎨 UI/UX Best Practices

### Design Principles
1. **Consistency**: Use MUI theme throughout
2. **Responsiveness**: Mobile-first design
3. **Accessibility**: WCAG 2.1 AA compliance
4. **Performance**: Lazy loading, code splitting
5. **Real-time**: Live data updates where applicable
6. **Feedback**: Loading states, error handling, success messages

### Component Patterns
- **Form Components**: Use `react-hook-form` with Zod validation
- **Data Fetching**: TanStack Query for caching and real-time updates
- **State Management**: Zustand for local state, React Query for server state
- **Error Handling**: Centralized error formatter
- **Loading States**: Skeleton loaders, progress indicators
- **Empty States**: Helpful messages with action buttons

### Real-time Features
- WebSocket for live updates (messages, notifications)
- Polling for engagement metrics
- Optimistic updates for better UX
- Background sync for offline support

---

## 🔄 Data Flow

### API Integration
- All pages use TanStack Query hooks
- Centralized API client (`api/clientProfile.js`)
- Error handling via `errorFormatter.js`
- Success messages via toast notifications

### State Management
- Server state: TanStack Query
- Local state: React hooks
- Global state: Zustand (if needed)
- Form state: react-hook-form

---

## 📝 Implementation Priority

### Phase 1 (Core Features)
1. ✅ Dashboard (Enhanced)
2. ✅ Sidebar (Enhanced)
3. Profile - Basic Information
4. Profile - Care Preferences
5. Documents - List & Upload

### Phase 2 (Essential Features)
6. Billing - Preferences
7. Analytics - Engagement Metrics
8. Settings - General & Security
9. Documents - Verification & Expiry

### Phase 3 (Advanced Features)
10. Team Management (Organizations)
11. Analytics - Audit Log
12. Settings - Consents & Locale
13. Workforce - All pages

### Phase 4 (Enhancements)
14. Real-time features
15. Advanced analytics
16. Export/Import functionality
17. Mobile app optimizations

---

## 🚀 Next Steps

1. Create page components following the structure above
2. Implement shared components (forms, cards, lists)
3. Set up routing in main App.jsx
4. Add API endpoints in backend
5. Implement real-time features
6. Add comprehensive error handling
7. Write unit and integration tests
8. Performance optimization
9. Accessibility audit
10. User testing and feedback

---

## 📚 Additional Resources

- MUI Documentation: https://mui.com/
- TanStack Query: https://tanstack.com/query
- React Hook Form: https://react-hook-form.com/
- Zod Validation: https://zod.dev/
- Cloudinary Docs: https://cloudinary.com/documentation

---

**Last Updated**: 2025-01-08
**Version**: 1.0.0

