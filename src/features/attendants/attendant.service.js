const Attendant = require('../../models/attendant.model');
const Shop = require('../../models/shop.model');

/**
 * Creates a new attendant for a specific shop, owned by the logged-in admin.
 * @param {object} attendantData - Data for the new attendant.
 * @param {string} adminId - The ID of the admin creating the attendant.
 * @returns {Promise<object>} The newly created attendant document.
 */
const createAttendant = async (attendantData, adminId) => {
    const { shopId } = attendantData;

    // Security Check: Ensure the shop belongs to the admin creating the attendant.
    const shop = await Shop.findOne({ _id: shopId, adminId });
    if (!shop) {
        throw new Error('Shop not found or you do not have permission to add attendants to it.');
    }

    const attendant = await Attendant.create({
        ...attendantData,
        adminId,
    });

    // Exclude password from the returned object
    const attendantObj = attendant.toObject();
    delete attendantObj.password;
    return attendantObj;
};

/**
 * Retrieves all attendants belonging to a specific admin.
 * @param {string} adminId - The ID of the admin.
 * @returns {Promise<Array<object>>} A list of attendant documents.
 */
const getAttendantsByAdmin = async (adminId) => {
    const attendants = await Attendant.find({ adminId })
        .select('-password -refreshToken') // Exclude sensitive fields
        .populate('shopId', 'name'); // Populate the shop's name
    return attendants;
};

/**
 * Updates an existing attendant.
 * @param {string} attendantId - The ID of the attendant to update.
 * @param {object} updateData - The data to update.
 * @param {string} adminId - The ID of the admin to verify ownership.
 * @returns {Promise<object|null>} The updated attendant document.
 */
const updateAttendant = async (attendantId, updateData, adminId) => {
    // Prevent changing the admin or shop ID directly in a simple update
    delete updateData.adminId;
    delete updateData.shopId;

    const attendant = await Attendant.findOneAndUpdate(
        { _id: attendantId, adminId }, // Ensures admin can only update their own attendants
        updateData,
        { new: true, runValidators: true },
    ).select('-password -refreshToken');

    return attendant;
};

/**
 * Deletes an attendant.
 * @param {string} attendantId - The ID of the attendant to delete.
 * @param {string} adminId - The ID of the admin to verify ownership.
 * @returns {Promise<object|null>} The deleted attendant document.
 */
const deleteAttendant = async (attendantId, adminId) => {
    const attendant = await Attendant.findOneAndDelete({ _id: attendantId, adminId });
    return attendant;
};

module.exports = {
    createAttendant,
    getAttendantsByAdmin,
    updateAttendant,
    deleteAttendant,
};
