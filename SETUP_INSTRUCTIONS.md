# 🚀 **JBS Authentication System Setup Guide**

## **Critical Setup Steps**

### **1. Backend Environment Variables (REQUIRED)**

Create a file named `.env` in your `backend/` directory with the following content:

```bash
# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_at_least_32_characters
JWT_EXPIRE=24h

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/jbs_database

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:4173
```

**⚠️ IMPORTANT:** 
- Without `JWT_SECRET`, ALL authentication will fail with "secretOrPrivateKey must have a value"
- Generate a strong secret using: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### **2. Frontend Environment Variables (Optional)**

Create a file named `.env.local` in your root directory:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=JBS Platform
```

## **3. Database Setup**

Ensure MongoDB is running and accessible at `mongodb://localhost:27017/`

## **4. Start the Application**

### **Backend:**
```bash
cd backend
npm install
npm start
```

### **Frontend:**
```bash
npm install
npm run dev
```

## **5. Test the System**

1. **Registration:** Try registering as both a Student and Owner
2. **Login:** Test login with the registered credentials
3. **Navigation:** Verify redirection to appropriate dashboards

## **6. Troubleshooting**

### **Common Issues:**

1. **"secretOrPrivateKey must have a value"**
   - Solution: Create the `.env` file with `JWT_SECRET`

2. **"Cannot connect to MongoDB"**
   - Solution: Ensure MongoDB is running and accessible

3. **CORS errors**
   - Solution: Check `ALLOWED_ORIGINS` in backend `.env`

4. **Login not redirecting**
   - Solution: Check browser console for errors and verify AuthContext logic

## **7. Security Notes**

- Never commit `.env` files to version control
- Use strong, random JWT secrets in production
- Regularly rotate JWT secrets
- Implement rate limiting for production use

## **8. Features Implemented**

✅ **Enhanced Date of Birth Component** - Dropdown selectors for day/month/year
✅ **Password Fields** - Added to both registration forms
✅ **Enhanced Validation** - Password confirmation and length checks
✅ **Improved Error Handling** - Better user feedback
✅ **Role-Based Navigation** - Automatic redirection after login
✅ **Comprehensive Authentication Flow** - Registration → Login → Dashboard

## **9. Next Steps**

After setup, consider implementing:
- Password reset functionality
- Email verification
- Two-factor authentication
- Session management
- Audit logging
