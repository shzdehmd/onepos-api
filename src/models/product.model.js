const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required.'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        sellingPrice: {
            type: Number,
            required: [true, 'Selling price is required.'],
            min: 0,
        },
        buyingPrice: {
            type: Number,
            min: 0,
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required.'],
            default: 0,
        },
        reorderLevel: {
            type: Number,
            default: 0,
        },
        images: [
            {
                type: String, // URLs to product images
            },
        ],
        barcode: {
            type: String,
            trim: true,
        },
        isTaxInclusive: {
            type: Boolean,
            default: false,
        },
        productCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductCategory',
        },
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Supplier',
        },
        shopId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shop',
            required: true,
        },
        // The user who created/added the product. Could be an Admin or Attendant.
        // For simplicity, we will reference the Admin model for now.
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
