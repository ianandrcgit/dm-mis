const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const { createDisaster, getDisasters, updateDisasterStatus } = require('../controllers/disaster.controller');
const { protect, authorizeRoles } = require('../middleware/auth.middleware');

const UPLOADS_DIR = 'uploads/';

// Ensure the uploads directory exists, creating it if necessary.
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
  }
} catch (err) {
  console.error(`❌ Could not create uploads directory at '${UPLOADS_DIR}'. Please check permissions.`, err);
  process.exit(1); // Exit if we can't create the directory, as file uploads will fail.
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Protect all routes in this file
router.use(protect);

router.route('/')
  .get(getDisasters)
  .post(authorizeRoles('VILLAGE_OFFICER'), upload.single('photo'), createDisaster);

router.patch('/:id/status', updateDisasterStatus);

module.exports = router;
