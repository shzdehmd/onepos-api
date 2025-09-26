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

const getCurrentUserHandler = (req, res) => {
    // The `protect` middleware has already fetched the user and attached it to req.user
    // We just need to send it back.
    res.status(200).json({
        success: true,
        message: 'Current user data fetched successfully.',
        data: req.user,
    });
};

const loginAttendantHandler = async (req, res, next) => {
    const { uniqueDigits, password } = req.body;

    if (!uniqueDigits || !password) {
        return res.status(400).json({ success: false, message: 'Unique code and password are required.' });
    }

    try {
        const { loggedInUser, accessToken, refreshToken } = await authService.loginAttendant(uniqueDigits, password);

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        };

        res.status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', refreshToken, options)
            .json({
                success: true,
                message: 'Attendant logged in successfully.',
                data: {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
            });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerAdminHandler,
    loginAdminHandler,
    getCurrentUserHandler,
    loginAttendantHandler,
};
