const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("===== LOGIN ATTEMPT =====");
  console.log("Email:", email);
  
  try {
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
      console.log("   - Provided password:", `"${password}"`);
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

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  console.log("===== REGISTRATION ATTEMPT =====");
  console.log("Email:", email);

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ User already exists");
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create new user (password will be hashed by the pre-save hook in the model)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'STATE_ADMIN'
    });

    console.log("✅ User registered successfully");

    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    // Exclude password from the response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ success: true, message: 'User registered successfully', token, user: userResponse });
  } catch (err) {
    console.error("❌ Registration error:", err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};