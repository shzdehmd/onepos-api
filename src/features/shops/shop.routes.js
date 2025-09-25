const { Router } = require('express');
const { createShopHandler, getAdminShopsHandler } = require('./shop.controller');
const { protect } = require('../../core/middleware/auth.middleware');

const productRoutes = require('../products/product.routes'); // Import the product router for nested routes
const purchaseRoutes = require('../purchases/purchase.routes'); // Import the purchase router for nested routes
const saleRoutes = require('../sales/sale.routes'); // Import the sale router for nested routes

const router = Router();

// Apply the 'protect' middleware to all routes in this file.
// This ensures that only authenticated users can access these endpoints.
router.use(protect);

router.route('/').post(createShopHandler).get(getAdminShopsHandler);

// Mount the product router
// Any request to /api/v1/shops/:shopId/products will be handled by productRoutes
router.use('/:shopId/products', productRoutes);

// Mount the purchase router
// Any request to /api/v1/shops/:shopId/purchases will be handled by purchaseRoutes
router.use('/:shopId/purchases', purchaseRoutes);

// Mount the sale router
// Any request to /api/v1/shops/:shopId/sales will be handled by saleRoutes
router.use('/:shopId/sales', saleRoutes);

module.exports = router;
