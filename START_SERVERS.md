# Server Startup Guide

## Backend Server (Port 5000)
```bash
cd backend
npm install
node index.js
```

## Frontend Server (Port 5173)
```bash
cd frontend1
npm install
npm run dev
```

## Troubleshooting

### Backend Issues:
1. **Database Connection**: Ensure MongoDB is running or connection string is correct in `.env`
2. **Port Conflicts**: Backend runs on port 5000, ensure it's available
3. **Dependencies**: Run `npm install` in backend directory

### Frontend Issues:
1. **API Calls**: Frontend makes requests to `http://localhost:5000/api/*`
2. **CORS**: Backend is configured to allow requests from port 5173
3. **Authentication**: Ensure you're logged in with proper role permissions

### Admin Dashboard Specific:
- Requires admin role authentication
- Fetches data from `/api/admin/stats`
- Shows system statistics and user management options
