// userSchema.models.js
import mongoose from 'mongoose';

// Define the different roles (job types) that users can have in the system
// Each role determines what permissions and access level a user has
const USER_ROLES = {
  ADMIN: 'admin',          // Full system access, can create HR accounts, view organization analytics
  HR: 'hr',                // Full CRUD on employees, approve/reject leave, track standups
  MANAGER: 'manager',      // Team Manager - creates projects, assigns tickets, manages teams
  DEVELOPER: 'developer',  // Can work on coding tasks and development tickets
  TESTER: 'tester',       // Can test software and report bugs/issues
  SALES: 'sales',         // Sales team members with Sprint→Kanban workflow
  MARKETING: 'marketing', // Marketing team members with Sprint→Kanban workflow
  INTERN: 'intern'        // Intern role - same workflow as assigned role but tagged differently
};

// User status for account management
const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending'
};

const userSchema = new mongoose.Schema({
  
  // Unique identifier that the user types to log into the system
  username: {
    type: String,        // Must be text
    required: true,      // This field must be provided
    unique: true,        // No two users can have the same username
    trim: true          // Automatically removes extra spaces from beginning and end
  },
  
  // User's email address for communication and account recovery
  email: {
    type: String,        // Must be text
    required: true,      // This field must be provided
    unique: true,        // No two users can have the same email address
    lowercase: true      // Automatically converts to lowercase (john@email.com vs JOHN@EMAIL.com)
  },
  
  // User's secret password for account security
  password: {
    type: String,        // Must be text
    required: true       // This field must be provided
  }, // Note: Password should be encrypted/hashed before storing for security
  
  // The user's role/job type in the organization
  role: {
    type: String,                        // Must be text
    enum: Object.values(USER_ROLES),     // Must be one of the predefined role values
    required: true                       // Role is mandatory for proper access control
  },
  
  // For interns - specify their actual working role
  actualRole: {
    type: String,
    enum: Object.values(USER_ROLES),
    default: null  // Only used when role is 'intern'
  },
  
  // User's first name (given name)
  firstName: {
    type: String,        // Must be text
    required: true,      // This field must be provided
    trim: true          // Automatically removes extra spaces from beginning and end
  },
  
  // User's last name (family name/surname)
  lastName: {
    type: String,        // Must be text
    required: true,      // This field must be provided
    trim: true          // Automatically removes extra spaces from beginning and end
  },
  
  // Employee ID for HR management
  employeeId: {
    type: String,
    unique: true,
    sparse: true  // Allows null values while maintaining uniqueness
  },
  
  // Department/Team information
  department: {
    type: String,
    trim: true
  },
  
  // Job title
  jobTitle: {
    type: String,
    trim: true
  },
  
  // Manager/Supervisor reference
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Contact information
  phone: {
    type: String,
    trim: true
  },
  
  // Address information
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // Employment details
  dateOfJoining: {
    type: Date,
    default: Date.now
  },
  
  dateOfBirth: Date,
  
  // Leave balance tracking
  leaveBalance: {
    annualLeave: {
      type: Number,
      default: 21  // Default annual leave days
    },
    sickLeave: {
      type: Number,
      default: 10  // Default sick leave days
    },
    personalLeave: {
      type: Number,
      default: 5   // Default personal leave days
    },
    compensatoryLeave: {
      type: Number,
      default: 0   // Earned comp-off days
    }
  },
  
  // Whether the user account is currently active
  status: {
    type: String,
    enum: Object.values(USER_STATUS),
    default: USER_STATUS.ACTIVE
  },
  
  // Whether the user account is currently active (can log in and use the system)
  // This allows deactivating accounts without deleting them entirely
  isActive: {
    type: Boolean,       // Must be true or false
    default: true        // If not specified, defaults to active (true)
  },
  
  // Array of ticket references (composite keys since tickets are embedded in Project.modules.tickets)
  // This tracks all the work items/tasks that this person is responsible for
  assignedTickets: [{
    projectId: {
      type: mongoose.Schema.Types.ObjectId,   // Project ID where the module is embedded
      ref: 'Project'                          // Reference to the Project collection
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId    // Module ID within the project's modules array
    },
    ticketId: {
      type: mongoose.Schema.Types.ObjectId    // Ticket ID within the module's tickets array
    }
  }],
  
  // Teams this user belongs to
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'  // Reference to projects they're part of
  }],
  
  // Skills and expertise (useful for task assignment)
  skills: [String],
  
  // User preferences
  preferences: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      inApp: {
        type: Boolean,
        default: true
      }
    },
    dashboardLayout: {
      type: String,
      default: 'default'
    }
  },
  
  // Profile picture URL
  profilePicture: {
    type: String,
    default: null
  },
  
  // Last login tracking
  lastLogin: {
    type: Date,
    default: null
  },
  
  // Password reset token and expiry
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Account verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  emailVerificationToken: String,
  
  // Two-factor authentication
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  
  twoFactorSecret: String
}, {
  // Additional schema options
  timestamps: true  // Automatically adds 'createdAt' and 'updatedAt' fields to track account creation and modifications
});

// Note: username and email indexes are automatically created by unique: true constraint
// Index for quickly finding users by their role (useful for getting all managers, developers, etc.)
userSchema.index({ role: 1 });

// Index for quickly finding users who have tickets assigned to them
userSchema.index({ 'assignedTickets.projectId': 1 });

// Index for employee management
userSchema.index({ employeeId: 1 });
userSchema.index({ managerId: 1 });
userSchema.index({ department: 1 });
userSchema.index({ status: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual to check if user is intern
userSchema.virtual('isIntern').get(function() {
  return this.role === USER_ROLES.INTERN;
});

// Virtual to get effective role (actual role for interns, role for others)
userSchema.virtual('effectiveRole').get(function() {
  return this.role === USER_ROLES.INTERN ? this.actualRole : this.role;
});

// Export the schema and role constants so other files can use them
export {
  userSchema,     // The database structure definition for user accounts
  USER_ROLES,     // The possible role values that can be assigned to users
  USER_STATUS     // User account status options
};