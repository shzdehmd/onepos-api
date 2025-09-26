const jwt = require('jsonwebtoken');
const Admin = require('../../models/admin.model');
const Attendant = require('../../models/attendant.model');

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

        let user;
        // Check the role from the token and query the appropriate model
        if (decoded.role === 'admin') {
            user = await Admin.findById(decoded._id).select('-password -refreshToken');
        } else if (decoded.role === 'attendant') {
            user = await Attendant.findById(decoded._id).select('-password -refreshToken');
        } else {
            res.status(401);
            throw new Error('Invalid token. Unknown user role.');
        }

        if (!user) {
            // This case handles if the user has been deleted after the token was issued
            res.status(401);
            throw new Error('Invalid access token. User not found.');
        }

        // Attach the found user (either Admin or Attendant) to the request
        req.user = user;
        next();
    } catch (error) {
        res.status(401);
        next(new Error('Unauthorized request. Invalid token.'));
    }
};

module.exports = { protect };
