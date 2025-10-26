# Reference Management System

A comprehensive reference check management system built with React, Material-UI, and TanStack Query following industry best practices.

## Features

### 🎯 Core Functionality
- **Complete Reference Management**: View, filter, search, and manage all reference checks
- **Email Tracking**: Real-time email delivery, open, and click tracking
- **Status Management**: Track reference status from pending to completion
- **Bulk Operations**: Bulk email sending, status updates, and data export
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 📊 Analytics & Reporting
- **Real-time Statistics**: Completion rates, email performance, status distribution
- **Visual Dashboards**: Interactive charts and progress indicators
- **Data Export**: CSV export functionality for reporting
- **Performance Metrics**: Email open rates, click rates, bounce rates

### 🔧 Technical Features
- **TanStack Query**: Optimized data fetching with caching and real-time updates
- **Material-UI**: Modern, accessible UI components
- **TypeScript Ready**: Full type safety and IntelliSense support
- **Error Handling**: Comprehensive error states and user feedback
- **Loading States**: Skeleton loaders and progress indicators

## Components

### ReferenceTable
Main data table component for displaying and managing references.

**Props:**
- `initialFilters` (object): Initial filter values
- `onReferenceSelect` (function): Callback when reference is selected
- `showFilters` (boolean): Show/hide filter controls
- `showBulkActions` (boolean): Show/hide bulk action buttons

**Features:**
- Sortable columns
- Advanced filtering (status, search, date range)
- Pagination
- Row selection
- Bulk operations
- Export functionality
- Responsive design

### ReferenceStats
Statistics dashboard component showing key metrics and performance data.

**Features:**
- Key performance indicators
- Status distribution charts
- Email performance metrics
- Real-time data updates
- Responsive grid layout

## API Integration

### Hooks
- `useReferences`: Main hook for fetching reference data
- `useReferenceStats`: Statistics and analytics data
- `useSendReferenceEmail`: Send individual reference emails
- `useBulkUpdateStatus`: Bulk status updates
- `useBulkSendEmails`: Bulk email sending
- `useExportReferences`: Data export functionality

### API Endpoints
- `GET /api/references` - Get all references with filtering
- `GET /api/references/stats` - Get reference statistics
- `POST /api/references/bulk/send-emails` - Bulk email sending
- `PUT /api/references/bulk/status` - Bulk status updates
- `GET /api/references/export` - Export references data

## Usage

### Basic Implementation
```jsx
import ReferenceTable from './components/ReferenceTable/ReferenceTable';
import ReferenceStats from './components/ReferenceStats/ReferenceStats';

function ReferencesPage() {
  return (
    <div>
      <ReferenceTable 
        showFilters={true}
        showBulkActions={true}
        onReferenceSelect={(id) => console.log('Selected:', id)}
      />
    </div>
  );
}
```

### With Statistics
```jsx
import { Tabs, Tab } from '@mui/material';
import ReferenceTable from './components/ReferenceTable/ReferenceTable';
import ReferenceStats from './components/ReferenceStats/ReferenceStats';

function ReferencesPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
        <Tab label="Table" />
        <Tab label="Statistics" />
      </Tabs>
      
      {activeTab === 0 && <ReferenceTable />}
      {activeTab === 1 && <ReferenceStats />}
    </div>
  );
}
```

## Data Structure

### Reference Object
```javascript
{
  _id: "reference_id",
  worker: "worker_id",
  referenceInfo: {
    name: "John Doe",
    email: "john@example.com",
    company: "Acme Corp",
    position: "Manager",
    phone: "+1234567890"
  },
  status: "Completed", // Pending, EmailSent, Viewed, InProgress, Completed, Rejected, Expired, Bounced
  emailTracking: {
    emailsSent: 2,
    opened: true,
    clicked: true,
    emailBounced: false,
    lastEmailSent: "2024-01-15T10:30:00Z"
  },
  progress: {
    totalQuestions: 10,
    answeredQuestions: 8,
    percentageComplete: 80
  },
  createdAt: "2024-01-10T09:00:00Z",
  completedAt: "2024-01-15T14:30:00Z"
}
```

## Styling

The components use Material-UI's theming system and are fully customizable:

```jsx
// Custom theme overrides
const theme = createTheme({
  components: {
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
  },
});
```

## Performance Optimizations

- **Virtual Scrolling**: For large datasets
- **Debounced Search**: Prevents excessive API calls
- **Query Caching**: TanStack Query handles intelligent caching
- **Lazy Loading**: Components load only when needed
- **Memoization**: React.memo for expensive components

## Accessibility

- **ARIA Labels**: Full screen reader support
- **Keyboard Navigation**: Complete keyboard accessibility
- **Color Contrast**: WCAG AA compliant
- **Focus Management**: Proper focus handling
- **Semantic HTML**: Meaningful markup structure

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

```json
{
  "@mui/material": "^5.0.0",
  "@mui/icons-material": "^5.0.0",
  "@tanstack/react-query": "^4.0.0",
  "date-fns": "^2.0.0",
  "react": "^18.0.0",
  "react-dom": "^18.0.0"
}
```

## Contributing

1. Follow the existing code style
2. Add proper TypeScript types
3. Include unit tests for new features
4. Update documentation
5. Ensure accessibility compliance

## License

MIT License - see LICENSE file for details.
