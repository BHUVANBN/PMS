#!/usr/bin/env node

/**
 * Backend Server Startup Script
 * This script helps identify and fix common startup issues
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting PMS Backend Server...\n');

// Check if .env file exists
if (!fs.existsSync('.env')) {
    console.error('❌ Error: .env file not found!');
    console.log('📝 Please create a .env file with the following variables:');
    console.log(`
MONGODB=mongodb://localhost:27017/pms
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
    `);
    process.exit(1);
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing dependencies...');
    const npmInstall = spawn('npm', ['install'], { stdio: 'inherit' });
    
    npmInstall.on('close', (code) => {
        if (code !== 0) {
            console.error('❌ Failed to install dependencies');
            process.exit(1);
        }
        startServer();
    });
} else {
    startServer();
}

function startServer() {
    console.log('🔧 Starting server with nodemon...\n');
    
    const server = spawn('npm', ['run', 'dev'], { 
        stdio: 'inherit',
        env: { ...process.env, FORCE_COLOR: '1' }
    });
    
    server.on('error', (err) => {
        console.error('❌ Failed to start server:', err.message);
        console.log('\n🔧 Troubleshooting tips:');
        console.log('1. Make sure MongoDB is running');
        console.log('2. Check your .env file configuration');
        console.log('3. Verify all dependencies are installed');
        console.log('4. Check if port 5000 is available');
    });
    
    server.on('close', (code) => {
        if (code !== 0) {
            console.log(`\n❌ Server exited with code ${code}`);
        }
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down server...');
        server.kill('SIGINT');
        process.exit(0);
    });
}
