const followUpController  = require('../controller/followUpController');
const {adminAuth}=require('../controller/authController')
const {checkRole}=require('../middleware/checkRole')
const combinedAuthenticate=require('../middleware/permission')

const followUpRoute = (app,io) => {
    app.get('/get-followUp',combinedAuthenticate, checkRole(['admin','agent']), (req, res) => followUpController.getAllFollowUps(io, req, res));
    app.get('/get-followUp/:leadId',combinedAuthenticate, checkRole(['admin','agent']), followUpController.getFollowUpById);
    app.get('/get-all-followUp/:agentId',combinedAuthenticate, checkRole(['admin','agent']), followUpController.getallSpecifiFollowUpByAgentId);

    
    app.put('/update-followUp/:leadId', combinedAuthenticate, checkRole(['admin','agent']),(req, res) =>followUpController.updateFollowUp(io, req, res))
    app.delete('/delete-followUp/:leadId',combinedAuthenticate, checkRole(['admin']), followUpController.deleteFollowUp);

};

module.exports = followUpRoute;
