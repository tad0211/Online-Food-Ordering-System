const FoodItem = require('../models/FoodItem');
const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();
    return res.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching categories' });
  }
};

exports.getFoodItems = async (req, res) => {
  const { category, search } = req.query;

  try {
    let items;
    if (category) {
      items = await FoodItem.findByCategory(category);
    } else if (search) {
      items = await FoodItem.search(search);
    } else {
      items = await FoodItem.getAll();
    }
    return res.json({ success: true, count: items.length, items });
  } catch (error) {
    console.error('Error fetching food items:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching food items' });
  }
};

exports.getFoodItemById = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await FoodItem.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }
    return res.json({ success: true, item });
  } catch (error) {
    console.error('Error fetching food item details:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching food item details' });
  }
};
