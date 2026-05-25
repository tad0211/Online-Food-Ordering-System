const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, getOrderById } = require('../controllers/order.controller');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Guard all order routes

router.post('/', createOrder);
router.get('/my', getUserOrders);
router.get('/:id', getOrderById);

module.exports = router;
