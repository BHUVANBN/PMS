# Database Seeding Scripts

This directory contains scripts for seeding initial data into the database.

## Admin Seeding

The `seed-admin.js` script creates the initial admin user for the system.

### Prerequisites

- MongoDB connection configured in your `.env` file
- Node.js environment set up
- All dependencies installed (`npm install`)

### Usage

1. **Make sure your MongoDB is running and accessible**

2. **Run the seeding script:**
   ```bash
   npm run seed:admin
   ```

3. **Follow the interactive prompts:**
   - Enter admin first name
   - Enter admin last name
   - Enter admin username
   - Enter admin email
   - Enter admin password (min 6 characters)

### What it does

- ✅ Connects to your MongoDB database
- ✅ Checks if an admin user already exists
- ✅ If no admin exists, creates one with the provided details
- ✅ Hashes the password securely using bcrypt
- ✅ Provides feedback on success/failure

### Example Output

```
🚀 Starting Admin Seeding Process...

✅ Connected to database

📝 No admin user found. Let's create one!

Enter admin first name: John
Enter admin last name: Admin
Enter admin username: admin
Enter admin email: admin@company.com
Enter admin password (min 6 characters):

🔐 Creating admin user...

✅ Admin user created successfully!
📋 Admin Details:
   Username: admin
   Email: admin@company.com
   Role: admin
   Full Name: John Admin
   Created: 2024-01-15T10:30:00.000Z

🎉 Admin seeding completed successfully!
💡 You can now login with the admin credentials at: /api/auth/login
🔑 Use the admin credentials to create HR users and manage the system.
```

### Security Notes

- The admin password is hashed using bcrypt with 10 salt rounds
- The script validates email format and password length
- If an admin already exists, the script will show existing details and exit

### Troubleshooting

**Connection Issues:**
- Ensure MongoDB is running
- Check your `.env` file has correct database connection string
- Verify network connectivity to your database

**Permission Issues:**
- Ensure you have write permissions to the database
- Check database user credentials in your connection string

**Script Errors:**
- Make sure all dependencies are installed: `npm install`
- Ensure you're running the script from the backend directory
- Check Node.js version compatibility (ES modules support required)
