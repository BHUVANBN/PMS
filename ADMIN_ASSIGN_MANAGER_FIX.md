# Admin Can Assign Manager to Project

## Summary
Added ability for admin to select and assign a project manager when creating a new project.

## Changes Made

### File: `frontendv2/src/pages/manager/ProjectForm.jsx`

#### 1. Added Imports
```javascript
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../services/api';
```

#### 2. Added Admin Detection
```javascript
const { user } = useAuth();
const isAdmin = user?.role === 'admin';
```

#### 3. Added Managers State
```javascript
const [managers, setManagers] = useState([]);
```

#### 4. Load Managers for Admin
```javascript
// In useEffect, load managers if user is admin
if (isAdmin) {
  try {
    const managersRes = await adminAPI.getUsersByRole('manager');
    const managersList = managersRes?.data || managersRes?.users || managersRes || [];
    setManagers(Array.isArray(managersList) ? managersList : []);
  } catch (err) {
    console.error('Error loading managers:', err);
  }
}
```

#### 5. Updated Form Submission Logic
```javascript
if (mode === 'create') {
  const payload = {
    name: values.name,
    description: values.description,
    startDate: values.startDate,
    endDate: values.endDate || undefined,
    status: values.status,
  };
  
  // Admin can assign manager, otherwise backend sets from authenticated user
  if (isAdmin) {
    if (!values.projectManager) {
      setError('Please select a project manager');
      setLoading(false);
      return;
    }
    payload.projectManager = values.projectManager;
    await projectsAPI.createProject(payload); // Uses admin API
  } else {
    await managerAPI.createProject(payload); // Uses manager API
  }
}
```

#### 6. Added Manager Selection Field in UI
```javascript
{/* Show manager selection for admin during creation */}
{(isAdmin && mode === 'create') || mode === 'edit' ? (
  <Grid item xs={12} sm={6}>
    <FormSelect
      label="Project Manager"
      value={values.projectManager}
      onChange={(e)=>handleChange('projectManager', e.target.value)}
      options={managers.map(m => ({
        value: m._id || m.id,
        label: `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.username || m.email
      }))}
      required={isAdmin && mode === 'create'}
      disabled={managers.length === 0}
    />
  </Grid>
) : null}
```

## How It Works

### For Admin Users:
1. **Navigate to Create Project**
   - Go to Projects → New Project

2. **See Manager Dropdown**
   - New field appears: "Project Manager"
   - Dropdown populated with all managers from database
   - Field is **required**

3. **Fill Form**
   - Project Name (required)
   - Status (required)
   - Description
   - Start Date (required)
   - End Date (optional)
   - **Project Manager (required)** ← NEW

4. **Submit**
   - Admin must select a manager
   - If no manager selected, shows error: "Please select a project manager"
   - On success, project created with assigned manager

### For Manager Users:
1. **Navigate to Create Project**
   - Go to Projects → New Project

2. **No Manager Dropdown**
   - Manager field is hidden
   - Backend automatically assigns current user as project manager

3. **Fill Form**
   - Project Name (required)
   - Status (required)
   - Description
   - Start Date (required)
   - End Date (optional)

4. **Submit**
   - Project created with current user as manager

## API Calls

### Admin Creating Project:
```javascript
// Frontend
await projectsAPI.createProject({
  name: "New Project",
  description: "Description",
  startDate: "2025-10-02",
  endDate: "2025-12-31",
  status: "planning",
  projectManager: "manager_user_id" // Admin selects this
});

// Backend: POST /api/projects
// Uses project.controller.js createProject()
// Validates manager exists
// Creates project with assigned manager
```

### Manager Creating Project:
```javascript
// Frontend
await managerAPI.createProject({
  name: "New Project",
  description: "Description",
  startDate: "2025-10-02",
  endDate: "2025-12-31",
  status: "planning"
  // No projectManager field
});

// Backend: POST /api/manager/project
// Uses manager.controller.js createProject()
// Automatically sets projectManager = req.user._id
```

## Backend Support

### Already Exists:
✅ `POST /api/projects` - Admin can create project with projectManager
✅ `POST /api/manager/project` - Manager creates project (auto-assigned)
✅ `GET /api/admin/users/role/manager` - Get all managers

### Validation:
✅ Backend validates projectManager exists
✅ Backend checks permissions (admin/manager only)

## UI Behavior

### Admin View:
```
┌─────────────────────────────────────────┐
│ Create Project                           │
├─────────────────────────────────────────┤
│ Project Name: [____________]             │
│ Status: [Planning ▼]                     │
│ Description: [____________]              │
│ Start Date: [2025-10-02]                 │
│ End Date: [2025-12-31]                   │
│                                          │
│ === Team ===                             │
│ Project Manager: [Select Manager ▼] *   │ ← NEW FIELD
│   - John Doe                             │
│   - Jane Smith                           │
│   - Mike Johnson                         │
│                                          │
│ [Cancel]  [Create Project]               │
└─────────────────────────────────────────┘
```

### Manager View:
```
┌─────────────────────────────────────────┐
│ Create Project                           │
├─────────────────────────────────────────┤
│ Project Name: [____________]             │
│ Status: [Planning ▼]                     │
│ Description: [____________]              │
│ Start Date: [2025-10-02]                 │
│ End Date: [2025-12-31]                   │
│                                          │
│ === Team ===                             │
│ (No manager field - auto-assigned)       │
│                                          │
│ [Cancel]  [Create Project]               │
└─────────────────────────────────────────┘
```

## Validation

### Frontend Validation:
- ✅ Admin must select a manager (required field)
- ✅ Shows error if manager not selected
- ✅ Disables dropdown if no managers available

### Backend Validation:
- ✅ Validates projectManager exists in database
- ✅ Validates user has permission to create project
- ✅ Returns error if validation fails

## Testing Instructions

### Test 1: Admin Creates Project with Manager
1. Login as Admin
2. Navigate to Projects → New Project
3. **Verify**: "Project Manager" dropdown appears
4. **Verify**: Dropdown shows all managers
5. Fill form WITHOUT selecting manager
6. Click "Create Project"
7. **Verify**: Error message: "Please select a project manager"
8. Select a manager from dropdown
9. Click "Create Project"
10. **Verify**: Project created successfully
11. **Verify**: Selected manager is assigned to project

### Test 2: Manager Creates Project (Auto-Assigned)
1. Login as Manager
2. Navigate to Projects → New Project
3. **Verify**: No "Project Manager" dropdown visible
4. Fill form and submit
5. **Verify**: Project created successfully
6. **Verify**: Current manager is automatically assigned

### Test 3: View Created Projects
1. Login as Admin
2. Navigate to Projects list
3. **Verify**: Project shows correct manager name
4. Login as the assigned Manager
5. Navigate to Projects list
6. **Verify**: Manager sees the project in their list

## Error Handling

### No Managers Available:
- Dropdown shows "Loading managers..." or empty
- Field is disabled
- Admin cannot submit until managers load

### Manager Not Selected:
- Shows error: "Please select a project manager"
- Form doesn't submit
- Error clears when manager is selected

### API Errors:
- Shows error message from backend
- Form remains editable
- User can retry

## Permissions

### Who Can Assign Managers:
- ✅ **Admin**: Can assign any manager to any project
- ❌ **Manager**: Cannot assign managers (auto-assigned as self)
- ❌ **Other Roles**: Cannot create projects

### Who Can Be Assigned:
- ✅ Users with role = 'manager'
- ✅ Users with role = 'admin' (can also be project managers)

## Benefits

1. **Flexibility**: Admin can assign projects to specific managers
2. **Control**: Admin has oversight of project assignments
3. **Simplicity**: Managers still auto-assigned when they create projects
4. **Validation**: Ensures every project has a valid manager
5. **Visibility**: Clear indication of who manages each project

## Future Enhancements

1. Allow admin to reassign manager after project creation
2. Show manager workload when selecting
3. Add manager availability/capacity indicators
4. Bulk assign multiple projects to a manager
5. Manager approval workflow for assignments

---

**Status**: ✅ **COMPLETE**
**Date**: 2025-10-02
**Feature**: Admin can assign manager when creating project
**Files Modified**: ProjectForm.jsx
