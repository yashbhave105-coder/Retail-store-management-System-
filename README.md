# 🛒 Retail Store Management System

A modern, full-featured **Retail Store Management System** web application featuring dual-role **Admin** and **Customer** portals, Indian Rupee (`₹`) pricing, real-time cart engine, inventory CRUD, executive sales dashboard, and database setup scripts for PostgreSQL.

---

## 🌟 Key Features

### 👤 Unified Authentication Gateway
- Role-based authentication supporting both **Admin Login** and **Customer Login**.
- Instant **Quick Demo Fill** buttons for single-click testing.

### 🛍️ Customer Portal
- **Product Catalog**: High-res product cards with category badges, price tags in Indian Rupees (`₹`), stock status indicators (`In Stock`, `Low Stock Warning`, `Out of Stock`).
- **Category & Search Filters**: Interactive category pill filters (Electronics, Fashion & Apparel, Home & Living, Groceries & Snacks) and real-time search bar.
- **Mandatory Cart Authentication**: Guests attempting to add items to cart are automatically alerted and guided to the Sign Up / Login gateway.
- **Slide-out Shopping Cart Drawer**: Adjust quantities, view real-time totals, remove items.
- **Checkout Modal**: Shipping address input and payment selection (**UPI / GPay / PhonePe**, Credit/Debit Cards, Net Banking, Cash on Delivery).
- **Purchase History**: View active and past customer orders with live status tracking (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).

### ⚙️ Admin Management Panel
- **Executive Sales Dashboard**: High-level metric cards for **Total Sales Revenue** (in `₹`), **Total Store Orders**, **Active Products Count**, and **Low Stock Warnings**.
- **Inventory Product CRUD**: Add new products, update stock quantities, edit pricing/descriptions, or remove discontinued items.
- **Order Fulfillment Pipeline**: View all customer orders and update status in real-time.

---

## 🏗️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Design System with Glassmorphic cards, CSS Grid/Flexbox, dynamic animations, and toast notifications), ES6 JavaScript.
- **Backend**: ASP.NET Core 8 Web API (C#) with Entity Framework Core (`Npgsql.EntityFrameworkCore.PostgreSQL`) and RESTful controllers.
- **Database**: PostgreSQL with standalone DDL schema (`database/schema.sql`) and seed scripts (`database/seed.sql`).
- **Dev Engine**: Zero-setup local Node.js server (`server.js`) for instant out-of-the-box browser testing.

---

## 📁 Repository Structure

```
retail-store-management-system/
├── frontend/
│   ├── index.html            # Main SPA layout with Auth, Customer Store, Admin Dashboard
│   ├── css/
│   │   └── style.css         # Modern design system (Glassmorphism, CSS variables, dark mode header)
│   └── js/
│       ├── app.js            # Core App State & Router
│       ├── auth.js           # Authentication handler (Admin vs Customer)
│       ├── store.js          # Customer catalog, filters, shopping cart, checkout
│       └── admin.js          # Admin dashboard, product CRUD, inventory, order management
├── backend/
│   ├── RetailStore.API/
│   │   ├── Program.cs                # ASP.NET Core setup & EF Core PostgreSQL config
│   │   ├── appsettings.json          # Database connection strings
│   │   ├── Models/                   # Entity models (User, Product, Category, Order, OrderItem)
│   │   ├── Data/StoreDbContext.cs    # EF Core DbContext
│   │   └── Controllers/              # RESTful API Controllers
├── database/
│   ├── schema.sql            # PostgreSQL DDL tables & indexes
│   └── seed.sql              # Initial admin account, sample customers, categories & products
├── server.js                 # Portable Node/Express dev server for instant local preview
└── README.md
```

---

## 🚀 Getting Started

### Option 1: Instant Local Preview (Node.js Engine)

1. Clone the repository:
   ```bash
   git clone https://github.com/yashbhave105-coder/Retail-store-management-System-.git
   cd Retail-store-management-System-
   ```
2. Start the dev server:
   ```bash
   node server.js
   ```
3. Open your browser at **`http://localhost:5000`**.

---

### Option 2: Running ASP.NET Core Web API + PostgreSQL

1. **Set up PostgreSQL Database**:
   ```bash
   psql -U postgres -c "CREATE DATABASE retail_store_db;"
   psql -U postgres -d retail_store_db -f database/schema.sql
   psql -U postgres -d retail_store_db -f database/seed.sql
   ```

2. **Configure Connection String**:
   Update `backend/RetailStore.API/appsettings.json` with your PostgreSQL username and password.

3. **Run ASP.NET Core API**:
   ```bash
   cd backend/RetailStore.API
   dotnet run
   ```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@retail.com` | `Admin123` |
| **Customer** | `customer@gmail.com` | `Customer123` |

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
