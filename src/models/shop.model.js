const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        contact: {
            type: String,
            trim: true,
        },
        currency: {
            type: String,
            required: true,
            trim: true,
        },
        logo: {
            type: String, // URL to the logo image
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
        subscription: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subscription',
        },
        allowNegativeSelling: {
            type: Boolean,
            default: false,
        },
        isVMSEnabled: {
            type: Boolean,
            default: false,
        },
        shopTIN: {
            type: String,
        },
        frcsSettings: {
            uid: { type: String, trim: true },
            invoiceType: {
                type: String,
                enum: ['Training', 'Normal'],
                default: 'Training',
            },
            encryptedPac: {
                iv: String,
                content: String,
                authTag: String,
            },
            encryptedPassword: {
                iv: String,
                content: String,
                authTag: String,
            },
            p12_chain_file: {
                type: Buffer,
                select: false,
            },
        },
    },
    {
        timestamps: true,
    },
);

const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;
