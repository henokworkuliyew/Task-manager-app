# Frontend Configuration Guide

## API URL Configuration

The frontend automatically detects the environment and uses the appropriate API URL:

### Development Mode (localhost)
- **API URL**: `http://localhost:5000/api`
- **When**: Running with `npm run dev` or when `import.meta.env.DEV` is true
- **Use Case**: Local development with local backend

### Production Mode (Render)
- **API URL**: `https://task-manager-backend-ubgg.onrender.com/api`
- **When**: Built and deployed to production or when `import.meta.env.DEV` is false
- **Use Case**: Production deployment

## How It Works

1. **Environment Detection**: The app automatically detects if it's running in development or production mode
2. **Smart URL Selection**: Based on the environment, it selects the appropriate backend URL
3. **No Manual Configuration**: You don't need to manually change URLs between environments

## Configuration Files

### `src/config/config.js`
- Central configuration file
- Contains API URLs for different environments
- Easy to modify for different deployments

### `src/utils/environment.js`
- Environment detection utility
- Provides information about current environment
- Helps with debugging

### `src/utils/api.js`
- API client configuration
- Uses the config to set the correct base URL
- Includes comprehensive logging and error handling

## Debugging

When you run the app, check the browser console for:
- 🌐 API Configuration: Shows which API URL is being used
- 🌍 Environment Information: Shows current environment details
- 📡 API Request: Logs all API requests
- 🚨 API Error: Logs any API errors

## Customization

To change the production API URL:
1. Edit `src/config/config.js`
2. Update the `production` URL in the `api` section
3. Rebuild and redeploy

## Troubleshooting

### Issue: Still connecting to localhost
**Solution**: Make sure you're running the production build, not the development server

### Issue: CORS errors in production
**Solution**: Check that your backend CORS configuration allows your frontend domain

### Issue: API requests failing
**Solution**: Check the browser console for detailed error logs and API configuration

