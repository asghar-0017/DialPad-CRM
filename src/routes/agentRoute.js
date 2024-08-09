const {agentController}  = require('../controller/agentController');
const {agentAuthController}  = require('../controller/agentController');
const {adminAuth}=require('../controller/authController')
const {checkRole}=require('../middleware/checkRole')

const agentRoute = (app) => {
    app.post('/create-agent',  adminAuth.authenticate, checkRole(['admin']),agentController.createAgent);
    app.get('/get-agent', adminAuth.authenticate, checkRole(['admin','agent']),agentController.getAgent)
    app.get('/get-agent/:agentId', adminAuth.authenticate, checkRole(['admin','agent']), agentController.getAgentById);
    app.put('/update-agent/:agentId', adminAuth.authenticate, checkRole(['admin','agent']), agentController.updateAgent);
    app.delete('/delete-agent/:agentId', adminAuth.authenticate, checkRole(['admin']), agentController.deleteAgent);
    app.post('/assign-task/:agentId',adminAuth.authenticate, checkRole(['admin']), agentController.assignTask)


    app.post('/login-agent',agentAuthController.login)
    app.post('/forgot-password-agent', agentAuthController.forgotPassword);
    app.post('/verify-reset-code-agent', agentAuthController.verifyResetCode);
    app.post('/reset-password-agent', agentAuthController.resetPassword);
    // app.post('/logout', adminAuth.authenticate, adminAuth.logout);
    // app.post('/verify-token', adminAuth.verifyToken);

};

module.exports = agentRoute;
