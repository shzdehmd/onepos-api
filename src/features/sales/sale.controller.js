const saleService = require('./sale.service');

const createSaleHandler = async (req, res, next) => {
    try {
        const user = req.user; // Pass the entire user object
        const saleData = req.body;

        // For Admins, shopId must be in the body. For Attendants, it's optional as it's derived from their token.
        if (user.role === 'admin' && !saleData.shopId) {
            res.status(400);
            throw new Error('Shop ID is required for admins.');
        }

        if (!saleData.items || !saleData.paymentType) {
            res.status(400);
            throw new Error('Items and payment type are required.');
        }

        const newSale = await saleService.createSale(saleData, user);

        res.status(201).json({
            success: true,
            message: 'Sale recorded successfully.',
            data: newSale,
        });
    } catch (error) {
        next(error);
    }
};

const getShopSalesHandler = async (req, res, next) => {
    try {
        const user = req.user; // Pass the entire user object
        const { shopId } = req.params;

        if (!shopId) {
            res.status(400);
            throw new Error('Shop ID is required.');
        }

        const sales = await saleService.getSalesByShop(shopId, user);

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
