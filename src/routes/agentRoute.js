const {agentController}  = require('../controller/agentController');
const {agentAuthController}  = require('../controller/agentController');
const {adminAuth}=require('../controller/authController')
const {checkRole}=require('../middleware/checkRole')
const upload = require('../utils/upload')
const combinedAuthenticate = require('../middleware/permission')

const agentRoute = (app) => {
    app.post('/create-agent',combinedAuthenticate, checkRole(['admin',]), agentController.createAgent);
    app.get('/get-agent',combinedAuthenticate, checkRole(['admin','agent']),agentController.getAgent)
    app.get('/get-agent/:agentId',combinedAuthenticate, checkRole(['admin','agent']), agentController.getAgentById);
    app.put('/update-agent/:agentId',combinedAuthenticate, checkRole(['admin','agent']), agentController.updateAgent);
    app.delete('/delete-agent/:agentId', combinedAuthenticate, checkRole(['admin']),agentController.deleteAgent);

    app.post('/assign-task/:agentId',combinedAuthenticate, checkRole(['admin']), agentController.assignTask)
    app.get('/get-assign-task', combinedAuthenticate, checkRole(['admin','agent']),agentController.getAssignTask)
    app.get('/get-assign-tasks/:agentId',combinedAuthenticate, checkRole(['admin','agent']), agentController.getAssignTaskById);
    app.get('/get-assign-task/:taskId',combinedAuthenticate, checkRole(['admin','agent']), agentController.getAssignTaskByTaskId);
    app.put('/update-assign-task/:taskId',combinedAuthenticate, checkRole(['admin']), agentController.updateAssignTaskById);
    app.delete('/delete-assign-task/:agentId/:taskId',combinedAuthenticate, checkRole(['admin']),  agentController.deleteAssignTaskById);
    app.delete('/delete-assign-task/:taskId',combinedAuthenticate, checkRole(['admin']),  agentController.deleteAssignTaskByTaskId);


    app.post('/upload-task', combinedAuthenticate, checkRole(['admin']),upload.single('file'), agentController.saveExcelFileData)
    app.post('/create-agent-csv', combinedAuthenticate, checkRole(['admin','agent']),upload.single('file'), agentController.saveExcelFileDataOfCreateAgent)


    app.post('/login-agent',agentAuthController.login)
    app.post('/forgot-password-agent', agentAuthController.forgotPassword);
    app.post('/verify-reset-code-agent', agentAuthController.verifyResetCode)
    app.post('/reset-password-agent', agentAuthController.resetPassword);
    app.post('/logout-agent', agentAuthController.authenticate, agentAuthController.logout);
    app.post('/verify-token', adminAuth.verifyToken);
    app.put('/update-status/:agentId',combinedAuthenticate, checkRole(['admin']),agentAuthController.updateAgentStatus)

};

module.exports = agentRoute;
