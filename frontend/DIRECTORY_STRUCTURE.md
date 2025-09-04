# Frontend Directory Structure

```
frontend/
├── public/
│   ├── vite.svg
│   └── favicon.ico
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── forms/
│   │   │   ├── RegisterForm.jsx
│   │   │   ├── ProjectForm.jsx
│   │   │   ├── TicketForm.jsx
│   │   │   └── UserForm.jsx
│   │   │
│   │   ├── kanban/
│   │   │   ├── KanbanBoard.jsx
│   │   │   ├── KanbanColumn.jsx
│   │   │   └── KanbanCard.jsx
│   │   │
│   │   └── dashboards/
│   │       ├── StatsCard.jsx
│   │       ├── RecentActivity.jsx
│   │       └── TaskSummary.jsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── UserListPage.jsx
│   │   │   ├── UserDetailPage.jsx
│   │   │   ├── EmployeeCreatePage.jsx
│   │   │   └── SystemStatsPage.jsx
│   │   │
│   │   ├── hr/
│   │   │   ├── HRDashboard.jsx
│   │   │   ├── EmployeeListPage.jsx
│   │   │   ├── EmployeeDetailPage.jsx
│   │   │   ├── EmployeeCreatePage.jsx
│   │   │   └── HRStatsPage.jsx
│   │   │
│   │   ├── manager/
│   │   │   ├── ManagerDashboard.jsx
│   │   │   ├── ProjectListPage.jsx
│   │   │   ├── ProjectCreatePage.jsx
│   │   │   ├── ProjectOverviewPage.jsx
│   │   │   ├── ProjectSettingsPage.jsx
│   │   │   └── ProjectTeamPage.jsx
│   │   │
│   │   ├── developer/
│   │   │   ├── DeveloperDashboard.jsx
│   │   │   └── MyWorkPage.jsx
│   │   │
│   │   ├── tester/
│   │   │   ├── TesterDashboard.jsx
│   │   │   └── QAWorkspacePage.jsx
│   │   │
│   │   ├── projects/
│   │   │   ├── ProjectsListPage.jsx
│   │   │   ├── ProjectDetailPage.jsx
│   │   │   ├── TicketListPage.jsx
│   │   │   ├── TicketDetailPage.jsx
│   │   │   ├── TicketCreatePage.jsx
│   │   │   ├── MainKanbanPage.jsx
│   │   │   ├── KanbanBoardPage.jsx
│   │   │   ├── DevBoardPage.jsx
│   │   │   ├── SprintBoardPage.jsx
│   │   │   ├── SprintListPage.jsx
│   │   │   ├── SprintDetailPage.jsx
│   │   │   ├── SprintCreatePage.jsx
│   │   │   ├── StandupListPage.jsx
│   │   │   ├── StandupDetailPage.jsx
│   │   │   ├── BugListPage.jsx
│   │   │   ├── BugDetailPage.jsx
│   │   │   ├── BugCreatePage.jsx
│   │   │   └── ActivityLogPage.jsx
│   │   │
│   │   ├── employee/
│   │   │   └── EmployeeDashboard.jsx
│   │   │
│   │   └── shared/
│   │       ├── NotFoundPage.jsx
│   │       └── UnauthorizedPage.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useApi.js
│   │   ├── useLocalStorage.js
│   │   ├── useDebounce.js
│   │   ├── usePagination.js
│   │   ├── useSocket.js
│   │   └── usePermissions.js
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── AuthProvider.jsx
│   │   ├── ThemeContext.jsx
│   │   ├── ThemeProvider.jsx
│   │   ├── ProjectContext.jsx
│   │   └── ProjectProvider.jsx
│   │
│   ├── services/
│   │   ├── api.js                    (✅ Already created)
│   │   ├── auth.service.js
│   │   ├── socket.service.js
│   │   ├── storage.service.js
│   │   └── notification.service.js
│   │
│   ├── utils/
│   │   ├── constants/
│   │   │   ├── roles.js
│   │   │   ├── statuses.js
│   │   │   ├── priorities.js
│   │   │   └── routes.js
│   │   ├── helpers/
│   │   │   ├── dateUtils.js
│   │   │   ├── formatUtils.js
│   │   │   ├── validationUtils.js
│   │   │   └── permissionUtils.js
│   │   └── validators/
│   │       ├── authValidators.js
│   │       ├── projectValidators.js
│   │       └── ticketValidators.js
│   │
│   ├── assets/
│   │   ├── images/
│   │   │   ├── logos/
│   │   │   ├── avatars/
│   │   │   ├── icons/
│   │   │   └── backgrounds/
│   │   ├── fonts/
│   │   └── videos/
│   │
│   ├── routes/
│   │   ├── AppRouter.jsx
│   │   ├── PrivateRoute.jsx
│   │   ├── RoleBasedRoute.jsx
│   │   └── routeConfig.js
│   │
│   ├── store/ (optional - for state management)
│   │   ├── slices/
│   │   │   ├── authSlice.js
│   │   │   ├── projectSlice.js
│   │   │   └── ticketSlice.js
│   │   └── store.js
│   │
│   ├── App.jsx                       (✅ Already exists)
│   ├── main.jsx                      (✅ Already exists)
│   └── index.css                     (✅ Already exists)
│
├── .env
├── .env.example
├── .gitignore                        (✅ Already exists)
├── index.html                        (✅ Already exists)
├── package.json                      (✅ Already exists)
├── vite.config.js                    (✅ Already exists)
├── eslint.config.js                  (✅ Already exists)
└── README.md                         (✅ Already exists)
```
