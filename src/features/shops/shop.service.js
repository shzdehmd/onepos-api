const Shop = require('../../models/shop.model');
const Admin = require('../../models/admin.model');

/**
 * Creates a new shop for a given admin.
 * @param {object} shopData - The data for the new shop.
 * @param {string} adminId - The ID of the admin creating the shop.
 * @returns {Promise<object>} The newly created shop document.
 */
const createShop = async (shopData, adminId) => {
    const newShop = await Shop.create({
        ...shopData,
        adminId,
    });

    // If the admin does not have a primary shop set, assign this new one.
    const admin = await Admin.findById(adminId);
    if (admin && !admin.primaryShop) {
        admin.primaryShop = newShop._id;
        await admin.save({ validateBeforeSave: false });
    }

    return newShop;
};

/**
 * Retrieves all shops belonging to a specific admin.
 * @param {string} adminId - The ID of the admin.
 * @returns {Promise<Array<object>>} A list of shop documents.
 */
const getShopsByAdmin = async (adminId) => {
    const shops = await Shop.find({ adminId });
    return shops;
};

module.exports = {
    createShop,
    getShopsByAdmin,
};
