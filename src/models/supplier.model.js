const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Supplier name is required.'],
            trim: true,
        },
        phoneNumber: {
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
        // Each supplier is owned by an admin to ensure data separation.
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

// Add a compound index to ensure that a supplier name is unique per admin.
supplierSchema.index({ name: 1, adminId: 1 }, { unique: true });

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
