# Secure Land Management Web System

A comprehensive, secure web-based Land Management System with role-based access control, PostgreSQL database integration, and protected API endpoints.

## 🚀 Features

### 🔐 Security Features
- **JWT Authentication** with secure token management
- **Role-Based Access Control (RBAC)** with three user roles:
  - **Admin**: Full system privileges and user management
  - **Auditor**: Data entry and report generation
  - **Farmer**: View-only access to own data
- **Input Validation** and sanitization
- **Rate Limiting** to prevent abuse
- **SQL Injection Prevention** with parameterized queries
- **Password Hashing** with bcrypt

### 📊 Database Schema
- **24 Tables** covering all aspects of land management:
  - Administrative Information
  - Farm Identification
  - Farm Infrastructure
  - Equipment
  - Crop Production (Summer/Winter/Horticulture)
  - Livestock Production
  - Irrigation Facilities
  - Overall Assessment
- **PostgreSQL** with optimized indexes and triggers
- **Automatic timestamp updates** for audit trails

### 🖥️ User Dashboards
- **Admin Dashboard**: User management, system monitoring
- **Auditor Dashboard**: Data entry forms, report generation
- **Farmer Dashboard**: View-only personal data access

### 📈 Reporting System
- **Comprehensive Assessment Reports** (JSON/PDF)
- **System Statistics** and analytics
- **Real-time data summaries**

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** for authentication
- **bcrypt** for password hashing
- **Puppeteer** for PDF generation
- **Helmet** for security headers
- **Express Validator** for input validation

### Frontend
- **React** with modern hooks
- **React Router** for navigation
- **Axios** for API calls
- **Tailwind CSS** for styling
- **Lucide** for icons

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **PostgreSQL** (v12 or higher)
3. **npm** or **yarn**

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd land-management-system
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE land_management;
```

2. Run the schema:
```bash
psql -d land_management -f database/schema.sql
```

### 4. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=land_management
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 5. Start Backend Server

```bash
npm run dev  # Development with nodemon
# or
npm start    # Production
```

The backend will be available at `http://localhost:5000`

### 6. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will be available at `http://localhost:3000`

## 🔑 Default Admin Account

- **Email**: admin@landmanagement.com
- **Password**: admin123

⚠️ **Important**: Change the default admin password immediately after first login!

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/login
Login user and return JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "role": "admin",
    "farmer_id": null
  },
  "token": "jwt_token_here"
}
```

#### POST /api/auth/register
Register new user (Admin only).

#### GET /api/auth/me
Get current user information.

### User Management Endpoints

#### GET /api/users
Get all users (Admin only).

#### GET /api/users/:id
Get user by ID.

#### PUT /api/users/:id
Update user information.

#### DELETE /api/users/:id
Delete user (Admin only).

### Farmer Management Endpoints

#### GET /api/farmers
Get all farmers (Admin, Auditor).

#### POST /api/farmers
Create new farmer (Admin, Auditor).

#### GET /api/farmers/:id
Get farmer by ID.

#### PUT /api/farmers/:id
Update farmer information (Admin, Auditor).

### Farm Data Endpoints

#### GET /api/farm-data/:farmerId
Get farm data for farmer.

#### POST /api/farm-data/:farmerId/:table
Create farm data (Admin, Auditor).

#### PUT /api/farm-data/:farmerId/:table/:recordId
Update farm data (Admin, Auditor).

### Reports Endpoints

#### GET /api/reports/assessment/:farmerId
Generate assessment report (Admin, Auditor).

#### GET /api/reports/my-reports
Get farmer's own reports (Farmer).

#### GET /api/reports/statistics
Get system statistics (Admin).

## 🔒 Security Implementation

### Authentication Flow
1. User logs in with email/password
2. Server validates credentials and returns JWT
3. Client stores token securely
4. Token sent with all subsequent requests
5. Server validates token on each request

### Authorization Rules
- **Admin**: Full access to all endpoints
- **Auditor**: Access to farmer data and reports, cannot manage users
- **Farmer**: Read-only access to own data only

### Data Protection
- All passwords hashed with bcrypt (12 rounds)
- JWT tokens with expiration
- Input validation on all endpoints
- SQL injection prevention with parameterized queries
- Rate limiting to prevent brute force attacks

## 🧪 Testing

```bash
cd backend
npm test
```

## 📝 Development Notes

### Database Schema
The system uses 24 tables to capture comprehensive farm data:
- Core tables: users, farmers
- Administrative: administrative_information, farm_identification
- Infrastructure: farm_infrastructure, equipment, irrigation_facilities
- Production: crop_production_summer, crop_production_winter, crop_production_horticulture, livestock_production
- Assessment: overall_assessment

### Role-Based Access
All API endpoints are protected with middleware that:
1. Validates JWT tokens
2. Checks user roles
3. Enforces data access rules (farmers can only see their data)

### Error Handling
- Global error handler for consistent error responses
- Validation errors with detailed messages
- Security headers and CORS configuration

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
DB_HOST=your_production_db_host
DB_PASSWORD=your_production_db_password
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL=https://your-domain.com
```

### Security Considerations
- Use HTTPS in production
- Configure database firewall
- Set up database backups
- Monitor application logs
- Regular security updates

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 📄 License

This project is licensed under the MIT License.
