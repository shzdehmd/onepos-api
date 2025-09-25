const { Router } = require('express');
const {
    createCustomerHandler,
    getAdminCustomersHandler,
    updateCustomerHandler,
    deleteCustomerHandler,
} = require('./customer.controller');
const { protect } = require('../../core/middleware/auth.middleware');

const router = Router();

// Protect all routes in this file
router.use(protect);

router.route('/').post(createCustomerHandler).get(getAdminCustomersHandler);

router.route('/:customerId').put(updateCustomerHandler).delete(deleteCustomerHandler);

module.exports = router;
