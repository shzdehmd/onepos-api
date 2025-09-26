const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
    {
        customerNo: {
            type: Number,
        },
        name: {
            type: String,
            required: [true, 'Customer name is required.'],
            trim: true,
        },
        phonenumber: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        wallet: {
            type: Number, // Represents balance in cents
            default: 0,
        },
        // Each customer is owned by an admin to ensure data separation.
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

// This compound index ensures the customer number is unique for each admin.
customerSchema.index({ customerNo: 1, adminId: 1 }, { unique: true });

// Pre-save hook to generate a unique, sequential customer number per admin.
customerSchema.pre('save', async function (next) {
    if (this.isNew) {
        // Find the customer with the highest customerNo for this admin.
        const lastCustomer = await this.constructor.findOne({ adminId: this.adminId }).sort({ customerNo: -1 });

        // Set the new customerNo to 1 more than the last, or 1 if it's the first.
        this.customerNo = lastCustomer && lastCustomer.customerNo ? lastCustomer.customerNo + 1 : 1;
    }
    next();
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
