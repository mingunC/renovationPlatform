# Contractor Onboarding System - Renovate Platform

This document provides comprehensive documentation for the multi-step contractor onboarding flow that guides contractors through profile setup with progress tracking and optional verification.

## 🚀 **System Overview**

The contractor onboarding system provides a streamlined, user-friendly process for contractors to set up their profiles and start receiving project opportunities. The system emphasizes reducing friction while collecting essential information.

### **Key Features**

✅ **Multi-Step Flow** - 4 progressive steps with clear navigation  
✅ **Progress Tracking** - Visual progress indicators and completion percentages  
✅ **Skip Options** - "Complete Profile Later" to reduce onboarding friction  
✅ **Smart Validation** - Real-time validation with helpful error messages  
✅ **Document Upload** - Optional verification document handling  
✅ **GTA Area Selection** - Geographic service area targeting  
✅ **Category Specialization** - Project type selection with market insights  
✅ **Completion Dashboard** - Dashboard widget showing profile completion status  

## 🔄 **Onboarding Flow Architecture**

### **Flow Structure**

```
Step 1: Business Information  →  Step 2: Service Areas  →  Step 3: Categories  →  Step 4: Verification
    (Required)                    (Required)               (Required)            (Optional)
```

### **Navigation Features**

- ✅ **Progressive Disclosure**: Each step builds on the previous
- ✅ **Backward Navigation**: Users can go back to edit previous steps
- ✅ **Skip to End**: "Complete Profile Later" option available at any step
- ✅ **Step Jumping**: Completed steps are clickable for easy navigation
- ✅ **Progress Persistence**: Form data persists across page reloads

## 📋 **Step-by-Step Breakdown**

### **Step 1: Business Information** 🏢

**Purpose:** Collect essential business details for customer communication

**Required Fields:**
- ✅ **Business Name**: Company/individual name (required)
- ✅ **Business Phone**: Customer contact number (required)

**Optional Fields:**
- 📄 **Business Number**: 15-digit CRA business number

**Features:**
- ✅ **Phone Formatting**: Auto-formats to (XXX) XXX-XXXX
- ✅ **Real-time Validation**: Instant feedback on phone number format
- ✅ **Professional Guidance**: Tips on using official business names
- ✅ **Privacy Assurance**: Clear explanation of data usage

**Validation Rules:**
```typescript
business_name: z.string().min(1, 'Business name is required')
phone: z.string().regex(/^[\+]?[1]?[\s\-\.]?\(?[0-9]{3}\)?[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{4}$/)
business_number: z.string().optional()
```

### **Step 2: Service Areas** 📍

**Purpose:** Define geographic coverage for project notifications

**GTA Area Selection:**
- 🏙️ **Central Toronto**: Toronto, North York, Scarborough, Etobicoke
- 🏢 **Western GTA**: Mississauga, Brampton, Oakville, Burlington  
- 🌺 **Northern GTA**: Markham, Richmond Hill, Vaughan

**Features:**
- ✅ **Multi-Select Interface**: Checkbox-based area selection
- ✅ **Regional Grouping**: Select all areas in a region with one click
- ✅ **Population Data**: Shows potential customer base for each area
- ✅ **Postal Code Mapping**: Uses 3-character postal prefixes (M4W, L5B, etc.)
- ✅ **Quick Actions**: "Select All" and "Clear Selection" buttons
- ✅ **Market Intelligence**: Real-time calculation of total potential customers

**Business Logic:**
```typescript
// At least one service area required
service_areas: z.array(z.string()).min(1, 'Select at least one service area')

// Postal code prefix matching for project notifications
const postalPrefix = request.postal_code.substring(0, 3).toUpperCase()
const matchingContractors = contractors.filter(c => 
  c.service_areas.includes(postalPrefix) || c.service_areas.length === 0
)
```

### **Step 3: Categories & Specializations** 🔧

**Purpose:** Define project types and expertise areas

**Available Categories:**
- 🍳 **Kitchen Renovation** - High complexity, $25K avg, High demand
- 🚿 **Bathroom Renovation** - High complexity, $15K avg, High demand
- 🏠 **Basement Finishing** - Medium complexity, $20K avg, Medium demand
- 🏗️ **Flooring Installation** - Medium complexity, $8K avg, High demand
- 🎨 **Painting & Finishing** - Low complexity, $3.5K avg, Very High demand
- 🔧 **General Contracting** - High complexity, $35K avg, Medium demand

**Features:**
- ✅ **Smart Cards**: Interactive category cards with expand/collapse details
- ✅ **Market Data**: Complexity level, average project value, demand level
- ✅ **Project Examples**: Common project types for each category
- ✅ **Color-Coded Badges**: Visual indicators for complexity and demand
- ✅ **Market Insights**: Platform activity data and recommendations
- ✅ **Value Calculator**: Real-time calculation of combined market value

**Category Intelligence:**
```typescript
const categoryData = {
  complexity: 'High' | 'Medium' | 'Low',
  avgProject: '$25,000',
  demand: 'Very High' | 'High' | 'Medium',
  examples: ['Cabinet installation', 'Countertop replacement', ...]
}
```

### **Step 4: Verification & Documents** ✅

**Purpose:** Optional document upload for trust building (can be skipped)

**Document Types:**
- 🛡️ **Insurance Certificate**: General liability insurance (PDF, JPEG, PNG, max 5MB)
- ⚡ **WSIB Certificate**: Workplace Safety Insurance Board coverage
- 📋 **Business License Number**: Municipal business license (text input)

**Features:**
- ✅ **Drag & Drop Upload**: Intuitive file upload interface
- ✅ **File Validation**: Type and size validation with clear error messages
- ✅ **Preview System**: File name display with remove option
- ✅ **Skip Option**: Prominent "Skip Verification" with benefits explanation
- ✅ **Security Assurance**: Clear privacy and security messaging
- ✅ **Benefits Education**: Explains advantages of verification

**Upload Handling:**
```typescript
// File validation
const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
const maxSize = 5 * 1024 * 1024 // 5MB

// Temporary base64 storage (production would use cloud storage)
const base64 = Buffer.from(arrayBuffer).toString('base64')
const dataUrl = `data:${file.type};base64,${base64}`
```

## 🧠 **Technical Implementation**

### **Custom Hook: useContractorOnboarding**

```typescript
export function useContractorOnboarding() {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<OnboardingData>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Navigation methods
  const nextStep = () => { /* ... */ }
  const prevStep = () => { /* ... */ }
  const goToStep = (step: number) => { /* ... */ }
  const skipToEnd = () => { /* ... */ }

  // Validation
  const canProceedToNext = (step: number) => { /* ... */ }
  const getCompletionPercentage = () => { /* ... */ }

  // Submission
  const submitOnboarding = async () => { /* ... */ }
}
```

### **Progress Tracking System**

**Visual Progress Components:**
- ✅ **OnboardingProgress**: Step indicator with clickable navigation
- ✅ **OnboardingNavigation**: Back/Next/Skip buttons with validation
- ✅ **Completion Percentage**: Real-time calculation based on filled fields

**Progress Calculation:**
```typescript
const getCompletionPercentage = () => {
  let completed = 0
  
  // Step 1 - Business Info (25%)
  if (data.business_name && data.phone) completed += 25
  
  // Step 2 - Service Areas (25%)
  if (data.service_areas.length > 0) completed += 25
  
  // Step 3 - Categories (25%)
  if (data.categories.length > 0) completed += 25
  
  // Step 4 - Verification (25%)
  if (data.skip_verification || hasVerificationDocs) completed += 25
  
  return completed
}
```

### **Data Structure**

```typescript
interface OnboardingData {
  // Step 1 - Business Info
  business_name: string
  business_number: string
  phone: string
  
  // Step 2 - Service Areas
  service_areas: string[] // Postal code prefixes
  
  // Step 3 - Categories
  categories: string[] // Category IDs
  
  // Step 4 - Verification
  insurance_document?: File | null
  wsib_certificate?: File | null
  business_license_number?: string
  
  // Tracking
  completed_steps: number[]
  skip_verification: boolean
}
```

## 🔗 **API Integration**

### **Onboarding Endpoint: `/api/contractors/onboarding`**

**POST - Complete Onboarding:**
```typescript
// Request: FormData with files and form fields
{
  business_name: string
  business_number?: string
  phone: string
  service_areas: string[] // JSON array
  categories: string[] // JSON array
  business_license_number?: string
  skip_verification: boolean
  insurance_document?: File
  wsib_certificate?: File
}

// Response: Contractor profile with completion status
{
  contractor: {
    id: string
    business_name: string
    completion_percentage: number
    profile_completed: boolean
    verification_status: {
      insurance_verified: boolean
      wsib_verified: boolean
      skip_verification: boolean
    }
  }
}
```

**GET - Check Status:**
```typescript
// Response: Current onboarding status
{
  onboarding_completed: boolean
  contractor: ContractorProfile | null
}
```

### **Database Schema Updates**

**Enhanced Contractor Model:**
```prisma
model Contractor {
  // ... existing fields
  phone                   String?
  business_license_number String?
  insurance_document_url  String?
  wsib_certificate_url   String?
  profile_completed       Boolean @default(false)
  completion_percentage   Int     @default(0)
  skip_verification       Boolean @default(false)
  onboarding_completed_at DateTime?
  
  @@index([profile_completed])
}
```

## 📊 **Dashboard Integration**

### **ProfileCompletion Component**

**Purpose:** Dashboard widget showing completion status and next steps

**Features:**
- ✅ **Completion Percentage**: Visual progress bar with color coding
- ✅ **Status Indicators**: Verification status with color-coded dots
- ✅ **Missing Fields**: List of incomplete profile sections
- ✅ **Next Steps**: Actionable recommendations
- ✅ **Call-to-Action**: "Complete Profile" or "Start Onboarding" buttons

**Color Scheme:**
- 🟢 **100% Complete**: Green - Ready for bidding
- 🔵 **75-99% Complete**: Blue - Nearly ready
- 🟡 **50-74% Complete**: Yellow - Needs attention
- 🔴 **0-49% Complete**: Red - Requires immediate action

**Usage in Dashboard:**
```typescript
<ProfileCompletion 
  contractorId={contractor.id}
  className="col-span-1 lg:col-span-2"
/>
```

## 🎯 **User Experience Design**

### **Friction Reduction Strategy**

**Progressive Requirements:**
1. **Step 1-3**: Essential information only (business, areas, categories)
2. **Step 4**: Optional verification (can be completed later)
3. **Skip Options**: Available at every step
4. **Completion Benefits**: Clear explanation of profile completion advantages

**Visual Design:**
- ✅ **Step Progress**: Visual step indicator with completion status
- ✅ **Form Persistence**: Data saves automatically as users navigate
- ✅ **Smart Defaults**: Reasonable defaults where possible
- ✅ **Clear CTAs**: Prominent action buttons with progress indication
- ✅ **Help Text**: Contextual guidance and examples throughout

### **Mobile Responsiveness**

**Mobile Adaptations:**
- ✅ **Simplified Progress**: Compact progress bar for mobile
- ✅ **Touch-Friendly**: Large touch targets for checkboxes and buttons
- ✅ **Stack Layout**: Single-column layout on smaller screens
- ✅ **Swipe Navigation**: Gesture-friendly navigation between steps

## 🔄 **Business Logic**

### **Completion Percentage Calculation**

```typescript
// Base calculation: 75% for required fields
let completion = 75 // Business info + Service areas + Categories

// Additional 25% for verification
if (hasVerificationDocs || skipVerification) {
  completion = 100
}

// Profile marked as complete when >= 75%
const profileCompleted = completion >= 75
```

### **Project Notification Logic**

**Geographic Matching:**
```typescript
// Match contractors by postal code prefix
const contractorsInArea = await prisma.contractor.findMany({
  where: {
    OR: [
      { service_areas: { has: postalPrefix } },
      { service_areas: { isEmpty: true } } // All-area contractors
    ]
  }
})
```

**Category Matching:**
```typescript
// Match contractors by project category
const specializedContractors = contractors.filter(contractor =>
  contractor.categories.includes(projectCategory) ||
  contractor.categories.length === 0 // General contractors
)
```

## 📈 **Analytics & Metrics**

### **Onboarding Funnel Tracking**

**Key Metrics:**
- ✅ **Step Completion Rates**: % completing each step
- ✅ **Drop-off Points**: Where users abandon onboarding
- ✅ **Skip Rates**: How often verification is skipped
- ✅ **Time to Complete**: Average onboarding duration
- ✅ **Profile Completion**: % reaching 100% completion

**Completion Categories:**
- 🎯 **Full Completion**: All steps + verification (100%)
- ✅ **Essential Completion**: Steps 1-3 only (75%)
- ⚠️ **Partial Completion**: Incomplete required fields (<75%)
- ❌ **Abandoned**: Started but never completed

## 🚀 **Advanced Features**

### **Smart Recommendations**

**Service Area Suggestions:**
- Suggest nearby areas based on initial selection
- Show market demand data for each area
- Recommend optimal area combinations

**Category Recommendations:**
- Suggest complementary categories based on selection
- Show market opportunity for category combinations
- Highlight high-demand, low-competition niches

### **Verification Benefits**

**Trust Indicators:**
- ✅ Verified badge on profile and bids
- ✅ Priority in project notifications
- ✅ Access to premium projects
- ✅ Higher bid acceptance rates

**Future Enhancements:**
- AI-powered document verification
- Integration with insurance providers
- Automated WSIB status checking
- Background check integration

## 🔧 **Development Guidelines**

### **Adding New Steps**

1. **Update OnboardingData Interface**: Add new fields
2. **Create Step Component**: Follow existing step pattern
3. **Update Validation**: Add new validation rules
4. **Update Progress Logic**: Include in completion calculation
5. **Update API**: Handle new fields in submission

### **Customizing Categories**

```typescript
const RENOVATION_CATEGORIES = [
  {
    id: 'NEW_CATEGORY',
    name: 'Category Name',
    icon: '🔧',
    description: 'Category description',
    examples: ['Example 1', 'Example 2'],
    complexity: 'Medium',
    avgProject: '$15,000',
    demand: 'High'
  }
]
```

### **Adding Service Areas**

```typescript
const NEW_REGION = {
  id: 'region_id',
  name: 'Region Name',
  areas: [
    { 
      code: 'K1A', // Postal prefix
      name: 'Area Name', 
      population: '100K', 
      icon: '🏘️' 
    }
  ]
}
```

## 📋 **Testing Strategy**

### **Component Testing**
- Form validation behavior
- Step navigation logic
- File upload functionality
- Progress calculation accuracy

### **Integration Testing**
- API submission flow
- Database persistence
- File handling
- Error scenarios

### **User Experience Testing**
- Onboarding completion rates
- User feedback on clarity
- Mobile responsiveness
- Accessibility compliance

This comprehensive contractor onboarding system provides a smooth, professional experience that maximizes completion rates while collecting all necessary information for successful project matching! 🚀👷‍♂️
