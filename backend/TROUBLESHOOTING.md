# Backend Troubleshooting Guide

## Quick Start Commands

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev

# Or use the startup script
node start-server.js
```

## Common Issues and Solutions

### 1. Module Import Errors

**Error**: `Cannot find module` or `SyntaxError: Unexpected token 'import'`

**Solution**: 
- Ensure `package.json` has `"type": "module"`
- Check all import statements use `.js` extensions
- Verify all route files exist in the `routes/` directory

### 2. MongoDB Connection Issues

**Error**: `MongooseServerSelectionError` or `ECONNREFUSED`

**Solutions**:
```bash
# Start MongoDB service (Ubuntu/Debian)
sudo systemctl start mongod

# Start MongoDB service (macOS with Homebrew)
brew services start mongodb-community

# Start MongoDB service (Windows)
net start MongoDB

# Or use MongoDB Atlas connection string in .env:
MONGODB=mongodb+srv://username:password@cluster.mongodb.net/pms
```

### 3. Environment Variables Missing

**Error**: `JWT_SECRET is not defined` or similar

**Solution**: Create/update `.env` file:
```env
MONGODB=mongodb://localhost:27017/pms
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 4. Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solutions**:
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process (replace PID with actual process ID)
kill -9 PID

# Or use a different port in .env
PORT=5001
```

### 5. CORS Issues

**Error**: `Access to fetch at 'http://localhost:5000' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution**: The CORS configuration in `index.js` should handle this, but verify:
- Frontend URL is in the allowed origins list
- Credentials are set to true
- Proper headers are allowed

### 6. Authentication Issues

**Error**: `Authentication token missing` or `Invalid token`

**Solutions**:
- Ensure JWT_SECRET is set in .env
- Check token is being sent in Authorization header or cookies
- Verify token format: `Bearer <token>`

### 7. Database Schema Errors

**Error**: `ValidationError` or `CastError`

**Solutions**:
- Check model schemas in `models/` directory
- Ensure required fields are provided
- Verify data types match schema definitions

## Testing Routes

### 1. Health Check
```bash
curl http://localhost:5000/
# Expected: "API is running..."
```

### 2. Authentication Test
```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test@123",
    "firstName": "Test",
    "lastName": "User",
    "role": "developer"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test@123"
  }'
```

### 3. Protected Route Test
```bash
# Test developer route (replace TOKEN with actual JWT)
curl -X GET http://localhost:5000/api/developer/me \
  -H "Authorization: Bearer TOKEN"
```

## Available Routes

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout

### Role-Based Routes
- `/api/admin/*` - Admin functionality
- `/api/hr/*` - HR management
- `/api/manager/*` - Project management
- `/api/developer/*` - Developer tasks
- `/api/tester/*` - Testing workflows
- `/api/employee/*` - Employee functions
- `/api/intern/*` - Intern workflows
- `/api/sales/*` - Sales team tasks
- `/api/marketing/*` - Marketing team tasks

### Resource Routes
- `/api/users/*` - User management
- `/api/tickets/*` - Ticket operations
- `/api/kanbanboard/*` - Kanban board
- `/api/analytics/*` - Analytics data

## Debugging Tips

1. **Enable Request Logging**: Set `NODE_ENV=development` in .env
2. **Check Console Output**: Look for detailed error messages
3. **Use Postman**: Import the provided Postman collection for testing
4. **MongoDB Compass**: Use GUI to inspect database collections
5. **Check Network Tab**: In browser dev tools for frontend issues

## Performance Monitoring

```bash
# Check server memory usage
ps aux | grep node

# Monitor MongoDB connections
mongo --eval "db.serverStatus().connections"

# Check application logs
tail -f logs/app.log  # if logging to file
```

## Need Help?

If you're still experiencing issues:

1. Check the console output for specific error messages
2. Verify all dependencies are installed: `npm list`
3. Ensure MongoDB is running and accessible
4. Test individual routes using curl or Postman
5. Check firewall settings if running on different machines
