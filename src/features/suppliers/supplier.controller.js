const supplierService = require('./supplier.service');

const createSupplierHandler = async (req, res, next) => {
    try {
        const adminId = req.user._id;
        const supplier = await supplierService.createSupplier(req.body, adminId);
        res.status(201).json({
            success: true,
            message: 'Supplier created successfully.',
            data: supplier,
        });
    } catch (error) {
        next(error);
    }
};

const getAdminSuppliersHandler = async (req, res, next) => {
    try {
        const adminId = req.user._id;
        const suppliers = await supplierService.getSuppliersByAdmin(adminId);
        res.status(200).json({
            success: true,
            message: 'Suppliers fetched successfully.',
            data: suppliers,
        });
    } catch (error) {
        next(error);
    }
};

const updateSupplierHandler = async (req, res, next) => {
    try {
        const { supplierId } = req.params;
        const adminId = req.user._id;

        const updatedSupplier = await supplierService.updateSupplier(supplierId, req.body, adminId);

        if (!updatedSupplier) {
            res.status(404);
            throw new Error('Supplier not found or you do not have permission to update it.');
        }

        res.status(200).json({
            success: true,
            message: 'Supplier updated successfully.',
            data: updatedSupplier,
        });
    } catch (error) {
        next(error);
    }
};

const deleteSupplierHandler = async (req, res, next) => {
    try {
        const { supplierId } = req.params;
        const adminId = req.user._id;

        const deletedSupplier = await supplierService.deleteSupplier(supplierId, adminId);

        if (!deletedSupplier) {
            res.status(404);
            throw new Error('Supplier not found or you do not have permission to delete it.');
        }

        res.status(200).json({
            success: true,
            message: 'Supplier deleted successfully.',
            data: { _id: deletedSupplier._id },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createSupplierHandler,
    getAdminSuppliersHandler,
    updateSupplierHandler,
    deleteSupplierHandler,
};
