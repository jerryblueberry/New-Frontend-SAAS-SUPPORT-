# Profile Completeness API Implementation Guide

## Overview

This guide explains how to integrate and use the profile completeness API with suggestions in your frontend application. The implementation follows production-ready best practices with TanStack Query for caching and state management.

## API Endpoint

**GET** `/api/client/profile/completeness`

Returns detailed completeness breakdown with suggestions for improving profile completion.

## Implementation Structure

### 1. API Function (`api/clientProfile.js`)

```javascript
export const getCompletenessDetails = async () => {
  const response = await api.get('/client/profile/completeness');
  return response.data;
};
```

### 2. TanStack Query Hook (`stores/useClientProfileStore.js`)

```javascript
export const useCompletenessDetails = () => {
  return useQuery({
    queryKey: ['clientProfile', 'completeness'],
    queryFn: async () => {
      const response = await clientProfileApi.getCompletenessDetails();
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch completeness details');
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
```

### 3. UI Component (`components/ClientComponents/CompletenessSuggestions/CompletenessSuggestions.jsx`)

Reusable component for displaying suggestions and section breakdown.

## Usage by Page

### Client Profile Page (`/client/profile`)

**Purpose:** Main profile display with completeness suggestions

**Implementation:**
```jsx
import { useCompletenessDetails } from '../../../stores/useClientProfileStore';
import CompletenessSuggestions from '../../../components/ClientComponents/CompletenessSuggestions/CompletenessSuggestions';

const ClientProfile = () => {
  const { data: completenessDetails } = useCompletenessDetails();
  
  return (
    <>
      {/* Profile display */}
      {completenessDetails && (
        <CompletenessSuggestions
          completeness={completenessDetails}
          showSectionBreakdown={true}
        />
      )}
    </>
  );
};
```

**When to use:**
- Display overall completeness percentage
- Show suggestions for improving profile
- Show section-by-section breakdown

### Client Dashboard (`/client-dashboard`)

**Purpose:** Quick overview with next steps

**Implementation:**
```jsx
import { useCompletenessDetails } from '../../../stores/useClientProfileStore';
import CompletenessSuggestions from '../../../components/ClientComponents/CompletenessSuggestions/CompletenessSuggestions';

const ClientDashboard = () => {
  const { data: completenessDetails, isLoading } = useCompletenessDetails();
  
  return (
    <>
      {/* Dashboard content */}
      {completenessDetails && (
        <CompletenessSuggestions
          completeness={completenessDetails}
          showSectionBreakdown={false}
          compact={true}
        />
      )}
    </>
  );
};
```

**When to use:**
- Show overall percentage in dashboard card
- Display top 3 "Next Steps" suggestions
- Compact mode for dashboard

### Individual Profile Sections

**Pages:**
- `/client/profile` (Basic Information)
- `/client/profile/preferences`
- `/client/profile/communication`
- `/client/profile/care-plan`

**Purpose:** Show section-specific suggestions

**Implementation:**
```jsx
import { useCompletenessDetails } from '../../../stores/useClientProfileStore';

const BasicInformation = () => {
  const { data: completenessDetails } = useCompletenessDetails();
  
  // Filter suggestions for this section
  const sectionSuggestions = completenessDetails?.suggestions.highPriority
    .filter(s => s.section === 'basicInformation');
  
  return (
    <>
      {/* Form fields */}
      {sectionSuggestions && sectionSuggestions.length > 0 && (
        <Alert severity="info">
          {sectionSuggestions[0].description}
        </Alert>
      )}
    </>
  );
};
```

**When to use:**
- Show field-specific suggestions
- Highlight missing required fields
- Guide users to complete section

### Admin Client Management (`/admin/clients/:id`)

**Purpose:** Admin view of client completeness

**Implementation:**
```jsx
// Admin uses different endpoint (future enhancement)
// For now, can use same hook if admin has access
const ViewClientDetails = () => {
  // Admin would use different query key or API endpoint
  // This is a placeholder for future admin-specific implementation
};
```

**When to use:**
- View client completeness for admin review
- Identify clients needing assistance
- Track completion trends

## API Response Structure

```typescript
{
  success: true,
  data: {
    percentage: 75.5,
    sectionDetails: {
      basicInformation: {
        isComplete: false,
        completionRate: 83.33,
        partialCredit: 83.33,
        contribution: 50.0,
        contributionPercentage: 83.33,
        missingFields: ["address.postcode"],
        fieldDetails: { ... }
      },
      documents: {
        isComplete: true,
        documentCount: 2,
        completionRate: 100,
        partialCredit: 100,
        contribution: 20.0
      },
      subscription: {
        isComplete: false,
        subscriptionState: "pending",
        partialCredit: 50,
        contribution: 5.0
      },
      otherDetails: {
        isComplete: true,
        completionRate: 75,
        partialCredit: 75,
        contribution: 7.5
      }
    },
    fieldLevelDetails: { ... },
    suggestions: {
      highPriority: [
        {
          field: "address.postcode",
          label: "Complete Address",
          description: "Fill in: postcode",
          section: "basicInformation",
          weight: 60,
          completionImpact: "Completing address will add 15% to your profile"
        }
      ],
      mediumPriority: [ ... ],
      lowPriority: [ ... ],
      nextSteps: [ ... ] // Top 3 suggestions
    },
    consistencyCheck: {
      isConsistent: true,
      issues: [],
      warnings: [ ... ]
    }
  }
}
```

## Best Practices

### 1. Caching Strategy

**Use TanStack Query cache:**
- `staleTime: 2 minutes` - Completeness can change frequently
- Invalidate on profile updates:
  ```javascript
  queryClient.invalidateQueries({ queryKey: ['clientProfile', 'completeness'] });
  ```

**When to invalidate:**
- After updating any profile section
- After uploading/deleting documents
- After subscription changes

### 2. Error Handling

```jsx
const { data, isLoading, isError, error } = useCompletenessDetails();

if (isError) {
  return <Alert severity="error">Failed to load completeness details</Alert>;
}
```

### 3. Loading States

```jsx
{isLoading ? (
  <CircularProgress />
) : (
  <CompletenessSuggestions completeness={data} />
)}
```

### 4. Conditional Rendering

**Don't show if 100% complete:**
```jsx
{completenessDetails && completenessDetails.percentage < 100 && (
  <CompletenessSuggestions completeness={completenessDetails} />
)}
```

### 5. Navigation Integration

**Navigate to relevant sections:**
```jsx
const handleSuggestionClick = (suggestion) => {
  const routeMap = {
    basicInformation: '/client/profile',
    documents: '/client/profile',
    subscription: '/client/billing/preferences',
    otherDetails: '/client/profile/communication',
  };
  navigate(routeMap[suggestion.section]);
};
```

## Component Props

### CompletenessSuggestions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `completeness` | Object | required | Completeness data from API |
| `showSectionBreakdown` | boolean | `true` | Show section-by-section breakdown |
| `compact` | boolean | `false` | Compact mode for smaller displays |
| `onSuggestionClick` | Function | `undefined` | Callback when suggestion clicked |
| `onDismiss` | Function | `undefined` | Callback to dismiss suggestions |

## Cache Invalidation

### After Profile Updates

```javascript
// In mutation onSuccess callbacks
queryClient.invalidateQueries({ queryKey: ['clientProfile', 'completeness'] });
queryClient.invalidateQueries({ queryKey: ['clientProfile', 'full'] });
```

### Example: After Updating Basic Info

```javascript
const updateMutation = useMutation({
  mutationFn: updateBasicInfo,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['clientProfile', 'completeness'] });
    queryClient.invalidateQueries({ queryKey: ['clientProfile', 'basic'] });
    queryClient.invalidateQueries({ queryKey: ['clientProfile', 'full'] });
  },
});
```

## Performance Optimization

### 1. Memoization

```jsx
const nextSteps = useMemo(() => {
  return completenessDetails?.suggestions.nextSteps || [];
}, [completenessDetails]);
```

### 2. Lazy Loading

```jsx
// Only fetch when component is visible
const { data } = useCompletenessDetails({
  enabled: isVisible, // Only fetch when component is visible
});
```

### 3. Debouncing

For real-time updates during form editing:
```javascript
import { useDebounce } from 'use-debounce';

const [formData, setFormData] = useState({});
const [debouncedFormData] = useDebounce(formData, 1000);

useEffect(() => {
  // Invalidate completeness after debounced changes
  queryClient.invalidateQueries({ queryKey: ['clientProfile', 'completeness'] });
}, [debouncedFormData]);
```

## Testing

### Unit Tests

```javascript
describe('useCompletenessDetails', () => {
  it('should fetch completeness details', async () => {
    const { result } = renderHook(() => useCompletenessDetails());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data.percentage).toBeDefined();
  });
});
```

### Component Tests

```javascript
describe('CompletenessSuggestions', () => {
  it('should display suggestions when completeness < 100%', () => {
    const completeness = { percentage: 75, suggestions: { nextSteps: [...] } };
    render(<CompletenessSuggestions completeness={completeness} />);
    expect(screen.getByText('Improve Your Profile')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Completeness not updating

1. **Check cache invalidation:**
   ```javascript
   queryClient.invalidateQueries({ queryKey: ['clientProfile', 'completeness'] });
   ```

2. **Verify backend calculation:**
   - Check backend logs for completeness calculation
   - Verify profile was saved correctly

3. **Check staleTime:**
   - Reduce `staleTime` for more frequent updates
   - Or manually refetch: `refetch()`

### Suggestions not showing

1. **Check API response:**
   ```javascript
   console.log(completenessDetails?.suggestions);
   ```

2. **Verify percentage:**
   - Suggestions only show if `percentage < 100`

3. **Check component props:**
   - Ensure `completeness` prop is passed correctly

## Future Enhancements

1. **Real-time Updates:**
   - WebSocket integration for live completeness updates

2. **Analytics:**
   - Track which suggestions users follow
   - Measure completion rate improvements

3. **Personalization:**
   - ML-based suggestion prioritization
   - Personalized completion paths

4. **Admin Dashboard:**
   - Admin-specific completeness endpoint
   - Bulk completeness reports

## Related Documentation

- `PARTIAL_CREDIT_COMPLETENESS_GUIDE.md` - Backend completeness calculation
- `CLIENT_PROFILE_COMPLETENESS_GUIDE.md` - Detailed calculation logic
- `COMPLETENESS_SERVICE_INTEGRATION.md` - Backend integration patterns
