const db = require('../config/db');

const FoodItem = {
  async getAll() {
    const [rows] = await db.execute(`
      SELECT f.*, c.name AS category_name 
      FROM food_items f 
      LEFT JOIN categories c ON f.category_id = c.id
      ORDER BY f.id DESC
    `);
    return rows;
  },

  async findByCategory(categoryId) {
    const [rows] = await db.execute(`
      SELECT f.*, c.name AS category_name 
      FROM food_items f 
      LEFT JOIN categories c ON f.category_id = c.id
      WHERE f.category_id = ? AND f.is_available = TRUE
      ORDER BY f.id DESC
    `, [categoryId]);
    return rows;
  },

  async findById(id) {
    const [rows] = await db.execute(`
      SELECT f.*, c.name AS category_name 
      FROM food_items f 
      LEFT JOIN categories c ON f.category_id = c.id
      WHERE f.id = ?
    `, [id]);
    return rows[0];
  },

  async create({ name, description, price, image_url, category_id }) {
    const [result] = await db.execute(
      'INSERT INTO food_items (name, description, price, image_url, category_id) VALUES (?, ?, ?, ?, ?)',
      [name, description || null, price, image_url || null, category_id]
    );
    return { id: result.insertId, name, description, price, image_url, category_id };
  },

  async update(id, { name, description, price, image_url, category_id, is_available }) {
    const isAvail = is_available === undefined ? true : (is_available === 'true' || is_available === true || is_available === 1);
    await db.execute(
      'UPDATE food_items SET name = ?, description = ?, price = ?, image_url = ?, category_id = ?, is_available = ? WHERE id = ?',
      [name, description || null, price, image_url || null, category_id, isAvail ? 1 : 0, id]
    );
    return { id, name, description, price, image_url, category_id, is_available: isAvail };
  },

  async delete(id) {
    const [result] = await db.execute('DELETE FROM food_items WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async search(query) {
    const wildcard = `%${query}%`;
    const [rows] = await db.execute(`
      SELECT f.*, c.name AS category_name 
      FROM food_items f 
      LEFT JOIN categories c ON f.category_id = c.id
      WHERE (f.name LIKE ? OR f.description LIKE ? OR c.name LIKE ?) AND f.is_available = TRUE
      ORDER BY f.id DESC
    `, [wildcard, wildcard, wildcard]);
    return rows;
  }
};

module.exports = FoodItem;
