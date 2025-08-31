// userSchema.models.js
import mongoose from 'mongoose';

// Define the different roles (job types) that users can have in the system
// Each role determines what permissions and access level a user has
const USER_ROLES = {
  ADMIN: 'admin', 
  HR: 'hr' ,         // Full system access, can manage everything and everyone
  MANAGER: 'manager',      // Can oversee projects and teams, manage assignments
  DEVELOPER: 'developer',  // Can work on coding tasks and development tickets
  TESTER: 'tester',       // Can test software and report bugs/issues
  EMPLOYEE: 'employee' ,
  MARKETING: 'marketing' ,
  SALES: 'sales' ,
  INTERN: 'intern'
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
    default: USER_ROLES.EMPLOYEE         // If not specified, defaults to basic 'employee' role
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
  }]
}, {
  // Additional schema options
  timestamps: true  // Automatically adds 'createdAt' and 'updatedAt' fields to track account creation and modifications
});

// Note: username and email indexes are automatically created by unique: true constraint
// Index for quickly finding users by their role (useful for getting all managers, developers, etc.)
userSchema.index({ role: 1 });

// Index for quickly finding users who have tickets assigned to them
userSchema.index({ 'assignedTickets.projectId': 1 });

// Export the schema and role constants so other files can use them
export{
  userSchema,     // The database structure definition for user accounts
  USER_ROLES      // The possible role values that can be assigned to users
};

// Note: This schema handles basic user information, authentication, and work assignments
// The assignedTickets field creates a direct link between users and their current workload
// For additional project relationships, other schemas will also reference
// users by their unique ID to link them to sprints, standups, and project teams