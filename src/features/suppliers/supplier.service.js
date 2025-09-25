const Supplier = require('../../models/supplier.model');

/**
 * Creates a new supplier for the logged-in admin.
 * @param {object} supplierData - The data for the new supplier.
 * @param {string} adminId - The ID of the admin creating the supplier.
 * @returns {Promise<object>} The newly created supplier document.
 */
const createSupplier = async (supplierData, adminId) => {
    const supplier = await Supplier.create({ ...supplierData, adminId });
    return supplier;
};

/**
 * Retrieves all suppliers belonging to a specific admin.
 * @param {string} adminId - The ID of the admin.
 * @returns {Promise<Array<object>>} A list of supplier documents.
 */
const getSuppliersByAdmin = async (adminId) => {
    const suppliers = await Supplier.find({ adminId });
    return suppliers;
};

/**
 * Updates an existing supplier.
 * @param {string} supplierId - The ID of the supplier to update.
 * @param {object} updateData - The data to update.
 * @param {string} adminId - The ID of the admin to verify ownership.
 * @returns {Promise<object|null>} The updated supplier document, or null if not found.
 */
const updateSupplier = async (supplierId, updateData, adminId) => {
    const supplier = await Supplier.findOneAndUpdate(
        { _id: supplierId, adminId }, // Ensures user can only update their own suppliers
        updateData,
        { new: true, runValidators: true },
    );
    return supplier;
};

/**
 * Deletes a supplier.
 * @param {string} supplierId - The ID of the supplier to delete.
 * @param {string} adminId - The ID of the admin to verify ownership.
 * @returns {Promise<object|null>} The deleted supplier document, or null if not found.
 */
const deleteSupplier = async (supplierId, adminId) => {
    // We should also consider what happens to products linked to this supplier.
    // For now, we will just delete the supplier.
    const supplier = await Supplier.findOneAndDelete({ _id: supplierId, adminId });
    return supplier;
};

module.exports = {
    createSupplier,
    getSuppliersByAdmin,
    updateSupplier,
    deleteSupplier,
};
