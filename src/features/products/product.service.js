const Product = require('../../models/product.model');
const ProductCategory = require('../../models/productCategory.model');
const Shop = require('../../models/shop.model');

/**
 * Creates a new product within a specific shop.
 * @param {object} productData - The data for the new product.
 * @param {string} shopId - The ID of the shop to add the product to.
 * @param {string} userId - The ID of the user creating the product.
 * @returns {Promise<object>} The newly created product document.
 */
const createProduct = async (productData, shopId, userId) => {
    // Verify that the shop exists and belongs to the user.
    const shop = await Shop.findOne({ _id: shopId, adminId: userId });
    if (!shop) {
        throw new Error('Shop not found or you do not have permission to add products to it.');
    }

    // If a category is provided, verify it exists and belongs to the user.
    if (productData.productCategoryId) {
        const category = await ProductCategory.findOne({
            _id: productData.productCategoryId,
            adminId: userId,
        });
        if (!category) {
            throw new Error('Product category not found or you do not have permission to use it.');
        }
    }

    const newProduct = await Product.create({
        ...productData,
        shopId,
        createdBy: userId,
    });

    return newProduct;
};

/**
 * Retrieves all products for a specific shop, ensuring user has access.
 * @param {string} shopId - The ID of the shop.
 * @param {string} userId - The ID of the user requesting the products.
 * @returns {Promise<Array<object>>} A list of product documents with categories populated.
 */
const getProductsByShop = async (shopId, userId) => {
    // Verify that the shop exists and belongs to the user.
    const shop = await Shop.findOne({ _id: shopId, adminId: userId });
    if (!shop) {
        throw new Error('Shop not found or you do not have permission to view its products.');
    }

    const products = await Product.find({ shopId }).populate({
        path: 'productCategoryId',
        select: 'name', // Only return the name of the category
    });
    return products;
};

module.exports = {
    createProduct,
    getProductsByShop,
};
