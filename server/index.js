import express from 'express';
import path from 'path';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import authSignupRouter from './backend/auth.js';
import authLoginRouter from './backend/authLogin.js';
import productRoutes from './backend/productRoutes.js';
import session from 'express-session'; // Import express-session
import businessRoutes from './backend/businessRoutes.js';
import cartRoutes from "./backend/cartRoutes.js";
import wishlistRoutes from "./backend/wishlistRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure express-session middleware
app.use(session({
    secret: process.env.KEY_SECRET,  
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }         // Set to true if using HTTPS
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/auth/signup', authSignupRouter);
app.use('/auth', authLoginRouter);
app.use('/products', productRoutes); // Product routes
app.use('/business', businessRoutes); //Add business route
app.use("/cart", cartRoutes);
app.use("/wishlist", wishlistRoutes);

// Customer pages
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

// Seller pages
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

// Auth pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login_page.html'));
});
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/signup_page.html'));
});

// Test page
app.get('/test', (req, res) => {
    res.send('<h1>This is a test page</h1>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
