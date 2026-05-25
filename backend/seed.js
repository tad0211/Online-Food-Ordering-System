const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'root',
};

const dbName = process.env.DB_NAME || 'online_food_system';

async function seed() {
  console.log('Starting Database Seed...');
  let connection;
  try {
    // 1. Create database if not exists
    connection = await mysql.createConnection(dbConfig);
    console.log(`Checking/Creating database: ${dbName}`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();

    // 2. Connect to the database
    connection = await mysql.createConnection({ ...dbConfig, database: dbName });
    console.log('Connected to database. Executing schema.sql...');

    // 3. Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Remove SQL comments (both block /* comments */ and line -- comments)
    const cleanSql = schemaSql
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/--.*$/gm, '');

    // Split SQL by semicolon
    const sqlStatements = cleanSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const stmt of sqlStatements) {
      await connection.query(stmt);
    }
    console.log('Schema created successfully.');

    // 4. Seed Categories
    console.log('Seeding categories...');
    const categories = [
      { name: 'Starters', image_url: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=500&auto=format&fit=crop&q=60' },
      { name: 'Main Course', image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60' },
      { name: 'Desserts', image_url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&auto=format&fit=crop&q=60' },
      { name: 'Drinks', image_url: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&auto=format&fit=crop&q=60' },
      { name: 'Fast Food', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60' }
    ];

    const categoryIdMap = {};
    for (const cat of categories) {
      const [result] = await connection.query(
        'INSERT INTO categories (name, image_url) VALUES (?, ?)',
        [cat.name, cat.image_url]
      );
      categoryIdMap[cat.name] = result.insertId;
    }
    console.log('Categories seeded:', categoryIdMap);

    // 5. Seed Users
    console.log('Seeding users...');
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const testPasswordHash = await bcrypt.hash('Test@123', 10);

    await connection.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin User', 'admin@foodsystem.com', adminPasswordHash, 'admin']
    );

    await connection.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Test User', 'user@test.com', testPasswordHash, 'user']
    );
    console.log('Users seeded (Admin & Test User).');

    // 6. Seed 20 Food Items
    console.log('Seeding food items...');
    const foodItems = [
      // Starters
      { name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices and peppers', price: 180.00, image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=60', category: 'Starters' },
      { name: 'Veg Spring Rolls', description: 'Crispy deep-fried rolls filled with shredded vegetables', price: 120.00, image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60', category: 'Starters' },
      { name: 'Chicken Wings', description: 'Spicy, tangy buffalo-style glazed chicken wings', price: 220.00, image_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=60', category: 'Starters' },
      
      // Main Course
      { name: 'Veg Biryani', description: 'Fragrant basmati rice slow cooked with garden veggies and spices', price: 200.00, image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60', category: 'Main Course' },
      { name: 'Butter Chicken', description: 'Tender chicken in a rich, creamy tomato-butter gravy', price: 280.00, image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60', category: 'Main Course' },
      { name: 'Dal Makhani', description: 'Slow-cooked black lentils and kidney beans with butter and cream', price: 160.00, image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60', category: 'Main Course' },
      { name: 'Paneer Butter Masala', description: 'Cottage cheese cubes cooked in a sweet and spicy tomato sauce', price: 220.00, image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60', category: 'Main Course' },
      { name: 'Chicken Biryani', description: 'Traditional aromatic rice layer-cooked with spiced chicken', price: 300.00, image_url: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=60', category: 'Main Course' },
      
      // Desserts
      { name: 'Gulab Jamun', description: 'Soft golden milk-solid dumplings dipped in cardamom sugar syrup', price: 80.00, image_url: '/uploads/gulab_jamun.png', category: 'Desserts' },
      { name: 'Rasgulla', description: 'Spongy, juicy cottage cheese balls soaked in light syrup', price: 70.00, image_url: '/uploads/rasgulla.png', category: 'Desserts' },
      { name: 'Chocolate Brownie', description: 'Warm, fudgy chocolate brownie topped with chocolate syrup', price: 150.00, image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60', category: 'Desserts' },
      { name: 'Mango Kulfi', description: 'Rich, dense, traditional Indian mango ice cream', price: 90.00, image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=60', category: 'Desserts' },
      
      // Drinks
      { name: 'Mango Lassi', description: 'Creamy yogurt drink flavored with sweet ripe mangoes', price: 80.00, image_url: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=500&auto=format&fit=crop&q=60', category: 'Drinks' },
      { name: 'Cold Coffee', description: 'Rich, blended chilled coffee with chocolate syrup drizzle', price: 100.00, image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=60', category: 'Drinks' },
      { name: 'Fresh Lime Soda', description: 'Zesty fresh lime juice mixed with chilled soda water', price: 60.00, image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60', category: 'Drinks' },
      { name: 'Masala Chai', description: 'Traditional spiced milk tea brewed with ginger and cardamom', price: 40.00, image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60', category: 'Drinks' },
      
      // Fast Food
      { name: 'Veg Burger', description: 'Crispy vegetable patty with fresh lettuce, tomato, and cheese', price: 130.00, image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60', category: 'Fast Food' },
      { name: 'Chicken Burger', description: 'Juicy grilled chicken patty with spicy mayo and cheese', price: 180.00, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60', category: 'Fast Food' },
      { name: 'French Fries', description: 'Golden, crispy potato fries lightly tossed with salt', price: 90.00, image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60', category: 'Fast Food' },
      { name: 'Pizza Margherita', description: 'Classic pizza base loaded with tomato sauce and mozzarella cheese', price: 250.00, image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=60', category: 'Fast Food' }
    ];

    for (const item of foodItems) {
      const catId = categoryIdMap[item.category];
      if (!catId) {
        console.warn(`Category not found: ${item.category} for item ${item.name}`);
        continue;
      }
      await connection.query(
        'INSERT INTO food_items (name, description, price, image_url, category_id) VALUES (?, ?, ?, ?, ?)',
        [item.name, item.description, item.price, item.image_url, catId]
      );
    }
    console.log('Seeded 20 food items.');

    console.log('Database Seeding Completed Successfully.');
  } catch (error) {
    console.error('Error during database seed:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seed();
