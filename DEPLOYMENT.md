# Deployment Guide - Fixing CORS Issues

## Current Issue
Your backend is experiencing CORS (Cross-Origin Resource Sharing) issues when deployed on Render. The frontend at `https://task-manager-frontend-x3pe.onrender.com` cannot communicate with the backend at `https://task-manager-backend-ubgg.onrender.com`.

## What I've Fixed

### 1. Enhanced CORS Configuration
- Moved CORS configuration to be the first middleware
- Added explicit handling for OPTIONS preflight requests
- Added comprehensive CORS headers
- Added debugging logs to help troubleshoot

### 2. Environment Variables Required
Your backend needs these environment variables set in Render:

```bash
NODE_ENV=production
FRONTEND_URL=https://task-manager-frontend-x3pe.onrender.com
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
PORT=5000
```

## Steps to Fix

### 1. Update Environment Variables in Render
1. Go to your Render dashboard
2. Select your backend service (`task-manager-backend-ubgg`)
3. Go to "Environment" tab
4. Add/update these variables:
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `https://task-manager-frontend-x3pe.onrender.com`
   - Ensure `MONGO_URI` and `JWT_SECRET` are set

### 2. Redeploy Backend
1. In Render, trigger a new deployment
2. Wait for deployment to complete
3. Check the logs for any errors

### 3. Test CORS
1. Test the health endpoint: `https://task-manager-backend-ubgg.onrender.com/api/health`
2. Test the CORS endpoint: `https://task-manager-backend-ubgg.onrender.com/api/cors-test`
3. Check browser console for CORS errors

## CORS Configuration Details

The updated CORS configuration:
- Allows requests from your frontend domain
- Handles preflight OPTIONS requests properly
- Sets appropriate headers for credentials and methods
- Includes debugging logs for troubleshooting

## Common Issues & Solutions

### Issue: Still getting CORS errors
**Solution**: Check that `NODE_ENV=production` is set in Render

### Issue: Frontend can't connect
**Solution**: Verify the `FRONTEND_URL` environment variable matches exactly

### Issue: Database connection fails
**Solution**: Ensure `MONGO_URI` is correctly set and accessible

## Testing

After deployment, test these endpoints:
- `GET /api/health` - Basic health check
- `GET /api/cors-test` - CORS test endpoint
- `POST /api/auth/login` - Your login endpoint

## Monitoring

Check the Render logs for:
- CORS debug information
- Database connection status
- Any error messages

## Next Steps

1. Update environment variables in Render
2. Redeploy the backend
3. Test the endpoints
4. Check browser console for CORS errors
5. If issues persist, check the Render logs for debugging information

The CORS configuration is now much more robust and should resolve your deployment issues.
