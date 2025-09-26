const attendantService = require('./attendant.service');

const createAttendantHandler = async (req, res, next) => {
    try {
        const adminId = req.user._id;
        const attendant = await attendantService.createAttendant(req.body, adminId);
        res.status(201).json({
            success: true,
            message: 'Attendant created successfully.',
            data: attendant,
        });
    } catch (error) {
        next(error);
    }
};

const getAdminAttendantsHandler = async (req, res, next) => {
    try {
        const adminId = req.user._id;
        const attendants = await attendantService.getAttendantsByAdmin(adminId);
        res.status(200).json({
            success: true,
            message: 'Attendants fetched successfully.',
            data: attendants,
        });
    } catch (error) {
        next(error);
    }
};

const updateAttendantHandler = async (req, res, next) => {
    try {
        const { attendantId } = req.params;
        const adminId = req.user._id;

        const updatedAttendant = await attendantService.updateAttendant(attendantId, req.body, adminId);

        if (!updatedAttendant) {
            res.status(404);
            throw new Error('Attendant not found or you do not have permission to update it.');
        }

        res.status(200).json({
            success: true,
            message: 'Attendant updated successfully.',
            data: updatedAttendant,
        });
    } catch (error) {
        next(error);
    }
};

const deleteAttendantHandler = async (req, res, next) => {
    try {
        const { attendantId } = req.params;
        const adminId = req.user._id;

        const deletedAttendant = await attendantService.deleteAttendant(attendantId, adminId);

        if (!deletedAttendant) {
            res.status(404);
            throw new Error('Attendant not found or you do not have permission to delete it.');
        }

        res.status(200).json({
            success: true,
            message: 'Attendant deleted successfully.',
            data: { _id: deletedAttendant._id },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAttendantHandler,
    getAdminAttendantsHandler,
    updateAttendantHandler,
    deleteAttendantHandler,
};
