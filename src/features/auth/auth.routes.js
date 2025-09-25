const { Router } = require('express');
const { registerAdminHandler, loginAdminHandler, getCurrentUserHandler } = require('./auth.controller');
const { protect } = require('../../core/middleware/auth.middleware');

const router = Router();

router.post('/register', registerAdminHandler);
router.post('/login', loginAdminHandler);

// --- Protected Routes ---
// This user profile will only be accessible if a valid accessToken is provided
router.get('/profile', protect, getCurrentUserHandler);

module.exports = router;
