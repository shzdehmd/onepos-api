const { Router } = require('express');
const { createProductHandler, getShopProductsHandler } = require('./product.controller');

// The { mergeParams: true } option is crucial. It allows this router
// to access URL parameters from its parent router (like :shopId).
const router = Router({ mergeParams: true });

router.route('/').post(createProductHandler).get(getShopProductsHandler);

module.exports = router;
