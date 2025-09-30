# Quick Start Guide - Complete Workflow Testing

## Prerequisites
- MongoDB running on localhost:27017
- Node.js installed
- Backend and Frontend dependencies installed

## Step 1: Start the Servers

### Start Backend
```bash
cd backend
npm install  # if not already done
npm start
```
Backend should run on `http://localhost:5000`

### Start Frontend
```bash
cd frontendv2
npm install  # if not already done
npm run dev
```
Frontend should run on `http://localhost:5173`

## Step 2: Create Initial Admin Account

If you don't have an admin account, create one via the register endpoint or database directly.

## Step 3: Test the Complete Workflow

### 3.1 HR Role - Create Employees

1. **Login as HR**
   - Navigate to `http://localhost:5173/login`
   - Login with HR credentials

2. **Create Employees**
   - Go to HR Dashboard
   - Click "Create Employee" or navigate to `/hr/employees`
   - Create employees with different roles:
     ```
     Developer 1:
     - Username: dev1
     - Email: dev1@company.com
     - Password: password123
     - Role: developer
     - First Name: John
     - Last Name: Developer

     Developer 2:
     - Username: dev2
     - Email: dev2@company.com
     - Password: password123
     - Role: developer
     - First Name: Jane
     - Last Name: Developer

     Tester 1:
     - Username: tester1
     - Email: tester1@company.com
     - Password: password123
     - Role: tester
     - First Name: Alice
     - Last Name: Tester

     Manager 1:
     - Username: manager1
     - Email: manager1@company.com
     - Password: password123
     - Role: manager
     - First Name: Bob
     - Last Name: Manager
     ```

3. **Verify Creation**
   - Check HR Dashboard to see all created employees
   - Verify role distribution chart updates

### 3.2 Manager Role - Create Teams & Assign Work

1. **Login as Manager**
   - Logout from HR account
   - Login with Manager credentials (manager1)

2. **Create a Project**
   - Navigate to Manager Dashboard
   - Click "Create Project"
   - Fill in project details:
     ```
     Name: E-Commerce Platform
     Description: Building a new e-commerce platform
     Start Date: [Today's date]
     End Date: [30 days from now]
     Status: active
     ```
   - Click "Create"

3. **Add Team Members to Project**
   - Open the created project
   - In "Team Management" section:
     - Add dev1 (Developer)
     - Add dev2 (Developer)
     - Add tester1 (Tester)

4. **Create Modules**
   - In the project view, click "Add Module"
   - Create modules:
     ```
     Module 1:
     - Name: User Authentication
     - Description: Login, registration, password reset
     - Status: active
     - Start Date: [Today]
     - End Date: [10 days from now]

     Module 2:
     - Name: Product Catalog
     - Description: Product listing and search
     - Status: planning
     - Start Date: [5 days from now]
     - End Date: [20 days from now]
     ```

5. **Create Tickets and Assign**
   - Click "Add Ticket" in the "User Authentication" module
   - Create tickets:
     ```
     Ticket 1:
     - Title: Implement user login API
     - Description: Create REST API for user authentication
     - Type: task
     - Priority: high
     - Assign Developer: dev1
     - Assign Tester: tester1
     - Estimated Hours: 8
     - Story Points: 5
     - Due Date: [3 days from now]

     Ticket 2:
     - Title: Create registration form
     - Description: Frontend registration form with validation
     - Type: task
     - Priority: medium
     - Assign Developer: dev2
     - Assign Tester: tester1
     - Estimated Hours: 6
     - Story Points: 3
     - Due Date: [4 days from now]

     Ticket 3:
     - Title: Fix password reset bug
     - Description: Password reset email not sending
     - Type: bug
     - Priority: critical
     - Assign Developer: dev1
     - Assign Tester: tester1
     - Estimated Hours: 4
     - Story Points: 2
     - Due Date: [2 days from now]
     ```

6. **Verify Manager Dashboard**
   - Check that statistics update:
     - Active Projects: 1
     - Pending Tasks: 3
     - Team Performance shows assigned developers

### 3.3 Developer Role - Complete Tickets

1. **Login as Developer**
   - Logout from Manager account
   - Login as dev1

2. **View Assigned Tickets**
   - Navigate to Developer Dashboard
   - You should see tickets assigned to you:
     - "Implement user login API"
     - "Fix password reset bug"

3. **Complete a Ticket**
   - Click on "Implement user login API"
   - Click "Complete Ticket" or "Mark as Done"
   - Add completion notes: "API implemented with JWT authentication"
   - Add actual hours: 7.5
   - Submit

4. **Verify Automatic Transition**
   - The ticket should automatically move to "testing" status
   - Tester (tester1) should now see this ticket in their queue

5. **Check Developer Stats**
   - Navigate to Developer Dashboard
   - Verify statistics update:
     - Completed Tickets: 1
     - In Progress: 1 (the other ticket)

### 3.4 Tester Role - Validate Tickets

1. **Login as Tester**
   - Logout from Developer account
   - Login as tester1

2. **View Test Tickets**
   - Navigate to Tester Dashboard
   - You should see tickets in "testing" status:
     - "Implement user login API" (just completed by dev1)

3. **Test and Approve Ticket**
   - Click on the ticket
   - Review the implementation
   - Click "Approve Ticket" or "Validate"
   - Add approval notes: "Tested successfully. All authentication flows working."
   - Submit

4. **Verify Ticket Completion**
   - The ticket status should change to "done"
   - The ticket is now complete in the workflow

5. **Alternative: Reject Ticket**
   - If testing fails, you can:
     - Click "Reject" or "Create Bug"
     - The ticket goes back to developer
     - A bug report is created

6. **Check Tester Stats**
   - Navigate to Tester Dashboard
   - Verify statistics update:
     - Test Cases Executed: 1
     - Passed: 1

### 3.5 Verify Complete Workflow

1. **Login as Manager Again**
   - Check the project dashboard
   - Verify ticket lifecycle:
     - Created by Manager ✓
     - Assigned to Developer ✓
     - Completed by Developer ✓
     - Automatically moved to Tester ✓
     - Approved by Tester ✓
     - Final status: Done ✓

2. **Check Module Progress**
   - Module "User Authentication" should show:
     - Progress: 33% (1 of 3 tickets done)
     - Tickets breakdown visible

3. **View Analytics**
   - Navigate to Manager Analytics
   - Check team performance metrics
   - View project completion rates

## Step 4: Test Edge Cases

### Test 1: Ticket Without Tester
1. As Manager, create a ticket without assigning a tester
2. As Developer, complete the ticket
3. Verify: Ticket should go directly to "done" status (no testing phase)

### Test 2: Multiple Developers on Same Module
1. As Manager, assign multiple tickets to different developers
2. Each developer completes their tickets
3. Verify: Each ticket follows its own lifecycle independently

### Test 3: Tester Rejecting Ticket
1. As Tester, reject a ticket or create a bug
2. Verify: Ticket status changes appropriately
3. Developer should see the ticket back in their queue

## Troubleshooting

### Backend Not Starting
- Check MongoDB is running: `mongod --version`
- Check port 5000 is not in use
- Check `.env` file has correct MongoDB connection string

### Frontend Not Connecting to Backend
- Verify backend is running on port 5000
- Check CORS settings in `backend/index.js`
- Check API base URL in `frontendv2/src/services/api.js`

### Authentication Issues
- Clear browser localStorage
- Check JWT token is being sent in headers
- Verify token expiration settings

### Data Not Showing
- Check browser console for errors
- Verify API responses in Network tab
- Check MongoDB data using MongoDB Compass

## API Testing with Postman

Import the collection: `PMS.postman_collection.json`

### Test Sequence:
1. **Login as HR**
   - POST `/api/auth/login`
   - Save token

2. **Create Employee**
   - POST `/api/hr/employees`
   - Use saved token

3. **Login as Manager**
   - POST `/api/auth/login`
   - Save new token

4. **Create Project**
   - POST `/api/manager/project`

5. **Add Module**
   - POST `/api/manager/project/:projectId/module`

6. **Create Ticket**
   - POST `/api/manager/ticket/:projectId/:moduleId`

7. **Login as Developer**
   - POST `/api/auth/login`

8. **Get My Tickets**
   - GET `/api/developer/tickets`

9. **Complete Ticket**
   - POST `/api/developer/tickets/:projectId/:moduleId/:ticketId/complete`

10. **Login as Tester**
    - POST `/api/auth/login`

11. **Get Test Tickets**
    - GET `/api/tester/tickets`

12. **Approve Ticket**
    - POST `/api/tester/tickets/:projectId/:moduleId/:ticketId/approve`

## Success Criteria

✅ HR can create employees with different roles
✅ Manager can see all employees
✅ Manager can create projects and add team members
✅ Manager can create modules within projects
✅ Manager can create tickets and assign to developers & testers
✅ Developer can see assigned tickets
✅ Developer can complete tickets
✅ Completed tickets automatically move to tester (if assigned)
✅ Tester can see tickets in testing status
✅ Tester can approve/validate tickets
✅ Approved tickets show as "done"
✅ All dashboards show correct statistics
✅ Role-based access control works (users can only access their allowed routes)

## Next Steps After Testing

1. **Customize the workflow** - Modify ticket statuses, add custom fields
2. **Add notifications** - Email/in-app notifications for assignments
3. **Implement real-time updates** - WebSocket for live ticket updates
4. **Add reporting** - Generate PDF reports, export data
5. **Enhance UI** - Add drag-and-drop kanban boards
6. **Add file uploads** - Attach files to tickets
7. **Implement comments** - Team collaboration on tickets
8. **Add time tracking** - Track actual time spent on tickets

## Support

For issues or questions:
- Check `WORKFLOW_IMPLEMENTATION.md` for detailed architecture
- Review backend logs in terminal
- Check browser console for frontend errors
- Verify database state in MongoDB Compass
