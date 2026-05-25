const db = require('../config/db');

const Category = {
  async getAll() {
    const [rows] = await db.execute('SELECT * FROM categories ORDER BY id ASC');
    return rows;
  },

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0];
  },

  async create({ name, image_url }) {
    const [result] = await db.execute(
      'INSERT INTO categories (name, image_url) VALUES (?, ?)',
      [name, image_url || null]
    );
    return { id: result.insertId, name, image_url };
  },

  async update(id, { name, image_url }) {
    await db.execute(
      'UPDATE categories SET name = ?, image_url = ? WHERE id = ?',
      [name, image_url || null, id]
    );
    return { id, name, image_url };
  },

  async delete(id) {
    const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Category;
