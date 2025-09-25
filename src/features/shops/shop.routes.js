const { Router } = require('express');
const { createShopHandler, getAdminShopsHandler } = require('./shop.controller');
const { protect } = require('../../core/middleware/auth.middleware');

// Import the product router for nested routes
const productRoutes = require('../products/product.routes');

const router = Router();

// Apply the 'protect' middleware to all routes in this file.
// This ensures that only authenticated users can access these endpoints.
router.use(protect);

router.route('/').post(createShopHandler).get(getAdminShopsHandler);

// Mount the product router
// Any request to /api/v1/shops/:shopId/products will be handled by productRoutes
router.use('/:shopId/products', productRoutes);

module.exports = router;
