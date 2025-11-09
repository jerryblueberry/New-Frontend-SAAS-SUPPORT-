# Complete Dashboard Structure - Client & Admin

## 📋 TABLE OF CONTENTS

1. [Client Dashboard Structure](#client-dashboard-structure)
2. [Admin Dashboard Structure](#admin-dashboard-structure)
3. [Component Architecture](#component-architecture)
4. [Page-Component Mapping](#page-component-mapping)
5. [API Integration Patterns](#api-integration-patterns)

---

## 🎯 CLIENT DASHBOARD STRUCTURE

### **Sidebar Menu Items** (Based on Model)

```
📊 Dashboard
   └── /client-dashboard

👤 Profile
   ├── Basic Information → /client/profile/basic
   ├── Care Preferences → /client/profile/preferences
   ├── Care Plan Summary → /client/profile/care-plan
   └── Communication → /client/profile/communication

👥 Workforce
   ├── Job Requests → /client/workforce/requests
   ├── Messages → /client/workforce/messages
   └── Sessions → /client/workforce/sessions

📄 Documents
   ├── All Documents → /client/documents
   ├── Pending Verification → /client/documents/pending
   └── Expiring Soon → /client/documents/expiring

💳 Billing & Payments
   ├── Billing Preferences → /client/billing/preferences
   ├── Invoices → /client/billing/invoices
   └── Payment Methods → /client/billing/payment-methods

👨‍👩‍👧‍👦 Team Management (Organizations only)
   ├── Team Members → /client/team/members
   ├── Invitations → /client/team/invitations
   └── Roles & Permissions → /client/team/permissions

📈 Analytics & Insights
   ├── Engagement Metrics → /client/analytics/engagement
   ├── Activity History → /client/analytics/activity
   └── Audit Log → /client/analytics/audit-log

⚙️ Settings
   ├── General Settings → /client/settings/general
   ├── Security & Privacy → /client/settings/security
   ├── Notifications → /client/settings/notifications
   ├── Consents & Privacy → /client/settings/consents
   └── Language & Region → /client/settings/locale
```

---

## 🎯 ADMIN DASHBOARD STRUCTURE

### **Sidebar Menu Items** (Based on Model & Admin Needs)

```
📊 Dashboard
   └── /admin-dashboard

👥 Client Management
   ├── All Clients → /admin/clients
   ├── Pending Verification → /admin/clients/pending
   ├── Verified Clients → /admin/clients/verified
   ├── Rejected Clients → /admin/clients/rejected
   ├── High-Value Clients → /admin/clients/high-value
   ├── Flagged Clients → /admin/clients/flagged
   ├── Client Details → /admin/clients/:id
   └── Client Analytics → /admin/clients/analytics

📄 Document Verification
   ├── Pending Documents → /admin/documents/pending
   ├── Expiring Documents → /admin/documents/expiring
   ├── Verified Documents → /admin/documents/verified
   └── Document Analytics → /admin/documents/analytics

📝 Admin Notes & Reviews
   ├── All Notes → /admin/notes
   ├── Unresolved Notes → /admin/notes/unresolved
   ├── Internal Notes → /admin/notes/internal
   └── Public Notes → /admin/notes/public

📊 Audit & Compliance
   ├── Change History → /admin/audit/changes
   ├── Field-Level Audit → /admin/audit/fields
   ├── User Activity → /admin/audit/activity
   ├── Compliance Reports → /admin/audit/compliance
   └── Export Audit Log → /admin/audit/export

🏢 Organization Management
   ├── All Organizations → /admin/organizations
   ├── Organization Members → /admin/organizations/members
   ├── Team Permissions → /admin/organizations/permissions
   └── Organization Analytics → /admin/organizations/analytics

💰 Billing & Payments (Admin View)
   ├── Client Billing → /admin/billing/clients
   ├── Funding Types → /admin/billing/funding-types
   ├── Payment Methods → /admin/billing/payment-methods
   └── Billing Analytics → /admin/billing/analytics

📈 Analytics & Insights
   ├── Engagement Metrics → /admin/analytics/engagement
   ├── Client Growth → /admin/analytics/growth
   ├── Profile Completeness → /admin/analytics/completeness
   ├── Verification Stats → /admin/analytics/verification
   ├── Document Stats → /admin/analytics/documents
   └── AI/ML Insights → /admin/analytics/ai-insights

🚩 System Flags & Alerts
   ├── Needs Re-verification → /admin/flags/reverification
   ├── Manual Review Required → /admin/flags/manual-review
   ├── Duplicate Detection → /admin/flags/duplicates
   ├── Priority Support → /admin/flags/priority
   └── On Hold Accounts → /admin/flags/on-hold

👥 User Management
   ├── All Users → /users/all
   ├── Add User → /users/add
   └── Roles & Permissions → /users/roles

⚙️ Settings
   ├── General → /settings/general
   ├── Security → /settings/security
   ├── Backup → /settings/backup
   ├── Integrations → /settings/integrations
   ├── API Keys → /settings/api
   ├── Notifications → /settings/notifications
   ├── Email Settings → /settings/email
   ├── SMS Settings → /settings/sms
   ├── Localization → /settings/localization
   └── Appearance → /settings/appearance
```

---

## 📁 PAGE-COMPONENT MAPPING

### **1. Client Profile Pages**

#### **1.1 Basic Information** (`/client/profile/basic`)
**Page**: `ClientPages/Profile/BasicInformation/BasicInformation.jsx`

**Components**:
- `BasicInformationForm.jsx` - Main form component
- `AddressSelector.jsx` - Address input with GPS
- `EmergencyContactForm.jsx` - Emergency contact fields
- `OrganizationFields.jsx` - Org name & ABN (conditional)
- `ProfileStatusCard.jsx` - Display current status

**API Calls**:
- `GET /api/client/profile/basic` - Load data
- `PATCH /api/client/profile/basic` - Update (minimal)

---

#### **1.2 Care Preferences** (`/client/profile/preferences`)
**Page**: `ClientPages/Profile/CarePreferences/CarePreferences.jsx`

**Components**:
- `SupportCategoriesSelector.jsx` - Multi-select for categories
- `ServiceRegionsSelector.jsx` - Region autocomplete
- `WorkerPreferencesForm.jsx` - Gender, age, experience
- `CulturalPreferencesForm.jsx` - Dietary, religious
- `AvailabilityScheduler.jsx` - Days & time slots
- `ServiceDeliveryOptions.jsx` - In-person/remote

**API Calls**:
- `GET /api/client/profile/preferences` - Load data
- `PATCH /api/client/profile/preferences` - Update (minimal)

---

#### **1.3 Care Plan Summary** (`/client/profile/care-plan`)
**Page**: `ClientPages/Profile/CarePlanSummary/CarePlanSummary.jsx`

**Components**:
- `CarePlanForm.jsx` - Plan dates, budget, goals
- `BudgetVisualization.jsx` - Charts (used/remaining)
- `GoalsTracker.jsx` - Goals list with progress
- `BudgetAlerts.jsx` - Alerts for 80%, 90%, 100%
- `PlanPeriodCalendar.jsx` - Visual plan timeline

**API Calls**:
- `GET /api/client/profile/care-plan` - Load data
- `PATCH /api/client/profile/care-plan` - Update (minimal)

---

#### **1.4 Communication Preferences** (`/client/profile/communication`)
**Page**: `ClientPages/Profile/CommunicationPreferences/CommunicationPreferences.jsx`

**Components**:
- `CommunicationPreferencesForm.jsx` - Method, language
- `AccessibilityNeedsSelector.jsx` - Accessibility checklist
- `NotificationTester.jsx` - Test notification button
- `CommunicationHistory.jsx` - Recent communications

**API Calls**:
- `GET /api/client/profile/communication` - Load data
- `PATCH /api/client/profile/communication` - Update (minimal)

---

### **2. Documents Management Pages**

#### **2.1 Documents List** (`/client/documents`)
**Page**: `ClientPages/Documents/DocumentsList/DocumentsList.jsx`

**Components**:
- `DocumentsGrid.jsx` - Grid view of documents
- `DocumentsList.jsx` - List view option
- `DocumentCard.jsx` - Individual document card
- `DocumentUploader.jsx` - Cloudinary upload component
- `DocumentFilters.jsx` - Filter by type, status, expiry
- `DocumentSearch.jsx` - Search documents
- `DocumentViewer.jsx` - View/download modal

**API Calls**:
- `GET /api/client/documents` - List all (with filters)
- `POST /api/client/documents` - Upload
- `GET /api/client/documents/:id` - Get details
- `PATCH /api/client/documents/:id` - Update
- `DELETE /api/client/documents/:id` - Delete

---

#### **2.2 Pending Verification** (`/client/documents/pending`)
**Page**: `ClientPages/Documents/PendingVerification/PendingVerification.jsx`

**Components**:
- `PendingDocumentsList.jsx` - List unverified docs
- `VerificationStatusCard.jsx` - Status display
- `ResubmitDocument.jsx` - Resubmit if rejected

**API Calls**:
- `GET /api/client/documents/status/pending` - Filter pending

---

#### **2.3 Expiring Soon** (`/client/documents/expiring`)
**Page**: `ClientPages/Documents/ExpiringSoon/ExpiringSoon.jsx`

**Components**:
- `ExpiringDocumentsList.jsx` - List expiring docs
- `RenewalReminder.jsx` - Renewal alerts
- `DocumentRenewalForm.jsx` - Renew document

**API Calls**:
- `GET /api/client/documents/status/expiring` - Filter expiring

---

### **3. Billing & Payments Pages**

#### **3.1 Billing Preferences** (`/client/billing/preferences`)
**Page**: `ClientPages/Billing/BillingPreferences/BillingPreferences.jsx`

**Components**:
- `BillingPreferencesForm.jsx` - Funding type, payment method
- `PaymentMethodSelector.jsx` - Payment method dropdown
- `BillingAddressForm.jsx` - Billing address
- `InvoiceEmailSettings.jsx` - Invoice email config

**API Calls**:
- `GET /api/client/billing/preferences` - Load data
- `PATCH /api/client/billing/preferences` - Update (minimal)

---

#### **3.2 Invoices** (`/client/billing/invoices`)
**Page**: `ClientPages/Billing/Invoices/Invoices.jsx`

**Components**:
- `InvoicesList.jsx` - List invoices
- `InvoiceDetail.jsx` - Invoice details modal
- `InvoiceFilters.jsx` - Filter by status, date
- `PaymentTracker.jsx` - Payment status

**API Calls**:
- `GET /api/client/billing/invoices` - List invoices

---

### **4. Team Management Pages** (Organizations only)

#### **4.1 Team Members** (`/client/team/members`)
**Page**: `ClientPages/Team/TeamMembers/TeamMembers.jsx`

**Components**:
- `TeamMembersList.jsx` - List members
- `TeamMemberCard.jsx` - Member card with role
- `AddMemberForm.jsx` - Invite new member
- `RoleSelector.jsx` - Role dropdown
- `PermissionsEditor.jsx` - Permission matrix
- `MemberActivity.jsx` - Member activity log

**API Calls**:
- `GET /api/client/team/members` - List members
- `POST /api/client/team/members` - Add/invite
- `PATCH /api/client/team/members/:id` - Update
- `DELETE /api/client/team/members/:id` - Remove

---

### **5. Analytics & Insights Pages**

#### **5.1 Engagement Metrics** (`/client/analytics/engagement`)
**Page**: `ClientPages/Analytics/EngagementMetrics/EngagementMetrics.jsx`

**Components**:
- `EngagementDashboard.jsx` - Main dashboard
- `EngagementCharts.jsx` - Charts (line, bar, pie)
- `TrendAnalysis.jsx` - Trend indicators
- `EngagementReports.jsx` - Export reports

**API Calls**:
- `GET /api/client/analytics/engagement` - Get metrics

---

#### **5.2 Activity History** (`/client/analytics/activity`)
**Page**: `ClientPages/Analytics/ActivityHistory/ActivityHistory.jsx`

**Components**:
- `ActivityTimeline.jsx` - Timeline view
- `ActivityFilters.jsx` - Filter by type, date
- `ActivityExport.jsx` - Export functionality

**API Calls**:
- `GET /api/client/analytics/activity` - Get activity

---

#### **5.3 Audit Log** (`/client/analytics/audit-log`)
**Page**: `ClientPages/Analytics/AuditLog/AuditLog.jsx`

**Components**:
- `AuditLogTable.jsx` - Table view
- `ChangeDiffViewer.jsx` - Show old vs new values
- `AuditFilters.jsx` - Filter by field, user, date
- `ComplianceReports.jsx` - Compliance export

**API Calls**:
- `GET /api/client/analytics/audit-log` - Get audit log

---

### **6. Settings Pages**

#### **6.1 Consents & Privacy** (`/client/settings/consents`)
**Page**: `ClientPages/Settings/ConsentsPrivacy/ConsentsPrivacy.jsx`

**Components**:
- `ConsentsForm.jsx` - Consent toggles
- `ConsentHistory.jsx` - Consent change history
- `PrivacyPolicyViewer.jsx` - Privacy policy display

**API Calls**:
- `GET /api/client/settings/consents` - Load consents
- `PATCH /api/client/settings/consents` - Update consents

---

#### **6.2 Language & Region** (`/client/settings/locale`)
**Page**: `ClientPages/Settings/LocaleSettings/LocaleSettings.jsx`

**Components**:
- `LocaleSettingsForm.jsx` - Main form
- `TimezoneSelector.jsx` - Timezone dropdown
- `CurrencySelector.jsx` - Currency dropdown
- `DateFormatSelector.jsx` - Date format options
- `LocalePreview.jsx` - Preview changes

**API Calls**:
- `GET /api/client/settings/locale` - Load settings
- `PATCH /api/client/settings/locale` - Update settings

---

## 🎯 ADMIN PAGES STRUCTURE

### **1. Client Management Pages**

#### **1.1 All Clients** (`/admin/clients`)
**Page**: `AdminPages/Clients/AllClients/AllClients.jsx`

**Components**:
- `ClientsTable.jsx` - Data table with sorting/filtering
- `ClientFilters.jsx` - Filter by status, type, flags
- `ClientSearch.jsx` - Search clients
- `ClientActions.jsx` - Bulk actions
- `ClientExport.jsx` - Export functionality

**API Calls**:
- `GET /api/admin/clients` - List clients (with pagination)

---

#### **1.2 Client Details** (`/admin/clients/:id`)
**Page**: `AdminPages/Clients/ClientDetails/ClientDetails.jsx`

**Components**:
- `ClientOverview.jsx` - Profile summary
- `ClientTabs.jsx` - Tab navigation
  - Basic Info Tab
  - Preferences Tab
  - Documents Tab
  - Billing Tab
  - Team Tab (if org)
  - Analytics Tab
  - Audit Log Tab
  - Admin Notes Tab
- `StatusActions.jsx` - Verify/Reject/Action buttons
- `FlagManager.jsx` - Set/clear flags
- `AdminNotesPanel.jsx` - Add/view notes

**API Calls**:
- `GET /api/admin/clients/:id` - Get full profile
- `PATCH /api/admin/clients/:id` - Update (admin override)
- `POST /api/admin/clients/:id/verify` - Verify profile
- `POST /api/admin/clients/:id/reject` - Reject profile
- `POST /api/admin/clients/:id/flags` - Set flags

---

#### **1.3 Pending Verification** (`/admin/clients/pending`)
**Page**: `AdminPages/Clients/PendingVerification/PendingVerification.jsx`

**Components**:
- `PendingClientsList.jsx` - List submitted profiles
- `QuickReviewCard.jsx` - Quick review panel
- `BulkVerifyActions.jsx` - Bulk verify/reject

**API Calls**:
- `GET /api/admin/clients?status=submitted` - Filter pending

---

#### **1.4 Flagged Clients** (`/admin/clients/flagged`)
**Page**: `AdminPages/Clients/FlaggedClients/FlaggedClients.jsx`

**Components**:
- `FlaggedClientsList.jsx` - List flagged clients
- `FlagFilter.jsx` - Filter by flag type
- `FlagActions.jsx` - Clear flags, take action

**API Calls**:
- `GET /api/admin/clients?flags=true` - Filter flagged

---

### **2. Document Verification Pages**

#### **2.1 Pending Documents** (`/admin/documents/pending`)
**Page**: `AdminPages/Documents/PendingDocuments/PendingDocuments.jsx`

**Components**:
- `PendingDocumentsTable.jsx` - List unverified docs
- `DocumentViewer.jsx` - View document
- `VerificationActions.jsx` - Verify/Reject buttons
- `BulkVerifyActions.jsx` - Bulk operations

**API Calls**:
- `GET /api/admin/documents/pending` - List pending
- `POST /api/admin/documents/:id/verify` - Verify document
- `POST /api/admin/documents/:id/reject` - Reject document

---

### **3. Admin Notes Pages**

#### **3.1 All Notes** (`/admin/notes`)
**Page**: `AdminPages/Notes/AllNotes/AllNotes.jsx`

**Components**:
- `NotesList.jsx` - List all notes
- `NoteCard.jsx` - Note card with actions
- `AddNoteForm.jsx` - Add new note
- `NoteFilters.jsx` - Filter by visibility, resolved

**API Calls**:
- `GET /api/admin/notes` - List notes
- `POST /api/admin/notes` - Add note
- `PATCH /api/admin/notes/:id` - Update note

---

### **4. Audit & Compliance Pages**

#### **4.1 Change History** (`/admin/audit/changes`)
**Page**: `AdminPages/Audit/ChangeHistory/ChangeHistory.jsx`

**Components**:
- `ChangeHistoryTable.jsx` - Table of changes
- `ChangeDiffViewer.jsx` - Show old vs new
- `AuditFilters.jsx` - Filter by field, user, date
- `AuditExport.jsx` - Export audit log

**API Calls**:
- `GET /api/admin/audit/changes` - Get change history

---

### **5. Analytics Pages**

#### **5.1 Client Analytics** (`/admin/analytics/clients`)
**Page**: `AdminPages/Analytics/ClientAnalytics/ClientAnalytics.jsx`

**Components**:
- `AnalyticsDashboard.jsx` - Main dashboard
- `EngagementCharts.jsx` - Engagement metrics
- `GrowthCharts.jsx` - Client growth trends
- `CompletenessCharts.jsx` - Profile completeness stats
- `VerificationStats.jsx` - Verification metrics

**API Calls**:
- `GET /api/admin/analytics/clients` - Get analytics

---

## 🏗️ COMPONENT ARCHITECTURE

### **Shared Components** (Reusable across pages)

```
Frontend/src/components/
├── Shared/
│   ├── Forms/
│   │   ├── FormField.jsx
│   │   ├── FormSection.jsx
│   │   └── FormActions.jsx
│   ├── DataDisplay/
│   │   ├── DataTable.jsx
│   │   ├── DataCard.jsx
│   │   └── DataGrid.jsx
│   ├── Filters/
│   │   ├── FilterPanel.jsx
│   │   └── SearchBar.jsx
│   ├── Modals/
│   │   ├── ConfirmDialog.jsx
│   │   └── ViewModal.jsx
│   └── Charts/
│       ├── LineChart.jsx
│       ├── BarChart.jsx
│       └── PieChart.jsx
```

### **Client-Specific Components**

```
Frontend/src/components/ClientComponents/
├── Profile/
│   ├── BasicInformationForm.jsx
│   ├── PreferencesForm.jsx
│   └── CarePlanForm.jsx
├── Documents/
│   ├── DocumentUploader.jsx
│   ├── DocumentCard.jsx
│   └── DocumentViewer.jsx
└── Team/
    ├── TeamMemberCard.jsx
    └── PermissionsMatrix.jsx
```

### **Admin-Specific Components**

```
Frontend/src/components/AdminComponents/
├── Clients/
│   ├── ClientTable.jsx
│   ├── ClientDetailTabs.jsx
│   └── StatusActions.jsx
├── Documents/
│   ├── VerificationPanel.jsx
│   └── DocumentReview.jsx
└── Analytics/
    ├── AnalyticsDashboard.jsx
    └── MetricsCards.jsx
```

---

## 🔌 API INTEGRATION PATTERNS

### **1. Data Fetching (TanStack Query)**

```javascript
// hooks/useClientProfile.js
export const useClientProfileSection = (section) => {
  return useQuery({
    queryKey: ['clientProfile', section],
    queryFn: () => clientProfileApi.getSection(section),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateClientProfileSection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ section, data }) => 
      clientProfileApi.patchSection(section, data),
    onSuccess: (data, variables) => {
      // Invalidate only the specific section
      queryClient.invalidateQueries(['clientProfile', variables.section]);
    },
  });
};
```

### **2. Optimistic Updates**

```javascript
const updateMutation = useUpdateClientProfileSection();

const handleUpdate = (data) => {
  updateMutation.mutate(
    { section: 'basic', data },
    {
      onMutate: async (newData) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries(['clientProfile', 'basic']);
        
        // Snapshot previous value
        const previous = queryClient.getQueryData(['clientProfile', 'basic']);
        
        // Optimistically update
        queryClient.setQueryData(['clientProfile', 'basic'], (old) => ({
          ...old,
          ...newData.data,
        }));
        
        return { previous };
      },
      onError: (err, newData, context) => {
        // Rollback on error
        queryClient.setQueryData(['clientProfile', 'basic'], context.previous);
      },
    }
  );
};
```

---

## 📊 BEST PRACTICES

### **1. Code Organization**
- One page per route
- Reusable components in `/components/Shared`
- Domain-specific components in `/components/ClientComponents` or `/components/AdminComponents`
- Custom hooks for data fetching (`/hooks`)

### **2. Performance**
- Lazy load pages (React.lazy)
- Code splitting by route
- Memoize expensive computations
- Virtual scrolling for long lists

### **3. State Management**
- Server state: TanStack Query
- Form state: React Hook Form
- Local UI state: useState/useReducer
- Global state: Zustand (if needed)

### **4. Error Handling**
- Centralized error formatter
- User-friendly error messages
- Retry logic for failed requests
- Offline support (service worker)

### **5. Accessibility**
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management

---

**Last Updated**: 2025-01-08

