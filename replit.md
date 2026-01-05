# UK Truck Clean - Recording Application

## Overview
This project is a comprehensive web application designed to manage truck cleaning operations across various UK locations. Its primary purpose is to streamline fleet management, facilitate detailed wash recording, and provide an easily searchable historical record of all cleaning activities. The application aims to improve efficiency and record-keeping for truck cleaning businesses.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with **React** and **TypeScript**, using **Vite** for fast development. **Shadcn/ui** and **Radix UI** provide accessible components styled with **Tailwind CSS**, adhering to a minimalist design. **TanStack Query** manages server state and caching, while **React Hook Form** with **Zod** handles form validation.

### Backend Architecture
The backend uses **Express.js** with **TypeScript**, providing a **RESTful API**. Key features include:
- **API Endpoints**: CRUD operations for Companies, Vehicles, and Washes, plus authentication and user data.
- **Data Layer**: An abstraction layer (`IStorage`) implemented with **Drizzle ORM** for database interactions.
- **Authentication**: **Replit Auth** for user authentication with role-based access control.
- **Error Handling**: Structured JSON error responses and appropriate HTTP status codes.
- **Referential Integrity**: Enforced to prevent deletion of companies with associated vehicles.

### Data Storage
The application utilizes **PostgreSQL** via **Neon serverless platform** for data persistence. **Drizzle ORM** and **Drizzle Kit** manage schema and migrations. The database schema includes:
-   **Companies**: `co_id`, `name`, `contact_name`, `contact_email`, `contact_phone`, `created_at`.
-   **Vehicles**: `vreg`, `co_id` (foreign key), `wash_freq`, `last_wash_date`, `last_wash_type`.
-   **Washes**: `wash_id`, `vreg`, `co_id`, `location`, `wash_type`, `wash_date`.
-   **Wash Types**: `wtid`, `description`, `price` (pre-seeded with 16 types).
-   **Locations**: `location_id`, `name`, `motorway`, `area`, `postcode` (pre-seeded with 7 UK locations).
-   **Users**: `id`, `email`, `first_name`, `last_name`, `profile_image_url`, `role`, `created_at`, `updated_at`.
-   **Type Safety**: Achieved through shared Zod schemas and TypeScript types inferred from Drizzle.
-   **Key Behaviors**: Vehicle registrations are automatically uppercased. An upsert pattern is used for user data on login.

### Code Organization
The project follows a **monorepo structure** with separate directories for `client`, `server`, and `shared` (common types/schemas).

### Application Features
-   **Landing Page (`/`)**: Public-facing homepage showcasing UK Truck Clean services.
    -   **Pricing Table**: Displays all 16 wash types with prices from the database.
        -   Two-column responsive grid layout (md:grid-cols-2).
        -   Prices formatted as currency (£X.XX).
        -   Contact note below table: "Phone Gary Taylor on 07970 842 423 to discuss special deals on large fleets" (bold).
    -   **Location Table**: Numbered list of 7 UK motorway service locations with name, motorway, area, and postcode.
    -   **Interactive Map**: UK motorway coverage map built with React Leaflet and OpenStreetMap.
        -   Custom numbered markers (1-7) matching location table order.
        -   Markers positioned using postcode coordinates.
        -   Clickable popups showing location details.
        -   Branded markers using primary color scheme.
        -   UK centered at [52.5, -1.5] with zoom level 6.
    -   **Responsive Layout**: Two-column grid (lg:grid-cols-2) for locations and map.
    -   **Loading States**: Skeleton loaders for pricing table, location list, and map during data fetch.
-   **Fleet Management Page (`/manage`)**: Authenticated route for managing companies and vehicles.
    -   **Company Management**: CRUD operations for companies with validation and toast notifications.
    -   **Vehicle Management**: CRUD operations for vehicles, including company assignment, wash frequency configuration, and automatic uppercase for registration.
    -   **Search Functionality**: Real-time search filters for both companies and vehicles tables.
        -   **Company Search**: Searches across company name, contact name, contact email, and contact phone (case-insensitive).
        -   **Vehicle Search**: Searches across vehicle registration and associated company name (case-insensitive).
        -   **Performance**: Client-side filtering using `useMemo` hooks for optimal performance.
    -   **Pagination**: Both companies and vehicles tables are paginated to 20 items per page.
        -   **Pagination Controls**: Previous/Next buttons and numbered page buttons (max 5 visible) with ellipsis for additional pages.
        -   **Smart Visibility**: Pagination controls only appear when there are more than 20 items (after filtering).
        -   **State Management**: Pagination automatically resets to page 1 when search query changes.
        -   **Automatic Clamping**: If current page exceeds total pages (due to filtering or deletion), pagination automatically adjusts to the last valid page.
        -   **Unique TestIDs**: Data-testid attributes include table identifier and view type (mobile/desktop) for reliable testing.
-   **Wash Recording**: Allows logging of vehicle washes with details like location and wash type.
    -   **Auto-Update Vehicle**: When a wash is recorded, the vehicle's `last_wash_date` and `last_wash_type` are automatically updated using database transactions.
    -   **Next Wash Due Calculation**: The `last_wash_date` is set to the wash date PLUS the vehicle's `wash_freq` (wash frequency in days), representing when the next wash is due. For example, if a vehicle is washed on Jan 10th with a 7-day frequency, `last_wash_date` is set to Jan 17th.
-   **Historical Records**: Provides a searchable and sortable interface for past wash records.
-   **Invoice Generation**: PDF invoice creation for companies within specified date ranges.
    -   **Company Selection**: Dropdown selector for choosing a company (excludes placeholder company 999999).
    -   **Date Range Filter**: Start and end date inputs to define invoice period.
    -   **Validation**: Comprehensive checks for required fields, valid date ranges, and data availability.
    -   **PDF Output**: Professional invoice format including:
        -   Company billing information (name, contact details)
        -   Detailed wash records table (date, vehicle, location, wash type, price)
        -   Total cost summary with two decimal places
        -   Total wash count
        -   Automatic filename generation
    -   **Loading States**: Button disabled during data fetch to prevent premature actions.
    -   **Error Handling**: Toast notifications for validation failures and edge cases.
-   **Responsive Design**: Mobile-first approach with responsive layouts for all pages and components.
-   **Dynamic Data**: Location and wash type dropdowns are populated from the database.
-   **Company ID Cascading Update**: When a vehicle's placeholder company (999999) is updated to a real company, all associated historical wash records are updated with the new company ID using database transactions.

## External Dependencies

-   **Database**: Neon Serverless PostgreSQL
-   **ORM**: Drizzle ORM, Drizzle Kit
-   **UI/Styling**: Radix UI, Shadcn/ui, Tailwind CSS, Lucide React, Embla Carousel
-   **Form & Validation**: React Hook Form, Zod, @hookform/resolvers
-   **State Management**: TanStack Query (React Query)
-   **Authentication**: Replit Auth, Passport.js, Express sessions with connect-pg-simple
-   **Development Tools**: Vite, TypeScript, tsx, esbuild
-   **Date Utilities**: date-fns
-   **PDF Generation**: jsPDF
-   **Mapping**: React Leaflet, Leaflet (OpenStreetMap tiles)