const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
    {
        receiptNo: {
            type: String,
            unique: true,
        },
        shopId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shop',
            required: true,
        },
        // Customer is optional for cash-and-carry sales
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
        },
        items: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'SaleItem',
            },
        ],
        totalAmount: {
            type: Number, // Represents amount in cents
            required: true,
            min: 0,
        },
        amountPaid: {
            type: Number, // Represents amount in cents
            default: 0,
            min: 0,
        },
        paymentType: {
            type: String,
            enum: ['cash', 'credit', 'card', 'bank', 'wallet', 'split', 'mobile'],
            required: true,
        },
        status: {
            type: String,
            enum: ['completed', 'pending', 'voided'], // 'pending' for credit, 'voided' for cancelled
            default: 'completed',
        },
        // The user who processed this sale
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin', // Will later include 'Attendant'
            required: true,
        },
        isVmsSigned: {
            type: Boolean,
            default: false,
        },
        vmsData: {
            vmsInvoiceNumber: String,
            qrCodeImage: String, // URL or Base64 string of the QR code
            journalText: String, // Text representation of the fiscal receipt
            signedAt: Date,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// Virtual property to calculate the outstanding balance
saleSchema.virtual('outstandingBalance').get(function () {
    return this.totalAmount - this.amountPaid;
});

// Pre-save hook to generate a unique receipt number
saleSchema.pre('save', function (next) {
    if (this.isNew) {
        const prefix = 'REC';
        const timestamp = Date.now();
        this.receiptNo = `${prefix}-${timestamp}`;
    }
    next();
});

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;
