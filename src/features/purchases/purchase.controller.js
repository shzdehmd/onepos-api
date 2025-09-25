const purchaseService = require('./purchase.service');

/**
 * Handles the creation of a new purchase record.
 */
const createPurchaseHandler = async (req, res, next) => {
    try {
        const userId = req.user._id; // From auth middleware
        const purchaseData = req.body;

        // Basic validation
        if (!purchaseData.shopId || !purchaseData.supplierId || !purchaseData.items) {
            res.status(400);
            throw new Error('Shop ID, Supplier ID, and items are required.');
        }

        const newPurchase = await purchaseService.createPurchase(purchaseData, userId);

        res.status(201).json({
            success: true,
            message: 'Purchase recorded successfully.',
            data: newPurchase,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles fetching all purchases for a specific shop.
 * The shop ID is expected as a URL parameter.
 */
const getShopPurchasesHandler = async (req, res, next) => {
    try {
        const userId = req.user._id; // From auth middleware
        const { shopId } = req.params;

        if (!shopId) {
            res.status(400);
            throw new Error('Shop ID is required.');
        }

        const purchases = await purchaseService.getPurchasesByShop(shopId, userId);

        res.status(200).json({
            success: true,
            message: 'Purchases fetched successfully.',
            data: purchases,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPurchaseHandler,
    getShopPurchasesHandler,
};
