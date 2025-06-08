# Landing Page Flow Implementation Plan

## 1. Project Overview
- **Objective**: Implement data management system for landing page flow questions and responses
- **Scope**: Landing page flow only (4 tabs)
- **Current State**: Using static JSON files (questions.json and answers.json)
- **Target State**: Dynamic database-driven system with Redux state management

## 2. Architecture Overview

### 2.1 Database Design
```javascript
// Questions Collection Schema
{
    question_id: String,          // e.g., "Q1_A"
    tab_id: String,              // e.g., "general_details"
    question_text: String,
    question_type: String,       // "string" | "table" | "boolean" | "number"
    validation_rules: {
        required: Boolean,
        min_length: Number,
        max_length: Number,
        pattern: String
    },
    metadata: {
        table_structure: {
            columns: [{
                col_id: String,
                label: String,
                type: String
            }],
            rows: [{
                row_id: String,
                label: String
            }]
        },
        options: [String],      // For dropdown/multiple choice
        dependencies: [{
            question_id: String,
            condition: String
        }]
    }
}

// Responses Collection Schema
{
    response_id: String,
    question_id: String,
    company_id: String,          // If multiple companies
    response_data: {
        string_value: String,
        bool_value: Boolean,
        number_value: Number,
        table_value: [{
            row_id: String,
            col_id: String,
            value: Mixed
        }]
    },
    metadata: {
        last_updated: Date,
        updated_by: String,
        version: Number
    }
}
```

### 2.2 Backend Architecture (Python/FastAPI)
```python
# Core Modules Structure
backend/NewEsgBackend/Backend/
  |- routes/
     |- landing_flow_routes.py    # API endpoints
  |- models/
     |- landing_flow.py           # MongoDB models
  |- services/
     |- landing_flow_service.py   # Business logic
  |- schemas/
     |- landing_flow_schema.py    # Pydantic schemas
  |- utils/
     |- validators.py             # Custom validators
     |- data_migration.py         # JSON to DB migration

# API Endpoints
- /api/landing-flow/questions
  - GET: Fetch questions by tab
  - Query params: tab_id, company_id
  
- /api/landing-flow/responses
  - GET: Fetch responses
  - Query params: question_ids[], company_id
  
- /api/landing-flow/responses/save
  - POST: Save new response
  - Body: { question_id, response_data }
  
- /api/landing-flow/responses/update
  - PUT: Update existing response
  - Body: { response_id, response_data }
```

### 2.3 Frontend Architecture (JavaScript/React/Redux)
```javascript
// Redux Store Structure
{
    landingFlow: {
        questions: {
            byId: {},           // Question objects by ID
            byTab: {},          // Question IDs by tab
            loading: false,
            error: null
        },
        responses: {
            byId: {},          // Response objects by ID
            loading: false,
            error: null,
            unsavedChanges: new Set()
        }
    }
}

// Component Structure
frontend/src/
  |- features/
     |- landing-flow/
        |- components/
           |- forms/
              |- GeneralDetailsForm.js
              |- PolicyManagementForm.js
              |- PolicyReviewForm.js
              |- GovernanceForm.js
           |- common/
              |- QuestionField.js
              |- TableInput.js
              |- ValidationMessage.js
        |- services/
           |- api.js           // API calls
           |- validation.js    // Form validation
        |- store/
           |- questions.js     // Questions slice
           |- responses.js     // Responses slice
        |- utils/
           |- formatters.js
           |- validators.js
```

## 3. Detailed Implementation Checklist

### 3.1 Backend Setup [COMPLETED]
- [x] Create MongoDB models
  - [x] Question model
  - [x] Response model
  - [x] Add proper indexes
- [x] Create Pydantic schemas
  - [x] Question schema
  - [x] Response schema
  - [x] Validation schema
- [x] Implement services
  - [x] Question service (CRUD)
  - [x] Response service (CRUD)
  - [x] Validation service
- [x] Create API routes
  - [x] Questions endpoints
  - [x] Responses endpoints
- [x] Data migration
  - [x] JSON parser
  - [x] Database seeder
  - [x] Validation checks

### 3.2 Frontend Setup [COMPLETED]
- [x] Clean up existing code
  - [x] Remove unused components
  - [x] Clean up existing Redux store
- [x] Set up Redux store
  - [x] Questions slice
    - [x] Actions
    - [x] Reducers
    - [x] Selectors
  - [x] Responses slice
    - [x] Actions
    - [x] Reducers
    - [x] Selectors
- [x] Create API service
  - [x] Questions API
  - [x] Responses API
  - [x] Error handling
- [x] Form components
  - [x] Base question components
  - [x] Table input component
  - [x] Validation messages
- [x] Tab components
  - [x] General details form
  - [x] Policy management form
  - [x] Policy review form
  - [x] Governance form

### 3.3 Integration [COMPLETED]
- [x] Connect Redux with API
  - [x] Load questions on mount
  - [x] Load responses on mount
  - [x] Handle response updates
- [x] Form state management
  - [x] Local form state
  - [x] Validation state
  - [x] Error state
- [x] Auto-save functionality
  - [x] Debounced saves
  - [x] Error handling
  - [x] Loading states

## 4. Testing Plan
- [ ] Unit Tests
  - [ ] Redux store tests
  - [ ] Component tests
  - [ ] API service tests
- [ ] Integration Tests
  - [ ] Form submission flow
  - [ ] Auto-save functionality
  - [ ] Tab navigation
- [ ] End-to-End Tests
  - [ ] Complete form flow
  - [ ] Data persistence
  - [ ] Error handling

## 5. Deployment Plan
- [ ] Backend Deployment
  - [ ] Database migration
  - [ ] API endpoints configuration
  - [ ] Environment variables setup
- [ ] Frontend Deployment
  - [ ] Build optimization
  - [ ] Environment configuration
  - [ ] Static assets deployment

## 6. Best Practices

### 6.1 Code Organization
- Follow feature-based folder structure
- Keep components small and focused
- Use TypeScript for type safety
- Implement proper error boundaries

### 6.2 State Management
- Use Redux for global state
- Implement proper loading states
- Handle optimistic updates
- Cache responses appropriately

### 6.3 API Design
- Follow existing backend patterns
- Implement proper validation
- Use proper status codes
- Handle errors gracefully

### 6.4 Security
- Implement proper authentication
- Validate all inputs
- Sanitize all outputs
- Follow OWASP guidelines

## 7. Migration Strategy
1. Create new database collections
2. Migrate existing JSON data
3. Implement new API endpoints
4. Update frontend components
5. Test through UI
6. Deploy changes
7. Monitor for issues

## 8. Performance Considerations
- Implement proper indexing
- Use caching where appropriate
- Optimize API responses
- Implement pagination
- Use proper loading states

## 9. Monitoring & Maintenance
- Set up proper logging
- Implement error tracking
- Monitor performance metrics
- Regular security updates
- Database backups 