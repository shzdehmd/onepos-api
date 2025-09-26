const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const attendantSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required.'],
            trim: true,
        },
        // A short, unique code for quick login on a POS terminal, unique per admin.
        uniqueDigits: {
            type: String,
            required: [true, 'A unique PIN/code is required.'],
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required.'],
        },
        shopId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shop',
            required: true,
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
        permissions: {
            type: [String],
            default: [], // e.g., ['CAN_PROCESS_SALE', 'CAN_VIEW_REPORTS']
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    },
);

// Compound index to ensure username and uniqueDigits are unique per admin.
attendantSchema.index({ username: 1, adminId: 1 }, { unique: true });
attendantSchema.index({ uniqueDigits: 1, adminId: 1 }, { unique: true });

// Hash password before saving
attendantSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare candidate password with the hashed password
attendantSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Method to generate a JWT access token
attendantSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            shopId: this.shopId,
            role: 'attendant', // Crucial for our middleware to identify the user type
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        },
    );
};

// Method to generate a JWT refresh token
attendantSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            role: 'attendant',
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        },
    );
};

const Attendant = mongoose.model('Attendant', attendantSchema);

module.exports = Attendant;
