const productService = require('./product.service');

/**
 * Handles the creation of a new product.
 * The shop ID is expected as a URL parameter.
 */
const createProductHandler = async (req, res, next) => {
    try {
        const userId = req.user._id; // From auth middleware
        const { shopId } = req.params; // Shop ID from URL, e.g., /api/v1/shops/:shopId/products
        const productData = req.body;

        if (!shopId) {
            res.status(400);
            throw new Error('Shop ID is required.');
        }

        const newProduct = await productService.createProduct(productData, shopId, userId);

        res.status(201).json({
            success: true,
            message: 'Product created successfully.',
            data: newProduct,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles fetching all products for a specific shop.
 * The shop ID is expected as a URL parameter.
 */
const getShopProductsHandler = async (req, res, next) => {
    try {
        const userId = req.user._id; // From auth middleware
        const { shopId } = req.params;

        if (!shopId) {
            res.status(400);
            throw new Error('Shop ID is required.');
        }

        const products = await productService.getProductsByShop(shopId, userId);

        res.status(200).json({
            success: true,
            message: 'Products fetched successfully.',
            data: products,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProductHandler,
    getShopProductsHandler,
};
