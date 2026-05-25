const express = require('express');
const router = express.Router();
const { getCategories, getFoodItems, getFoodItemById } = require('../controllers/food.controller');

router.get('/categories', getCategories);
router.get('/items', getFoodItems);
router.get('/items/:id', getFoodItemById);

module.exports = router;
