const saleService = require('./sale.service');

/**
 * Handles the creation of a new sale record.
 */
const createSaleHandler = async (req, res, next) => {
    try {
        const userId = req.user._id; // From auth middleware
        const saleData = req.body;

        // Basic validation
        if (!saleData.shopId || !saleData.items || !saleData.paymentType) {
            res.status(400);
            throw new Error('Shop ID, items, and payment type are required.');
        }

        const newSale = await saleService.createSale(saleData, userId);

        res.status(201).json({
            success: true,
            message: 'Sale recorded successfully.',
            data: newSale,
        });
    } catch (error) {
        // The service layer will throw specific errors (e.g., insufficient stock)
        // which will be caught here and passed to the global error handler.
        next(error);
    }
};

/**
 * Handles fetching all sales for a specific shop.
 * The shop ID is expected as a URL parameter.
 */
const getShopSalesHandler = async (req, res, next) => {
    try {
        const userId = req.user._id; // From auth middleware
        const { shopId } = req.params;

        if (!shopId) {
            res.status(400);
            throw new Error('Shop ID is required.');
        }

        const sales = await saleService.getSalesByShop(shopId, userId);

        res.status(200).json({
            success: true,
            message: 'Sales fetched successfully.',
            data: sales,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createSaleHandler,
    getShopSalesHandler,
};
