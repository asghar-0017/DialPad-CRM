const {agentController}  = require('../controller/agentController');


const agentRoute = (app) => {
    app.post('/create-agent', agentController.createAgent);
    app.get('/get-agent',agentController.getAgent)

};

module.exports = agentRoute;
