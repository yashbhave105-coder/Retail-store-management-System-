-- Seed Data for Retail Store Management System (Indian Market / INR)

-- Insert Users
INSERT INTO users (full_name, email, password_hash, role, phone, address) VALUES
('Store Administrator', 'admin@retail.com', 'Admin123', 'Admin', '+91 98765 43210', 'Plot 42, Tech Park, Electronic City, Bengaluru, Karnataka'),
('Aarav Sharma', 'customer@gmail.com', 'Customer123', 'Customer', '+91 91234 56789', '12-B Park Street, Indiranagar, Bengaluru, Karnataka'),
('Priya Patel', 'priya.patel@yahoo.com', 'Customer123', 'Customer', '+91 99887 76655', '405 Sunshine Towers, Bandra West, Mumbai, Maharashtra');

-- Insert Categories
INSERT INTO categories (name, description, image_url) VALUES
('Electronics', 'Gadgets, smartphones, audio & smart devices', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60'),
('Fashion & Apparel', 'Trendy ethnic & western clothing, denim & shoes', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&auto=format&fit=crop&q=60'),
('Home & Living', 'Modern decor, LED lighting & ergonomic furniture', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=60'),
('Groceries & Snacks', 'Artisanal Indian tea, coffee & daily gourmet snacks', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60');

-- Insert Products
INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) VALUES
('Wireless Noise-Canceling Headphones', 'Premium over-ear headphones with active noise cancellation and 30h battery life.', 4999.00, 45, 1, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60'),
('Smart Fitness Watch v2', 'Track your health metrics, heart rate, sleep quality, and GPS workouts in real time.', 2999.00, 18, 1, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'),
('Ultra-Slim Mechanical Keyboard', 'RGB backlit wireless mechanical keyboard with tactile brown switches.', 3499.00, 12, 1, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60'),
('Organic Cotton Denim Jacket', 'Classic vintage denim jacket made from 100% sustainable organic cotton.', 1899.00, 30, 2, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=60'),
('Minimalist Leather Sneakers', 'Handcrafted genuine leather sneakers with soft cushioned soles for all-day comfort.', 2499.00, 8, 2, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60'),
('Smart LED Desk Lamp', 'Adjustable color temperature lamp with wireless smartphone charging pad base.', 1299.00, 25, 3, 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=500&auto=format&fit=crop&q=60'),
('Ergonomic Mesh Office Chair', 'Breathable mesh lumbar support chair with adjustable headrest and 3D armrests.', 6999.00, 5, 3, 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=500&auto=format&fit=crop&q=60'),
('South Indian Filter Coffee Beans (1kg)', 'Single-origin Arabica & Robusta coffee beans with rich cocoa notes.', 650.00, 60, 4, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=60');

-- Insert Initial Sample Orders
INSERT INTO orders (customer_id, total_amount, status, shipping_address, payment_method, order_date) VALUES
(2, 7998.00, 'Processing', '12-B Park Street, Indiranagar, Bengaluru, Karnataka', 'UPI / GPay / PhonePe', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(2, 650.00, 'Delivered', '12-B Park Street, Indiranagar, Bengaluru, Karnataka', 'UPI / GPay / PhonePe', CURRENT_TIMESTAMP - INTERVAL '10 days'),
(3, 2499.00, 'Shipped', '405 Sunshine Towers, Bandra West, Mumbai, Maharashtra', 'Credit / Debit Card', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- Insert Order Items
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 4999.00),
(1, 2, 1, 2999.00),
(2, 8, 1, 650.00),
(3, 5, 1, 2499.00);
