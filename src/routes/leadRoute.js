const {leadController}  = require('../controller/leadController');
const {adminAuth}=require('../controller/authController')
const {agentAuthController}=require('../controller/agentController')
const {checkRole}=require('../middleware/checkRole')
const upload = require('../utils/upload')
const combinedAuthenticate=require('../middleware/permission')

const leadRoute = (app) => {
    app.post('/create-lead',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => leadController.createLead( req, res));
    app.get('/get-lead',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => leadController.readLead(req, res));
    app.get('/get-lead/:leadId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => leadController.getLeadById( req, res));
    app.get('/get-all-lead/:agentId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => leadController.getallSpecificLeadByAgentId( req, res));
    app.put('/update-lead/:leadId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => leadController.updateLead( req, res));
    app.delete('/delete-lead/:leadId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => leadController.deleteLead(req, res));
    app.post('/upload-csv',combinedAuthenticate, checkRole(['admin','agent']), upload.single('file'),(req, res) => leadController.saveExcelFileData( req, res))
};

module.exports = leadRoute;
