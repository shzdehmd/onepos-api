const { Router } = require('express');
const {
    createCategoryHandler,
    getAdminCategoriesHandler,
    updateCategoryHandler,
    deleteCategoryHandler,
} = require('./productCategory.controller');
const { protect } = require('../../core/middleware/auth.middleware');

const router = Router();

// Protect all routes in this file
router.use(protect);

router.route('/').post(createCategoryHandler).get(getAdminCategoriesHandler);

router.route('/:categoryId').put(updateCategoryHandler).delete(deleteCategoryHandler);

module.exports = router;
