const { Router } = require('express');
const { createPurchaseHandler, getShopPurchasesHandler } = require('./purchase.controller');

// The { mergeParams: true } option is essential for accessing URL parameters
// from the parent router (e.g., :shopId from the shop router).
const router = Router({ mergeParams: true });

router.route('/').post(createPurchaseHandler).get(getShopPurchasesHandler);

module.exports = router;
