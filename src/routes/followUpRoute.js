const followUpController  = require('../controller/followUpController');
const {adminAuth}=require('../controller/authController')
const {checkRole}=require('../middleware/checkRole')
const combinedAuthenticate=require('../middleware/permission')

const followUpRoute = (app,io) => {
    app.get('/get-followUp',combinedAuthenticate, checkRole(['admin','agent']), (req, res) => followUpController.getAllFollowUps(io, req, res));
    app.get('/get-followUp/:leadId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => followUpController.getFollowUpById(io, req, res));
    app.get('/get-all-followUp/:agentId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => followUpController.getallSpecifiFollowUpByAgentId(io, req, res));

    
    app.put('/update-followUp-other/:leadId', combinedAuthenticate, checkRole(['admin','agent']),(req, res) =>followUpController.updateFollowUp(io, req, res))
    app.delete('/delete-followUp/:leadId',combinedAuthenticate, checkRole(['admin']),(req, res) => followUpController.deleteFollowUp(io, req, res));

};

module.exports = followUpRoute
