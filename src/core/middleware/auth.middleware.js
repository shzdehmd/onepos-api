const jwt = require('jsonwebtoken');
const Admin = require('../../models/admin.model');

const protect = async (req, res, next) => {
    try {
        // Extract token from either cookie or Authorization header
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            res.status(401);
            throw new Error('Unauthorized request. No token provided.');
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find the user based on the token's payload (_id)
        // Exclude sensitive fields like password and refreshToken
        const user = await Admin.findById(decoded._id).select('-password -refreshToken');

        if (!user) {
            // This case handles if the user has been deleted after the token was issued
            res.status(401);
            throw new Error('Invalid access token. User not found.');
        }

        // Attach the user object to the request for use in subsequent handlers
        req.user = user;
        next();
    } catch (error) {
        // Catches errors from jwt.verify (e.g., token expired, invalid signature)
        // and passes them to the global error handler
        res.status(401); // Ensure status is set to 401 for auth errors
        next(new Error('Unauthorized request. Invalid token.'));
    }
};

module.exports = { protect };
