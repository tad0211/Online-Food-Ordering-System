const db = require('../config/db');

const User = {
  async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await db.execute('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  async create({ name, email, password, role = 'user' }) {
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    return { id: result.insertId, name, email, role };
  }
};

module.exports = User;
