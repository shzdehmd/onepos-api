const { Router } = require('express');
const {
    createAttendantHandler,
    getAdminAttendantsHandler,
    updateAttendantHandler,
    deleteAttendantHandler,
} = require('./attendant.controller');
const { protect } = require('../../core/middleware/auth.middleware');

const router = Router();

// Protect all routes in this file. Only an authenticated user (Admin) can manage attendants.
router.use(protect);

router.route('/').post(createAttendantHandler).get(getAdminAttendantsHandler);

router.route('/:attendantId').put(updateAttendantHandler).delete(deleteAttendantHandler);

module.exports = router;
