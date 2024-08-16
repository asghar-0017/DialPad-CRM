const otherController  = require('../controller/otherController');
const {adminAuth}=require('../controller/authController')
const {checkRole}=require('../middleware/checkRole')
const combinedAuthenticate=require('../middleware/permission')

const otherRoute = (app,io) => {
    app.get('/get-other',combinedAuthenticate, checkRole(['admin','agent']), (req, res) => otherController.getAllOthers(io, req, res));
    app.get('/get-other/:leadId', combinedAuthenticate, checkRole(['admin','agent']), otherController.getOtherUpById);
    app.get('/get-all-other/:agentId',combinedAuthenticate, checkRole(['admin','agent']), otherController.getallSpecificOtherByAgentId);
    app.put('/update-other/:leadId', combinedAuthenticate, checkRole(['admin','agent']),(req, res) => otherController.updateOther(io, req, res));
    app.delete('/delete-other/:leadId',combinedAuthenticate, checkRole(['admin','agent']),  otherController.deleteOther);

};

module.exports = otherRoute;
