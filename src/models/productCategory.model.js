const mongoose = require('mongoose');

const productCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Category name is required.'],
            trim: true,
        },
        // Each category is owned by an admin to ensure data separation.
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

// Add a compound index to ensure that a category name is unique per admin.
productCategorySchema.index({ name: 1, adminId: 1 }, { unique: true });

const ProductCategory = mongoose.model('ProductCategory', productCategorySchema);

module.exports = ProductCategory;
