const Customer = require('../../models/customer.model');

/**
 * Creates a new customer for the logged-in admin.
 * @param {object} customerData - The data for the new customer.
 * @param {string} adminId - The ID of the admin creating the customer.
 * @returns {Promise<object>} The newly created customer document.
 */
const createCustomer = async (customerData, adminId) => {
    const customer = await Customer.create({ ...customerData, adminId });
    return customer;
};

/**
 * Retrieves all customers belonging to a specific admin.
 * @param {string} adminId - The ID of the admin.
 * @returns {Promise<Array<object>>} A list of customer documents.
 */
const getCustomersByAdmin = async (adminId) => {
    const customers = await Customer.find({ adminId }).sort({ name: 1 }); // Sort alphabetically by name
    return customers;
};

/**
 * Updates an existing customer.
 * @param {string} customerId - The ID of the customer to update.
 * @param {object} updateData - The data to update.
 * @param {string} adminId - The ID of the admin to verify ownership.
 * @returns {Promise<object|null>} The updated customer document, or null if not found.
 */
const updateCustomer = async (customerId, updateData, adminId) => {
    const customer = await Customer.findOneAndUpdate(
        { _id: customerId, adminId }, // Ensures user can only update their own customers
        updateData,
        { new: true, runValidators: true },
    );
    return customer;
};

/**
 * Deletes a customer.
 * @param {string} customerId - The ID of the customer to delete.
 * @param {string} adminId - The ID of the admin to verify ownership.
 * @returns {Promise<object|null>} The deleted customer document, or null if not found.
 */
const deleteCustomer = async (customerId, adminId) => {
    // Future consideration: Check if the customer has outstanding credit sales before deleting.
    const customer = await Customer.findOneAndDelete({ _id: customerId, adminId });
    return customer;
};

module.exports = {
    createCustomer,
    getCustomersByAdmin,
    updateCustomer,
    deleteCustomer,
};
