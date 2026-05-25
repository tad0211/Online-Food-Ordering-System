const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  addFoodItem,
  updateFoodItem,
  deleteFoodItem,
  addCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/admin.controller');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, PNG, WEBP, GIF) are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// Guard all admin routes with authentication and role protection
router.use(protect);
router.use(isAdmin);

// Dashboard Statistics
router.get('/stats', getDashboardStats);

// Orders List & Operations
router.get('/orders', getAllOrders);
router.put('/orders/:id', updateOrderStatus);

// Food Items Management
router.post('/items', upload.single('image'), addFoodItem);
router.put('/items/:id', upload.single('image'), updateFoodItem);
router.delete('/items/:id', deleteFoodItem);

// Categories Management
router.post('/categories', upload.single('image'), addCategory);
router.put('/categories/:id', upload.single('image'), updateCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;
