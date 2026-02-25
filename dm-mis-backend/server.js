require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors'); 
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const disasterRoutes = require('./routes/disaster.routes');

// Check for required environment variables
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error('FATAL ERROR: MONGO_URI and JWT_SECRET must be defined in .env file');
  process.exit(1);
}

const app = express();
app.use(cors()); 
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/disasters', disasterRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;

// Connect to MongoDB with timeout and retry options
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  dbName: 'dm-mis'
})
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });