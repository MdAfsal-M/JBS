# JBS Backend API Documentation

## Overview
This is the backend API for the JBS (Job Business Student) platform, built with Node.js, Express, and MongoDB. The API provides comprehensive authentication, user management, and business operations for both students and business owners.

## Features

### Core Features
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Comprehensive user profiles for students and business owners
- **Business Operations**: Job posting, internship management, product catalog, order processing
- **Dashboard Analytics**: Real-time analytics and insights for business owners
- **Security**: Rate limiting, account lockout, session management, security monitoring
- **File Management**: Document upload and management with Cloudinary integration

### Security Features
- **Multi-Factor Authentication**: TOTP and SMS verification support
- **Account Security**: Password history, account lockout, suspicious activity detection
- **Session Management**: Active session tracking, device management, session revocation
- **Login Analytics**: Geographic tracking, device statistics, security insights
- **Rate Limiting**: IP-based and user-based rate limiting with adaptive thresholds

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Owner Registration
```http
POST /api/auth/owner/register
```
**Request Body:**
```json
{
  "ownerName": "John Doe",
  "dob": "1990-01-01",
  "email": "john@business.com",
  "gender": "male",
  "city": "Mumbai",
  "phone": "+91-9876543210",
  "address": "123 Business Street, Mumbai",
  "companyName": "TechCorp Solutions",
  "companyLocation": "Mumbai, Maharashtra",
  "businessType": "IT Services",
  "productCategories": ["Electronics", "Software"],
  "companySize": "11-50",
  "foundedYear": "2015",
  "website": "https://techcorp.com",
  "description": "Leading IT solutions provider",
  "gstNumber": "27AABCT1234A1Z5",
  "panNumber": "AABCT1234A"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Owner registration successful! Welcome to JBS Platform.",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "john_1234",
    "email": "john@business.com",
    "role": "owner",
    "profile": { /* user profile data */ },
    "business": { /* business data */ },
    "settings": { /* user settings */ }
  },
  "credentials": {
    "email": "john@business.com",
    "password": "generated_password",
    "businessName": "TechCorp Solutions"
  },
  "redirectTo": "/owner-dashboard"
}
```

#### Login
```http
POST /api/auth/login
```
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "userType": "student|owner",
  "rememberMe": true
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "user@example.com",
    "role": "student|owner",
    "profile": { /* user profile data */ },
    "business": { /* business data for owners */ },
    "settings": { /* user settings */ }
  },
  "redirectTo": "/student-dashboard|/owner-dashboard",
  "expiresIn": "24h",
  "rememberMe": true
}
```

#### Register
```http
POST /api/auth/register
```
**Request Body:**
```json
{
  "username": "username",
  "email": "user@example.com",
  "password": "password123",
  "role": "student|owner"
}
```

#### Password Reset
```http
POST /api/auth/forgot-password
```
**Request Body:**
```json
{
  "email": "user@example.com"
}
```

```http
POST /api/auth/verify-reset-token
```
**Request Body:**
```json
{
  "token": "reset_token_here"
}
```

```http
POST /api/auth/reset-password
```
**Request Body:**
```json
{
  "token": "reset_token_here",
  "password": "new_password"
}
```

#### Change Password
```http
POST /api/auth/change-password
```
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

#### Session Management
```http
GET /api/auth/sessions
```
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "success": true,
  "sessions": [
    {
      "id": "session_id",
      "device": "Chrome on Windows",
      "ip": "192.168.1.1",
      "createdAt": "2024-01-01T00:00:00Z",
      "lastActivity": "2024-01-01T12:00:00Z",
      "isCurrent": true
    }
  ]
}
```

```http
DELETE /api/auth/sessions/:sessionId
```
**Headers:** `Authorization: Bearer <token>`

```http
DELETE /api/auth/sessions
```
**Headers:** `Authorization: Bearer <token>` (Revokes all other sessions)

```http
PUT /api/auth/sessions/activity
```
**Headers:** `Authorization: Bearer <token>` (Updates session activity)

#### User Profile
```http
GET /api/auth/me
```
**Headers:** `Authorization: Bearer <token>`

#### Token Refresh
```http
POST /api/auth/refresh
```
**Request Body:**
```json
{
  "token": "current_token_here"
}
```

#### Logout
```http
POST /api/auth/logout
```

### Analytics Routes (`/api/auth`)

#### Login Analytics
```http
GET /api/auth/analytics?days=30
```
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "success": true,
  "analytics": {
    "loginStats": [
      {
        "_id": "login_success",
        "count": 25,
        "lastEvent": "2024-01-01T12:00:00Z"
      }
    ],
    "geographicData": [
      {
        "_id": {
          "country": "India",
          "city": "Mumbai"
        },
        "count": 15,
        "lastLogin": "2024-01-01T12:00:00Z"
      }
    ],
    "deviceStats": [
      {
        "_id": {
          "browser": "Chrome",
          "os": "Windows",
          "isMobile": false
        },
        "count": 20,
        "lastUsed": "2024-01-01T12:00:00Z"
      }
    ],
    "suspiciousActivities": [
      {
        "eventType": "login_success",
        "timestamp": "2024-01-01T12:00:00Z",
        "ipAddress": "192.168.1.1",
        "riskScore": 75,
        "details": {
          "reason": "Login from new IP address"
        }
      }
    ]
  }
}
```

#### Security Insights
```http
GET /api/auth/security-insights
```
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "success": true,
  "securityInsights": {
    "securityScore": 85,
    "failedAttempts": 2,
    "successfulLogins": 15,
    "uniqueIPs": 3,
    "uniqueDevices": 2,
    "recommendations": [
      "Consider enabling two-factor authentication"
    ],
    "lastLogin": "2024-01-01T12:00:00Z",
    "accountAge": 30
  }
}
```

### File Upload Routes (`/api/upload`)

#### Upload Business License
```http
POST /api/upload/business-license
```
**Headers:** `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`
**Request Body:**
```
businessLicense: [file] (JPEG, PNG, PDF - Max 10MB)
```
**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "filename": "businessLicense-1234567890.pdf",
    "originalname": "license.pdf",
    "mimetype": "application/pdf",
    "size": 2048576,
    "url": "https://cloudinary.com/...",
    "cloudinary": {
      "url": "https://cloudinary.com/...",
      "publicId": "business_licenses/...",
      "format": "pdf",
      "size": 2048576
    }
  }
}
```

#### Get Upload Status
```http
GET /api/upload/status
```
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "success": true,
  "uploadConfig": {
    "maxFileSize": "10MB",
    "allowedTypes": ["JPEG", "PNG", "PDF"],
    "maxFiles": 1
  }
}
```

#### Serve Uploaded Files
```http
GET /api/upload/files/:filename
```

#### Delete Uploaded File
```http
DELETE /api/upload/files/:filename
```
**Headers:** `Authorization: Bearer <token>`

### Admin Routes (`/api/admin`)

#### Get Pending Verifications
```http
GET /api/admin/verifications/pending?page=1&limit=10
```
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+91-9876543210"
      },
      "business": {
        "businessName": "TechCorp Solutions",
        "businessType": "IT Services",
        "verificationStatus": "pending"
      },
      "email": "john@business.com",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### Get All Verifications
```http
GET /api/admin/verifications?status=pending&page=1&limit=10
```
**Headers:** `Authorization: Bearer <token>`

#### Update Verification Status
```http
PUT /api/admin/verifications/:userId
```
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "status": "verified|rejected|pending",
  "notes": "Optional verification notes"
}
```

#### Get Verification Statistics
```http
GET /api/admin/verifications/stats
```
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 150,
    "pending": 25,
    "verified": 120,
    "rejected": 5
  }
}
```

#### Bulk Update Verification Status
```http
PUT /api/admin/verifications/bulk
```
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "userIds": ["user_id_1", "user_id_2"],
  "status": "verified",
  "notes": "Bulk verification approved"
}
```

#### Get Owner Details
```http
GET /api/admin/verifications/:userId
```
**Headers:** `Authorization: Bearer <token>`

### Owner Routes (`/api/owner`)

#### Dashboard
```http
GET /api/owner/dashboard
```
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "user": { /* user data */ },
  "stats": {
    "totalJobs": 15,
    "totalInternships": 8,
    "totalProducts": 45,
    "totalOrders": 120,
    "pendingApplications": 25,
    "totalRevenue": 125000,
    "monthlyGrowth": 15.5
  },
  "recentOrders": [ /* recent orders */ ],
  "lowStockProducts": [ /* low stock products */ ],
  "notifications": 5
}
```

#### Analytics
```http
GET /api/owner/analytics
```
**Headers:** `Authorization: Bearer <token>`

#### Quick Stats
```http
GET /api/owner/quick-stats
```
**Headers:** `Authorization: Bearer <token>`

#### Notifications
```http
GET /api/owner/notifications
```
**Headers:** `Authorization: Bearer <token>`

```http
PUT /api/owner/notifications/:id/read
```
**Headers:** `Authorization: Bearer <token>`

```http
PUT /api/owner/notifications/read-all
```
**Headers:** `Authorization: Bearer <token>`

### Job Management (`/api/jobs`)

#### Get All Jobs
```http
GET /api/jobs?page=1&limit=10&search=developer&category=tech
```
**Headers:** `Authorization: Bearer <token>`

#### Get Job by ID
```http
GET /api/jobs/:id
```
**Headers:** `Authorization: Bearer <token>`

#### Create Job
```http
POST /api/jobs
```
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "title": "Software Developer",
  "description": "We are looking for a skilled developer...",
  "company": "TechCorp",
  "location": "Mumbai, India",
  "jobType": "full-time",
  "category": "technology",
  "pay": "₹50,000/month",
  "experience": "2-3 years",
  "requirements": ["JavaScript", "React", "Node.js"],
  "benefits": ["Health insurance", "Flexible hours"],
  "isRemote": false,
  "deadline": "2024-02-01",
  "contactInfo": {
    "email": "hr@techcorp.com",
    "phone": "+91-1234567890"
  }
}
```

#### Update Job
```http
PUT /api/jobs/:id
```
**Headers:** `Authorization: Bearer <token>`

#### Delete Job
```http
DELETE /api/jobs/:id
```
**Headers:** `Authorization: Bearer <token>`

#### Get Job Applications
```http
GET /api/jobs/:id/applications
```
**Headers:** `Authorization: Bearer <token>`

#### Update Application Status
```http
PUT /api/jobs/:id/applications/:applicationId
```
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "status": "approved|rejected|pending"
}
```

#### Job Analytics
```http
GET /api/jobs/:id/analytics
```
**Headers:** `Authorization: Bearer <token>`

### Internship Management (`/api/internships`)

Similar endpoints to jobs but for internships:
- `GET /api/internships`
- `GET /api/internships/:id`
- `POST /api/internships`
- `PUT /api/internships/:id`
- `DELETE /api/internships/:id`
- `GET /api/internships/:id/applications`
- `PUT /api/internships/:id/applications/:applicationId`
- `GET /api/internships/:id/analytics`

### Product Management (`/api/products`)

#### Get All Products
```http
GET /api/products?page=1&limit=10&category=electronics
```
**Headers:** `Authorization: Bearer <token>`

#### Create Product
```http
POST /api/products
```
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "name": "Laptop",
  "description": "High-performance laptop for students",
  "category": "electronics",
  "price": 45000,
  "stock": 10,
  "specifications": {
    "brand": "Dell",
    "model": "Inspiron 15",
    "processor": "Intel i5"
  }
}
```

#### Update Stock
```http
PUT /api/products/:id/stock
```
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "stock": 15
}
```

#### Product Analytics
```http
GET /api/products/:id/analytics
```
**Headers:** `Authorization: Bearer <token>`

#### Low Stock Products
```http
GET /api/products/low-stock
```
**Headers:** `Authorization: Bearer <token>`

### Order Management (`/api/orders`)

#### Get All Orders
```http
GET /api/orders?page=1&limit=10&status=pending
```
**Headers:** `Authorization: Bearer <token>`

#### Update Order Status
```http
PUT /api/orders/:id/status
```
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "status": "shipped|delivered|cancelled"
}
```

#### Add Tracking
```http
PUT /api/orders/:id/tracking
```
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "trackingNumber": "TRK123456789",
  "carrier": "FedEx"
}
```

#### Order Analytics
```http
GET /api/orders/analytics
```
**Headers:** `Authorization: Bearer <token>`

## Data Models

### User Model
```javascript
{
  username: String,
  email: String,
  password: String,
  role: 'owner' | 'user',
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    avatar: String,
    dateOfBirth: Date,
    gender: String,
    city: String,
    address: String
  },
  business: {
    businessName: String,
    businessType: String,
    address: Object,
    companySize: String,
    foundedYear: Number,
    website: String,
    description: String,
    gstNumber: String,
    panNumber: String,
    businessLicense: String,
    productCategories: [String],
    verificationStatus: String
  },
  settings: {
    notifications: Object,
    theme: String,
    language: String
  },
  isActive: Boolean,
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  emailVerified: Boolean,
  passwordChangedAt: Date,
  passwordHistory: Array,
  activeSessions: Array
}
```

### Login Analytics Model
```javascript
{
  userId: ObjectId,
  eventType: String,
  ipAddress: String,
  userAgent: String,
  location: Object,
  deviceInfo: Object,
  timestamp: Date,
  details: Object,
  riskScore: Number,
  isSuspicious: Boolean
}
```

## Security Features

### Rate Limiting
- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **File Upload**: 10 uploads per hour per IP
- **Search**: 30 searches per 5 minutes per IP
- **Order Creation**: 20 orders per hour per IP

### Account Security
- **Password Requirements**: Minimum 6 characters
- **Password History**: Prevents reuse of last 5 passwords
- **Account Lockout**: 5 failed attempts locks account for 15 minutes
- **Session Management**: Track active sessions, allow revocation
- **Suspicious Activity Detection**: Monitor login patterns, IP changes, device changes

### Data Protection
- **Input Validation**: Comprehensive validation using express-validator
- **SQL Injection Protection**: MongoDB with parameterized queries
- **XSS Protection**: Input sanitization and output encoding
- **CORS Configuration**: Properly configured for frontend integration

## Error Handling

### Standard Error Response
```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": "Additional error information"
}
```

### Common Error Codes
- `INVALID_CREDENTIALS`: Wrong email/password
- `ACCOUNT_LOCKED`: Account temporarily locked
- `INVALID_USER_TYPE`: User type mismatch
- `INVALID_TOKEN`: Invalid or expired token
- `SERVER_ERROR`: Internal server error
- `VALIDATION_ERROR`: Input validation failed
- `EMAIL_EXISTS`: Email already registered
- `BUSINESS_EXISTS`: Business name already registered
- `FILE_TOO_LARGE`: File size exceeds limit
- `INVALID_FILE_TYPE`: Unsupported file type

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables
# Edit .env file with your configuration

# Start development server
npm run dev

# Start production server
npm start
```

### Environment Variables
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/jbs_database

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=24h

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
```

## Development Guidelines

### Code Style
- Use ES6+ features
- Follow consistent naming conventions
- Add comprehensive error handling
- Include input validation
- Write meaningful comments

### Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### API Testing
Use tools like Postman or curl to test endpoints:

```bash
# Test owner registration
curl -X POST http://localhost:5000/api/auth/owner/register \
  -H "Content-Type: application/json" \
  -d '{
    "ownerName": "John Doe",
    "email": "john@business.com",
    "dob": "1990-01-01",
    "gender": "male",
    "city": "Mumbai",
    "phone": "+91-9876543210",
    "companyName": "TechCorp Solutions",
    "companyLocation": "Mumbai, Maharashtra",
    "businessType": "IT Services",
    "productCategories": ["Electronics", "Software"]
  }'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Test protected endpoint
curl -X GET http://localhost:5000/api/owner/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Performance Optimization

### Database Optimization
- Proper indexing on frequently queried fields
- Efficient aggregation pipelines
- Connection pooling
- Query optimization

### Caching Strategy
- Redis integration for session storage
- Response caching for static data
- Database query result caching

### Monitoring & Logging
- Request/response logging with Morgan
- Error tracking and alerting
- Performance monitoring
- Security event logging

## Deployment

### Production Checklist
- [ ] Set NODE_ENV=production
- [ ] Configure proper CORS settings
- [ ] Set up SSL/TLS certificates
- [ ] Configure database connection pooling
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies
- [ ] Set up CI/CD pipeline

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Update documentation
6. Submit a pull request

### Code Review Guidelines
- Ensure all tests pass
- Check for security vulnerabilities
- Verify API documentation is updated
- Confirm error handling is comprehensive
- Review performance implications

## Support & Maintenance

### Monitoring
- Application performance monitoring
- Database performance monitoring
- Error tracking and alerting
- Security monitoring

### Backup Strategy
- Database backups (daily)
- File storage backups
- Configuration backups
- Disaster recovery plan

### Security Updates
- Regular dependency updates
- Security patch management
- Vulnerability scanning
- Penetration testing

## License

This project is licensed under the ISC License.

---

For more information, contact the development team or refer to the project documentation.
