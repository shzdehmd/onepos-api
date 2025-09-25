const express = require('express');
const cors = require('cors');

const app = express();

// --- Core Middleware ---
app.use(cors()); // Enables Cross-Origin Resource Sharing
app.use(express.json({ limit: '16kb' })); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true, limit: '16kb' })); // Parses URL-encoded data

// --- Health Check Route ---
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is up and running!' });
});

// --- API Imports ---
const authRoutes = require('./features/auth/auth.routes'); // Imports the authentication routes
const shopRoutes = require('./features/shops/shop.routes'); // Imports the shop routes
const productCategoryRoutes = require('./features/productCategories/productCategory.routes'); // Imports the product category routes
const supplierRoutes = require('./features/suppliers/supplier.routes'); // Imports the supplier routes
const customerRoutes = require('./features/customers/customer.routes'); // Imports the customer routes

// --- API Routes ---
app.use('/api/v1/auth', authRoutes); // Mounts the authentication routes under the /api/v1/auth prefix
app.use('/api/v1/shops', shopRoutes); // Mounts the shop routes
app.use('/api/v1/product-categories', productCategoryRoutes); // Mounts the product category routes
app.use('/api/v1/suppliers', supplierRoutes); // Mounts the supplier routes
app.use('/api/v1/customers', customerRoutes); // Mounts the customer routes

// --- Error Handling Middleware ---

// Handle 404 Not Found errors
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// Global Error Handler - Catches all errors passed by next(error)
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        // Provide stack trace only in development environment
        stack: process.env.NODE_ENV === 'development' ? err.stack : '🥞',
    });
});

module.exports = app;
