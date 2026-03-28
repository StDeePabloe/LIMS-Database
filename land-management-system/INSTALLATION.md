# Installation Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**
- **Git**

## Quick Start

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

1. **Create PostgreSQL database:**
   ```sql
   CREATE DATABASE land_management;
   ```

2. **Create database user (optional):**
   ```sql
   CREATE USER land_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE land_management TO land_user;
   ```

3. **Run the database schema:**
   ```bash
   psql -d land_management -f database/schema.sql
   ```

### 4. Environment Configuration

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file with your configuration:**
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
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The backend will be available at `http://localhost:5000`

### 6. Frontend Setup

```bash
cd frontend
npm install
```

### 7. Start Frontend Development Server

```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Default Login Credentials

After setting up the database, you can use these default credentials:

- **Admin**: admin@landmanagement.com / admin123
- **Auditor**: auditor@landmanagement.com / auditor123 (need to create)
- **Farmer**: farmer@landmanagement.com / farmer123 (need to create)

## Detailed Setup Instructions

### Database Configuration

#### PostgreSQL Setup (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -u postgres psql
```

#### PostgreSQL Setup (Windows)

1. Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Use pgAdmin to create the database
3. Run the schema file

#### PostgreSQL Setup (macOS)

```bash
brew install postgresql
brew services start postgresql
createdb land_management
```

### Node.js Installation

#### Using Node Version Manager (nvm) - Recommended

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

#### Direct Installation

Download from [nodejs.org](https://nodejs.org/)

### Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_NAME` | Database name | land_management |
| `DB_USER` | Database username | postgres |
| `DB_PASSWORD` | Database password | your_password |
| `JWT_SECRET` | JWT signing secret | make_it_long_and_random |
| `JWT_EXPIRES_IN` | Token expiration time | 24h |
| `PORT` | Backend server port | 5000 |
| `NODE_ENV` | Environment | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

### Production Deployment

#### Environment Variables for Production

```env
NODE_ENV=production
DB_HOST=your_production_db_host
DB_PASSWORD=your_production_db_password
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL=https://your-domain.com
```

#### Security Considerations

1. **Use HTTPS in production**
2. **Set strong database passwords**
3. **Use environment-specific JWT secrets**
4. **Configure database firewall**
5. **Set up database backups**
6. **Monitor application logs**

#### Building for Production

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

### Troubleshooting

#### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify database credentials
   - Ensure database exists

2. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :5000
   # Kill process
   kill -9 <PID>
   ```

3. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration

4. **CORS Errors**
   - Verify FRONTEND_URL in .env
   - Check frontend is running on correct port

#### Health Check

Test the backend health endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

### Development Tips

1. **Use nodemon for auto-restart during development**
2. **Check browser console for frontend errors**
3. **Use Postman/Insomnia for API testing**
4. **Enable debug logs for troubleshooting**

### Database Schema

The system uses 24 tables covering:
- User management
- Farmer information
- Administrative data
- Farm infrastructure
- Equipment tracking
- Crop production (summer/winter/horticulture)
- Livestock management
- Irrigation facilities
- Overall assessments

See `backend/database/schema.sql` for complete schema.

### API Documentation

Once the backend is running, you can access:
- Health check: `GET /api/health`
- Authentication endpoints: `POST /api/auth/login`
- User management: `GET /api/users`
- Farmer management: `GET /api/farmers`
- Farm data: `GET /api/farm-data/:farmerId`
- Reports: `GET /api/reports/assessment/:farmerId`

### Support

For issues:
1. Check the troubleshooting section
2. Review error logs
3. Verify environment configuration
4. Check database connectivity

### Next Steps

After successful installation:

1. Create additional user accounts via admin panel
2. Set up farmer profiles
3. Begin data entry through auditor dashboard
4. Generate assessment reports
5. Configure production environment

## Security Best Practices

1. **Change default passwords immediately**
2. **Use strong JWT secrets**
3. **Enable SSL in production**
4. **Regular database backups**
5. **Monitor application logs**
6. **Keep dependencies updated**
7. **Use environment variables for secrets**
8. **Implement proper database user permissions**
