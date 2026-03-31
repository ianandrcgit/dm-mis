const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isHashed = user.password.startsWith('$2') && user.password.length === 60;
    let isPasswordValid = false;

    if (isHashed) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Support legacy records that were stored before password hashing was enforced.
      isPasswordValid = password === user.password;

      if (isPasswordValid) {
        user.password = password;
        await user.save();
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({ success: true, token, user: userResponse });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
