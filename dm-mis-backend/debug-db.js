require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User.model');

const debug = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'dm-mis' });
    
    // Find the admin user
    const user = await User.findOne({ email: "admin@karnataka.gov.in" });
    
    if (!user) {
      console.log('❌ User not found in database');
      process.exit();
    }
    
    console.log('\n===== DATABASE DEBUG =====');
    console.log('User found:', user.email);
    console.log('Stored password hash:', user.password);
    console.log('Password hash length:', user.password.length);
    console.log('Name:', user.name);
    console.log('Role:', user.role);
    
    // Test bcrypt compare
    console.log('\n===== TESTING PASSWORD COMPARISON =====');
    const testPassword = 'admin_password_123';
    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log('Testing password:', testPassword);
    console.log('Does it match?:', isMatch);
    
    if (!isMatch) {
      const isHashed = user.password.startsWith('$2') && user.password.length === 60;
      console.log('\n⚠️  Password does not match!');
      if (!isHashed) {
        console.log('The password in the database appears to be stored as plain text, not a hash.');
      } else {
        console.log('The password in the database is hashed, but does not match the expected password.');
      }
      console.log('Attempting to hash and update the password...');
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testPassword, salt);
      
      await User.updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword } }
      );
      console.log('✅ Password has been hashed and updated successfully.');
      console.log('You should now be able to log in with the test credentials.');
    }
    
    process.exit();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit();
  }
};

debug();
