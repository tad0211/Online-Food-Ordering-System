const db = require('../config/db');

const Order = {
  async create({ user_id, total_amount, delivery_address, items }) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Insert into orders table
      const [orderResult] = await conn.execute(
        'INSERT INTO orders (user_id, total_amount, delivery_address, status) VALUES (?, ?, ?, ?)',
        [user_id, total_amount, delivery_address, 'Placed']
      );

      const orderId = orderResult.insertId;

      // 2. Insert into order_items table for each item
      for (const item of items) {
        // item should have food_item_id, quantity, price
        await conn.execute(
          'INSERT INTO order_items (order_id, food_item_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.food_item_id, item.quantity, item.price]
        );
      }

      await conn.commit();
      return { id: orderId, user_id, total_amount, delivery_address, status: 'Placed', items };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  async findByUserId(userId) {
    const [rows] = await db.execute(`
      SELECT o.*, 
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS item_count 
      FROM orders o 
      WHERE o.user_id = ? 
      ORDER BY o.created_at DESC
    `, [userId]);
    return rows;
  },

  async findById(id) {
    const [orders] = await db.execute(`
      SELECT o.*, u.name AS user_name, u.email AS user_email 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      WHERE o.id = ?
    `, [id]);
    
    if (orders.length === 0) return null;
    const order = orders[0];

    const [items] = await db.execute(`
      SELECT oi.*, f.name AS food_name, f.image_url 
      FROM order_items oi 
      LEFT JOIN food_items f ON oi.food_item_id = f.id 
      WHERE oi.order_id = ?
    `, [id]);

    order.items = items;
    return order;
  },

  async getAllWithDetails() {
    const [orders] = await db.execute(`
      SELECT o.*, u.name AS user_name, u.email AS user_email 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `);

    // Let's attach item summaries or counts
    for (let order of orders) {
      const [items] = await db.execute(`
        SELECT oi.*, f.name AS food_name 
        FROM order_items oi 
        LEFT JOIN food_items f ON oi.food_item_id = f.id 
        WHERE oi.order_id = ?
      `, [order.id]);
      order.items = items;
    }
    return orders;
  },

  async updateStatus(id, status) {
    const [result] = await db.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  },

  async getDashboardStats() {
    // 1. Total Orders
    const [[{ totalOrders }]] = await db.execute('SELECT COUNT(*) AS totalOrders FROM orders');
    
    // 2. Total Revenue (sum of total_amount for orders that are not cancelled)
    const [[{ totalRevenue }]] = await db.execute('SELECT COALESCE(SUM(total_amount), 0) AS totalRevenue FROM orders WHERE status != "Cancelled"');
    
    // 3. Active Users (count of users who placed at least one order)
    const [[{ activeUsers }]] = await db.execute('SELECT COUNT(DISTINCT user_id) AS activeUsers FROM orders');
    
    // 4. Popular Items (top 5 food items by quantity sold)
    const [popularItems] = await db.execute(`
      SELECT f.name, SUM(oi.quantity) AS total_quantity 
      FROM order_items oi 
      JOIN food_items f ON oi.food_item_id = f.id 
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != "Cancelled"
      GROUP BY oi.food_item_id, f.name 
      ORDER BY total_quantity DESC 
      LIMIT 5
    `);

    // 5. Monthly Sales chart data (last 6 months or 7 days)
    // Let's get daily sales for the last 7 days or monthly sales for chart
    const [salesHistory] = await db.execute(`
      SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS date, SUM(total_amount) AS revenue, COUNT(*) AS count
      FROM orders
      WHERE status != "Cancelled" AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
      ORDER BY date ASC
    `);

    return {
      totalOrders,
      totalRevenue: parseFloat(totalRevenue),
      activeUsers,
      popularItems,
      salesHistory
    };
  }
};

module.exports = Order;
