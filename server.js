const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5000;

// Initial Database State (Seeded with sample Indian retail store data)
let db = {
    users: [
        { id: 1, fullName: 'Store Administrator', email: 'admin@retail.com', passwordHash: 'Admin123', role: 'Admin', phone: '+91 98765 43210', address: 'Plot 42, Tech Park, Electronic City, Bengaluru, Karnataka' },
        { id: 2, fullName: 'Aarav Sharma', email: 'customer@gmail.com', passwordHash: 'Customer123', role: 'Customer', phone: '+91 91234 56789', address: '12-B Park Street, Indiranagar, Bengaluru, Karnataka' },
        { id: 3, fullName: 'Priya Patel', email: 'priya.patel@yahoo.com', passwordHash: 'Customer123', role: 'Customer', phone: '+91 99887 76655', address: '405 Sunshine Towers, Bandra West, Mumbai, Maharashtra' }
    ],
    categories: [
        { id: 1, name: 'Electronics', description: 'Gadgets, smartphones, audio & smart devices', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60' },
        { id: 2, name: 'Fashion & Apparel', description: 'Trendy ethnic & western clothing, denim & shoes', imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&auto=format&fit=crop&q=60' },
        { id: 3, name: 'Home & Living', description: 'Modern decor, LED lighting & ergonomic furniture', imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=60' },
        { id: 4, name: 'Groceries & Snacks', description: 'Artisanal Indian tea, coffee & daily gourmet snacks', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60' }
    ],
    products: [
        { id: 1, name: 'Wireless Noise-Canceling Headphones', description: 'Premium over-ear headphones with active noise cancellation and 30h battery life.', price: 4999.00, stockQuantity: 45, categoryId: 1, categoryName: 'Electronics', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60', isActive: true },
        { id: 2, name: 'Smart Fitness Watch v2', description: 'Track your health metrics, heart rate, sleep quality, and GPS workouts in real time.', price: 2999.00, stockQuantity: 18, categoryId: 1, categoryName: 'Electronics', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60', isActive: true },
        { id: 3, name: 'Ultra-Slim Mechanical Keyboard', description: 'RGB backlit wireless mechanical keyboard with tactile brown switches.', price: 3499.00, stockQuantity: 12, categoryId: 1, categoryName: 'Electronics', imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60', isActive: true },
        { id: 4, name: 'Organic Cotton Denim Jacket', description: 'Classic vintage denim jacket made from 100% sustainable organic cotton.', price: 1899.00, stockQuantity: 30, categoryId: 2, categoryName: 'Fashion & Apparel', imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=60', isActive: true },
        { id: 5, name: 'Minimalist Leather Sneakers', description: 'Handcrafted genuine leather sneakers with soft cushioned soles.', price: 2499.00, stockQuantity: 8, categoryId: 2, categoryName: 'Fashion & Apparel', imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60', isActive: true },
        { id: 6, name: 'Smart LED Desk Lamp', description: 'Adjustable color temperature lamp with wireless smartphone charging pad base.', price: 1299.00, stockQuantity: 25, categoryId: 3, categoryName: 'Home & Living', imageUrl: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=500&auto=format&fit=crop&q=60', isActive: true },
        { id: 7, name: 'Ergonomic Mesh Office Chair', description: 'Breathable mesh lumbar support chair with adjustable headrest and armrests.', price: 6999.00, stockQuantity: 5, categoryId: 3, categoryName: 'Home & Living', imageUrl: 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=500&auto=format&fit=crop&q=60', isActive: true },
        { id: 8, name: 'South Indian Filter Coffee Beans (1kg)', description: 'Single-origin Arabica & Robusta coffee beans with rich aroma and cocoa notes.', price: 650.00, stockQuantity: 60, categoryId: 4, categoryName: 'Groceries & Snacks', imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=60', isActive: true }
    ],
    orders: [
        {
            id: 1001,
            customerId: 2,
            customerName: 'Aarav Sharma',
            totalAmount: 7998.00,
            status: 'Processing',
            shippingAddress: '12-B Park Street, Indiranagar, Bengaluru, Karnataka',
            paymentMethod: 'UPI / GPay / PhonePe',
            orderDate: new Date(Date.now() - 86400000 * 2).toISOString(),
            items: [
                { productId: 1, productName: 'Wireless Noise-Canceling Headphones', quantity: 1, unitPrice: 4999.00 },
                { productId: 2, productName: 'Smart Fitness Watch v2', quantity: 1, unitPrice: 2999.00 }
            ]
        },
        {
            id: 1002,
            customerId: 2,
            customerName: 'Aarav Sharma',
            totalAmount: 650.00,
            status: 'Delivered',
            shippingAddress: '12-B Park Street, Indiranagar, Bengaluru, Karnataka',
            paymentMethod: 'UPI / GPay / PhonePe',
            orderDate: new Date(Date.now() - 86400000 * 8).toISOString(),
            items: [
                { productId: 8, productName: 'South Indian Filter Coffee Beans (1kg)', quantity: 1, unitPrice: 650.00 }
            ]
        },
        {
            id: 1003,
            customerId: 3,
            customerName: 'Priya Patel',
            totalAmount: 2499.00,
            status: 'Shipped',
            shippingAddress: '405 Sunshine Towers, Bandra West, Mumbai, Maharashtra',
            paymentMethod: 'Credit / Debit Card',
            orderDate: new Date(Date.now() - 86400000 * 1).toISOString(),
            items: [
                { productId: 5, productName: 'Minimalist Leather Sneakers', quantity: 1, unitPrice: 2499.00 }
            ]
        }
    ]
};

// Content Type MIME mapping
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

function parseBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                resolve({});
            }
        });
    });
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // --- REST API ENDPOINTS ---

    // Auth Login
    if (pathname === '/api/auth/login' && method === 'POST') {
        const body = await parseBody(req);
        const user = db.users.find(u => u.email.toLowerCase() === (body.email || '').toLowerCase());
        if (!user || user.passwordHash !== body.password) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Invalid email or password.' }));
        }

        if (body.requestedRole && user.role.toLowerCase() !== body.requestedRole.toLowerCase()) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: `Role mismatch. This account is registered as '${user.role}'.` }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            token: `jwt-session-token-${user.id}-${user.role.toLowerCase()}`,
            user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, phone: user.phone, address: user.address }
        }));
    }

    // Auth Register
    if (pathname === '/api/auth/register' && method === 'POST') {
        const body = await parseBody(req);
        if (!body.email || !body.fullName || !body.password) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Name, email, and password are required.' }));
        }
        if (db.users.some(u => u.email.toLowerCase() === body.email.toLowerCase())) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Email address is already registered.' }));
        }

        const newUser = {
            id: db.users.length + 1,
            fullName: body.fullName,
            email: body.email,
            passwordHash: body.password,
            role: body.role === 'Admin' ? 'Admin' : 'Customer',
            phone: body.phone || '',
            address: body.address || ''
        };
        db.users.push(newUser);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Registration successful!', user: newUser }));
    }

    // Get Products (with search & category filter)
    if (pathname === '/api/products' && method === 'GET') {
        let results = db.products;
        const categoryId = parsedUrl.query.categoryId;
        const search = parsedUrl.query.search;

        if (categoryId && parseInt(categoryId) > 0) {
            results = results.filter(p => p.categoryId === parseInt(categoryId));
        }

        if (search) {
            const term = search.toLowerCase();
            results = results.filter(p => p.name.toLowerCase().includes(term) || (p.description && p.description.toLowerCase().includes(term)));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(results));
    }

    // Create Product (Admin)
    if (pathname === '/api/products' && method === 'POST') {
        const body = await parseBody(req);
        const category = db.categories.find(c => c.id === parseInt(body.categoryId));
        const newProduct = {
            id: db.products.length ? Math.max(...db.products.map(p => p.id)) + 1 : 1,
            name: body.name || 'Untitled Product',
            description: body.description || '',
            price: parseFloat(body.price) || 0,
            stockQuantity: parseInt(body.stockQuantity) || 0,
            categoryId: category ? category.id : null,
            categoryName: category ? category.name : 'General',
            imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
            isActive: true
        };
        db.products.push(newProduct);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(newProduct));
    }

    // Update Product (Admin)
    if (pathname.startsWith('/api/products/') && method === 'PUT') {
        const id = parseInt(pathname.split('/')[3]);
        const product = db.products.find(p => p.id === id);
        if (!product) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Product not found.' }));
        }

        const body = await parseBody(req);
        const category = db.categories.find(c => c.id === parseInt(body.categoryId));

        product.name = body.name !== undefined ? body.name : product.name;
        product.description = body.description !== undefined ? body.description : product.description;
        product.price = body.price !== undefined ? parseFloat(body.price) : product.price;
        product.stockQuantity = body.stockQuantity !== undefined ? parseInt(body.stockQuantity) : product.stockQuantity;
        product.categoryId = category ? category.id : product.categoryId;
        product.categoryName = category ? category.name : product.categoryName;
        product.imageUrl = body.imageUrl || product.imageUrl;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(product));
    }

    // Delete Product (Admin)
    if (pathname.startsWith('/api/products/') && method === 'DELETE') {
        const id = parseInt(pathname.split('/')[3]);
        const index = db.products.findIndex(p => p.id === id);
        if (index === -1) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Product not found.' }));
        }

        db.products.splice(index, 1);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Product deleted successfully.' }));
    }

    // Get Categories
    if (pathname === '/api/categories' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(db.categories));
    }

    // Get All Orders (Admin)
    if (pathname === '/api/orders' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(db.orders));
    }

    // Get User Orders (Customer)
    if (pathname.startsWith('/api/orders/user/') && method === 'GET') {
        const userId = parseInt(pathname.split('/')[4]);
        const userOrders = db.orders.filter(o => o.customerId === userId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(userOrders));
    }

    // Create Order (Customer Purchase)
    if (pathname === '/api/orders' && method === 'POST') {
        const body = await parseBody(req);
        if (!body.items || !body.items.length) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Order must contain items.' }));
        }

        let total = 0;
        const processedItems = [];

        for (let item of body.items) {
            const product = db.products.find(p => p.id === item.productId);
            if (!product) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: `Product ID ${item.productId} not found.` }));
            }
            if (product.stockQuantity < item.quantity) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: `Not enough stock for '${product.name}'. Available: ${product.stockQuantity}` }));
            }

            // Deduct Stock
            product.stockQuantity -= item.quantity;
            total += product.price * item.quantity;

            processedItems.push({
                productId: product.id,
                productName: product.name,
                quantity: item.quantity,
                unitPrice: product.price
            });
        }

        const user = db.users.find(u => u.id === body.customerId) || { fullName: 'Guest Customer' };

        const newOrder = {
            id: 1000 + db.orders.length + 1,
            customerId: body.customerId,
            customerName: user.fullName,
            totalAmount: parseFloat(total.toFixed(2)),
            status: 'Pending',
            shippingAddress: body.shippingAddress || user.address || 'Standard Address',
            paymentMethod: body.paymentMethod || 'UPI / GPay / PhonePe',
            orderDate: new Date().toISOString(),
            items: processedItems
        };

        db.orders.unshift(newOrder);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(newOrder));
    }

    // Update Order Status (Admin)
    if (pathname.match(/\/api\/orders\/\d+\/status/) && method === 'PUT') {
        const id = parseInt(pathname.split('/')[3]);
        const body = await parseBody(req);
        const order = db.orders.find(o => o.id === id);

        if (!order) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Order not found.' }));
        }

        order.status = body.status || order.status;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(order));
    }

    // Admin Dashboard Statistics
    if (pathname === '/api/admin/stats' && method === 'GET') {
        const totalRevenue = db.orders
            .filter(o => o.status !== 'Cancelled')
            .reduce((sum, o) => sum + o.totalAmount, 0);

        const stats = {
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            totalOrders: db.orders.length,
            pendingOrders: db.orders.filter(o => o.status === 'Pending').length,
            totalProducts: db.products.length,
            lowStockProducts: db.products.filter(p => p.stockQuantity <= 10).length,
            totalCustomers: db.users.filter(u => u.role === 'Customer').length
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(stats));
    }

    // --- STATIC FILES SERVER (Frontend) ---
    let filePath = path.join(__dirname, 'frontend', pathname === '/' ? 'index.html' : pathname);
    const extname = path.extname(filePath);
    const contentType = MIME_TYPES[extname] || 'text/html';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Fallback to index.html for SPA routing
                fs.readFile(path.join(__dirname, 'frontend', 'index.html'), (error, htmlContent) => {
                    if (error) {
                        res.writeHead(500);
                        res.end('Error loading index.html');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(htmlContent, 'utf-8');
                    }
                });
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(` Retail Store Management System Web Application`);
    console.log(` Dev Server listening at: http://localhost:${PORT}`);
    console.log(` Admin Demo: admin@retail.com / Admin123`);
    console.log(` Customer Demo: customer@gmail.com / Customer123`);
    console.log(`==================================================\n`);
});
