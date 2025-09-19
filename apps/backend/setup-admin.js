#!/usr/bin/env node

/**
 * Admin User Setup Script
 * Creates an admin user for the cryptographic authentication system
 *
 * Usage: node setup-admin.js [email] [username] [name]
 */

const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function setupAdmin() {
  try {
    console.log('🔐 Admin User Setup for Cryptographic Authentication');
    console.log('==================================================\n');

    // SECURITY CHECKS
    console.log('🔒 Performing security checks...\n');

    // Check if running in production
    const NODE_ENV = process.env.NODE_ENV || 'development';
    if (NODE_ENV === 'production') {
      console.log('❌ Cannot run admin setup in production environment');
      console.log('   This script is for development/local setup only.');
      process.exit(1);
    }

    // Check for setup token (environment variable)
    const SETUP_TOKEN = process.env.ADMIN_SETUP_TOKEN;
    if (!SETUP_TOKEN) {
      console.log('❌ ADMIN_SETUP_TOKEN environment variable is required');
      console.log('   Set ADMIN_SETUP_TOKEN in your .env file for security.');
      console.log('   Example: ADMIN_SETUP_TOKEN=your-secure-token-here');
      process.exit(1);
    }

    // Parse command line arguments
    const [,, email, username, name, providedToken] = process.argv;

    if (!email) {
      console.log('\nUsage: node setup-admin.js <email> [username] [name] <setup-token>');
      console.log('Example: node setup-admin.js admin@example.com admin "Admin User" your-token');
      console.log('\nSecurity Requirements:');
      console.log('• Must set ADMIN_SETUP_TOKEN');
      console.log('• Must provide the token as the last argument');
      console.log('• Can only run in development/local environments');
      process.exit(1);
    }

    if (!email.includes('@')) {
      console.log('❌ Invalid email address');
      process.exit(1);
    }

    // Verify setup token
    if (!providedToken) {
      console.log('❌ Setup token is required as the last argument');
      process.exit(1);
    }

    if (providedToken !== SETUP_TOKEN) {
      console.log('❌ Invalid setup token');
      process.exit(1);
    }

    console.log('✅ Security checks passed\n');

    // Connect to database
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:example@localhost:27017/myBlog?authSource=admin';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check for existing admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  An admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Username: ${existingAdmin.username || 'Not set'}`);
      console.log(`   Has Public Key: ${existingAdmin.publicKey ? 'Yes' : 'No'}\n`);
      console.log('⚠️  Only one admin user is supported. Delete existing admin first if needed.');
      process.exit(0);
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ A user with this email already exists');
      process.exit(1);
    }

    // Create admin user (without password for cryptographic auth)
    const adminUser = new User({
      email: email.toLowerCase(),
      username: username || undefined,
      name: name || undefined,
      role: 'admin',
      publicKey: '', // Empty public key initially - will be set during key generation
      permissions: ['read', 'write', 'delete', 'admin', 'api_access']
    });

    await adminUser.save();

    console.log('\n✅ Admin user created successfully!');
    console.log('=====================================');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Username: ${adminUser.username || 'Not set'}`);
    console.log(`Name: ${adminUser.name || 'Not set'}`);
    console.log(`Role: ${adminUser.role}`);
    console.log(`Permissions: ${adminUser.permissions.join(', ')}`);
    console.log(`User ID: ${adminUser._id}`);
    console.log('\n🔑 Next Steps:');
    console.log('1. Start the application:');
    console.log('   cd apps/backend && npm start');
    console.log('   cd apps/frontend && npm run dev');
    console.log('2. Open http://localhost:3000/admin/login');
    console.log('3. The system will detect no keys and redirect you to setup');
    console.log('4. Generate your cryptographic key pair');
    console.log('5. Use the admin dashboard to manage your blog\n');

    console.log('🔐 Security Notes:');
    console.log('• Private keys are stored securely in your browser');
    console.log('• Never share your private key or backup codes');
    console.log('• Use the key export feature for secure backups');
    console.log('• Enable MFA for additional security\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

setupAdmin();
