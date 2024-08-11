const adminService = require('../service/authService');
const jwt = require('jsonwebtoken');
const { agentAuthService } = require('../service/agentService');
require('dotenv').config();

const secretKey = process.env.SECRET_KEY; // Corrected typo

const combinedAuthenticate = async (req, res, next) => {
    try {
        console.log("Combined API Hit");

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('No token provided');
            if (!res.headersSent) {
                return res.status(401).json({ message: 'No token provided' });
            }
            return; // Ensures no further code execution
        }

        const token = authHeader.split(' ')[1];
        let user;
        let decoded;

        try {
            console.log('Attempting to validate admin token...');
            const isValidAdminToken = await adminService.validateAdminToken(token);
            if (isValidAdminToken) {
                decoded = jwt.verify(token, secretKey);
                user = await adminService.findUserById(decoded.userName);
                if (user) {
                    req.user = user;
                    console.log('Admin token validated successfully, proceeding to next middleware');
                    return next();
                }
            }
        } catch (error) {
            console.log('Admin token validation failed:', error.message);
        }

        try {
            console.log('Attempting to validate agent token...');
            const isValidAgentToken = await agentAuthService.validateAgentToken(token);
            if (isValidAgentToken) {
                decoded = jwt.verify(token, secretKey);
                user = await agentAuthService.findUserById(decoded.userName);
                if (user) {
                    req.user = user;
                    console.log('Agent token validated successfully, proceeding to next middleware');
                    return next();
                }
            }
        } catch (error) {
            console.log('Agent token validation failed:', error.message);
        }

        // If neither token is valid, return a forbidden error
        console.log('Both admin and agent token validations failed');
        if (!res.headersSent) {
            return res.status(403).json({ message: 'Forbidden: Invalid token' });
        }

    } catch (error) {
        console.log('Internal Server Error:', error.message);
        if (!res.headersSent) {
            return res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    }
};

module.exports = combinedAuthenticate;
