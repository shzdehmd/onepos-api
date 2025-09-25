const shopService = require('./shop.service');

/**
 * Handles the creation of a new shop.
 * Requires `req.user` to be populated by the auth middleware.
 */
const createShopHandler = async (req, res, next) => {
    try {
        const adminId = req.user._id; // Get admin ID from authenticated user
        const shopData = req.body;

        const newShop = await shopService.createShop(shopData, adminId);

        res.status(201).json({
            success: true,
            message: 'Shop created successfully.',
            data: newShop,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles fetching all shops for the authenticated admin.
 * Requires `req.user` to be populated by the auth middleware.
 */
const getAdminShopsHandler = async (req, res, next) => {
    try {
        const adminId = req.user._id; // Get admin ID from authenticated user

        const shops = await shopService.getShopsByAdmin(adminId);

        res.status(200).json({
            success: true,
            message: 'Shops fetched successfully.',
            data: shops,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createShopHandler,
    getAdminShopsHandler,
};
