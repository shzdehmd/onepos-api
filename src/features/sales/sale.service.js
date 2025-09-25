const mongoose = require('mongoose');
const Sale = require('../../models/sale.model');
const SaleItem = require('../../models/saleItem.model');
const Product = require('../../models/product.model');
const Customer = require('../../models/customer.model');
const Shop = require('../../models/shop.model');
const vmsService = require('./sale.vms.service');

/**
 * Creates a new sale, updates product quantities, and optionally signs with VMS.
 * @param {object} saleData - Data for the sale, including items.
 * @param {string} userId - The ID of the admin processing the sale.
 * @returns {Promise<object>} The newly created and populated sale document.
 */
const createSale = async (saleData, userId) => {
    const { shopId, items, paymentType, amountPaid } = saleData;

    // --- 1. Pre-Transaction Validations ---
    // We need to fetch the full shop object, including sensitive frcsSettings
    const shop = await Shop.findOne({ _id: shopId, adminId: userId }).select('+frcsSettings.p12_chain_file');
    if (!shop) throw new Error('Shop not found or permission denied.');

    // If a customerId is provided, validate it.
    if (customerId) {
        const customer = await Customer.findOne({ _id: customerId, adminId: userId });
        if (!customer) throw new Error('Customer not found or you do not have permission to use it.');
    }

    if (!items || items.length === 0) throw new Error('Sale must include at least one item.');

    // --- 2. Start Transaction ---
    const session = await mongoose.startSession();
    session.startTransaction();

    let createdSale;

    try {
        // --- 3. Process Items and Calculate Total ---
        let calculatedTotal = 0;
        const saleItemDocs = [];
        const productUpdates = [];

        for (const item of items) {
            const product = await Product.findById(item.productId).session(session);
            if (!product || product.shopId.toString() !== shopId) {
                throw new Error(`Product with ID ${item.productId} not found in this shop.`);
            }

            if (!shop.allowNegativeSelling && product.quantity < item.quantity) {
                throw new Error(`Insufficient stock for product: ${product.name}. Available: ${product.quantity}`);
            }

            calculatedTotal += item.quantity * item.unitPrice;
            saleItemDocs.push({ ...item });
            productUpdates.push({
                updateOne: {
                    filter: { _id: item.productId },
                    update: { $inc: { quantity: -item.quantity } },
                },
            });
        }

        // --- 4. Create Sale and SaleItem Documents ---
        const sale = new Sale({
            ...saleData,
            totalAmount: calculatedTotal,
            status: (amountPaid || 0) < calculatedTotal ? 'pending' : 'completed',
            processedBy: userId,
        });
        await sale.save({ session });

        const createdItems = await SaleItem.insertMany(
            saleItemDocs.map((item) => ({ ...item, saleId: sale._id })),
            { session },
        );

        // --- 5. Link Items to Sale and Update Product Quantities ---
        sale.items = createdItems.map((item) => item._id);
        await sale.save({ session });
        await Product.bulkWrite(productUpdates, { session });

        // --- 6. Commit Transaction ---
        await session.commitTransaction();
        createdSale = sale;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }

    // --- 7. Post-Transaction: VMS Signing ---
    if (shop.isVMSEnabled) {
        try {
            // We need to re-fetch the sale with all items and products populated for the VMS payload
            const populatedSaleForVMS = await Sale.findById(createdSale._id).populate({
                path: 'items',
                populate: { path: 'product' }, // Populate the full product for VMS
            });

            const vmsResponse = await vmsService.signNormalSaleInvoice(shop, populatedSaleForVMS);

            // Update the sale with the VMS response data
            createdSale = await Sale.findByIdAndUpdate(
                createdSale._id,
                {
                    isVmsSigned: true,
                    vmsData: {
                        vmsInvoiceNumber: vmsResponse.invoiceIdentifier,
                        qrCodeImage: vmsResponse.qrCode,
                        journalText: vmsResponse.journal,
                        signedAt: new Date(),
                    },
                },
                { new: true },
            );
        } catch (vmsError) {
            console.error(`VMS signing failed for receipt ${createdSale.receiptNo}:`, vmsError.message);
            // The sale is still saved, but we log the VMS error.
        }
    }

    // --- 8. Return the final populated document ---
    return Sale.findById(createdSale._id)
        .populate({
            path: 'items',
            populate: { path: 'product', select: 'name' },
        })
        .populate('customerId', 'name phonenumber');
};

/**
 * Retrieves all sales for a specific shop.
 * @param {string} shopId - The ID of the shop.
 * @param {string} userId - The ID of the admin.
 * @returns {Promise<Array<object>>} A list of sale documents.
 */
const getSalesByShop = async (shopId, userId) => {
    const shop = await Shop.findOne({ _id: shopId, adminId: userId });
    if (!shop) throw new Error('Shop not found or permission denied.');

    return Sale.find({ shopId })
        .sort({ createdAt: -1 })
        .populate('customerId', 'name phonenumber')
        .populate({
            path: 'items',
            populate: {
                path: 'product',
                select: 'name',
            },
        });
};

module.exports = {
    createSale,
    getSalesByShop,
};
