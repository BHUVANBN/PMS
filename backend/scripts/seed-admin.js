#!/usr/bin/env node

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import readline from 'readline';
import { userSchema, USER_ROLES } from '../models/userschema.models.js';
import { connectDB } from '../db/connectDB.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Create readline interface for user input
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

/**
 * Prompt user for input
 */
const question = (query) => new Promise((resolve) => {
	rl.question(query, resolve);
});

/**
 * Hash password
 */
const hashPassword = async (password) => {
	const salt = await bcrypt.genSalt(10);
	return await bcrypt.hash(password, salt);
};

/**
 * Check if admin already exists
 */
const checkExistingAdmin = async () => {
	try {
		const admin = await User.findOne({ role: USER_ROLES.ADMIN });
		return admin;
	} catch (error) {
		console.error('Error checking for existing admin:', error);
		return null;
	}
};

/**
 * Create admin user
 */
const createAdminUser = async (adminData) => {
	try {
		const hashedPassword = await hashPassword(adminData.password);

		const adminUser = await User.create({
			username: adminData.username,
			email: adminData.email,
			password: hashedPassword,
			role: USER_ROLES.ADMIN,
			firstName: adminData.firstName,
			lastName: adminData.lastName,
			isActive: true
		});

		console.log('✅ Admin user created successfully!');
		console.log('📋 Admin Details:');
		console.log(`   Username: ${adminUser.username}`);
		console.log(`   Email: ${adminUser.email}`);
		console.log(`   Role: ${adminUser.role}`);
		console.log(`   Full Name: ${adminUser.firstName} ${adminUser.lastName}`);
		console.log(`   Created: ${adminUser.createdAt}`);

		return adminUser;
	} catch (error) {
		console.error('❌ Error creating admin user:', error.message);
		throw error;
	}
};

/**
 * Main seeding function
 */
const seedAdmin = async () => {
	try {
		console.log('🚀 Starting Admin Seeding Process...\n');

		// Connect to database
		await connectDB();
		console.log('✅ Connected to database\n');

		// Check if admin already exists
		const existingAdmin = await checkExistingAdmin();
		if (existingAdmin) {
			console.log('⚠️  Admin user already exists!');
			console.log('📋 Existing Admin Details:');
			console.log(`   Username: ${existingAdmin.username}`);
			console.log(`   Email: ${existingAdmin.email}`);
			console.log(`   Full Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
			console.log(`   Created: ${existingAdmin.createdAt}\n`);
			console.log('💡 If you need to reset the admin password, use the admin panel or contact support.\n');
			return;
		}

		console.log('📝 No admin user found. Let\'s create one!\n');

		// Get admin details from user input
		const adminData = {};

		adminData.firstName = await question('Enter admin first name: ');
		adminData.lastName = await question('Enter admin last name: ');
		adminData.username = await question('Enter admin username: ');
		adminData.email = await question('Enter admin email: ');

		// Password input (hidden)
		console.log('Enter admin password (min 6 characters): ');
		adminData.password = await question('');

		// Validate input
		if (!adminData.firstName || !adminData.lastName || !adminData.username || !adminData.email || !adminData.password) {
			console.log('❌ All fields are required!');
			return;
		}

		if (adminData.password.length < 6) {
			console.log('❌ Password must be at least 6 characters long!');
			return;
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(adminData.email)) {
			console.log('❌ Invalid email format!');
			return;
		}

		console.log('\n🔐 Creating admin user...\n');

		// Create admin user
		await createAdminUser(adminData);

		console.log('\n🎉 Admin seeding completed successfully!');
		console.log('💡 You can now login with the admin credentials at: /api/auth/login');
		console.log('🔑 Use the admin credentials to create HR users and manage the system.\n');

	} catch (error) {
		console.error('❌ Seeding failed:', error.message);
	} finally {
		// Close connections
		rl.close();
		mongoose.connection.close();
	}
};

/**
 * Run seeding if this script is executed directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
	seedAdmin().catch(console.error);
}

export { seedAdmin };
