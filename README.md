
# BiteDash | Full-Stack Online Food Ordering System

BiteDash is a professional, fully functional, and modern online food ordering web application built using Node.js, Express, MySQL, and Vanilla Javascript. It features high-quality glassmorphism components, dark and light theme toggles, toast notifications, real-time order tracking status steppers, and a complete administrative control panel with live metric charts.

---

## 📁 Project Structure

```
OnlineFoodSystem/
├── frontend/
│   ├── index.html            # Landing page
│   ├── menu.html             # Categorized menu with search
│   ├── cart.html             # Cart management
│   ├── checkout.html         # Delivery address details
│   ├── orders.html           # Real-time order tracker
│   ├── admin/
│   │   ├── dashboard.html    # Charts & metrics counter
│   │   ├── manage-menu.html  # Items and categories CRUD forms
│   │   └── manage-orders.html # Orders listings and updates
│   ├── css/
│   │   ├── style.css         # Styling system & theme variables
│   │   ├── animations.css    # Skeleton loaders & toast entries
│   │   └── responsive.css    # Mobile responsive media queries
│   └── js/
│       ├── app.js            # Core utils (Toasts, Themes, Navbar)
│       ├── cart.js           # Cart math, totals & checkout post
│       ├── auth.js           # Login & registration forms handler
│       └── admin.js          # Admin dashboard & database actions
├── backend/
│   ├── server.js             # Express application entrypoint
│   ├── config/
│   │   └── db.js             # MySQL2 Connection pool config
│   ├── database/
│   │   └── schema.sql        # Database tables schema script
│   ├── models/               # Parameterized database query models
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── FoodItem.js
│   │   └── Order.js
│   ├── routes/               # API route maps
│   ├── controllers/          # API business logic handlers
│   ├── middleware/
│   │   └── authMiddleware.js # JWT verification & role authorization
│   ├── seed.js               # Database tables seeder & bcrypt hasher
│   └── .env                  # Configuration variables
├── package.json              # App scripts and package dependencies
└── README.md                 # Project instructions
```

---

## ⚙️ Prerequisites

To run this application, make sure you have the following installed:
- **Node.js** (v14 or higher)
- **npm** (Node Package Manager)
- **MySQL Server** (running locally or in the cloud)

---

## 🚀 Setup & Execution Instructions

Follow these steps to configure and boot the application:

### Step 1: Clone and Install Dependencies
Navigate to the project root directory and run the following command to download and install all dependencies:
```bash
npm install
```

### Step 2: Configure Environment Variables
Create or open the `backend/.env` file in the project directory. Edit the configuration with your MySQL server credentials and any custom ports or secrets:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=online_food_system
JWT_SECRET=super_secret_food_delivery_jwt_key_98765
JWT_EXPIRES_IN=7d
```

### Step 3: Initialize Database & Seed Sample Data
Ensure your MySQL server is running. Then, execute the automated seeding script. This script will:
1. Connect to your MySQL server.
2. Create the `online_food_system` database if it doesn't already exist.
3. Parse and run the `backend/database/schema.sql` file to create the tables.
4. Hash default passwords using `bcrypt`.
5. Populate the database with **5 Food Categories**, **20 Delicious Food Items** (with image references), and the default user accounts.

To run the seeder, execute:
```bash
npm run seed
```

### Step 4: Launch the Server
Start the Express server hosting both the APIs and static views:
```bash
npm start
```
*For active development with auto-reloads, you can use `npm run dev` (requires nodemon).*

Open your web browser and navigate to: **[http://localhost:5000](http://localhost:5000)**

---

## 🔐 Credentials & Default Logins

The seeding script registers two pre-hashed accounts:

### 1. Administrative Account
- **Email**: `admin@foodsystem.com`
- **Password**: `Admin@123`
- **Access**: View dashboard graphs, add/edit/delete menu dishes, manage categories, and update order statuses.

### 2. Diner Customer Account
- **Email**: `user@test.com`
- **Password**: `Test@123`
- **Access**: Browse categories, search food items, add to cart, check out with address, and view real-time tracking progress.

---

## 📡 API Endpoints List

The backend exposes the following RESTful endpoints under `/api`:

### 🔑 Authentication (`/api/auth`)
- `POST /api/auth/register` - Create a new user account.
- `POST /api/auth/login` - Validate credentials and receive JWT access token.
- `GET /api/auth/profile` - Retrieve current logged-in user profile (Protected).

### 🍔 Food & Menu (`/api/food`)
- `GET /api/food/categories` - Fetch all category categories.
- `GET /api/food/items` - Fetch all food dishes. Supports query filters `?category=id` and `?search=query`.
- `GET /api/food/items/:id` - Retrieve detailed information for a single food item.

### 🛒 Orders (`/api/orders`)
- `POST /api/orders` - Place a new order with items. Calculations for 5% GST and delivery fees are done server-side (Protected).
- `GET /api/orders/my` - Retrieve logged-in user order histories (Protected).
- `GET /api/orders/:id` - Track real-time status of a specific order (Protected, Owner or Admin).

### 🛠️ Administrative Actions (`/api/admin`) *(All endpoints require Admin role)*
- `GET /api/admin/stats` - Fetch dashboard count totals, popular items list, and sales histories.
- `GET /api/admin/orders` - View list of all orders registered in the system.
- `PUT /api/admin/orders/:id` - Update status of order (`Placed`, `Preparing`, `Out for Delivery`, `Delivered`, `Cancelled`).
- `POST /api/admin/items` - Add a new food item (Supports multipart image uploads).
- `PUT /api/admin/items/:id` - Edit a food item (Supports editing stock availability).
- `DELETE /api/admin/items/:id` - Remove a food item.
- `POST /api/admin/categories` - Add a new category (Supports category image upload).
- `DELETE /api/admin/categories/:id` - Delete a category.

---

## 📸 Screenshots

*Placeholders for user-provided screenshots demonstrating UI pages:*
- **Home / Landing Page Mockup**: Beautiful Hero image and feature sections.
- **Menu view (Light/Dark themes)**: Responsive glassmorphism menu grid.
- **Cart checkout validation**: Real-time totals and tax calculations.
- **Order Tracking Stepper**: Progress bar illustrating Placed → Delivered.
- **Admin Dashboard Charts**: Canvas graphs displaying daily revenues.
=======
# Online-Food-Ordering-System
>>>>>>> 3eb1837d6a83c200813b62779ac3d6fde8e79746
