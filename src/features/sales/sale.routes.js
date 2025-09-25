const { Router } = require('express');
const { createSaleHandler, getShopSalesHandler } = require('./sale.controller');

// The { mergeParams: true } option is essential for accessing URL parameters
// from the parent router (e.g., :shopId from the shop router).
const router = Router({ mergeParams: true });

router.route('/').post(createSaleHandler).get(getShopSalesHandler);

module.exports = router;
