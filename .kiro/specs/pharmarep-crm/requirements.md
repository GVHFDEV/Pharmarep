# Requirements Document

## Introduction

PharmaRep CRM is a full-stack web application designed for pharmaceutical representatives to manage their portfolio of healthcare professionals (HCPs), schedule and record visits, control product samples inventory, manage relationship pipelines, and visualize commercial performance metrics. The system is built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Supabase (PostgreSQL, Auth, Storage), with a tablet-first responsive design approach.

## Glossary

- **System**: The PharmaRep CRM web application
- **HCP**: Healthcare Professional (physician/doctor) registered in the system
- **Representative**: The pharmaceutical representative user of the system
- **Visit**: A scheduled or completed interaction between the representative and an HCP
- **Pipeline_Deal**: A relationship opportunity tracked through stages in the Kanban board
- **Inventory**: Stock of product samples available for distribution
- **RLS**: Row Level Security — PostgreSQL policy ensuring data isolation per user
- **Supabase_Auth**: The authentication service providing email/password login and session management
- **Supabase_Storage**: The file storage service for avatar uploads
- **Bottom_Sheet**: A mobile/tablet UI panel that slides up from the bottom of the screen
- **Sidebar**: The navigation panel displayed on desktop (expanded) and tablet (collapsed/icons-only)
- **BottomNav**: The bottom navigation bar displayed on mobile devices
- **Adoption_Curve**: Classification of HCPs based on technology/product adoption speed (Inovador, Early Adopter, Maioria Inicial, Maioria Tardia, Retardatário)
- **Potential**: Numeric classification (1=high, 2=medium, 3=low) indicating the commercial value of an HCP

## Requirements

### Requirement 1: Authentication and Session Management

**User Story:** As a representative, I want to create an account, log in with email and password, and have my session managed securely, so that my data is protected and accessible only to me.

#### Acceptance Criteria

1. WHEN a new user submits the registration form with full name, email, password, and company, THE Supabase_Auth SHALL create the account and THE System SHALL create a corresponding profile record
2. WHEN a registered user submits valid email and password on the login form, THE Supabase_Auth SHALL authenticate the user and THE System SHALL redirect to the dashboard
3. WHEN a user submits invalid credentials on the login form, THE System SHALL display an inline error message without redirecting
4. WHEN a user clicks the logout button, THE System SHALL clear the session and redirect to the login page
5. IF a session token expires while the user is browsing, THEN THE System SHALL redirect to the login page automatically via middleware
6. WHEN an unauthenticated user attempts to access a protected route, THE System SHALL redirect to the login page
7. WHEN an authenticated user attempts to access the login or register page, THE System SHALL redirect to the dashboard

### Requirement 2: HCP Registration and Management

**User Story:** As a representative, I want to register healthcare professionals with all regulatory and commercial fields, so that I have a complete digital file for each doctor in my portfolio.

#### Acceptance Criteria

1. WHEN a representative submits the HCP form with valid data (name, CRM, specialty required), THE System SHALL create the HCP record associated with the representative's user_id
2. WHEN a representative submits the HCP form with an empty CRM field, THE System SHALL display a validation error and prevent submission
3. WHEN a representative enters a CPF value, THE System SHALL format it automatically as 000.000.000-00 in the input field
4. WHEN a representative enters a phone number, THE System SHALL format it automatically as (00) 00000-0000 in the input field
5. WHEN a representative submits a CPF with fewer or more than 11 digits, THE System SHALL display an inline validation error
6. WHEN a representative edits an existing HCP record, THE System SHALL update only the changed fields and preserve the original created_at timestamp
7. WHEN a representative inactivates an HCP, THE System SHALL set the active field to false without deleting the record (soft delete)
8. THE System SHALL enforce Row Level Security so that each representative can only view, create, edit, and inactivate HCPs belonging to their own user_id

### Requirement 3: HCP Search and Filtering

**User Story:** As a representative, I want to search and filter my HCPs by name, specialty, potential, and category, so that I can quickly find the doctor I need to visit.

#### Acceptance Criteria

1. WHEN a representative types in the search field, THE System SHALL filter HCPs by name with a 300ms debounce applied server-side
2. WHEN a representative selects a specialty filter, THE System SHALL display only HCPs matching that specialty
3. WHEN a representative selects a potential filter (1, 2, or 3), THE System SHALL display only HCPs matching that potential level
4. WHEN a representative selects a category filter, THE System SHALL display only HCPs matching that category
5. THE System SHALL paginate HCP results with 20 items per page and provide a "Load more" mechanism
6. WHEN the HCP list is loading, THE System SHALL display skeleton placeholders instead of a blank screen

### Requirement 4: HCP Profile and History

**User Story:** As a representative, I want to view the complete profile of an HCP including visit history and pipeline stage, so that I can prepare before each interaction.

#### Acceptance Criteria

1. WHEN a representative opens an HCP profile, THE System SHALL display all registration data (contact, address, commercial classification)
2. WHEN a representative views an HCP profile, THE System SHALL display the last 10 visits with date, status, and rating
3. WHEN a representative views an HCP profile, THE System SHALL display the current pipeline stage for that HCP
4. WHEN a representative clicks "New Visit" from the HCP profile, THE System SHALL open the visit form with the HCP pre-selected

### Requirement 5: Visit Scheduling

**User Story:** As a representative, I want to schedule visits to HCPs with date, time, and location, so that I can plan my daily route.

#### Acceptance Criteria

1. WHEN a representative submits the visit form with HCP, date, and time, THE System SHALL create a visit record with status "scheduled"
2. WHEN a representative submits the visit form without selecting an HCP, THE System SHALL display a validation error and prevent submission
3. WHEN a representative submits the visit form without a date, THE System SHALL display a validation error and prevent submission
4. WHEN a visit is scheduled for a past date, THE System SHALL allow it but display a yellow warning indicator
5. WHEN a representative searches for an HCP in the visit form, THE System SHALL provide autocomplete suggestions with 300ms debounce

### Requirement 6: Visit Agenda Visualization

**User Story:** As a representative, I want to view my scheduled visits in both list and calendar formats, so that I can plan my daily activities efficiently.

#### Acceptance Criteria

1. THE System SHALL provide a toggle between list view and monthly calendar view for visits
2. WHEN in list view, THE System SHALL group visits by date (Today, Tomorrow, This Week, Upcoming)
3. WHEN in calendar view, THE System SHALL display colored dots on days that have scheduled visits
4. WHEN a representative clicks a day in the calendar, THE System SHALL show the visits for that day in a side panel (desktop) or Bottom_Sheet (tablet/mobile)
5. THE System SHALL provide filter options: All, Today, This Week, Pending, Completed

### Requirement 7: Visit Result Registration

**User Story:** As a representative, I want to record the outcome of a visit including rating, notes, and products promoted, so that I have a complete interaction history.

#### Acceptance Criteria

1. WHEN a representative registers a visit result, THE System SHALL update the visit status to completed, cancelled, or rescheduled
2. WHEN a representative selects a rating (great, good, neutral, bad), THE System SHALL save the rating with the visit record
3. WHEN a representative selects products promoted during the visit, THE System SHALL create visit_product records linking the visit to each product
4. WHEN a representative specifies samples delivered for a product, THE System SHALL deduct the quantity from the inventory record
5. WHEN registering a result on tablet or mobile, THE System SHALL display the form in a Bottom_Sheet instead of a modal
6. WHEN a visit result is saved successfully, THE System SHALL display a success toast notification

### Requirement 8: Pipeline Kanban Board

**User Story:** As a representative, I want to see my HCPs organized by relationship stage in a Kanban board, so that I know where to focus my efforts.

#### Acceptance Criteria

1. THE System SHALL display a Kanban board with 6 columns: Prospecção, Primeiro Contato, Visita Agendada, Em Relacionamento, Convertido, Perdido
2. WHEN a representative clicks the forward or backward arrow on a pipeline card, THE System SHALL move the deal to the adjacent stage and persist the change
3. THE System SHALL display each pipeline card with HCP name, specialty, priority badge, and expected close date
4. WHEN a representative creates a new pipeline deal, THE System SHALL associate it with an HCP and set the initial stage
5. WHILE on mobile or tablet, THE System SHALL display the Kanban columns with horizontal scroll

### Requirement 9: Sample Inventory Management

**User Story:** As a representative, I want to track my product sample inventory with minimum stock alerts, so that I never run out of samples before a visit.

#### Acceptance Criteria

1. THE System SHALL display a table of products with current quantity, unit, configurable minimum, and last updated date
2. WHEN a product quantity falls below its configured minimum, THE System SHALL display a red alert badge and highlight the row with a red background
3. WHEN a representative adds stock (entry), THE System SHALL increase the product quantity by the specified amount
4. WHEN samples are delivered during a visit, THE System SHALL automatically deduct from inventory
5. WHEN a representative edits the minimum threshold for a product, THE System SHALL save the new value and re-evaluate the alert status
6. THE System SHALL allow representatives to manage products (create, edit, activate/deactivate)

### Requirement 10: Dashboard and Statistics

**User Story:** As a representative, I want to see key performance metrics on my dashboard, so that I can track my commercial activity at a glance.

#### Acceptance Criteria

1. THE System SHALL display summary cards: Total Active HCPs, Visits This Month, Completed Visits This Month, Pending Visits Today
2. THE System SHALL display a bar chart showing visits per week for the last 4 weeks
3. THE System SHALL display a donut chart showing HCP distribution by potential (1, 2, 3)
4. THE System SHALL display a ranking of the top 5 most visited HCPs in the current month
5. THE System SHALL display the top 3 most promoted products in the current month
6. WHEN the dashboard data is loading, THE System SHALL display skeleton placeholders for all sections

### Requirement 11: Account Settings

**User Story:** As a representative, I want to update my profile information, change my password, and upload an avatar, so that my account reflects my current details.

#### Acceptance Criteria

1. WHEN a representative updates their profile (name, company, region), THE System SHALL save the changes to the profiles table
2. WHEN a representative submits a new password with valid confirmation, THE Supabase_Auth SHALL update the password
3. WHEN a representative submits a new password shorter than 8 characters, THE System SHALL display a validation error
4. WHEN a representative uploads an avatar image, THE Supabase_Storage SHALL store the file and THE System SHALL update the avatar_url in the profile
5. THE System SHALL display a summary of the representative's data: total HCPs, visits, and products registered

### Requirement 12: Responsive Layout

**User Story:** As a representative, I want the application to work seamlessly on my tablet (primary device), mobile phone, and desktop, so that I can use it in the field and at the office.

#### Acceptance Criteria

1. WHILE the viewport is less than 768px, THE System SHALL display BottomNav for navigation and hide the Sidebar
2. WHILE the viewport is between 768px and 1024px, THE System SHALL display a collapsed Sidebar (icons only) with hover expansion
3. WHILE the viewport is greater than 1024px, THE System SHALL display the full Sidebar with icons and labels
4. WHILE on mobile, THE System SHALL display card grids in 1 column
5. WHILE on tablet, THE System SHALL display card grids in 2 columns
6. WHILE on desktop, THE System SHALL display card grids in 3 columns
7. WHILE on mobile or tablet, THE System SHALL use Bottom_Sheet instead of Modal for detail views and forms

### Requirement 13: Performance and Loading States

**User Story:** As a representative, I want the application to load quickly and show feedback during data fetching, so that I have a smooth experience even with slow connectivity.

#### Acceptance Criteria

1. THE System SHALL render the dashboard initial load within 2 seconds using Server-Side Rendering
2. THE System SHALL use server-side pagination with 20 items per page for all list views
3. WHEN data is being fetched, THE System SHALL display skeleton loading placeholders
4. WHEN a pipeline card is moved or a visit is completed, THE System SHALL apply optimistic UI updates before server confirmation

### Requirement 14: Data Security and Isolation

**User Story:** As a representative, I want my data to be completely isolated from other users, so that my portfolio, visits, and metrics are private.

#### Acceptance Criteria

1. THE System SHALL enable Row Level Security on all database tables without exception
2. THE System SHALL create RLS policies ensuring each user can only access records where user_id matches their auth.uid()
3. THE System SHALL filter queries by user_id as a secondary layer of protection in addition to RLS
4. THE System SHALL never expose the Supabase service role key in client-side code
5. IF a network error occurs during a Supabase operation, THEN THE System SHALL display a toast error with a retry option

### Requirement 15: Error Handling and Edge Cases

**User Story:** As a representative, I want clear feedback when something goes wrong, so that I can understand the issue and take corrective action.

#### Acceptance Criteria

1. WHEN a representative attempts to register an HCP with a duplicate CRM, THE System SHALL display a validation error before saving
2. WHEN a visit is scheduled for a past date, THE System SHALL display a yellow warning indicator
3. WHEN a product stock is below the configured minimum, THE System SHALL display a red alert badge in the inventory table and on the dashboard
4. IF the session token expires, THEN THE System SHALL redirect to the login page automatically
5. IF a Supabase network error occurs, THEN THE System SHALL display a toast with an error message and a retry option
6. WHEN a CPF is entered with invalid format, THE System SHALL block form submission with an inline error message
