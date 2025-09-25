const Admin = require('../../models/admin.model');

/**
 * Registers a new admin user.
 * @param {object} userData - The user data from the request body.
 * @returns {Promise<object>} The created admin user object.
 */
const registerAdmin = async (userData) => {
    const { email, username, password, phone } = userData;

    // Check if a user with the same email or username already exists
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
    if (existingAdmin) {
        throw new Error('Admin with this email or username already exists.');
    }

    // Create and save the new admin
    const admin = await Admin.create({
        email,
        username,
        password,
        phone,
    });

    return admin;
};

/**
 * Logs in an admin user.
 * @param {string} email - The admin's email.
 * @param {string} password - The admin's password.
 * @returns {Promise<object>} An object containing the logged-in user and tokens.
 */
const loginAdmin = async (email, password) => {
    // Find the admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
        throw new Error('Invalid credentials.');
    }

    // Check if the password is correct
    const isPasswordValid = await admin.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials.');
    }

    // Generate access and refresh tokens
    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    // Save the refresh token to the database
    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });

    // Prepare the user object to be returned (excluding sensitive info)
    const loggedInUser = await Admin.findById(admin._id).select('-password -refreshToken');

    return { loggedInUser, accessToken, refreshToken };
};

module.exports = {
    registerAdmin,
    loginAdmin,
};
