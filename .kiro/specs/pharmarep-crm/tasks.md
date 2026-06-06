# Implementation Plan: PharmaRep CRM

## Overview

This plan implements the PharmaRep CRM in 6 phases following the product roadmap. Each phase delivers functional increments. The stack is Next.js 14 (App Router), TypeScript, Tailwind CSS, and Supabase. All tasks reference specific requirements and produce code that compiles without errors.

## Tasks

- [x] 1. Project Setup and Supabase Configuration (TASK-001)
  - [x] 1.1 Initialize Next.js 14 project with TypeScript and App Router
    - Run `npx create-next-app@latest` with TypeScript, Tailwind CSS, App Router, and `src/` disabled
    - Install all dependencies from PRD §9: `@supabase/supabase-js`, `@supabase/ssr`, `react-hook-form`, `zod`, `@hookform/resolvers`, `recharts`, `lucide-react`, `date-fns`, `clsx`, `tailwind-merge`
    - Create `.env.local.example` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - _Requirements: 1.1, 1.2_
  - [x] 1.2 Configure Tailwind CSS with design tokens
    - Update `tailwind.config.ts` with custom colors from `docs/design.md`: background (#f0f4f8), surface (#ffffff), accent (#2563eb), text-primary (#0f172a), text-secondary (#475569), text-muted (#94a3b8), success, warning, danger, info, neutral
    - Add custom shadows (shadow-sm, shadow-md, shadow-lg, shadow-bottom-sheet) with blue tint
    - Add custom border-radius tokens (rounded-xs through rounded-xl)
    - Add breakpoints: mobile (<768px), tablet (768px-1024px), desktop (>1024px)
    - Update `app/globals.css` with Tailwind directives and CSS custom properties
    - _Requirements: 12.1, 12.2, 12.3_
  - [x] 1.3 Create Supabase client utilities
    - Create `lib/supabase/client.ts` using `createBrowserClient` from `@supabase/ssr`
    - Create `lib/supabase/server.ts` using `createServerClient` from `@supabase/ssr` with cookies from `next/headers`
    - Create `lib/supabase/middleware.ts` helper for session refresh in middleware
    - _Requirements: 14.4_
  - [x] 1.4 Create TypeScript types and utility functions
    - Create `types/index.ts` with all interfaces: UserProfile, HCP, Product, Visit, VisitProduct, InventoryItem, PipelineDeal
    - Create `lib/utils/formatters.ts` with functions: `formatCPF`, `formatPhone`, `stripCPF`, `stripPhone`, `formatDate`, `formatDateTime`
    - Create `lib/utils/constants.ts` with domain constants: adoption curves, pipeline stages, visit statuses, rating options, specialties list
    - Create `lib/utils/cn.ts` utility combining `clsx` and `tailwind-merge`
    - _Requirements: 2.3, 2.4_

- [x] 2. Authentication Middleware (TASK-002)
  - [x] 2.1 Create Next.js middleware for route protection
    - Create `middleware.ts` at project root
    - Use `@supabase/ssr` `createServerClient` to check session on every request
    - Routes matching `/(dashboard)/*` redirect to `/login` if no valid session
    - Routes matching `/(auth)/*` redirect to `/dashboard` if session exists
    - Configure `matcher` to exclude static assets and API routes
    - Handle session refresh (update cookies if session refreshed by Supabase)
    - _Requirements: 1.5, 1.6, 1.7_

- [x] 3. Login and Registration Pages (TASK-003)
  - [x] 3.1 Create the authentication layout and login page
    - Create `app/(auth)/layout.tsx` with centered card layout (white card on #f0f4f8 background)
    - Create `app/(auth)/login/page.tsx` with email and password fields, submit button, link to register
    - Implement `signInWithPassword` call to Supabase Auth
    - Display inline error message on invalid credentials
    - Redirect to `/dashboard` on successful login
    - _Requirements: 1.2, 1.3_
  - [x] 3.2 Create the registration page
    - Create `app/(auth)/register/page.tsx` with fields: full_name, email, password, company
    - Implement `signUp` call to Supabase Auth
    - After successful signup, insert record into `profiles` table with full_name, email, company
    - Handle "email already registered" error with inline message
    - Redirect to `/dashboard` on success
    - _Requirements: 1.1_
  - [x] 3.3 Implement logout functionality
    - Create a logout Server Action or client-side function calling `supabase.auth.signOut()`
    - Clear session and redirect to `/login`
    - Wire to the logout button (to be placed in Sidebar/Header later)
    - _Requirements: 1.4_

- [x] 4. Database Migrations: Profiles (TASK-004)
  - [x] 4.1 Create profiles table migration and RLS
    - Create `supabase/migrations/001_profiles.sql` with the profiles table schema from PRD
    - Create `supabase/migrations/002_rls_profiles.sql` enabling RLS and creating policy `auth.uid() = id`
    - Document the trigger for auto-creating profile on auth.users insert (for user to run in Supabase Dashboard)
    - _Requirements: 14.1, 14.2_

- [x] 5. Checkpoint — Authentication Flow Complete
  - Ensure `npm run build` passes without errors
  - Verify: unauthenticated access to `/dashboard` redirects to `/login`
  - Verify: login with valid credentials redirects to `/dashboard`
  - Verify: authenticated access to `/login` redirects to `/dashboard`
  - Ask the user if questions arise.

- [x] 6. Layout Components: Sidebar, BottomNav, Header (TASK-005)
  - [x] 6.1 Create the dashboard layout with responsive navigation
    - Create `app/(dashboard)/layout.tsx` that renders Sidebar (desktop/tablet) and BottomNav (mobile)
    - Create `components/layout/Sidebar.tsx`: 240px on desktop (icons + labels), 64px on tablet (icons only, hover expands), hidden on mobile. Navigation items: Dashboard, HCPs, Visitas, Pipeline, Estoque, Estatísticas, Configurações. Active item styled with accent-light background and accent text. User avatar and logout button at bottom.
    - Create `components/layout/BottomNav.tsx`: 64px fixed at bottom, visible only on mobile (<768px). 5 items: Dashboard, HCPs, Visitas, Pipeline, Mais (dropdown for remaining). Active item with accent color indicator.
    - Create `components/layout/Header.tsx`: 56px height, displays page title (from route), user avatar with dropdown (profile, logout). Breadcrumb on desktop.
    - Use `usePathname()` from `next/navigation` for active state detection
    - _Requirements: 12.1, 12.2, 12.3_
  - [x] 6.2 Create placeholder pages for all routes
    - Create `app/(dashboard)/page.tsx` (Dashboard placeholder)
    - Create `app/(dashboard)/hcps/page.tsx` (HCPs placeholder)
    - Create `app/(dashboard)/visits/page.tsx` (Visits placeholder)
    - Create `app/(dashboard)/pipeline/page.tsx` (Pipeline placeholder)
    - Create `app/(dashboard)/inventory/page.tsx` (Inventory placeholder)
    - Create `app/(dashboard)/stats/page.tsx` (Stats placeholder)
    - Create `app/(dashboard)/settings/page.tsx` (Settings placeholder)
    - Each page renders a simple heading so navigation can be tested
    - _Requirements: 12.1, 12.2, 12.3_

- [x] 7. Base UI Components (TASK-006)
  - [x] 7.1 Create core UI components
    - Create `components/ui/Button.tsx`: variants (primary, secondary, danger, ghost), sizes (sm, md, lg), loading state with spinner, disabled state. Styled per design.md tokens.
    - Create `components/ui/Input.tsx`: label above, error message below, icon slot, focus ring with accent color, placeholder styling.
    - Create `components/ui/Select.tsx`: native HTML select styled with Tailwind, label, error message, chevron indicator.
    - Create `components/ui/Badge.tsx`: variants (success, warning, danger, info, neutral), small rounded pill style.
    - Create `components/ui/Card.tsx`: white surface, border, shadow-sm, rounded-lg, optional hover effect (shadow-md + translateY(-1px)).
    - _Requirements: 12.1, 12.2, 12.3_
  - [x] 7.2 Create overlay UI components
    - Create `components/ui/Modal.tsx`: overlay with backdrop blur, centered card, close button, sizes (sm/md/lg), trap focus, close on Escape. Only shown on desktop (>1024px).
    - Create `components/ui/BottomSheet.tsx`: slides up from bottom with translateY animation, drag handle pill, overlay, max-height 90vh with internal scroll, close on overlay tap or swipe down. Used on tablet/mobile.
    - Create `components/ui/Toast.tsx`: positioned top-right, auto-dismiss after 3s, variants (success=green, error=red, warning=yellow), close button. Create a ToastProvider context and `useToast` hook.
    - Create `components/ui/Skeleton.tsx`: animated pulse placeholder for cards, tables, and text lines.
    - _Requirements: 12.7, 13.3, 15.5_

- [x] 8. Checkpoint — Layout and Navigation Complete
  - Ensure `npm run build` passes without errors
  - Verify: Sidebar visible on desktop, collapsed on tablet, hidden on mobile
  - Verify: BottomNav visible on mobile only
  - Verify: Navigation between all routes works correctly with active state highlighting
  - Ask the user if questions arise.

- [x] 9. Database Migrations: HCPs and Products (TASK-007)
  - [x] 9.1 Create HCPs and Products tables with RLS
    - Create `supabase/migrations/003_hcps.sql` with the complete hcps table schema from PRD (all columns, CHECK constraints for potential, adoption_curve)
    - Create `supabase/migrations/004_products.sql` with the products table schema
    - Enable RLS on both tables
    - Create RLS policies: `auth.uid() = user_id` for ALL operations on both tables
    - Create indexes: `hcps(user_id)`, `hcps(specialty)`, `hcps(potential)`, `products(user_id)`
    - _Requirements: 14.1, 14.2, 2.8_

- [x] 10. HCP List and Search (TASK-008)
  - [x] 10.1 Create HCP listing page with cards grid
    - Create `app/(dashboard)/hcps/page.tsx` as a Server Component that fetches HCPs from Supabase with pagination (limit 20)
    - Create `components/hcps/HcpCard.tsx`: displays name (body-medium), specialty (caption, text-secondary), CRM, badge for potential (1=green, 2=yellow, 3=gray), badge for category, badge for adoption_curve. Hover effect with shadow elevation. "View" button links to `/hcps/[id]`.
    - Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop
    - Floating action button (+) bottom-right corner for new HCP (links to `/hcps/new`)
    - _Requirements: 3.5, 3.6, 12.4, 12.5, 12.6_
  - [x] 10.2 Implement search and filters
    - Create `hooks/useHcps.ts` for client-side state management of filters and search
    - Add search input with 300ms debounce (client-side debounce, server-side query)
    - Add filter dropdowns: Specialty, Potential (1/2/3), Category
    - Implement "Load more" button for pagination (append next 20 items)
    - Show skeleton loading while fetching
    - Filters applied as Supabase query parameters (server-side filtering)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - [ ]* 10.3 Write property test for search filter consistency
    - **Property 9: Search Filter Consistency**
    - Test that for any filter value applied (potential, specialty, category), all returned results match the filter criteria
    - Use `fast-check` to generate filter combinations
    - **Validates: Requirements 3.2, 3.3, 3.4**

- [x] 11. HCP Registration and Edit Form (TASK-009)
  - [x] 11.1 Create HCP form with validation
    - Create `lib/validations/hcp.ts` with Zod schema: name (required), crm (required), cpf (11 digits or empty), email (valid or empty), mobile_phone (required), specialty (required), potential (1/2/3 optional), adoption_curve (enum optional)
    - Create `components/hcps/HcpForm.tsx` using `react-hook-form` with `@hookform/resolvers/zod`
    - Implement auto-formatting: CPF field formats as 000.000.000-00 on change, phone fields format as (00) 00000-0000 on change (store raw digits, display formatted)
    - Potential field rendered as 3 visual toggle buttons (1, 2, 3) instead of dropdown
    - Layout: 2 columns on desktop, 1 column on mobile. Full-screen on mobile.
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [x] 11.2 Create new HCP page and edit flow
    - Create `app/(dashboard)/hcps/new/page.tsx` rendering HcpForm
    - On valid submit: insert into `hcps` table via Supabase with `user_id` from session
    - Show success toast and redirect to `/hcps`
    - For edit: reuse HcpForm with `defaultValues` pre-populated, update record on submit
    - Handle duplicate CRM error (Supabase constraint violation code 23505) with inline message
    - _Requirements: 2.1, 2.6, 15.1_
  - [x] 11.3 Implement HCP soft delete (inactivation)
    - Add "Inactivate" button on HCP profile/edit that sets `active = false`
    - Inactivated HCPs hidden from default list view (filter `active = true`)
    - Show confirmation dialog before inactivation
    - _Requirements: 2.7_
  - [ ]* 11.4 Write property tests for formatters
    - **Property 1: CPF Formatting Round-Trip**
    - **Property 2: Phone Formatting Round-Trip**
    - Test with `fast-check`: for any 11-digit string, `stripCPF(formatCPF(x)) === x`
    - Test with `fast-check`: for any 10/11-digit string, `stripPhone(formatPhone(x)) === x`
    - **Validates: Requirements 2.3, 2.4**

- [x] 12. HCP Profile Page (TASK-010)
  - [x] 12.1 Create HCP detail page
    - Create `app/(dashboard)/hcps/[id]/page.tsx` as Server Component fetching HCP by id
    - Create `components/hcps/HcpProfile.tsx`: header with name, specialty, badges (potential, category, adoption_curve). Contact section (phones, email). Address section (clinic details). Commercial section (notes, adoption curve description).
    - Show "Visit History" section: fetch last 10 visits for this HCP with date, status badge, rating badge
    - Show "Pipeline" section: current pipeline stage if a deal exists for this HCP
    - Action buttons: Edit (link to edit form), New Visit (link to `/visits/new?hcp_id=[id]`), Inactivate
    - Tablet: 2-panel layout (data left, history right). Mobile: stacked with tabs.
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 13. Checkpoint — HCP Management Complete
  - Ensure `npm run build` passes without errors
  - Verify: Create an HCP with all fields, see it in the list
  - Verify: Search by name filters correctly
  - Verify: Filter by potential shows only matching HCPs
  - Verify: Edit an HCP, confirm changes saved
  - Verify: HCP profile shows all data
  - Ask the user if questions arise.

- [x] 14. Database Migrations: Visits and Visit Products (TASK-011)
  - [x] 14.1 Create visits and visit_products tables with RLS
    - Create `supabase/migrations/005_visits.sql` with visits table schema, CHECK constraints for status and rating
    - Create `supabase/migrations/006_visit_products.sql` with visit_products table schema
    - Enable RLS on both tables
    - RLS on visits: `auth.uid() = user_id`
    - RLS on visit_products: `EXISTS (SELECT 1 FROM visits WHERE visits.id = visit_products.visit_id AND visits.user_id = auth.uid())`
    - Create indexes: `visits(user_id)`, `visits(hcp_id)`, `visits(scheduled_at)`, `visits(status)`
    - _Requirements: 14.1, 14.2_

- [x] 15. Visit Agenda: List and Calendar Views (TASK-012)
  - [x] 15.1 Create visits page with list view
    - Create `app/(dashboard)/visits/page.tsx` with toggle between List and Calendar views
    - Create `components/visits/VisitCard.tsx`: colored left border by status (blue=scheduled, green=completed, gray=cancelled, yellow=rescheduled). Shows: HCP name, date/time, location, status badge, action buttons (Register Result, Edit, Cancel).
    - List view groups visits by date: "Hoje", "Amanhã", "Esta Semana", "Próximas"
    - Create `hooks/useVisits.ts` for fetching with filters
    - Add filter buttons: Todas, Hoje, Esta Semana, Pendentes, Concluídas
    - Floating action button (+) for new visit
    - _Requirements: 6.1, 6.2, 6.5_
  - [x] 15.2 Create calendar view
    - Create `components/visits/VisitCalendar.tsx`: monthly grid (CSS grid, no external library)
    - Display colored dots on days with visits (dot color matches status)
    - Navigation arrows to switch months
    - On day click: show visits for that day in side panel (desktop) or BottomSheet (tablet/mobile)
    - Current day highlighted with accent border
    - _Requirements: 6.3, 6.4_

- [x] 16. Visit Creation and Result Registration (TASK-013)
  - [x] 16.1 Create new visit form
    - Create `app/(dashboard)/visits/new/page.tsx`
    - Create `components/visits/VisitForm.tsx` with: HCP autocomplete search field (debounce 300ms, searches `hcps` table by name), date picker (native input type="datetime-local"), location text field, notes textarea
    - Create `lib/validations/visit.ts` with Zod schemas for visit creation and result registration
    - If `?hcp_id` query param present, pre-select that HCP
    - Show yellow warning if scheduled date is in the past
    - On submit: insert into `visits` with status "scheduled"
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [x] 16.2 Create visit result registration
    - Create `components/visits/VisitResult.tsx`: status toggle (Completed/Cancelled/Rescheduled), rating selection with emoji icons (great 😊, good 👍, neutral 😐, bad 😞), notes textarea, products section with checkboxes for each product + samples quantity input per product
    - On tablet/mobile: render in BottomSheet. On desktop: render in Modal.
    - On submit: update visit record (status, rating, notes, completed_at), insert visit_products records, deduct samples from inventory table
    - Show success toast on save
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  - [ ]* 16.3 Write property tests for visit logic
    - **Property 7: Visit Status Transition Invariant**
    - Test that for any scheduled visit, registering a result changes status to completed, cancelled, or rescheduled (never stays scheduled)
    - **Property 6: Inventory Deduction Consistency**
    - Test that delivering N samples deducts exactly N from inventory
    - **Validates: Requirements 7.1, 7.4, 9.4**

- [x] 17. Checkpoint — Visits Complete
  - Ensure `npm run build` passes without errors
  - Verify: Create a visit, see it in list and calendar
  - Verify: Register result with products, see status change and stock deduction
  - Verify: Calendar shows dots on days with visits
  - Verify: Past date shows warning
  - Ask the user if questions arise.

- [x] 18. Database Migrations: Pipeline and Inventory (TASK-014)
  - [x] 18.1 Create pipeline_deals and inventory tables with RLS
    - Create `supabase/migrations/007_pipeline.sql` with pipeline_deals schema, CHECK constraints for stage and priority
    - Create `supabase/migrations/008_inventory.sql` with inventory schema, UNIQUE constraint on (user_id, product_id)
    - Enable RLS on both: `auth.uid() = user_id`
    - Create indexes: `pipeline_deals(user_id)`, `pipeline_deals(stage)`, `inventory(user_id)`
    - _Requirements: 14.1, 14.2_

- [x] 19. Pipeline Kanban Board (TASK-015)
  - [x] 19.1 Create Kanban board page
    - Create `app/(dashboard)/pipeline/page.tsx`
    - Create `components/pipeline/KanbanBoard.tsx`: 6 columns (Prospecção, Primeiro Contato, Visita Agendada, Em Relacionamento, Convertido, Perdido). Each column has: header with name and card count, scrollable card list, (+) button to add new deal.
    - Create pipeline card component: HCP name, specialty (caption), priority badge (high=red, medium=yellow, low=gray), expected close date. Arrow buttons (← →) for moving between stages.
    - Horizontal scroll on mobile/tablet for columns
    - Moving a card: optimistic UI update, then persist to Supabase. Rollback on error with toast.
    - New deal form: HCP search (autocomplete), title, priority selection. Opens in BottomSheet (tablet/mobile) or Modal (desktop).
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [ ]* 19.2 Write property test for pipeline transitions
    - **Property 5: Pipeline Stage Transition Correctness**
    - Test that moving a deal forward then backward returns to original stage
    - Use `fast-check` to generate random starting stages
    - **Validates: Requirements 8.2**

- [x] 20. Sample Inventory Management (TASK-016)
  - [x] 20.1 Create inventory page with stock table
    - Create `app/(dashboard)/inventory/page.tsx`
    - Create `components/inventory/StockTable.tsx`: table with columns: Product Name, Quantity, Unit, Minimum, Last Updated, Actions. Rows where quantity < min_quantity highlighted with red background and alert badge. Actions: (+) Add Stock button, Edit Minimum button.
    - Add Stock: opens Modal/BottomSheet with quantity input field. On submit: increment quantity in inventory table.
    - Edit Minimum: inline edit or Modal with new min value.
    - Product management section: list products with Create/Edit/Deactivate. Simple form with name, category fields.
    - _Requirements: 9.1, 9.2, 9.3, 9.5, 9.6_
  - [ ]* 20.2 Write property test for low stock alert
    - **Property 10: Low Stock Alert Correctness**
    - Test that for any inventory item, alert is shown if and only if quantity < min_quantity
    - Use `fast-check` to generate random quantity/min pairs
    - **Validates: Requirements 9.2, 15.3**

- [x] 21. Dashboard with Metrics (TASK-017)
  - [x] 21.1 Create dashboard page with summary cards and charts
    - Update `app/(dashboard)/page.tsx` as Server Component
    - Fetch all metrics in parallel with `Promise.all`: total active HCPs, visits this month, completed visits this month, pending visits today
    - Render 4 summary cards in responsive grid (2x2 on tablet, 4x1 on mobile, 4 in row on desktop)
    - Create `components/stats/VisitChart.tsx`: Recharts BarChart showing visits per week (last 4 weeks), blue for completed, light blue for scheduled
    - Create `components/stats/HcpStats.tsx`: Recharts PieChart (donut) showing HCP distribution by potential (green/yellow/gray)
    - Ranking section: Top 5 most visited HCPs this month (name + visit count). Top 3 most promoted products this month (name + promotion count).
    - Skeleton loading for all sections while data fetches
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 13.1_

- [x] 22. Checkpoint — Pipeline, Inventory, and Dashboard Complete
  - Ensure `npm run build` passes without errors
  - Verify: Kanban board displays deals in correct columns
  - Verify: Moving cards between stages persists to database
  - Verify: Inventory shows low stock alerts correctly
  - Verify: Dashboard charts render with real data
  - Ask the user if questions arise.

- [x] 23. Account Settings and Final Polish (TASK-018)
  - [x] 23.1 Create settings page
    - Create `app/(dashboard)/settings/page.tsx` with 3 sections:
    - **Profile section**: Edit full_name, company, region. Avatar upload to Supabase Storage (preview before upload, save URL to profiles.avatar_url). Submit updates profiles table.
    - **Security section**: Change password form with new_password and confirm_password fields. Zod validation: minimum 8 characters, passwords match. Calls `supabase.auth.updateUser({ password })`.
    - **Data summary section**: Display total HCPs, total visits, total products as read-only stats.
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  - [x] 23.2 Responsiveness audit and fixes
    - Test all pages at 375px (mobile), 768px (tablet), 1280px (desktop)
    - Ensure BottomNav does not overlap content (add `pb-16` on mobile)
    - Ensure Sidebar collapse works correctly on tablet
    - Ensure forms use full width on mobile without horizontal overflow
    - Ensure card grids switch columns correctly at breakpoints
    - Ensure BottomSheet is used instead of Modal on tablet/mobile across all features
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_
  - [x] 23.3 Error handling and edge cases review
    - Ensure all Supabase queries destructure `{ data, error }` and handle errors
    - Add toast error with retry option for network failures
    - Verify middleware redirects on session expiry
    - Verify duplicate CRM shows validation error
    - Verify past-date visits show yellow warning
    - Verify low stock alerts appear on both inventory page and dashboard
    - Remove all `console.log` debug statements
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [x] 24. Final Validation and Build Verification
  - Run `npm run build` and ensure zero TypeScript errors and zero build warnings
  - Verify `.env.local.example` contains all required environment variables
  - Verify all pages render without runtime errors
  - Verify responsive behavior at 375px, 768px, and 1280px viewports
  - Verify the complete user flow: register → login → create HCPs → schedule visits → register results → check dashboard → change password → logout → login again
  - Verify no `console.log` statements remain in production code
  - Verify all SQL migration files are present and complete
  - Ask the user if questions arise.

## Task Dependency Graph

```json
{
  "waves": [
    {
      "name": "Phase 0: Foundation & Auth",
      "tasks": ["1", "2", "3", "4", "5"]
    },
    {
      "name": "Phase 1: Layout & Navigation",
      "tasks": ["6", "7", "8"]
    },
    {
      "name": "Phase 2: HCP Management",
      "tasks": ["9", "10", "11", "12", "13"]
    },
    {
      "name": "Phase 3: Visits & Schedule",
      "tasks": ["14", "15", "16", "17"]
    },
    {
      "name": "Phase 4: Pipeline, Inventory & Dashboard",
      "tasks": ["18", "19", "20", "21", "22"]
    },
    {
      "name": "Phase 5: Settings & Final Polish",
      "tasks": ["23", "24"]
    }
  ]
}
```

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at each phase boundary
- Property tests use `fast-check` library with minimum 100 iterations
- All Server Components use `lib/supabase/server.ts`, all Client Components use `lib/supabase/client.ts`
- The `.env.local.example` file should be ready for the user to insert their Supabase URL and anon key
- SQL migrations are documentation for the user to run in Supabase Dashboard (not auto-executed)
