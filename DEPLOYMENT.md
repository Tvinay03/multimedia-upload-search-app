# Deployment Guide

## Backend Deployment (Railway/Heroku)

### 1. Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy backend
cd backend
railway deploy
```

### 2. Environment Variables for Production

Set these in your deployment platform:

```
NODE_ENV=production
PORT=8000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/multimedia-app
JWT_SECRET=your_very_secure_jwt_secret_for_production
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
BCRYPT_SALT_ROUNDS=12
```

## Frontend Deployment (Vercel/Netlify)

### 1. Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

### 2. Build Command

```bash
npm run build
```

### 3. Environment Variables for Production

Set in your deployment platform:

```
VITE_API_URL=https://your-backend-url.com/api
```

## Database Setup (MongoDB Atlas)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist your deployment platform's IPs (or use 0.0.0.0/0 for all IPs)
5. Get the connection string and set it as MONGODB_URI

## Cloudinary Setup

1. Create a Cloudinary account
2. Get your cloud name, API key, and API secret from the dashboard
3. Set them as environment variables in your deployment platform

## Post-Deployment Checklist

- [ ] Backend health check responds: `https://your-backend-url.com/health`
- [ ] API documentation accessible: `https://your-backend-url.com/api-docs`
- [ ] Frontend loads correctly
- [ ] User registration works
- [ ] File upload works
- [ ] Search functionality works
- [ ] CORS is properly configured for your frontend domain

## Domain Configuration

### Custom Domain (Optional)

1. **Backend**: Configure custom domain in Railway/Heroku
2. **Frontend**: Configure custom domain in Vercel/Netlify
3. **Update CORS**: Add your custom domains to CORS configuration
4. **Update Frontend**: Update VITE_API_URL to use your custom backend domain

### SSL Certificates

Both Railway/Heroku and Vercel/Netlify provide automatic SSL certificates for custom domains.

## Monitoring & Maintenance

1. **Error Monitoring**: Consider adding Sentry for error tracking
2. **Performance Monitoring**: Use built-in platform monitoring
3. **Database Monitoring**: Monitor MongoDB Atlas performance
4. **Cloudinary Usage**: Monitor storage and bandwidth usage

## Scaling Considerations

1. **Database**: MongoDB Atlas auto-scaling
2. **File Storage**: Cloudinary handles CDN and scaling
3. **Backend**: Platform auto-scaling features
4. **Frontend**: CDN distribution via deployment platforms
