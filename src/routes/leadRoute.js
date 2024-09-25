const {leadController}  = require('../controller/leadController');
const {adminAuth}=require('../controller/authController')
const {agentAuthController}=require('../controller/agentController')
const {checkRole}=require('../middleware/checkRole')
const upload = require('../utils/upload')
const combinedAuthenticate=require('../middleware/permission')

const leadRoute = (app,io) => {
    app.post('/create-lead',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => leadController.createLead(io, req, res));
    app.get('/get-lead',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => leadController.readLead(io, req, res));
    app.get('/get-lead/:leadId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => leadController.getLeadById(io, req, res));
    app.get('/get-all-lead/:agentId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => leadController.getallSpecificLeadByAgentId(io, req, res));
    app.put('/update-lead/:leadId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => leadController.updateLead(io, req, res));
    
    app.delete('/delete-lead/:leadId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => leadController.deleteLead(io, req, res));
    
    app.post('/upload-csv',combinedAuthenticate, checkRole(['admin','agent']), upload.single('file'),(req, res) => leadController.saveExcelFileData(io, req, res))
    

};

module.exports = leadRoute;
