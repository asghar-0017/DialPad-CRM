const {agentController}  = require('../controller/agentController');
const {agentAuthController}  = require('../controller/agentController');
const {adminAuth}=require('../controller/authController')
const {checkRole}=require('../middleware/checkRole')
const upload = require('../utils/upload')
const combinedAuthenticate = require('../middleware/permission')

const agentRoute = (app) => {
    app.post('/create-agent',combinedAuthenticate, checkRole(['admin']), agentController.createAgent);
    app.get('/get-agent',adminAuth.authenticate, checkRole(['admin']),agentController.getAgent)
    app.get('/get-agent/:agentId',adminAuth.authenticate, checkRole(['admin']), agentController.getAgentById);
    app.put('/update-agent/:agentId', adminAuth.authenticate, checkRole(['admin']), agentController.updateAgent);
    app.delete('/delete-agent/:agentId', adminAuth.authenticate, checkRole(['admin']),agentController.deleteAgent);

    app.post('/assign-task/:agentId',adminAuth.authenticate, checkRole(['admin']), agentController.assignTask)
    app.get('/get-assign-task', adminAuth.authenticate, checkRole(['admin']),agentController.getAssignTask)
    app.get('/get-assign-tasks/:agentId', adminAuth.authenticate, checkRole(['admin']), agentController.getAssignTaskById);
    app.get('/get-assign-task/:taskId',adminAuth.authenticate, checkRole(['admin']), agentController.getAssignTaskByTaskId);
    app.put('/update-assign-task/:taskId', adminAuth.authenticate, checkRole(['admin']), agentController.updateAssignTaskById);
    app.delete('/delete-assign-task/:agentId/:taskId',adminAuth.authenticate, checkRole(['admin']),  agentController.deleteAssignTaskById);
    app.delete('/delete-assign-task/:taskId',adminAuth.authenticate, checkRole(['admin']),  agentController.deleteAssignTaskByTaskId);


    app.post('/upload-task', upload.single('file'), agentController.saveExcelFileData)



    app.post('/login-agent',agentAuthController.login)
    app.post('/forgot-password-agent', agentAuthController.forgotPassword);
    app.post('/verify-reset-code-agent', agentAuthController.verifyResetCode);
    app.post('/reset-password-agent', agentAuthController.resetPassword);
    app.post('/logout-agent', adminAuth.authenticate, agentAuthController.logout);
    app.post('/verify-token', agentAuthController.verifyToken);

};

module.exports = agentRoute;
