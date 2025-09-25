const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        username: {
            type: String,
            required: [true, 'Username is required'],
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
        },
        primaryShop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shop',
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        phoneVerified: {
            type: Boolean,
            default: false,
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    },
);

// Hash password before saving
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare candidate password with the hashed password
adminSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Method to generate a JWT access token
adminSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            // We can add roles here later, e.g., role: 'admin'
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        },
    );
};

// Method to generate a JWT refresh token
adminSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        },
    );
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
