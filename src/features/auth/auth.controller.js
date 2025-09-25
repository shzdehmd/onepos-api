const authService = require('./auth.service');

const registerAdminHandler = async (req, res, next) => {
    try {
        const admin = await authService.registerAdmin(req.body);
        // Exclude password from the response
        const adminResponse = admin.toObject();
        delete adminResponse.password;

        res.status(201).json({
            success: true,
            message: 'Admin registered successfully.',
            data: adminResponse,
        });
    } catch (error) {
        // Pass the error to the global error handler
        next(error);
    }
};

const loginAdminHandler = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    try {
        const { loggedInUser, accessToken, refreshToken } = await authService.loginAdmin(email, password);

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        };

        res.status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', refreshToken, options)
            .json({
                success: true,
                message: 'Admin logged in successfully.',
                data: {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
            });
    } catch (error) {
        // Pass the error to the global error handler
        next(error);
    }
};

module.exports = {
    registerAdminHandler,
    loginAdminHandler,
};
