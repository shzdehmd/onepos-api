const mongoose = require('mongoose');
const Sale = require('../../models/sale.model');
const SaleItem = require('../../models/saleItem.model');
const Product = require('../../models/product.model');
const Shop = require('../../models/shop.model');
const Customer = require('../../models/customer.model');
const vmsService = require('./sale.vms.service');

/**
 * Creates a new sale, updates product quantities, and optionally signs with VMS.
 * @param {object} saleData - Data for the sale, including items.
 *
 * @param {object} user - The authenticated user object (Admin or Attendant) from req.user.
 * @returns {Promise<object>} The newly created and populated sale document.
 */
const createSale = async (saleData, user) => {
    // --- KEY CHANGE: Determine the shopId and adminId based on the user's role ---
    const shopId = user.role === 'admin' ? saleData.shopId : user.shopId.toString();
    const adminId = user.role === 'admin' ? user._id.toString() : user.adminId.toString();
    const userId = user._id; // The ID of the user actually processing the sale

    if (!shopId) {
        throw new Error('Shop ID is required for this operation.');
    }

    // --- 1. Pre-Transaction Validations ---
    const shop = await Shop.findOne({ _id: shopId, adminId: adminId }).select('+frcsSettings.p12_chain_file');
    if (!shop) throw new Error('Shop not found or permission denied.');

    if (saleData.customerId) {
        const customer = await Customer.findOne({ _id: saleData.customerId, adminId: adminId });
        if (!customer) throw new Error('Customer not found or you do not have permission to use it.');
    }

    if (!saleData.items || saleData.items.length === 0) throw new Error('Sale must include at least one item.');

    // --- (The rest of the function remains largely the same, but uses the new variables) ---
    const session = await mongoose.startSession();
    session.startTransaction();

    let createdSale;

    try {
        let calculatedTotal = 0;
        const saleItemDocs = [];
        const productUpdates = [];

        for (const item of saleData.items) {
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

        const sale = new Sale({
            ...saleData,
            shopId, // Ensure the correct shopId is saved
            totalAmount: calculatedTotal,
            status: (saleData.amountPaid || 0) < calculatedTotal ? 'pending' : 'completed',
            processedBy: userId, // --- KEY CHANGE: Save the actual user's ID ---
        });
        await sale.save({ session });

        const createdItems = await SaleItem.insertMany(
            saleItemDocs.map((item) => ({ ...item, saleId: sale._id })),
            { session },
        );

        sale.items = createdItems.map((item) => item._id);
        await sale.save({ session });
        await Product.bulkWrite(productUpdates, { session });

        await session.commitTransaction();
        createdSale = sale;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }

    if (shop.isVMSEnabled) {
        try {
            const populatedSaleForVMS = await Sale.findById(createdSale._id).populate({
                path: 'items',
                populate: { path: 'product' },
            });

            const vmsResponse = await vmsService.signNormalSaleInvoice(shop, populatedSaleForVMS);

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
        }
    }

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
 * @param {object} user - The authenticated user (Admin or Attendant).
 * @returns {Promise<Array<object>>} A list of sale documents.
 */
const getSalesByShop = async (shopId, user) => {
    // --- KEY CHANGE: Determine adminId based on user role ---
    const adminId = user.role === 'admin' ? user._id.toString() : user.adminId.toString();

    const shop = await Shop.findOne({ _id: shopId, adminId: adminId });
    if (!shop) throw new Error('Shop not found or permission denied.');

    // --- KEY CHANGE: An attendant can only view sales for their assigned shop ---
    if (user.role === 'attendant' && user.shopId.toString() !== shopId) {
        throw new Error('Permission denied. You can only view sales for your assigned shop.');
    }

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
