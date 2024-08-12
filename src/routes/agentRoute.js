const {agentController}  = require('../controller/agentController');
const {agentAuthController}  = require('../controller/agentController');
const {adminAuth}=require('../controller/authController')
const {checkRole}=require('../middleware/checkRole')
const upload = require('../utils/upload')

const agentRoute = (app) => {
    app.post('/create-agent', agentController.createAgent);
    app.get('/get-agent',agentController.getAgent)
    app.get('/get-agent/:agentId', agentController.getAgentById);
    app.put('/update-agent/:agentId',  agentController.updateAgent);
    app.delete('/delete-agent/:agentId', agentController.deleteAgent);

    app.post('/assign-task/:agentId', agentController.assignTask)
    app.get('/get-assign-task', agentController.getAssignTask)
    app.get('/get-assign-task/:agentId',  agentController.getAssignTaskById);
    app.get('/get-assign-task/:taskId',  agentController.getAssignTaskByTaskId);
    app.put('/update-assign-task/:agentId/:taskId',  agentController.updateAssignTaskById);
    app.delete('/delete-assign-task/:agentId/:taskId',  agentController.deleteAssignTaskById);


    app.post('/upload-task', upload.single('file'), agentController.saveExcelFileData)



    app.post('/login-agent',agentAuthController.login)
    app.post('/forgot-password-agent', agentAuthController.forgotPassword);
    app.post('/verify-reset-code-agent', agentAuthController.verifyResetCode);
    app.post('/reset-password-agent', agentAuthController.resetPassword);
    app.post('/logout-agent', adminAuth.authenticate, agentAuthController.logout);
    app.post('/verify-token', agentAuthController.verifyToken);

};

module.exports = agentRoute;
