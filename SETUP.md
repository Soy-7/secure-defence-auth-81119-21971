# SecureDefence Authentication System Setup

## MongoDB Atlas Configuration

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up or log in to your account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Select a cloud provider and region
   - Name your cluster (e.g., "SecureDefence")

3. **Configure Database Access**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose authentication method: Username and Password
   - Create username and password (save these!)
   - Set user privileges to "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add specific IP addresses

5. **Get Connection String**
   - Go to "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority`

6. **Update .env File**
   - Open `.env` file in the project root
   - Replace the `MONGODB_URI` with your connection string
   - Replace `<username>` with your database username
   - Replace `<password>` with your database password
   - Add database name: `mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/secure_defence?retryWrites=true&w=majority`

## Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Update `.env` file:
```env
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/secure_defence?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=3001
NODE_ENV=development
```

### 3. Start the Application

**Option A: Run Frontend and Backend Together**
```bash
npm run dev:all
```

**Option B: Run Separately**

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:8081
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## User Flow

1. **Registration**
   - Fill in personal details (Step 1)
   - Provide service credentials (Step 2)
   - Choose MFA method and accept terms (Step 3)
   - Create password and verify (Step 4)
   - Set up TOTP authenticator (if selected)
   - Scan QR code with Google Authenticator/Authy
   - Enter 6-digit code to verify
   - Account is created in MongoDB
   - Redirected to role-specific dashboard

2. **Dashboard Access**
   - `/dashboard/personnel` - Defence Personnel Dashboard
   - `/dashboard/family` - Family Member Dashboard
   - `/dashboard/veteran` - Veteran Dashboard
   - `/dashboard/cert` - CERT Personnel Dashboard
   - `/dashboard/admin` - Administrator Dashboard

## MongoDB Collections

### Users Collection
```javascript
{
  fullName: String,
  email: String (unique),
  mobile: String,
  serviceId: String,
  role: String (personnel|family|veteran|cert|admin),
  password: String (bcrypt hashed),
  mfaMethod: String (totp|email),
  totpSecret: String (base32),
  backupCodes: [{ code: String, used: Boolean }],
  isVerified: Boolean,
  isActive: Boolean,
  createdAt: Date,
  lastLogin: Date
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-mfa` - Verify MFA code

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ TOTP 2FA with otpauth library
- ✅ QR code generation for authenticator apps
- ✅ Backup codes for account recovery
- ✅ Role-based access control
- ✅ Secure MongoDB connection

## Troubleshooting

### MongoDB Connection Issues
- Verify connection string is correct
- Check database username and password
- Ensure IP is whitelisted in Network Access
- Verify database name exists in connection string

### Port Already in Use
- Frontend: Change in vite.config.ts
- Backend: Change PORT in .env file

### CORS Issues
- Backend allows origins: localhost:5173, localhost:8080, localhost:8081
- Add more origins in server/index.js if needed

## Production Deployment

1. Update MongoDB to restrict network access
2. Change JWT_SECRET to a strong random string
3. Enable SSL/HTTPS
4. Set NODE_ENV=production
5. Update CORS origins to production domains
6. Implement rate limiting
7. Add request logging
8. Set up monitoring and alerts
