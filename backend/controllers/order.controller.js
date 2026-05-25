const Order = require('../models/Order');
const FoodItem = require('../models/FoodItem');

exports.createOrder = async (req, res) => {
  const { delivery_address, items } = req.body;

  if (!delivery_address || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Please provide delivery address and at least one food item' });
  }

  try {
    // 1. Calculate total price on server side to prevent client tampering
    let subtotal = 0;
    const orderItemsToInsert = [];

    for (const cartItem of items) {
      const foodItem = await FoodItem.findById(cartItem.food_item_id);
      if (!foodItem) {
        return res.status(404).json({ success: false, message: `Food item with id ${cartItem.food_item_id} not found` });
      }
      if (!foodItem.is_available) {
        return res.status(400).json({ success: false, message: `${foodItem.name} is currently unavailable` });
      }
      
      const itemPrice = parseFloat(foodItem.price);
      const qty = parseInt(cartItem.quantity, 10);
      subtotal += itemPrice * qty;

      orderItemsToInsert.push({
        food_item_id: foodItem.id,
        quantity: qty,
        price: itemPrice
      });
    }

    // Tax is 5% GST
    const gstAmount = parseFloat((subtotal * 0.05).toFixed(2));
    const deliveryFee = subtotal >= 500 ? 0 : 40; // Free delivery above 500
    const finalTotal = parseFloat((subtotal + gstAmount + deliveryFee).toFixed(2));

    // 2. Write to database using model transaction
    const newOrder = await Order.create({
      user_id: req.user.id,
      total_amount: finalTotal,
      delivery_address,
      items: orderItemsToInsert
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      orderId: newOrder.id,
      totalAmount: finalTotal,
      gst: gstAmount,
      deliveryFee
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ success: false, message: 'Server error placing order' });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findByUserId(req.user.id);
    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching orders list' });
  }
};

exports.getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorization: User can only view their own orders; admins can view any order
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    return res.json({ success: true, order });
  } catch (error) {
    console.error('Error fetching order details:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching order details' });
  }
};
