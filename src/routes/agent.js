const {agentController}  = require('../controller/agentController');
const {adminAuth}=require('../controller/authController')
const {checkRole}=require('../middleware/checkRole')

const agentRoute = (app) => {
    app.post('/create-agent', agentController.createAgent);
    app.get('/get-agent',agentController.getAgent)

};

module.exports = agentRoute;
