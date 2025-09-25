const ProductCategory = require('../../models/productCategory.model');

/**
 * Creates a new product category for the logged-in admin.
 * @param {string} name - The name of the category.
 * @param {string} adminId - The ID of the admin creating the category.
 * @returns {Promise<object>} The newly created category document.
 */
const createCategory = async (name, adminId) => {
    // The unique index on the model will prevent duplicates for the same admin.
    const category = await ProductCategory.create({ name, adminId });
    return category;
};

/**
 * Retrieves all categories belonging to a specific admin.
 * @param {string} adminId - The ID of the admin.
 * @returns {Promise<Array<object>>} A list of category documents.
 */
const getCategoriesByAdmin = async (adminId) => {
    const categories = await ProductCategory.find({ adminId });
    return categories;
};

/**
 * Updates an existing product category.
 * @param {string} categoryId - The ID of the category to update.
 * @param {object} updateData - The data to update (e.g., { name }).
 * @param {string} adminId - The ID of the admin to verify ownership.
 * @returns {Promise<object|null>} The updated category document, or null if not found.
 */
const updateCategory = async (categoryId, updateData, adminId) => {
    const category = await ProductCategory.findOneAndUpdate(
        { _id: categoryId, adminId }, // Ensures user can only update their own categories
        updateData,
        { new: true, runValidators: true },
    );
    return category;
};

/**
 * Deletes a product category.
 * @param {string} categoryId - The ID of the category to delete.
 * @param {string} adminId - The ID of the admin to verify ownership.
 * @returns {Promise<object|null>} The deleted category document, or null if not found.
 */
const deleteCategory = async (categoryId, adminId) => {
    const category = await ProductCategory.findOneAndDelete({ _id: categoryId, adminId });
    return category;
};

module.exports = {
    createCategory,
    getCategoriesByAdmin,
    updateCategory,
    deleteCategory,
};
