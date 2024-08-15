const followUpController  = require('../controller/followUpController');
const {adminAuth}=require('../controller/authController')
const {checkRole}=require('../middleware/checkRole')
const combinedAuthenticate=require('../middleware/permission')

const followUpRoute = (app) => {
    app.get('/get-followUp',combinedAuthenticate, checkRole(['admin','agent']),followUpController.getAllFollowUps);
    app.get('/get-followUp/:leadId',combinedAuthenticate, checkRole(['admin','agent']), followUpController.getFollowUpById);
    app.get('/get-all-followUp/:agentId',combinedAuthenticate, checkRole(['admin','agent']), followUpController.getallSpecifiFollowUpByAgentId);
    app.put('/update-followUp/:leadId', combinedAuthenticate, checkRole(['admin','agent']),followUpController.updateFollowUp);
    app.delete('/delete-followUp/:leadId',combinedAuthenticate, checkRole(['admin']), followUpController.deleteFollowUp);

};

module.exports = followUpRoute;
