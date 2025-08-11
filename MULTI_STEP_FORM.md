# Multi-Step Renovation Request Form

This document describes the comprehensive multi-step form system implemented for submitting renovation requests.

## Overview

The multi-step form guides customers through a 5-step process to submit detailed renovation requests, providing an intuitive user experience with validation, progress tracking, and data persistence.

## Features

### 🎯 **5-Step Process**
1. **Project Type**: Visual grid selection with icons
2. **Budget Range**: Radio buttons with reference costs
3. **Timeline**: Timeline selection with visual indicators
4. **Location**: Postal code validation with auto-city detection
5. **Details**: Description and photo upload with drag & drop

### 📊 **User Experience**
- ✅ **Progress Bar**: Visual progress indicator with step completion
- ✅ **Step Navigation**: Clickable step indicators for easy navigation
- ✅ **Data Persistence**: Form data maintained between steps
- ✅ **Validation**: Real-time validation with helpful error messages
- ✅ **Responsive Design**: Mobile-friendly interface

### 🛠️ **Technical Features**
- ✅ **Custom Hook**: Centralized state management
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **File Upload**: Image upload with validation and preview
- ✅ **Canadian Postal Code**: Advanced validation and city detection
- ✅ **API Integration**: Seamless submission to backend

## File Structure

```
hooks/
└── use-multi-step-form.ts          # Form state management hook

components/forms/
├── multi-step-request-form.tsx     # Main form component
└── request-steps/
    ├── step-1-project-type.tsx     # Project type selection
    ├── step-2-budget-range.tsx     # Budget range selection
    ├── step-3-timeline.tsx         # Timeline selection
    ├── step-4-location.tsx         # Location input with validation
    ├── step-5-details.tsx          # Description and photo upload
    ├── step-progress.tsx           # Progress indicator
    └── step-navigation.tsx         # Navigation controls

app/(customer)/
├── request/
│   ├── page.tsx                    # Main request page
│   └── success/
│       └── page.tsx                # Success page with request details
└── api/requests/
    ├── route.ts                    # Request submission endpoint
    └── [id]/route.ts               # Individual request retrieval
```

## Step-by-Step Breakdown

### Step 1: Project Type Selection
**Components**: Visual card grid with icons
**Validation**: Single selection required
**Features**:
- 6 project types: Kitchen, Bathroom, Basement, Flooring, Painting, Other
- Color-coded cards with hover effects
- Icon representations for each type
- Confirmation message on selection

**Project Types**:
```typescript
const PROJECT_TYPES = [
  { id: 'KITCHEN', title: 'Kitchen', icon: '🍳' },
  { id: 'BATHROOM', title: 'Bathroom', icon: '🚿' },
  { id: 'BASEMENT', title: 'Basement', icon: '🏠' },
  { id: 'FLOORING', title: 'Flooring', icon: '🏗️' },
  { id: 'PAINTING', title: 'Painting', icon: '🎨' },
  { id: 'OTHER', title: 'Other', icon: '🔧' },
]
```

### Step 2: Budget Range Selection
**Components**: Radio button cards with reference information
**Validation**: Single selection required
**Features**:
- 4 budget ranges with cost examples
- "Most Popular" indicators
- Reference examples for each range
- Helpful tips about budgeting

**Budget Ranges**:
```typescript
const BUDGET_OPTIONS = [
  { id: 'UNDER_10K', title: 'Under $10,000', popular: false },
  { id: 'RANGE_10_25K', title: '$10,000 - $25,000', popular: true },
  { id: 'RANGE_25_50K', title: '$25,000 - $50,000', popular: true },
  { id: 'OVER_50K', title: 'Over $50,000', popular: false },
]
```

### Step 3: Timeline Selection
**Components**: Visual timeline cards with priority indicators
**Validation**: Single selection required
**Features**:
- 4 timeline options with visual distinctions
- Priority indicators for urgent requests
- Color-coded based on urgency
- Helpful context about timing

**Timeline Options**:
```typescript
const TIMELINE_OPTIONS = [
  { id: 'ASAP', title: 'ASAP', urgent: true },
  { id: 'WITHIN_1MONTH', title: 'Within 1 Month', urgent: false },
  { id: 'WITHIN_3MONTHS', title: 'Within 3 Months', urgent: false },
  { id: 'PLANNING', title: 'Just Planning', urgent: false },
]
```

### Step 4: Location Input
**Components**: Postal code and address inputs with validation
**Validation**: Canadian postal code format + complete address
**Features**:
- Real-time postal code validation
- Auto-city detection from postal code
- Address completeness checking
- Privacy protection messaging

**Postal Code Validation**:
```typescript
const validateCanadianPostalCode = (postalCode: string): boolean => {
  const canadianPostalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/
  return canadianPostalRegex.test(postalCode)
}
```

### Step 5: Details & Photo Upload
**Components**: Text area and drag-drop photo upload
**Validation**: 50+ character description, up to 5 photos
**Features**:
- Rich text description input
- Drag and drop photo upload
- File type and size validation
- Photo preview with removal option
- Progress indicators

**Photo Upload Specs**:
- **Max Files**: 5 images
- **File Types**: JPEG, PNG, WebP
- **Max Size**: 10MB per file
- **Features**: Drag & drop, preview, removal

## Form State Management

### Custom Hook: `useMultiStepForm`
Centralized state management for the entire form process:

```typescript
export interface RenovationFormData {
  category: 'KITCHEN' | 'BATHROOM' | 'BASEMENT' | 'FLOORING' | 'PAINTING' | 'OTHER' | null
  budget_range: 'UNDER_10K' | 'RANGE_10_25K' | 'RANGE_25_50K' | 'OVER_50K' | null
  timeline: 'ASAP' | 'WITHIN_1MONTH' | 'WITHIN_3MONTHS' | 'PLANNING' | null
  postal_code: string
  address: string
  city: string
  description: string
  photos: File[]
}
```

### Hook Features:
- **State Management**: Centralized form data
- **Navigation**: Step control with validation
- **Validation**: Step-by-step validation rules
- **Progress**: Automatic progress calculation
- **Persistence**: Data maintained across steps

## Validation Rules

### Step-by-Step Validation:
```typescript
const isStepValid = (step: number): boolean => {
  switch (step) {
    case 1: return formData.category !== null
    case 2: return formData.budget_range !== null
    case 3: return formData.timeline !== null
    case 4: return formData.postal_code.length >= 6 && formData.address.length >= 10
    case 5: return formData.description.length >= 50
    default: return false
  }
}
```

### Real-time Validation:
- **Postal Code**: Canadian format (A1A 1A1)
- **Address**: Minimum 10 characters
- **Description**: Minimum 50 characters
- **Photos**: File type, size, and count limits

## Progress Tracking

### Visual Progress Indicator:
- **Progress Bar**: Percentage-based progress
- **Step Indicators**: Completed, current, and pending states
- **Navigation**: Click to revisit completed steps
- **Mobile Optimization**: Responsive design for all screens

### Progress States:
- **Completed**: Green checkmark for finished steps
- **Current**: Blue highlight for active step
- **Pending**: Gray for upcoming steps

## API Integration

### Form Submission:
```typescript
const handleSubmit = async () => {
  // Convert photos to base64
  const photoData = await Promise.all(
    formData.photos.map(photo => convertToBase64(photo))
  )

  // Submit to API
  const response = await fetch('/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: formData.category,
      budget_range: formData.budget_range,
      timeline: formData.timeline,
      postal_code: formData.postal_code,
      address: formData.address,
      description: formData.description,
      photos: photoData,
    }),
  })
}
```

### Success Flow:
1. Form submission with loading state
2. API creates database record
3. Redirect to success page with request ID
4. Display request details and next steps

## User Experience Features

### Loading States:
- **Step Navigation**: Disabled during validation
- **Form Submission**: Loading spinner with progress text
- **Photo Upload**: Visual feedback during file processing

### Error Handling:
- **Validation Errors**: Inline error messages
- **API Errors**: User-friendly error display
- **Network Errors**: Retry mechanisms

### Accessibility:
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels
- **Focus Management**: Logical tab order
- **Color Contrast**: WCAG compliant colors

## Mobile Optimization

### Responsive Design:
- **Grid Layouts**: Adaptive column counts
- **Touch Targets**: Appropriately sized buttons
- **Photo Upload**: Mobile-friendly file selection
- **Progress Indicator**: Condensed mobile view

### Mobile-Specific Features:
- **Haptic Feedback**: Visual confirmations
- **Swipe Navigation**: Gesture support consideration
- **Auto-zoom Prevention**: Proper input types

## Development Features

### Type Safety:
- **Full TypeScript**: Complete type coverage
- **Interface Definitions**: Clear data contracts
- **Validation Schemas**: Type-safe validation

### Code Organization:
- **Modular Components**: Separated by responsibility
- **Custom Hooks**: Reusable logic extraction
- **Utility Functions**: Shared functionality

### Debug Features:
- **Development Mode**: Form data inspector
- **Console Logging**: Detailed error information
- **State Inspection**: Hook state visibility

## Performance Optimizations

### Efficient Rendering:
- **Conditional Rendering**: Only active steps rendered
- **Image Optimization**: Proper file handling
- **Memory Management**: Cleanup on unmount

### Bundle Optimization:
- **Code Splitting**: Step components lazy-loaded
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Compressed images and styles

## Testing Considerations

### Unit Tests:
- **Hook Testing**: State management validation
- **Component Testing**: Individual step functionality
- **Validation Testing**: Form validation rules

### Integration Tests:
- **Flow Testing**: Complete form submission
- **API Testing**: Backend integration
- **Error Scenarios**: Error handling validation

### Manual Testing Checklist:
- [ ] All steps complete successfully
- [ ] Validation works on each step
- [ ] Photos upload and display correctly
- [ ] Postal code validation works
- [ ] Form persists data between steps
- [ ] Success page displays correctly
- [ ] Mobile experience is smooth
- [ ] Error states are handled gracefully

## Future Enhancements

### Potential Improvements:
- **Save Draft**: Auto-save functionality
- **Photo Editing**: Basic image editing tools
- **Address Autocomplete**: Google Places integration
- **Progress Estimation**: Time-to-complete indicators
- **Multi-language**: Internationalization support

This multi-step form provides a comprehensive, user-friendly experience for submitting renovation requests while maintaining high technical standards and excellent user experience.
