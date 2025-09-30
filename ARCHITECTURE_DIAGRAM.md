# System Architecture Diagram

## Complete Workflow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React + MUI)                             │
│                         http://localhost:5173                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  HR Dashboard│  │Manager Dash  │  │Developer Dash│  │Tester Dash   │   │
│  │              │  │              │  │              │  │              │   │
│  │ - View Emps  │  │ - Projects   │  │ - My Tickets │  │ - Test Queue │   │
│  │ - Create Emp │  │ - Teams      │  │ - Complete   │  │ - Approve    │   │
│  │ - Statistics │  │ - Modules    │  │ - Statistics │  │ - Statistics │   │
│  │              │  │ - Tickets    │  │              │  │              │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                 │                 │            │
│         └─────────────────┴─────────────────┴─────────────────┘            │
│                                    │                                        │
│                            API Service Layer                                │
│                         (services/api.js)                                   │
│                                    │                                        │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
                                     │ HTTP/REST API
                                     │ JWT Authentication
                                     │
┌────────────────────────────────────┼────────────────────────────────────────┐
│                                    │                                        │
│                           BACKEND (Node.js + Express)                       │
│                         http://localhost:5000/api                           │
├────────────────────────────────────┼────────────────────────────────────────┤
│                                    │                                        │
│                            Middleware Layer                                 │
│                    ┌───────────────┴───────────────┐                       │
│                    │                                │                       │
│              ┌─────▼─────┐                  ┌──────▼──────┐                │
│              │verifyToken│                  │ roleAuth    │                │
│              │  (JWT)    │                  │ (RBAC)      │                │
│              └─────┬─────┘                  └──────┬──────┘                │
│                    └───────────────┬───────────────┘                       │
│                                    │                                        │
│                            Route Layer                                      │
│         ┌──────────────┬───────────┼───────────┬──────────────┐            │
│         │              │           │           │              │            │
│    ┌────▼────┐   ┌────▼────┐ ┌────▼────┐ ┌────▼────┐   ┌────▼────┐       │
│    │HR Routes│   │Mgr Route│ │Dev Route│ │Test Route│   │Auth Route│      │
│    │         │   │         │ │         │ │         │   │         │      │
│    │/hr/*    │   │/manager/│ │/develop/│ │/tester/ │   │/auth/*  │      │
│    └────┬────┘   └────┬────┘ └────┬────┘ └────┬────┘   └────┬────┘       │
│         │             │           │           │             │            │
│         │             │           │           │             │            │
│                       Controller Layer                                      │
│         │             │           │           │             │            │
│    ┌────▼────┐   ┌────▼────┐ ┌────▼────┐ ┌────▼────┐   ┌────▼────┐       │
│    │   HR    │   │ Manager │ │Developer│ │ Tester  │   │  Auth   │       │
│    │Controller│  │Controller│ │Controller│ │Controller│  │Controller│      │
│    │         │   │         │ │         │ │         │   │         │      │
│    │-create  │   │-create  │ │-getMyTix│ │-getMyTix│   │-login   │      │
│    │ Employee│   │ Project │ │-complete│ │-approve │   │-register│      │
│    │-getAll  │   │-addModule│ │ Ticket  │ │ Ticket  │   │-verify  │      │
│    │-getStats│   │-createTix│ │-getStats│ │-getStats│   │         │      │
│    └────┬────┘   └────┬────┘ └────┬────┘ └────┬────┘   └────┬────┘       │
│         │             │           │           │             │            │
│         └─────────────┴───────────┴───────────┴─────────────┘            │
│                                    │                                        │
│                            Model Layer (Mongoose)                           │
│                                    │                                        │
│                    ┌───────────────┴───────────────┐                       │
│                    │                                │                       │
│              ┌─────▼─────┐                  ┌──────▼──────┐                │
│              │User Model │                  │Project Model│                │
│              │           │                  │             │                │
│              │-username  │                  │-name        │                │
│              │-email     │                  │-manager     │                │
│              │-password  │                  │-teamMembers │                │
│              │-role      │                  │-modules[]   │                │
│              │-firstName │                  │  -tickets[] │                │
│              │-lastName  │                  │             │                │
│              │-isActive  │                  │             │                │
│              └─────┬─────┘                  └──────┬──────┘                │
│                    │                                │                       │
└────────────────────┼────────────────────────────────┼───────────────────────┘
                     │                                │
                     └────────────┬───────────────────┘
                                  │
┌─────────────────────────────────▼─────────────────────────────────────────┐
│                         DATABASE (MongoDB)                                 │
│                      mongodb://localhost:27017/pms                         │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐              ┌─────────────────────────────────────┐  │
│  │  users          │              │  projects                           │  │
│  │  Collection     │              │  Collection                         │  │
│  ├─────────────────┤              ├─────────────────────────────────────┤  │
│  │ _id             │              │ _id                                 │  │
│  │ username        │              │ name                                │  │
│  │ email           │              │ description                         │  │
│  │ password (hash) │              │ projectManager (ref: User)          │  │
│  │ role            │◄─────────────┤ teamMembers[] (ref: User)           │  │
│  │ firstName       │              │ modules[] {                         │  │
│  │ lastName        │              │   name, description, status         │  │
│  │ isActive        │              │   tickets[] {                       │  │
│  │ teams[]         │              │     ticketNumber, title             │  │
│  │ createdAt       │              │     assignedDeveloper (ref: User)   │  │
│  │ updatedAt       │              │     tester (ref: User)              │  │
│  └─────────────────┘              │     status, priority, type          │  │
│                                   │     completedAt, comments[]         │  │
│                                   │   }                                 │  │
│                                   │ }                                   │  │
│                                   │ createdAt, updatedAt                │  │
│                                   └─────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Workflow Sequence Diagram

```
HR                Manager            Developer          Tester            System
│                   │                   │                 │                 │
│ 1. Create         │                   │                 │                 │
│    Employee       │                   │                 │                 │
├──────────────────>│                   │                 │                 │
│                   │                   │                 │                 │
│                   │ 2. View           │                 │                 │
│                   │    Employees      │                 │                 │
│                   ├──────────────────>│                 │                 │
│                   │                   │                 │                 │
│                   │ 3. Create         │                 │                 │
│                   │    Project        │                 │                 │
│                   ├──────────────────────────────────────────────────────>│
│                   │                   │                 │                 │
│                   │ 4. Assign Team    │                 │                 │
│                   ├──────────────────────────────────────────────────────>│
│                   │                   │                 │                 │
│                   │ 5. Create Module  │                 │                 │
│                   ├──────────────────────────────────────────────────────>│
│                   │                   │                 │                 │
│                   │ 6. Create Ticket  │                 │                 │
│                   │    + Assign Dev   │                 │                 │
│                   │    + Assign Tester│                 │                 │
│                   ├──────────────────────────────────────────────────────>│
│                   │                   │                 │                 │
│                   │                   │ 7. View Ticket  │                 │
│                   │                   ├────────────────>│                 │
│                   │                   │                 │                 │
│                   │                   │ 8. Work on      │                 │
│                   │                   │    Ticket       │                 │
│                   │                   │                 │                 │
│                   │                   │ 9. Complete     │                 │
│                   │                   │    Ticket       │                 │
│                   │                   ├────────────────────────────────────>│
│                   │                   │                 │                 │
│                   │                   │                 │ 10. Auto        │
│                   │                   │                 │     Transition  │
│                   │                   │                 │     to Testing  │
│                   │                   │                 │<────────────────│
│                   │                   │                 │                 │
│                   │                   │                 │ 11. View Test   │
│                   │                   │                 │     Ticket      │
│                   │                   │                 ├────────────────>│
│                   │                   │                 │                 │
│                   │                   │                 │ 12. Test &      │
│                   │                   │                 │     Approve     │
│                   │                   │                 ├────────────────>│
│                   │                   │                 │                 │
│                   │                   │                 │ 13. Status      │
│                   │                   │                 │     = Done      │
│                   │                   │                 │<────────────────│
│                   │                   │                 │                 │
│                   │ 14. View          │                 │                 │
│                   │     Completed     │                 │                 │
│                   │     Ticket        │                 │                 │
│                   ├──────────────────────────────────────────────────────>│
│                   │                   │                 │                 │
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TICKET LIFECYCLE                                 │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │   CREATED    │  Manager creates ticket
    │  (Manager)   │  Assigns: Developer + Tester
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │     OPEN     │  Ticket visible to Developer
    │  (Waiting)   │  Status: 'open'
    └──────┬───────┘
           │
           │ Developer starts work
           ▼
    ┌──────────────┐
    │ IN_PROGRESS  │  Developer working
    │ (Developer)  │  Status: 'in_progress'
    └──────┬───────┘
           │
           │ Developer completes
           ▼
    ┌──────────────────────────────────────┐
    │      AUTOMATIC TRANSITION            │
    │                                      │
    │  IF tester assigned:                 │
    │    → Status = 'testing'              │
    │    → Appears in tester queue         │
    │                                      │
    │  IF no tester:                       │
    │    → Status = 'done'                 │
    │    → Workflow complete               │
    └──────┬───────────────────────────────┘
           │
           │ (If tester assigned)
           ▼
    ┌──────────────┐
    │   TESTING    │  Tester validates
    │   (Tester)   │  Status: 'testing'
    └──────┬───────┘
           │
           │ Tester approves
           ▼
    ┌──────────────┐
    │     DONE     │  Workflow complete
    │  (Complete)  │  Status: 'done'
    └──────────────┘
```

## Component Interaction Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND COMPONENTS                                 │
└─────────────────────────────────────────────────────────────────────────┘

ManagerDashboard.jsx
    │
    ├─> ProjectForm.jsx
    │       │
    │       └─> Creates Project
    │           Assigns Team Members
    │
    ├─> ModuleManagement.jsx
    │       │
    │       ├─> Creates Modules
    │       │
    │       └─> TicketForm.jsx
    │               │
    │               └─> Creates Tickets
    │                   Assigns Developer
    │                   Assigns Tester
    │
    └─> API Service (api.js)
            │
            ├─> managerAPI.createProject()
            ├─> managerAPI.addModule()
            ├─> managerAPI.createTicket()
            └─> managerAPI.getEmployees()

DeveloperDashboard.jsx
    │
    ├─> Views Tickets
    │
    ├─> Completes Tickets
    │
    └─> API Service (api.js)
            │
            ├─> developerAPI.getMyTickets()
            └─> developerAPI.completeTicket()
                    │
                    └─> Backend Auto-Transition

TesterDashboard.jsx
    │
    ├─> Views Test Queue
    │
    ├─> Approves Tickets
    │
    └─> API Service (api.js)
            │
            ├─> testerAPI.getMyTestTickets()
            └─> testerAPI.approveTicket()
```

## Security Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION & AUTHORIZATION                      │
└─────────────────────────────────────────────────────────────────────────┘

User Login
    │
    ▼
┌──────────────────┐
│  POST /auth/login│
│                  │
│  Credentials:    │
│  - username      │
│  - password      │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│  Backend Validation      │
│                          │
│  1. Find user            │
│  2. Compare password     │
│     (bcrypt)             │
│  3. Generate JWT token   │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Return JWT Token        │
│  + User Role             │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Frontend Stores:        │
│  - Token in localStorage │
│  - Role for routing      │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  All Subsequent Requests         │
│                                  │
│  Headers:                        │
│  Authorization: Bearer <token>   │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Backend Middleware              │
│                                  │
│  1. verifyToken()                │
│     - Validates JWT              │
│     - Extracts user info         │
│                                  │
│  2. roleAuth()                   │
│     - Checks user role           │
│     - Allows/Denies access       │
└──────────────────────────────────┘
```

## Database Relationships

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      ENTITY RELATIONSHIPS                                │
└─────────────────────────────────────────────────────────────────────────┘

User (HR, Manager, Developer, Tester)
    │
    │ 1:N (creates)
    ▼
Employee Records
    │
    │ N:M (assigned to)
    ▼
Projects
    │
    │ 1:N (contains)
    ▼
Modules
    │
    │ 1:N (contains)
    ▼
Tickets
    │
    ├─> N:1 (assigned to) Developer
    │
    └─> N:1 (assigned to) Tester


Detailed Structure:

User
├── _id
├── role: 'hr' | 'manager' | 'developer' | 'tester'
└── teams[] → References to Projects

Project
├── _id
├── projectManager → User._id (Manager)
├── teamMembers[] → User._id[] (Developers, Testers)
└── modules[] (Embedded)
    ├── name
    ├── status
    └── tickets[] (Embedded)
        ├── assignedDeveloper → User._id
        ├── tester → User._id
        ├── status: 'open' | 'in_progress' | 'testing' | 'done'
        └── comments[]
```

---

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Role-based access control
- ✅ Automatic workflow transitions
- ✅ Scalable structure
- ✅ Maintainable codebase
- ✅ Secure authentication
- ✅ Efficient data flow
