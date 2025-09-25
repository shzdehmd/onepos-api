const { Router } = require('express');
const { registerAdminHandler, loginAdminHandler } = require('./auth.controller');

const router = Router();

router.post('/register', registerAdminHandler);
router.post('/login', loginAdminHandler);

module.exports = router;
