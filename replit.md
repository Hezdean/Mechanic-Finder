# Auto Repair Marketplace Platform

## Overview

This is a comprehensive auto repair marketplace platform that connects car owners with trusted mechanics. The platform enables users to post repair jobs, mechanics to bid on jobs, and facilitates secure transactions with integrated payment processing. Built with modern web technologies, it features role-based access control, real-time messaging, AI-powered diagnostics, and emergency assistance capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: JWT-based authentication with role-based access control
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API with comprehensive endpoint coverage
- **Middleware**: Custom authentication and authorization middleware

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle with schema-first approach
- **Migrations**: Drizzle Kit for database schema management

## Key Components

### User Management System
- **Multi-role authentication** (admin, mechanic, car_owner, visitor)
- **User profiles** with comprehensive information storage
- **Email and phone verification** system with OTP support
- **Secure password hashing** using bcrypt

### Job Management System
- **Job posting** by car owners with detailed vehicle information
- **Bidding system** for mechanics to compete for jobs
- **Status tracking** throughout the repair lifecycle
- **Location-based job discovery**

### Mechanic Profile System
- **Professional profiles** with specializations and certifications
- **Verification system** for mechanic credentials
- **Rating and review system** for quality assurance
- **Service history tracking**

### Communication System
- **Real-time messaging** between users
- **Email notifications** via SendGrid integration
- **Emergency alert system** for urgent repairs
- **Arrival verification system** with secure code generation for mechanic presence confirmation

### Payment System
- **Transaction management** with multiple payment methods
- **Invoice generation** with PDF receipts
- **Payment history tracking**
- **Secure transaction processing**

### AI Integration
- **Vehicle diagnostics** using OpenAI GPT-4o
- **Symptom analysis** with repair recommendations
- **Cost estimation** based on diagnostic results

## Data Flow

### User Authentication Flow
1. User registers with email verification
2. JWT token generated and stored
3. Role-based permissions applied
4. Session management with token refresh

### Job Lifecycle Flow
1. Car owner posts repair job
2. System notifies relevant mechanics
3. Mechanics submit competitive bids
4. Car owner reviews and accepts bid
5. Job proceeds to completion
6. Payment processing and review system

### Communication Flow
1. Users exchange messages through platform
2. Email notifications sent for important updates
3. Emergency alerts trigger immediate notifications
4. System maintains message history

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **@sendgrid/mail**: Email service integration
- **@tanstack/react-query**: Server state management
- **bcrypt**: Password hashing and security
- **jsonwebtoken**: JWT authentication
- **drizzle-orm**: Database ORM and query builder

### UI Dependencies
- **@radix-ui/react-**: Comprehensive UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Dependencies
- **typescript**: Type safety and development experience
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for Node.js

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized React application
- **Backend**: esbuild compiles TypeScript server code
- **Database**: Drizzle migrations ensure schema consistency

### Environment Configuration
- **Database**: PostgreSQL via DATABASE_URL environment variable
- **Email**: SendGrid API key for email functionality
- **AI**: OpenAI API key for diagnostic features
- **Auth**: JWT secret for token security

### Production Considerations
- **Static file serving** handled by Express
- **Error handling** with comprehensive error boundaries
- **Security headers** and authentication middleware
- **Database connection pooling** for performance

## Changelog

```
Changelog:
- June 29, 2025. Initial setup
- July 2, 2025. Added mechanic arrival verification system with secure code generation and customer confirmation
- July 2, 2025. Implemented real-time database updates with WebSocket integration for live job notifications
- July 2, 2025. Modified payment flow - car owners now make payments only after verifying mechanic arrival
- July 2, 2025. Implemented comprehensive mobile-first onboarding experience with step-by-step user guidance, role selection, account creation, profile completion, location services, and notification setup
- July 2, 2025. Fixed critical messages system issue by switching from MemStorage to DbStorage for persistent data access
- July 2, 2025. Resolved arrival verification database schema inconsistencies by adding missing columns (job_id, is_used) and fixing constraints
- July 2, 2025. Completed AI vehicle diagnostic tool setup with OpenAI GPT-4o integration, comprehensive diagnostic interface, fallback system for when AI service is unavailable, and intuitive user experience with priority levels and cost estimates
- July 2, 2025. Fixed critical AI diagnostics display issue by correcting JSON response parsing in frontend mutation, ensuring proper display of diagnostic results, causes, recommendations, and cost estimates
- July 2, 2025. Enhanced registration form with optional phone number field for improved user contact information and verification capabilities
- July 2, 2025. Fixed styling errors on home page: corrected Browse Mechanics button to use proper theme colors and resolved DOM nesting warnings in Header and Footer components
- July 3, 2025. Fixed unhandled promise rejection errors by adding proper error handling for authentication queries and global error handlers to prevent console warnings
- November 27, 2025. Fixed mechanic dashboard data inconsistency: stats now only count truly completed jobs by cross-referencing bids with actual job status
- November 27, 2025. Replaced all '$' currency symbols with 'MK' throughout the application (dashboard, marketplace, cart, notifications)
- November 27, 2025. Fixed rating display to show "N/A" when rating is 0 or unavailable
- November 27, 2025. Created mechanic job history page at /dashboard/mechanic/history with comprehensive tracking
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```