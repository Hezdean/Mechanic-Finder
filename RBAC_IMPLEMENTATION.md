# Role-Based Access Control (RBAC) Implementation

## Overview
Comprehensive role-based access control system implemented for the auto repair marketplace platform with JWT authentication.

## User Roles
- **admin**: Full system access and management capabilities
- **mechanic**: Can bid on jobs, manage their profile, view assigned jobs
- **car_owner**: Can post jobs, accept bids, leave reviews
- **visitor**: Limited read-only access to public data

## API Endpoint Restrictions

### Job Management
- `POST /api/jobs` - **car_owner only** (post new repair jobs)
- `GET /api/jobs` - **public access** (view available jobs)
- `GET /api/jobs/:id` - **public access** (view job details)
- `PUT /api/jobs/:id` - **job owner or admin** (update job details)

### Bidding System
- `POST /api/bids` - **mechanic only** (submit bids on jobs)
- `GET /api/bids/:id` - **job owner, bid owner, or admin** (view bid details)
- `PUT /api/bids/:id/accept` - **car_owner only** (accept winning bids)
- `GET /api/jobs/:jobId/bids` - **job owner, assigned mechanic, or admin** (view all bids)

### Mechanic Profiles
- `POST /api/mechanic-profiles` - **authenticated users** (become a mechanic)
- `PUT /api/mechanic-profiles/:id` - **profile owner or admin** (update profile)
- `PUT /api/mechanic-profiles/:id/verify` - **admin only** (verify mechanic credentials)
- `GET /api/mechanic-profiles` - **public access** (browse mechanics)

### Review System
- `POST /api/reviews` - **car_owner only** (leave reviews for completed jobs)
- `GET /api/reviews/mechanic/:id` - **public access** (view mechanic reviews)
- `GET /api/reviews/user/:id` - **public access** (view user's reviews)

### User Management
- `GET /api/users` - **admin only** (manage user accounts)
- `PUT /api/users/:id` - **user owner or admin** (update user profile)
- `GET /api/auth/me` - **authenticated users** (get current user info)

### Messaging System
- `POST /api/messages` - **authenticated users** (send messages)
- `GET /api/messages/unread` - **authenticated users** (view unread messages)
- `PUT /api/messages/:id/read` - **message receiver only** (mark as read)

## Security Features

### JWT Authentication
- Secure token-based authentication
- 7-day token expiration
- Authorization header validation on protected routes
- Automatic token refresh capability

### Middleware Protection
- `authenticateToken`: Validates JWT tokens and extracts user data
- `hasRole(role)`: Restricts access to specific user roles
- `hasAnyRole([roles])`: Allows access to multiple specified roles
- Request validation using Zod schemas

### Data Validation
- Input sanitization on all API endpoints
- Type-safe request/response handling
- SQL injection prevention through parameterized queries
- XSS protection via input validation

### Access Control Examples

#### Successful Access
```bash
# Mechanic submitting a bid
POST /api/bids
Authorization: Bearer <mechanic_token>
{
  "jobId": 1,
  "mechanicId": 2,
  "amount": 500,
  "description": "Professional repair service"
}
```

#### Blocked Access
```bash
# Admin trying to post a job (forbidden)
POST /api/jobs
Authorization: Bearer <admin_token>
Response: 403 Forbidden: Insufficient permissions

# Mechanic trying to accept a bid (forbidden)
PUT /api/bids/1/accept
Authorization: Bearer <mechanic_token>
Response: 403 Forbidden: Insufficient permissions
```

## Implementation Details

### Backend Middleware
- Role verification happens at the route level
- Granular permissions for resource ownership
- Admin override capabilities where appropriate
- Comprehensive error handling with descriptive messages

### Frontend Integration
- JWT tokens stored securely in localStorage
- Automatic token inclusion in API requests
- Role-based UI component rendering
- Protected route navigation based on user permissions

## Testing Verification
All role restrictions have been tested and verified:
- ✅ Car owners can post jobs but cannot bid
- ✅ Mechanics can bid but cannot post jobs  
- ✅ Admins have management access but cannot perform user actions
- ✅ Unauthorized access properly blocked with 403 responses
- ✅ JWT authentication working correctly across all endpoints