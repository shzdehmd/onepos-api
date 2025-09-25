const { Router } = require('express');
const {
    createSupplierHandler,
    getAdminSuppliersHandler,
    updateSupplierHandler,
    deleteSupplierHandler,
} = require('./supplier.controller');
const { protect } = require('../../core/middleware/auth.middleware');

const router = Router();

// Protect all routes in this file
router.use(protect);

router.route('/').post(createSupplierHandler).get(getAdminSuppliersHandler);

router.route('/:supplierId').put(updateSupplierHandler).delete(deleteSupplierHandler);

module.exports = router;
