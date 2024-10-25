// Import required modules using ES module syntax
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the express app
const app = express();

// Serve static files (HTML, CSS, JS) from the 'frontend' directory
app.use(express.static(path.join(__dirname, '../frontend')));

// ======= CUSTOMER PAGES =======
app.get('/customer_home', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/customer_page/customer_home.html'));
});

app.get('/customer_shop', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/customer_page/customer_shop.html'));
});

app.get('/customer_wish', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/customer_page/customer_wish.html'));
});

app.get('/customer_cart', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/customer_page/customer_cart.html'));
});

app.get('/customer_profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/customer_page/customer_profile.html'));
});

// ======= SELLER PAGES =======
app.get('/seller_dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/seller_page/seller_dashboard.html'));
});

app.get('/seller_order', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/seller_page/seller_order.html'));
});

app.get('/seller_product', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/seller_page/seller_product.html'));
});

app.get('/seller_profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/seller_page/seller_profile.html'));
});

// ======= AUTH PAGES =======
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login_page.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/signup_page.html'));
});

// ======= TEST PAGE (optional for testing) =======
app.get('/test', (req, res) => {
    res.send('<h1>This is a test page</h1>');
});

// Start the server on a specific port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
