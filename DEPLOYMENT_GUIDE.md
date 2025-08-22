# 🚀 JBS Platform Deployment Guide

This guide will help you deploy your JBS (Jobs, Buying & Selling) platform to Netlify (frontend) and Render (backend).

## 📋 Prerequisites

- Node.js 18+ installed
- Git repository connected to GitHub
- MongoDB Atlas database (already configured)
- Netlify account
- Render account

## 🌐 Frontend Deployment (Netlify)

### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify
```bash
netlify login
```

### Step 3: Update Environment Variables
Edit `env.production` and update:
```env
VITE_API_URL=https://your-backend-app-name.onrender.com
```

### Step 4: Deploy
```bash
# Option 1: Use the deployment script
chmod +x deploy-frontend.sh
./deploy-frontend.sh

# Option 2: Manual deployment
npm run build
netlify deploy --prod --dir=dist
```

### Step 5: Configure Custom Domain (Optional)
1. Go to your Netlify dashboard
2. Navigate to Domain Management
3. Add your custom domain
4. Update DNS records

## 🔧 Backend Deployment (Render)

### Step 1: Install Render CLI
```bash
npm install -g @render/cli
```

### Step 2: Login to Render
```bash
render login
```

### Step 3: Update Environment Variables
Edit `backend/env.production` and update:
```env
FRONTEND_URL=https://your-frontend-app-name.netlify.app
ALLOWED_ORIGINS=https://your-frontend-app-name.netlify.app
JWT_SECRET=your_actual_jwt_secret_here
```

### Step 4: Deploy
```bash
# Option 1: Use the deployment script
chmod +x deploy-backend.sh
./deploy-backend.sh

# Option 2: Manual deployment
cd backend
render deploy
```

### Step 5: Configure Environment Variables in Render Dashboard
1. Go to your Render dashboard
2. Select your backend service
3. Go to Environment tab
4. Add all environment variables from `backend/env.production`

## 🔄 Post-Deployment Steps

### 1. Update Frontend API URL
After backend deployment, update `env.production`:
```env
VITE_API_URL=https://your-actual-backend-url.onrender.com
```

### 2. Update Backend CORS Settings
After frontend deployment, update `backend/env.production`:
```env
FRONTEND_URL=https://your-actual-frontend-url.netlify.app
ALLOWED_ORIGINS=https://your-actual-frontend-url.netlify.app
```

### 3. Test the Application
- Test frontend: Visit your Netlify URL
- Test backend: Visit `https://your-backend-url.onrender.com/api/health`
- Test database connection: Visit `https://your-backend-url.onrender.com/api/health/db`

## 🛠️ Troubleshooting

### Frontend Issues
- **Build fails**: Check for TypeScript errors, run `npm run lint`
- **API calls fail**: Verify `VITE_API_URL` is correct
- **Routing issues**: Check `netlify.toml` redirects

### Backend Issues
- **Server won't start**: Check environment variables in Render dashboard
- **Database connection fails**: Verify MongoDB URI and network access
- **CORS errors**: Check `FRONTEND_URL` and `ALLOWED_ORIGINS`

### Common Environment Variables
```env
# Required
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Frontend URL (update after deployment)
FRONTEND_URL=https://your-frontend-url.netlify.app
ALLOWED_ORIGINS=https://your-frontend-url.netlify.app

# Optional (if using these services)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

## 📱 Monitoring & Maintenance

### Health Checks
- Frontend: Netlify automatically monitors uptime
- Backend: Render monitors `/api/health` endpoint

### Logs
- Frontend: Netlify function logs
- Backend: Render service logs

### Updates
- Frontend: Push to main branch triggers automatic deployment
- Backend: Push to main branch triggers automatic deployment

## 🔒 Security Considerations

1. **JWT Secret**: Use a strong, unique secret
2. **Environment Variables**: Never commit sensitive data
3. **CORS**: Restrict to your frontend domain only
4. **Rate Limiting**: Already configured in your backend
5. **HTTPS**: Both platforms provide SSL certificates

## 📞 Support

- **Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **Render**: [render.com/docs](https://render.com/docs)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

---

**Happy Deploying! 🎉**
