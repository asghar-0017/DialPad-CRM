const {agentController}  = require('../controller/agentController');
const {adminAuth}=require('../controller/authController')
const {checkRole}=require('../middleware/checkRole')

const agentRoute = (app) => {
    app.post('/create-agent',  adminAuth.authenticate, checkRole(['admin']),agentController.createAgent);
    app.get('/get-agent', adminAuth.authenticate, checkRole(['admin','agent']),agentController.getAgent)
    app.get('/get-agent/:agentId', adminAuth.authenticate, checkRole(['admin','agent']), agentController.getAgentById);
    app.put('/update-agent/:agentId', adminAuth.authenticate, checkRole(['admin','agent']), agentController.updateAgent);
    app.delete('/delete-agent/:agentId', adminAuth.authenticate, checkRole(['admin']), agentController.deleteAgent);

};

module.exports = agentRoute;
