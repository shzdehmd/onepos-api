const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema(
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
        // The price per unit at the time of sale
        unitPrice: {
            type: Number,
            required: [true, 'Item unit price is required.'],
            min: 0,
        },
        // A reference back to the parent Sale document
        saleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Sale',
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

saleItemSchema.virtual('total').get(function () {
    return this.quantity * this.unitPrice;
});

const SaleItem = mongoose.model('SaleItem', saleItemSchema);

module.exports = SaleItem;
