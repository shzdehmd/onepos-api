const mongoose = require('mongoose');

const purchaseItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        quantity: {
            type: Number,
            required: [true, 'Item quantity is required.'],
            min: [1, 'Quantity must be at least 1.'],
        },
        // The cost per unit at the time of purchase
        unitPrice: {
            type: Number,
            required: [true, 'Item unit price is required.'],
            min: 0,
        },
        // A reference back to the parent Purchase document
        purchaseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Purchase',
            required: true,
        },
    },
    {
        timestamps: true,
        // Define a virtual property to easily calculate the total for this line item
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

purchaseItemSchema.virtual('total').get(function () {
    return this.quantity * this.unitPrice;
});

const PurchaseItem = mongoose.model('PurchaseItem', purchaseItemSchema);

module.exports = PurchaseItem;
