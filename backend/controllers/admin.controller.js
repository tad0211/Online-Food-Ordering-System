const Order = require('../models/Order');
const FoodItem = require('../models/FoodItem');
const Category = require('../models/Category');

// Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await Order.getDashboardStats();
    return res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching stats' });
  }
};

// Orders Management
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.getAllWithDetails();
    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('Error fetching admin orders list:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching orders list' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid status: Placed, Preparing, Out for Delivery, Delivered, Cancelled' });
  }

  try {
    const updated = await Order.updateStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    return res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ success: false, message: 'Server error updating status' });
  }
};

// Food Items CRUD
exports.addFoodItem = async (req, res) => {
  const { name, description, price, category_id } = req.body;

  if (!name || !price || !category_id) {
    return res.status(400).json({ success: false, message: 'Please provide name, price, and category_id' });
  }

  try {
    let imageUrl = req.body.image_url || '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const newItem = await FoodItem.create({
      name,
      description,
      price: parseFloat(price),
      image_url: imageUrl,
      category_id: parseInt(category_id, 10)
    });

    return res.status(201).json({ success: true, message: 'Food item added successfully', item: newItem });
  } catch (error) {
    console.error('Error adding food item:', error);
    return res.status(500).json({ success: false, message: 'Server error adding food item' });
  }
};

exports.updateFoodItem = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category_id, is_available } = req.body;

  if (!name || !price || !category_id) {
    return res.status(400).json({ success: false, message: 'Please provide name, price, and category_id' });
  }

  try {
    const existingItem = await FoodItem.findById(id);
    if (!existingItem) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    let imageUrl = existingItem.image_url;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.image_url !== undefined) {
      imageUrl = req.body.image_url;
    }

    const updated = await FoodItem.update(id, {
      name,
      description,
      price: parseFloat(price),
      image_url: imageUrl,
      category_id: parseInt(category_id, 10),
      is_available
    });

    return res.json({ success: true, message: 'Food item updated successfully', item: updated });
  } catch (error) {
    console.error('Error updating food item:', error);
    return res.status(500).json({ success: false, message: 'Server error updating food item' });
  }
};

exports.deleteFoodItem = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await FoodItem.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }
    return res.json({ success: true, message: 'Food item deleted successfully' });
  } catch (error) {
    console.error('Error deleting food item:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting food item' });
  }
};

// Categories CRUD
exports.addCategory = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Please provide category name' });
  }

  try {
    let imageUrl = req.body.image_url || '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const newCategory = await Category.create({ name, image_url: imageUrl });
    return res.status(201).json({ success: true, message: 'Category added successfully', category: newCategory });
  } catch (error) {
    console.error('Error adding category:', error);
    return res.status(500).json({ success: false, message: 'Server error adding category' });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Please provide category name' });
  }

  try {
    const existing = await Category.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    let imageUrl = existing.image_url;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.image_url !== undefined) {
      imageUrl = req.body.image_url;
    }

    const updated = await Category.update(id, { name, image_url: imageUrl });
    return res.json({ success: true, message: 'Category updated successfully', category: updated });
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({ success: false, message: 'Server error updating category' });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Category.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    return res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting category' });
  }
};
