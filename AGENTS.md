# Software Requirements Specification (SRS) for AzharStore
**Version 2.0**

**Date: 2025-09-17**
j
## 1. Introduction

### 1.1. Purpose
This document provides a detailed Software Requirements Specification (SRS) for AzharStore, a full-stack e-commerce application. The project is being developed to serve as the online storefront and management system for a real-world store, featuring a modern distributed architecture with separated frontend and backend deployments.

### 1.2. Scope
The application provides a comprehensive set of core e-commerce functionalities with a distributed architecture:

- A complete admin dashboard for managing products, orders, and customers
- A customer-facing storefront for browsing products and making purchases  
- A complete guest checkout and order processing workflow
- Separated frontend and backend deployments for improved scalability and maintainability

This SRS document covers the existing features, updated architecture, and deployment strategy for the AzharStore repository.

### 1.3. Overview
This document is organized to provide a clear understanding of the application's requirements with the new FastAPI backend architecture. It details the overall description of the product, specific functional and non-functional requirements, UI/UX guidelines, the underlying data model, and the distributed deployment strategy.

## 2. Overall Description

### 2.1. Product Perspective
AzharStore is a distributed, full-stack web application built with a modern technology stack featuring separated frontend and backend services. It integrates a React/Vite frontend deployed on Cloudflare Workers with a FastAPI backend deployed on Dokploy, leveraging Supabase for database and backend services. The application is being developed for a specific retail business with a focus on performance, scalability, and maintainability.

### 2.2. Target Audience
The target audience for the AzharStore application includes:

- **Customers**: Individuals browsing the store to purchase products
- **Store Administrators**: Staff responsible for managing products, processing orders, and overseeing store operations via the admin dashboard

### 2.3. Operating Environment
The application is a web-based platform consisting of:

**Frontend (Cloudflare Workers):**
- Fully functional on the latest stable versions of modern web browsers:
  - Google Chrome
  - Mozilla Firefox  
  - Apple Safari
  - Microsoft Edge
- Designed for both desktop and mobile devices
- Served globally via Cloudflare's edge network

**Backend (Dokploy):**
- FastAPI REST API deployed on Dokploy platform supporting Python applications
- Database services through Supabase
- Containerized deployment with Docker support

### 2.4. General Constraints
- **Responsive Design**: The user interface must be mobile-first and fully responsive, adapting gracefully to a wide range of screen sizes from mobile phones to desktops. This is enforced through the use of Tailwind CSS.
- **Cross-Browser Compatibility**: The application must provide a consistent look, feel, and functionality across all supported browsers.
- **Accessibility**: The application should adhere to Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. The use of the shadcn/ui component library, which is built on Radix UI, provides a strong foundation for meeting this requirement.
- **Technology Stack**: The project uses React/TypeScript for frontend, FastAPI/Python for backend, and Supabase for database services.
- **Animation & UI Libraries**: The frontend must utilize modern animation libraries to achieve professional-grade UI/UX similar to contemporary platforms like Dokploy.
- **Deployment Separation**: Frontend and backend are deployed independently on different platforms to ensure scalability and maintainability.

## 3. Specific Requirements

### 3.1. Functional Requirements

#### 3.1.1. Admin Authentication
- **FR-1: Admin Login**: The application provides a simple login page for an administrator. Access is granted by providing a single, correct password. There is no customer-facing registration or login functionality.

#### 3.1.2. Admin Dashboard  
- **FR-2: Summary View**: Upon logging in, administrators are presented with a dashboard displaying high-level statistics (e.g., total revenue, number of orders, new customers).
- **FR-3: Data Visualization**: The dashboard includes charts and graphs (using recharts) to visualize sales trends and other key performance indicators over time.

#### 3.1.3. Product Management (Admin)
- **FR-4: Product CRUD**: Administrators shall have full Create, Read, Update, and Delete (CRUD) capabilities for products through the admin interface.
- **FR-5: Product Details**: Product information shall include name, description, price, stock quantity, and associated category.
- **FR-6: Product Image Upload**: Administrators shall be able to upload product images.

#### 3.1.4. Category Management (Admin)
- **FR-7: Category CRUD**: Administrators shall have full Create, Read, Update, and Delete (CRUD) capabilities for product categories.

#### 3.1.5. Order Management (Admin)
- **FR-8: Order Viewing & Deletion**: Administrators shall be able to view a list of all orders and delete orders.
- **FR-9: Update Order Status**: Administrators shall be able to update the status of an order (e.g., "Pending", "Shipped", "Delivered", "Cancelled").

#### 3.1.6. Customer Management (Admin)
- **FR-10: Customer CRUD**: Administrators shall have full Create, Read, Update, and Delete (CRUD) capabilities for customer records. Customer records are used to store contact information for orders.

#### 3.1.7. Store Settings Management (Admin)
- **FR-11: General Settings**: Administrators shall be able to configure general store information such as store name, description, and currency.
- **FR-12: Delivery & Payment Settings**: Administrators shall be able to configure delivery fees for different geographic areas, set a minimum amount for free delivery, and toggle payment methods (e.g., Cash on Delivery).
- **FR-13: Customizable Messages**: Administrators shall be able to customize various user-facing messages in both English and Arabic, including the order success message, checkout instructions, and delivery/pickup messages.
- **FR-14: Admin Account Management**: The administrator shall be able to change their password and update their contact email.

### 3.1.9. API Status & Monitoring
#### 3.1.8. Storefront & Public Functionality
  - API service health and uptime
  - Database connectivity status
  - Third-party service integrations status (Supabase, etc.)
  - Recent API response times and performance metrics
  - System version information and deployment timestamp
- **FR-19: Health Check Endpoints**: The API shall provide dedicated health check endpoints for monitoring services
- **FR-20: Status Page Accessibility**: The status dashboard shall be publicly accessible without authentication for transparency
- **FR-15: Product Browsing**: All users shall be able to view and search for products, filter them by category, and view detailed product pages.
- **FR-16: Shopping Cart**: Users shall be able to add products to a shopping cart and modify its contents.
- **FR-17: Guest Checkout**: Users shall check out as guests. The checkout process is a multi-step flow within a modal dialog that collects customer contact information and delivery preferences before placing the order.

### 3.2. Non-Functional Requirements

**NFR-1: Performance:**
- The frontend application shall be optimized for fast load times through Cloudflare Workers' edge deployment
- The FastAPI backend offers very high performance, on par with NodeJS and Go
- Client-side data fetching shall be managed by TanStack React Query to provide caching, reduce redundant API calls, and improve perceived performance
- The application should target a First Contentful Paint (FCP) of under 1.5 seconds globally via Cloudflare's edge network
- FastAPI's built-in support for async and await syntax enables highly performant applications

**NFR-2: Security:**
- The administrator password must be securely hashed using bcrypt algorithm before being stored
- FastAPI's automatic data validation using type hints reduces security vulnerabilities
- The public-facing API for creating orders and customers should be protected against abuse through rate limiting
- Admin-only API endpoints shall be protected with proper authentication middleware
- Sensitive credentials (API keys, database URLs) must be managed through environment variables
- CORS configuration must be properly set to allow frontend-backend communication across different domains

**NFR-3: Usability:**
- The UI must be responsive and mobile-first, ensuring a seamless experience on all device sizes
- The component library (shadcn/ui) provides a consistent, accessible, and intuitive set of building blocks
- API responses shall include clear error messages and status codes for better debugging

**NFR-4: Localization:**
- The application must support at least two languages: English and Arabic
- API responses should support localized error messages

**NFR-5: Scalability:**
- FastAPI's asynchronous support leverages modern Python features for high concurrency
- Frontend deployment on Cloudflare Workers provides automatic global scaling
- Backend deployment on Dokploy supports multi-node scaling and Docker orchestration
- The use of Supabase provides a scalable database infrastructure
- Separation of frontend and backend allows independent scaling based on demand

**NFR-9: Maintainability:**
- The frontend codebase is written in TypeScript for type safety
- FastAPI uses Python type hints and automatic OpenAPI documentation generation to improve development speed and reduce errors
- Code is organized into distinct frontend and backend repositories
- Pydantic models ensure data validation and consistency
- FastAPI automatically generates OpenAPI documentation for API endpoints

**NFR-7: Animation & UI Library Requirements:**
- **Motion (Framer Motion)**: The application must utilize Motion (previously Framer Motion) as the primary animation library, which is a fast, production-grade web animation library for React with smooth UI animations and a tiny footprint
- **React Spring**: Secondary animation library for physics-based animations and smooth transitions, explicitly recommended over React Motion for superior performance
- **Tailwind CSS Animate**: Built-in Tailwind animation utilities for basic transitions and keyframe animations
- **React Transition Group**: Official React team library for managing element enter/leave transitions, integrating smoothly with existing React codebase
- **Intersection Observer**: For reveal animations using React Awesome Reveal, utilizing the Intersection Observer API to identify when elements are visible within the viewport
- **Performance Requirements**: All animations must maintain 60fps performance with hardware acceleration through CSS transforms and opacity properties

**NFR-8: Deployment & DevOps:**
- Frontend shall be deployed to Cloudflare Workers with automatic CI/CD
- Backend shall be deployed to Dokploy with support for Docker, GitHub integration, and automated deployments
- Both deployments should support staging and production environments
- Database migrations should be automated and version-controlled
- Health checks and monitoring should be implemented for both services

### 3.3. UI/UX Requirements

**UI-1: Core Principle - Modern Dashboard Aesthetics:**
The entire user interface must embody a modern, professional dashboard aesthetic inspired by contemporary DevOps platforms. The design should prioritize clarity, efficiency, and visual sophistication while maintaining simplicity for end users.

**UI-2: Navigation Architecture:**
- **Public Storefront**: Clean top navigation bar with minimal, rectangular buttons and proper spacing
- **Admin Dashboard**: Persistent sidebar navigation with:
  - Organized menu sections with clear visual hierarchy
  - Smooth hover animations and active state indicators
  - Icons paired with text labels for clarity
  - Collapsible sections for better space utilization
  - Subtle background variations to distinguish different menu areas

**UI-3: Modal Dialog System:**
- **Design Pattern**: All create/edit workflows utilize modal dialogs as primary interaction method
- **Modal Specifications**:
  - Backdrop blur effect with subtle transparency
  - Smooth fade-in/scale animations (200-300ms duration)
  - Rounded corners (12-16px border-radius) for modern appearance
  - Proper focus management and keyboard navigation
  - Clean close button positioned consistently in top-right corner

**UI-4: Button Design Standards:**
- **Corner Rounding**: All buttons must use consistent border-radius of 8-12px (avoid fully rounded buttons)
- **Primary Buttons**: 
  - Brand color (#742370) background with white text
  - Smooth hover transitions with slight color darkening
  - Subtle shadow effects for depth
- **Secondary Buttons**: 
  - Light background with brand color text
  - Hover states with background color transitions
- **Icon Buttons**: Square or slightly rounded rectangle shape, never circular
- **Animation Requirements**: 
  - 150ms transition duration for all hover states
  - Subtle scale animation on click (transform: scale(0.98))

**UI-5: Form Design Guidelines:**
- **Input Fields**:
  - Consistent padding (12-16px vertical, 16-20px horizontal)
  - Rounded corners (8px border-radius)
  - Subtle border with focus state color change to brand color
  - Placeholder text with appropriate opacity (0.6-0.7)
- **Labels**: 
  - Clear typography hierarchy
  - Proper spacing above input fields
  - Required field indicators when applicable
- **Validation**:
  - Inline validation with smooth error message animations
  - Color-coded feedback (red for errors, green for success)
  - Non-intrusive validation timing (on blur, not on every keystroke)

**UI-6: Visual Design System:**
- **Primary Brand Color**: #742370 (deep purple)
- **Color Palette**:
  - Light mode background: #ffffff, #f8fafc, #f1f5f9 for layered backgrounds
  - Text colors: #0f172a (primary), #475569 (secondary), #64748b (muted)
  - Border colors: #e2e8f0 (light), #cbd5e1 (medium)
  - Success: #10b981, Warning: #f59e0b, Error: #ef4444
- **Typography**:
  - Font family: Inter or system fonts for optimal readability
  - Clear hierarchy with consistent font weights and sizes
  - Proper line spacing for improved readability
- **Spacing System**: 
  - 8px base unit for consistent spacing throughout the application
  - Multiples of 8px (8, 16, 24, 32, 48, 64px) for margins and padding

**UI-7: Animation & Micro-interaction Standards:**
- **Primary Animation Library**: Motion (Framer Motion) for complex UI animations, gestures, and orchestration
  - Declarative API with motion components for 120fps animations
  - SSR-compatible and highly customizable
  - Variants system for coordinated animations across multiple elements
- **Secondary Animation Libraries**:
  - **React Spring**: Physics-based animations with natural spring physics
  - **React Transition Group**: Element enter/exit transitions with lifecycle management
  - **React Awesome Reveal**: Scroll-based reveal animations using Intersection Observer
- **CSS Animation Integration**:
  - **Tailwind CSS Animate**: Built-in utility classes for basic transitions
  - **Custom keyframes**: Hardware-accelerated animations using transform and opacity
- **Animation Specifications**:
  - **Page Transitions**: Smooth fade transitions between admin sections (200ms)
  - **Modal Animations**: Backdrop blur with scale/fade-in effects (300ms)
  - **Hover States**: 150ms transition duration for all interactive elements
  - **Click Feedback**: Subtle scale animation (transform: scale(0.98)) with 100ms duration
  - **Loading States**: Skeleton screens with shimmer effects and smooth spinner animations
  - **List Animations**: Stagger animations for items appearing/disappearing
- **Gesture Support**:
  - **Drag & Drop**: For admin interface (reordering products, categories)
  - **Swipe Gestures**: Mobile navigation and carousel interactions
  - **Hover Effects**: Desktop-specific animations with touch device alternatives
- **Performance Standards**:
  - All animations must maintain 60fps performance
  - Use transform and opacity properties for optimal GPU acceleration
  - Implement proper animation reducers for accessibility compliance
  - Lazy load animation libraries to minimize initial bundle size

**UI-8: Admin Dashboard Layout Specifications:**
- **Sidebar**:
  - Fixed width: 280px on desktop, collapsible on mobile
  - Two-tier navigation structure (main items + settings section)
  - Smooth expand/collapse animations
  - Active state highlighting with background color and left border indicator
- **Main Content Area**:
  - Proper spacing from sidebar with responsive adjustments
  - Clean header with breadcrumb navigation
  - Card-based layout for content sections
- **Data Tables**:
  - Alternating row colors for improved readability
  - Sortable columns with clear visual indicators
  - Hover states for rows
  - Responsive design with horizontal scrolling on mobile

**UI-9: Component-Specific Requirements:**
- **Cards**: 
  - Subtle drop shadows (0 1px 3px rgba(0,0,0,0.1))
  - Rounded corners (12px border-radius)
  - Proper padding and content spacing
- **Dropdowns/Select Elements**:
  - Custom styling to match overall design system
  - Smooth open/close animations
  - Proper keyboard navigation support
- **Toggle Switches**: 
  - Smooth sliding animations
  - Brand color for active state
  - Appropriate sizing for touch targets

**UI-10: Responsive Behavior:**
- **Breakpoint Strategy**:
  - Mobile-first approach with progressive enhancement
  - Sidebar collapses to overlay on tablets/mobile
  - Modal dialogs adapt sizing for smaller screens
  - Form layouts stack vertically on mobile
- **Touch Interactions**:
  - Minimum 44px touch targets
  - Appropriate hover state alternatives for touch devices
  - Smooth scroll behavior throughout the application

**UI-11: Accessibility & Usability:**
- **Keyboard Navigation**: 
  - Logical tab order throughout the interface
  - Visible focus indicators with brand color
  - Escape key functionality for modal dialogs
- **Screen Reader Support**:
  - Semantic HTML structure
  - Appropriate ARIA labels and descriptions
  - Status updates announced for dynamic content
- **Color Contrast**: 
  - WCAG AA compliance for all text/background combinations
  - Alternative indicators beyond color for important information

**UI-13: Frontend Technology Stack & Dependencies:**
- **Core Framework**: React 18+ with TypeScript for type safety and modern React features
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling Framework**: Tailwind CSS v3+ with utility-first methodology
- **Component Library**: shadcn/ui built on Radix UI primitives for accessibility
- **Animation Libraries** (Required for Dokploy-like UI/UX):
  - **Motion v10+** (formerly Framer Motion): Primary animation library for complex UI animations, gestures, and 120fps performance
  - **React Spring v9+**: Physics-based animations with declarative API, recommended over React Motion
  - **React Transition Group v4+**: Official React library for managing component transitions
  - **React Awesome Reveal v4+**: Scroll-triggered animations using Intersection Observer API
  - **Tailwind CSS Animate**: Built-in animation utilities for basic transitions
- **State Management**: TanStack React Query v4+ for server state management and caching
- **Form Handling**: React Hook Form v7+ with Zod validation for type-safe forms
- **Icons**: Lucide React for consistent, customizable SVG icons
- **Theming**: next-themes for light/dark mode support
- **Notifications**: Sonner for toast notifications with smooth animations
- **Utilities**:
  - clsx for conditional className composition
  - tailwind-merge for className conflict resolution
  - date-fns for date manipulation and formatting
- **Development Tools**:
  - ESLint with TypeScript rules
  - Prettier for code formatting
  - Husky for Git hooks
  - lint-staged for pre-commit checks

**UI-12: Loading States & Feedback:**
- **Motion Integration**: 
  - Use `<motion.div>` components for all animated elements
  - Implement variants for coordinated multi-element animations
  - Utilize layout animations for smooth position changes
- **React Spring Integration**:
  - useSpring hook for simple property animations
  - useTransition for list item animations
  - useChain for sequenced animations
- **Performance Optimization**:
  - Lazy load animation libraries using React.lazy()
  - Use AnimatePresence for exit animations
  - Implement proper cleanup for animation listeners
- **Accessibility Integration**:
  - Respect user preferences for reduced motion
  - Provide alternative focus indicators
  - Ensure keyboard navigation works with animations
- **Loading Indicators**:
  - Skeleton screens for data-heavy sections
  - Subtle spinner animations for quick actions
  - Progress indicators for multi-step processes
- **Success/Error States**:
  - Toast notifications with slide-in animations
  - Inline success messages with checkmark icons
  - Clear error messages with suggested actions
- **Empty States**:
  - Meaningful illustrations or icons
  - Clear call-to-action buttons
  - Helpful guidance text for next steps

## 4. Data Model and API

### 4.1. Data Entities
The core data entities are defined using Pydantic models in the FastAPI backend, ensuring type safety and automatic validation.

**AdminUser**: (Singleton entity for the administrator)
- id (Primary Key)
- email (String, Unique)  
- hashedPassword (String)

**Customer**: (Stores contact info for an order, not a user account)
- customerId (Primary Key)
- name (String)
- phone (String)
- address (String)

**Product**:
- productId (Primary Key)
- name (String)
- description (String)
- price (Number)
- stockQuantity (Integer)
- imageUrl (String)
- categoryId (Foreign Key to Category)

**Category**:
- categoryId (Primary Key)
- name (String)

**Order**:
- orderId (Primary Key)
- customerId (Foreign Key to Customer)
- status (Enum: 'PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED')
- totalAmount (Number)
- createdAt (Timestamp)

**OrderItem**: (Junction table for Orders and Products)
- orderItemId (Primary Key)
- orderId (Foreign Key to Order)
- productId (Foreign Key to Product)
- quantity (Integer)
- priceAtPurchase (Number)

### 4.2. Relationships
- A Customer record is associated with one or more Orders
- A Category can have many Products
- An Order belongs to one Customer
- An Order can contain many OrderItems
- An OrderItem links to one specific Product

### 4.3. API Architecture
The application exposes a FastAPI REST API for all client-server communication, with endpoints for different HTTP methods and automatic OpenAPI documentation.

**Domain Structure:**
- Customer Storefront: `https://azhar.store` (Cloudflare Workers)
- Admin Dashboard: `https://azhar.store/admin` (Same deployment, route-based)
- Backend API: `https://api.azhar.store` (Dokploy deployment)
- API Status & Health: `https://api.azhar.store/` (Root endpoint showing system status)

**Example Endpoints:**
- `GET /` - API status dashboard showing system health, uptime, and service status
- `POST /api/admin/login` - Authenticates the administrator
- `GET /api/products` - Fetches a list of all products  
- `POST /api/customers` - Creates a new customer record for guest checkout
- `POST /api/orders` - Creates a new order for guest checkout
- `GET /api/admin/orders` - Fetches all orders for the admin dashboard
- `PUT /api/admin/orders/{id}` - Updates an order's status
- `GET /docs` - Interactive API documentation (auto-generated by FastAPI)
- `GET /redoc` - Alternative API documentation format
- `GET /health` - Basic health check endpoint for monitoring

**API Features:**
- Automatic request/response validation using Pydantic models
- Built-in OpenAPI schema generation
- Automatic interactive documentation
- Type-safe request/response handling
- Async endpoint support for high performance
- Standardized error responses with proper HTTP status codes

## 5. Architecture and Deployment

### 5.1. System Architecture
The application follows a distributed microservices architecture:

**Frontend Service (Cloudflare Workers):**
- React/Vite application served from Cloudflare's global edge network at azhar.store
- Customer storefront accessible at root domain (azhar.store)
- Admin dashboard accessible at /admin route (azhar.store/admin)
- Single deployment serving both customer and admin interfaces through client-side routing
- Handles user interface, routing, and client-side logic  
- Communicates with backend via REST API calls to api.azhar.store
- Benefits from automatic global caching and CDN distribution

**Backend Service (Dokploy):**
- FastAPI application deployed at api.azhar.store providing high-performance REST API endpoints
- Root endpoint (/) serves as a public API status dashboard showing system health and performance
- Handles business logic, data validation, and database operations
- Deployed using Dokploy's Docker support with automated deployments
- Integrates with Supabase for database operations
- Provides comprehensive monitoring and health check endpoints

**Database Service (Supabase):**
- PostgreSQL database with built-in authentication and real-time features
- Provides scalable data storage and management
- Handles database migrations and backups

### 5.2. Deployment Strategy

**Frontend Deployment (Cloudflare Workers):**
- Single deployment serving both customer storefront and admin dashboard
- Primary domain: azhar.store for customer-facing store
- Admin access via: azhar.store/admin with client-side routing
- Automated deployment from Git repository
- Global edge distribution for optimal performance
- Automatic HTTPS and domain management
- Built-in analytics and performance monitoring
- Support for staging and production environments

**Backend Deployment (Dokploy):**
- Containerized deployment using Docker with support for Python applications
- Automated deployments via GitHub webhooks
- Environment variable management for sensitive configuration
- Database management with automated backups
- Health monitoring and logging capabilities
- Support for horizontal scaling across multiple nodes

**Development Workflow:**
1. Frontend and backend are developed in separate repositories
2. Both services have independent CI/CD pipelines
3. API contracts are maintained through shared type definitions
4. Staging environments mirror production setup
5. Automated testing covers both services independently

### 5.3. Communication Protocol
- Frontend communicates with backend exclusively via HTTP/HTTPS REST API
- CORS is configured to allow cross-origin requests between services
- Authentication tokens are passed via HTTP headers
- Error handling includes proper HTTP status codes and structured error responses
- API versioning strategy supports future updates without breaking changes

### 5.4. Monitoring and Observability
- Frontend: Cloudflare Workers analytics and error reporting
- Backend: Application logs and health checks via Dokploy monitoring
- Database: Supabase built-in monitoring and performance metrics
- API monitoring includes response times, error rates, and usage patterns

## 6. Migration Considerations

### 6.1. Technology Migration
- **From Express.js to FastAPI**: 
  - Maintains comparable performance while adding automatic validation and documentation
  - Existing API endpoints will be reimplemented with improved type safety
  - Database integration remains through Supabase with minimal changes

### 6.2. Deployment Migration
- **From Monolithic to Distributed**: 
  - Separate deployment pipelines for frontend and backend
  - Independent scaling and versioning capabilities
  - Improved fault isolation and system reliability

### 6.3. Development Process Changes
- Separate development teams can work on frontend and backend independently
- API-first development approach with contract-driven development
- Enhanced testing capabilities with separated concerns
- Improved developer experience with FastAPI's automatic documentation

---

**Document Version History:**
- v1.0: Initial SRS with Express.js backend
- v2.0: Updated for FastAPI backend and distributed deployment architecture
