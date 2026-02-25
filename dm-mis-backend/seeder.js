const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User.model');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  dbName: 'dm-mis'
});

// The Admin user to be created
const adminUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'password123',
  role: 'ADMIN',
  hierarchy: {} // Admin has no hierarchy restrictions
};

// Import into DB
const importData = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (existingAdmin) {
      console.log('Admin user already exists. Aborting.');
      process.exit();
    }

    await User.create(adminUser);
    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: ${adminUser.password}`);
    process.exit();
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await User.deleteMany();
    console.log('Data Destroyed...');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  deleteData();
} else {
  importData();
}