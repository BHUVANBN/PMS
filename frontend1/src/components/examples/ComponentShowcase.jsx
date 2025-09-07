import React, { useState } from 'react';
import { 
  Layout, 
  LoadingSpinner, 
  LoadingOverlay, 
  ButtonSpinner, 
  SkeletonCard, 
  SkeletonTable,
  Modal, 
  ConfirmModal,
  Breadcrumb,
  Pagination,
  SimplePagination,
  ErrorBoundary,
  ErrorFallback
} from '../common/index.js';
import {
  LoginForm,
  RegisterForm,
  ProjectForm,
  TicketForm,
  UserForm,
  BugForm,
  SprintForm
} from '../forms/index.js';
import {
  KanbanBoard,
  KanbanColumn,
  KanbanCard,
  KanbanFilters
} from '../kanban/index.js';
import {
  StatsCard,
  RecentActivity,
  TaskSummary,
  ChartWidget,
  TicketStatusChart,
  ProjectProgressChart
} from '../dashboards/index.js';
import {
  DataTable,
  UserTable,
  ProjectTable,
  TicketTable
} from '../tables/index.js';
import {
  Button,
  PrimaryButton,
  SecondaryButton,
  Input,
  SearchInput,
  Select,
  Checkbox,
  Badge,
  StatusBadge,
  PriorityBadge,
  Tooltip,
  InfoTooltip
} from '../ui/index.js';

const ComponentShowcase = () => {
  const [activeTab, setActiveTab] = useState('layout');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Components', href: '/components' },
    { label: 'Showcase' }
  ];

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const simulateOverlay = () => {
    setShowLoadingOverlay(true);
    setTimeout(() => setShowLoadingOverlay(false), 3000);
  };

  const renderLayoutSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Layout Components</h3>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Header Component</h4>
            <p className="text-sm text-gray-600 mb-3">
              Google-style navigation header with search, notifications, and user menu
            </p>
            <div className="bg-white border rounded p-2 text-xs">
              ✅ Search functionality<br/>
              ✅ Notification dropdown<br/>
              ✅ User profile menu<br/>
              ✅ Mobile responsive
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Sidebar Component</h4>
            <p className="text-sm text-gray-600 mb-3">
              Role-based navigation sidebar with collapsible sections
            </p>
            <div className="bg-white border rounded p-2 text-xs">
              ✅ Role-based menu items<br/>
              ✅ Expandable sections<br/>
              ✅ Mobile overlay<br/>
              ✅ User info display
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Layout Wrapper</h4>
            <p className="text-sm text-gray-600 mb-3">
              Main layout component combining header and sidebar
            </p>
            <div className="bg-white border rounded p-2 text-xs">
              ✅ Responsive design<br/>
              ✅ Auto user detection<br/>
              ✅ Mobile menu handling
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLoadingSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Loading Components</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">Loading Spinners</h4>
            
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded">
              <LoadingSpinner size="sm" />
              <LoadingSpinner size="md" />
              <LoadingSpinner size="lg" />
              <LoadingSpinner size="xl" />
            </div>

            <div className="space-y-2">
              <LoadingSpinner size="md" color="blue" text="Loading data..." />
              <LoadingSpinner size="md" color="green" text="Processing..." />
              <LoadingSpinner size="md" color="red" text="Error occurred" />
            </div>

            <div className="space-y-2">
              <button
                onClick={simulateLoading}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? <ButtonSpinner /> : 'Test Button Loading'}
              </button>

              <button
                onClick={simulateOverlay}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Show Loading Overlay
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Skeleton Loaders</h4>
            <SkeletonCard />
            <div className="mt-4">
              <h5 className="text-sm font-medium mb-2">Table Skeleton</h5>
              <SkeletonTable rows={3} columns={3} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModalSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Modal Components</h3>
        
        <div className="space-y-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Open Modal
            </button>
            
            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Confirm Dialog
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Modal Features</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Multiple sizes (sm, md, lg, xl, full)</li>
              <li>✅ Keyboard navigation (ESC to close)</li>
              <li>✅ Click outside to close</li>
              <li>✅ Focus management</li>
              <li>✅ Confirmation dialogs</li>
              <li>✅ Custom styling support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNavigationSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Navigation Components</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Breadcrumb Navigation</h4>
            <Breadcrumb items={breadcrumbItems} />
            
            <div className="mt-4 bg-gray-50 p-3 rounded text-sm">
              <strong>Features:</strong> Auto-generation from URL, custom separators, hover effects
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Pagination</h4>
            <Pagination
              currentPage={currentPage}
              totalPages={10}
              totalItems={95}
              itemsPerPage={10}
              onPageChange={setCurrentPage}
              showInfo={true}
              showSizeSelector={true}
            />
            
            <div className="mt-4">
              <h5 className="font-medium mb-2">Simple Pagination</h5>
              <SimplePagination
                currentPage={currentPage}
                totalPages={5}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderErrorSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Error Handling</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-3">Error Fallback</h4>
            <ErrorFallback 
              error={{ message: "This is a sample error message" }}
              resetError={() => console.log('Reset error')}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Error Boundary Features</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Catches JavaScript errors in component tree</li>
              <li>✅ Shows user-friendly error messages</li>
              <li>✅ Development mode shows detailed error info</li>
              <li>✅ Provides recovery options</li>
              <li>✅ Prevents entire app crashes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFormsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Form Components</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setShowLoginForm(true)}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <h4 className="font-medium text-blue-600">LoginForm</h4>
            <p className="text-sm text-gray-600 mt-1">User authentication form</p>
          </button>
          
          <button
            onClick={() => setShowProjectForm(true)}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <h4 className="font-medium text-blue-600">ProjectForm</h4>
            <p className="text-sm text-gray-600 mt-1">Project creation/editing</p>
          </button>
          
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="font-medium text-gray-600">Other Forms</h4>
            <p className="text-sm text-gray-500 mt-1">Register, Ticket, User, Bug, Sprint</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Form Features</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✅ Comprehensive validation with error messages</li>
            <li>✅ Loading states and API integration</li>
            <li>✅ Responsive design with Tailwind CSS</li>
            <li>✅ Role-based field visibility</li>
            <li>✅ File upload support (Bug forms)</li>
            <li>✅ Date/time pickers and dropdowns</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderKanbanSection = () => {
    const sampleTickets = [
      { id: 1, title: 'Sample Task 1', status: 'open', priority: 'high', type: 'feature', assignee: { firstName: 'John', lastName: 'Doe' }, estimatedHours: 8 },
      { id: 2, title: 'Sample Task 2', status: 'in_progress', priority: 'medium', type: 'bug', assignee: { firstName: 'Jane', lastName: 'Smith' }, estimatedHours: 4 }
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Kanban Components</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Kanban Filters</h4>
              <KanbanFilters 
                onFiltersChange={() => {}}
                assignees={[{ _id: '1', firstName: 'John', lastName: 'Doe' }]}
              />
            </div>

            <div>
              <h4 className="font-medium mb-3">Sample Kanban Cards</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sampleTickets.map(ticket => (
                  <KanbanCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Kanban Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Drag and drop functionality</li>
                <li>✅ Real-time filtering and search</li>
                <li>✅ Priority and type indicators</li>
                <li>✅ Assignee avatars and due dates</li>
                <li>✅ Column statistics and summaries</li>
                <li>✅ Responsive board layout</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboardsSection = () => {
    const sampleChartData = [
      { label: 'Open', value: 12 },
      { label: 'In Progress', value: 8 },
      { label: 'Testing', value: 5 },
      { label: 'Done', value: 25 }
    ];

    const sampleActivities = [
      { id: 1, user: { firstName: 'John', lastName: 'Doe' }, action: 'created', target: 'New Project', timestamp: new Date() },
      { id: 2, user: { firstName: 'Jane', lastName: 'Smith' }, action: 'updated', target: 'Bug Report #123', timestamp: new Date(Date.now() - 3600000) }
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Dashboard Components</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Statistics Cards</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard variant="users" count={156} />
                <StatsCard variant="projects" count={23} />
                <StatsCard variant="tickets" count={89} />
                <StatsCard variant="bugs" count={12} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Recent Activity</h4>
                <RecentActivity activities={sampleActivities} />
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Task Summary</h4>
                <TaskSummary className="h-96" />
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Chart Widgets</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartWidget 
                  title="Ticket Status Distribution" 
                  data={sampleChartData} 
                  type="pie" 
                  height="250px"
                />
                <ChartWidget 
                  title="Monthly Progress" 
                  data={sampleChartData} 
                  type="bar" 
                  height="250px"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Dashboard Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Real-time statistics with loading states</li>
                <li>✅ Interactive charts (bar, line, pie)</li>
                <li>✅ Recent activity feeds with icons</li>
                <li>✅ Task summaries with progress tracking</li>
                <li>✅ Responsive grid layouts</li>
                <li>✅ Error handling and empty states</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTablesSection = () => {
    const sampleUsers = [
      { _id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'developer', department: 'Engineering', status: 'active', createdAt: new Date(), lastLogin: new Date() },
      { _id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', role: 'manager', department: 'Engineering', status: 'active', createdAt: new Date(), lastLogin: new Date() }
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Table Components</h3>
          
          <div className="space-y-8">
            <div>
              <h4 className="font-medium mb-3">User Table</h4>
              <UserTable 
                showActions={false}
                selectable={false}
                className="max-h-64 overflow-hidden"
              />
            </div>

            <div>
              <h4 className="font-medium mb-3">Generic Data Table</h4>
              <DataTable
                data={sampleUsers}
                columns={[
                  { key: 'firstName', title: 'First Name' },
                  { key: 'lastName', title: 'Last Name' },
                  { key: 'email', title: 'Email' },
                  { key: 'role', title: 'Role', type: 'badge' }
                ]}
                pagination={false}
                className="max-h-48"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Table Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Sortable columns with visual indicators</li>
                <li>✅ Global search and filtering</li>
                <li>✅ Row selection with bulk actions</li>
                <li>✅ Pagination with page size options</li>
                <li>✅ Custom cell renderers and badges</li>
                <li>✅ Loading states and error handling</li>
                <li>✅ Responsive design with horizontal scroll</li>
                <li>✅ Specialized tables for Users, Projects, Tickets</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUISection = () => {
    const sampleOptions = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' }
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">UI Building Blocks</h3>
          
          <div className="space-y-8">
            {/* Buttons */}
            <div>
              <h4 className="font-medium mb-3">Buttons</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                <PrimaryButton>Primary</PrimaryButton>
                <SecondaryButton>Secondary</SecondaryButton>
                <Button variant="success">Success</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>

            {/* Inputs */}
            <div>
              <h4 className="font-medium mb-3">Input Fields</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Basic Input"
                  placeholder="Enter text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <SearchInput
                  label="Search Input"
                  placeholder="Search..."
                />
                <Input
                  label="Input with Error"
                  placeholder="Error state"
                  error="This field is required"
                />
                <Input
                  label="Input with Help"
                  placeholder="With helper text"
                  helperText="This is helper text"
                />
              </div>
            </div>

            {/* Select */}
            <div>
              <h4 className="font-medium mb-3">Select Dropdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Basic Select"
                  options={sampleOptions}
                  value={selectValue}
                  onChange={setSelectValue}
                  placeholder="Choose an option"
                />
                <Select
                  label="Searchable Select"
                  options={sampleOptions}
                  searchable
                  placeholder="Search options"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div>
              <h4 className="font-medium mb-3">Checkboxes & Switches</h4>
              <div className="space-y-3">
                <Checkbox
                  checked={checkboxValue}
                  onChange={(e) => setCheckboxValue(e.target.checked)}
                  label="Basic Checkbox"
                  description="This is a description for the checkbox"
                />
                <Checkbox
                  checked={true}
                  label="Checked State"
                  color="green"
                />
                <Checkbox
                  checked={false}
                  disabled
                  label="Disabled Checkbox"
                />
              </div>
            </div>

            {/* Badges */}
            <div>
              <h4 className="font-medium mb-3">Badges</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge>Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status="active" />
                <PriorityBadge priority="high" />
                <Badge variant="primary" removable onRemove={() => console.log('Removed')}>Removable</Badge>
              </div>
            </div>

            {/* Tooltips */}
            <div>
              <h4 className="font-medium mb-3">Tooltips</h4>
              <div className="flex flex-wrap gap-4">
                <Tooltip content="This is a tooltip">
                  <Button variant="outline">Hover me</Button>
                </Tooltip>
                <InfoTooltip content="This provides additional information">
                  Information with icon
                </InfoTooltip>
                <Tooltip content="Click tooltip" trigger="click">
                  <Button variant="outline">Click me</Button>
                </Tooltip>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">UI Component Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Consistent design system with multiple variants</li>
                <li>✅ Comprehensive form controls with validation</li>
                <li>✅ Accessible components with proper ARIA labels</li>
                <li>✅ Responsive design and mobile-friendly</li>
                <li>✅ Loading states and disabled states</li>
                <li>✅ Customizable colors, sizes, and styles</li>
                <li>✅ Specialized components for common use cases</li>
                <li>✅ Interactive tooltips and confirmation dialogs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Component Showcase</h1>
          <p className="text-gray-600">Google-style UI components built with Tailwind CSS</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'layout', label: 'Layout' },
              { id: 'loading', label: 'Loading' },
              { id: 'modals', label: 'Modals' },
              { id: 'navigation', label: 'Navigation' },
              { id: 'errors', label: 'Error Handling' },
              { id: 'forms', label: 'Forms' },
              { id: 'kanban', label: 'Kanban' },
              { id: 'dashboards', label: 'Dashboards' },
              { id: 'tables', label: 'Tables' },
              { id: 'ui', label: 'UI Components' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'layout' && renderLayoutSection()}
          {activeTab === 'loading' && renderLoadingSection()}
          {activeTab === 'modals' && renderModalSection()}
          {activeTab === 'navigation' && renderNavigationSection()}
          {activeTab === 'errors' && renderErrorSection()}
          {activeTab === 'forms' && renderFormsSection()}
          {activeTab === 'kanban' && renderKanbanSection()}
          {activeTab === 'dashboards' && renderDashboardsSection()}
          {activeTab === 'tables' && renderTablesSection()}
          {activeTab === 'ui' && renderUISection()}
        </div>

        {/* Modals */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Sample Modal"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              This is a sample modal dialog. It demonstrates the modal component with:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Responsive design</li>
              <li>Keyboard navigation</li>
              <li>Click outside to close</li>
              <li>Smooth animations</li>
            </ul>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </Modal>

        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => console.log('Confirmed!')}
          title="Confirm Action"
          message="Are you sure you want to proceed with this action? This cannot be undone."
          type="danger"
          confirmText="Delete"
          cancelText="Cancel"
        />

        <LoadingOverlay isVisible={showLoadingOverlay} text="Processing your request..." />
        
        {/* Form Modals */}
        <Modal
          isOpen={showLoginForm}
          onClose={() => setShowLoginForm(false)}
          title="Login Form Demo"
          size="md"
        >
          <LoginForm onSuccess={() => setShowLoginForm(false)} />
        </Modal>

        <Modal
          isOpen={showProjectForm}
          onClose={() => setShowProjectForm(false)}
          title="Project Form Demo"
          size="lg"
        >
          <ProjectForm onSuccess={() => setShowProjectForm(false)} />
        </Modal>
      </div>
    </ErrorBoundary>
  );
};

export default ComponentShowcase;
