const customerService = require('./customer.service');

const createCustomerHandler = async (req, res, next) => {
    try {
        const adminId = req.user._id;
        const customer = await customerService.createCustomer(req.body, adminId);
        res.status(201).json({
            success: true,
            message: 'Customer created successfully.',
            data: customer,
        });
    } catch (error) {
        next(error);
    }
};

const getAdminCustomersHandler = async (req, res, next) => {
    try {
        const adminId = req.user._id;
        const customers = await customerService.getCustomersByAdmin(adminId);
        res.status(200).json({
            success: true,
            message: 'Customers fetched successfully.',
            data: customers,
        });
    } catch (error) {
        next(error);
    }
};

const updateCustomerHandler = async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const adminId = req.user._id;

        const updatedCustomer = await customerService.updateCustomer(customerId, req.body, adminId);

        if (!updatedCustomer) {
            res.status(404);
            throw new Error('Customer not found or you do not have permission to update it.');
        }

        res.status(200).json({
            success: true,
            message: 'Customer updated successfully.',
            data: updatedCustomer,
        });
    } catch (error) {
        next(error);
    }
};

const deleteCustomerHandler = async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const adminId = req.user._id;

        const deletedCustomer = await customerService.deleteCustomer(customerId, adminId);

        if (!deletedCustomer) {
            res.status(404);
            throw new Error('Customer not found or you do not have permission to delete it.');
        }

        res.status(200).json({
            success: true,
            message: 'Customer deleted successfully.',
            data: { _id: deletedCustomer._id },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCustomerHandler,
    getAdminCustomersHandler,
    updateCustomerHandler,
    deleteCustomerHandler,
};
