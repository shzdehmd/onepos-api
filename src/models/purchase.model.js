const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
    {
        purchaseNo: {
            type: String,
            unique: true,
        },
        shopId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shop',
            required: true,
        },
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Supplier',
            required: true,
        },
        // An array of references to the individual line items of this purchase
        items: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'PurchaseItem',
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        amountPaid: {
            type: Number,
            default: 0,
            min: 0,
        },
        paymentType: {
            type: String,
            enum: ['cash', 'credit', 'bank'],
            required: true,
        },
        status: {
            type: String,
            enum: ['completed', 'pending'], // 'pending' for credit purchases
            default: 'completed',
        },
        // The user who recorded this purchase
        recordedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// Virtual property to calculate the outstanding balance
purchaseSchema.virtual('outstandingBalance').get(function () {
    return this.totalAmount - this.amountPaid;
});

// Pre-save hook to generate a unique purchase number
purchaseSchema.pre('save', function (next) {
    // Only generate a purchaseNo if it's a new document
    if (this.isNew) {
        const prefix = 'PUR';
        const timestamp = Date.now();
        this.purchaseNo = `${prefix}-${timestamp}`;
    }
    next();
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
