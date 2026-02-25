const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("===== LOGIN ATTEMPT =====");
  console.log("Email:", email);
  
  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password.' });
    }
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Security Check: Ensure the stored password is a hash and not plain text.
    const isHashed = user.password.startsWith('$2') && user.password.length === 60;
    if (!isHashed) {
      console.error("❌ CRITICAL SECURITY: The password for this user is not hashed!");
      console.error("   - Stored value:", `"${user.password}"`);
      return res.status(500).json({ success: false, message: 'Server configuration error: Insecure user credential storage.' });
    }

    // Compare hashed password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("❌ Password does not match");
      console.log("   - Stored hash:      ", `"${user.password}"`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    console.log("✅ Login Successful");

    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    // Exclude password from the response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ success: true, token, user: userResponse });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};