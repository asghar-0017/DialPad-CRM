const { adminAuth } = require('../controller/authController');

const AdminAuthRoute = (app) => {
    app.post('/auth', adminAuth.login);
    app.post('/forgot-password', adminAuth.forgotPassword);
    app.post('/verify-reset-code', adminAuth.verifyResetCode);
    app.post('/reset-password', adminAuth.resetPassword);
    app.post('/logout', adminAuth.authenticate, adminAuth.logout);
    app.post('/verify-token', adminAuth.verifyToken);
};

module.exports = AdminAuthRoute;
