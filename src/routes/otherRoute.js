const otherController  = require('../controller/otherController');
const {adminAuth}=require('../controller/authController')
const {checkRole}=require('../middleware/checkRole')
const combinedAuthenticate=require('../middleware/permission')

const otherRoute = (app) => {
    app.get('/get-other',combinedAuthenticate, checkRole(['admin','agent']), (req, res) => otherController.getAllOthers( req, res));
    app.get('/get-other/:leadId', combinedAuthenticate, checkRole(['admin','agent']), otherController.getOtherUpById);
    app.get('/get-all-other/:agentId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => otherController.getallSpecificOtherByAgentId( req, res));
    app.put('/update-other/:leadId', combinedAuthenticate, checkRole(['admin','agent']),(req, res) => otherController.updateOther(req, res));
    app.delete('/delete-other/:leadId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) =>  otherController.deleteOther( req, res));

};

module.exports = otherRoute;
