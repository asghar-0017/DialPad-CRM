const {agentController}  = require('../controller/agentController');
const {agentAuthController}  = require('../controller/agentController');
const {adminAuth}=require('../controller/authController')
const {checkRole}=require('../middleware/checkRole')
const upload = require('../utils/upload')
const combinedAuthenticate = require('../middleware/permission')


const agentRoute = (app,io) => {
    app.post('/create-agent', combinedAuthenticate, checkRole(['admin']), (req, res) => agentController.createAgent(io, req, res));
    app.get("/verify-email",agentController.verifyEmail);
    app.get('/get-agent',combinedAuthenticate, checkRole(['admin','agent']),  (req, res) => agentController.getAgent(io, req, res))
    app.get('/get-agent/:agentId',combinedAuthenticate, checkRole(['admin','agent']), agentController.getAgentById);
    app.put('/update-agent/:agentId',combinedAuthenticate, checkRole(['admin','agent']), (req, res) => agentController.updateAgent(io, req, res));
    app.delete('/delete-agent/:agentId', combinedAuthenticate, checkRole(['admin']),agentController.deleteAgent);

    app.post('/assign-task/:agentId',combinedAuthenticate, checkRole(['admin']),(req, res) => agentController.assignTask(io, req, res))
    app.get('/get-assign-task', combinedAuthenticate, checkRole(['admin','agent']),(req, res) => agentController.getAssignTask(io, req, res))
    app.get('/get-assign-tasks/:agentId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => agentController.getAssignTaskById(io, req, res));
    app.get('/get-assign-task/:taskId',combinedAuthenticate, checkRole(['admin','agent']), agentController.getAssignTaskByTaskId);
    app.put('/update-assign-task/:taskId',combinedAuthenticate, checkRole(['admin']),(req, res) => agentController.updateAssignTaskById(io, req, res));

    app.delete('/delete-assign-task/:taskId',combinedAuthenticate, checkRole(['admin']),  agentController.deleteAssignTaskByTaskId);
    app.get('/get-assign-task-taskNo/:agentId/:taskNo',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => agentController.getAssignTaskByTaskNo(io, req, res))
    app.delete('/delete-assign-tasks/:agentId/:taskNo',combinedAuthenticate, checkRole(['admin']),  agentController.deleteAssignTaskByAgentId);
    app.put('/update-task-status/:agentId/:taskNo', combinedAuthenticate, checkRole(['admin', 'agent']), (req, res) => agentController.updateTaskStatus(io, req, res));


    app.post('/assign-review/:agentId/:taskNo',combinedAuthenticate, checkRole(['admin']),(req, res) => agentController.assignReview(io, req, res))
    app.get('/get-assign-reviews/:agentId/:taskNo',combinedAuthenticate, checkRole(['admin','agent']), agentController.getAssignReviewsById);
    app.get('/get-assign-review/:reviewId',combinedAuthenticate, checkRole(['admin','agent']), agentController.getAssignReviewByReviewId);
    app.put('/update-assign-review/:reviewId',combinedAuthenticate, checkRole(['admin']),(req, res) => agentController.updateAssignReviewById(io, req, res));
    app.delete('/delete-assign-review/:reviewId',combinedAuthenticate, checkRole(['admin']),  agentController.deleteAssignReviewByReviewId);


    app.post('/upload-task/:agentId', combinedAuthenticate, checkRole(['admin','agent']),upload.single('file'),(req, res) => agentController.saveExcelFileData(io, req, res))
    
    app.post('/create-agent-csv', combinedAuthenticate, checkRole(['admin','agent']),upload.single('file'),(req, res) => agentController.saveExcelFileDataOfCreateAgent(io, req, res))


    app.post('/login-agent',agentAuthController.login)
    app.post('/forgot-password-agent', agentAuthController.forgotPassword);
    app.post('/verify-reset-code-agent', agentAuthController.verifyResetCode)
    app.post('/reset-password-agent', agentAuthController.resetPassword);
    app.post('/logout', adminAuth.logout);
    app.post('/verify-token',adminAuth.verifyToken);

    app.put('/update-status/:agentId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) =>agentAuthController.updateAgentStatus(io, req, res))

};

module.exports = agentRoute;
