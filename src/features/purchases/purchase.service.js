const mongoose = require('mongoose');
const Purchase = require('../../models/purchase.model');
const PurchaseItem = require('../../models/purchaseItem.model');
const Product = require('../../models/product.model');
const Shop = require('../../models/shop.model');
const Supplier = require('../../models/supplier.model');

/**
 * Creates a new purchase and updates product quantities.
 * This operation is performed within a database transaction.
 * @param {object} purchaseData - Data for the purchase, including items.
 * @param {string} userId - The ID of the admin recording the purchase.
 * @returns {Promise<object>} The newly created and populated purchase document.
 */
const createPurchase = async (purchaseData, userId) => {
    const { shopId, supplierId, items, paymentType, amountPaid } = purchaseData;

    // --- 1. Pre-Transaction Validations ---
    const shop = await Shop.findOne({ _id: shopId, adminId: userId });
    if (!shop) throw new Error('Shop not found or permission denied.');

    const supplier = await Supplier.findOne({ _id: supplierId, adminId: userId });
    if (!supplier) throw new Error('Supplier not found or permission denied.');

    if (!items || items.length === 0) throw new Error('Purchase must include at least one item.');

    // --- 2. Start a Mongoose Session for the Transaction ---
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // --- 3. Calculate Total and Prepare Item Data ---
        let calculatedTotal = 0;
        const purchaseItemDocs = [];
        const productUpdates = [];

        for (const item of items) {
            const product = await Product.findById(item.productId).session(session);
            if (!product || product.shopId.toString() !== shopId) {
                throw new Error(`Product with ID ${item.productId} not found in this shop.`);
            }
            calculatedTotal += item.quantity * item.unitPrice;
            purchaseItemDocs.push({ ...item });
            productUpdates.push({
                updateOne: {
                    filter: { _id: item.productId },
                    update: { $inc: { quantity: item.quantity } },
                },
            });
        }

        // --- 4. Create the Main Purchase Document ---
        const purchase = new Purchase({
            shopId,
            supplierId,
            totalAmount: calculatedTotal,
            amountPaid: amountPaid || 0,
            paymentType,
            status: (amountPaid || 0) < calculatedTotal ? 'pending' : 'completed',
            recordedBy: userId,
        });
        await purchase.save({ session });

        // --- 5. Create PurchaseItem Documents ---
        const createdItems = await PurchaseItem.insertMany(
            purchaseItemDocs.map((item) => ({ ...item, purchaseId: purchase._id })),
            { session },
        );

        // --- 6. Link Items to Purchase and Update Product Quantities ---
        purchase.items = createdItems.map((item) => item._id);
        await purchase.save({ session });
        await Product.bulkWrite(productUpdates, { session });

        // --- 7. Commit the Transaction ---
        await session.commitTransaction();

        // --- 8. Return the Populated Document ---
        // Repopulate outside the transaction to get all details
        return Purchase.findById(purchase._id)
            .populate({
                path: 'items',
                populate: { path: 'product', select: 'name' },
            })
            .populate('supplierId', 'name');
    } catch (error) {
        // --- 9. If Anything Fails, Abort the Transaction ---
        await session.abortTransaction();
        throw error; // Re-throw the error to be caught by the controller
    } finally {
        // --- 10. End the Session ---
        session.endSession();
    }
};

/**
 * Retrieves all purchases for a specific shop.
 * @param {string} shopId - The ID of the shop.
 * @param {string} userId - The ID of the admin.
 * @returns {Promise<Array<object>>} A list of purchase documents.
 */
const getPurchasesByShop = async (shopId, userId) => {
    const shop = await Shop.findOne({ _id: shopId, adminId: userId });
    if (!shop) throw new Error('Shop not found or permission denied.');

    return Purchase.find({ shopId })
        .sort({ createdAt: -1 }) // Show most recent first
        .populate('supplierId', 'name')
        .populate({
            path: 'items',
            populate: {
                path: 'product',
                select: 'name sellingPrice',
            },
        });
};

module.exports = {
    createPurchase,
    getPurchasesByShop,
};
