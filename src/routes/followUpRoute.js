const followUpController  = require('../controller/followUpController');
const {adminAuth}=require('../controller/authController')
const {checkRole}=require('../middleware/checkRole')
const combinedAuthenticate=require('../middleware/permission')

const followUpRoute = (app) => {
    app.get('/get-followUp',combinedAuthenticate, checkRole(['admin','agent']), (req, res) => followUpController.getAllFollowUps( req, res));
    app.get('/get-followUp/:leadId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => followUpController.getFollowUpById(req, res));
    app.get('/get-all-followUp/:agentId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => followUpController.getallSpecifiFollowUpByAgentId(req, res));

    
    app.put('/update-followUp-other/:leadId', combinedAuthenticate, checkRole(['admin','agent']),(req, res) =>followUpController.updateFollowUp(req, res))
    app.delete('/delete-followUp/:leadId',combinedAuthenticate, checkRole(['admin']),(req, res) => followUpController.deleteFollowUp( req, res));

};

module.exports = followUpRoute
