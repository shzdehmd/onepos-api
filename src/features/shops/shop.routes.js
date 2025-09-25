const { Router } = require('express');
const { createShopHandler, getAdminShopsHandler } = require('./shop.controller');
const { protect } = require('../../core/middleware/auth.middleware');

const router = Router();

// Apply the 'protect' middleware to all routes in this file.
// This ensures that only authenticated users can access these endpoints.
router.use(protect);

router.route('/').post(createShopHandler).get(getAdminShopsHandler);

module.exports = router;
