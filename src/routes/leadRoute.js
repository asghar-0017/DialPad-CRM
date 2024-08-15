const {leadController}  = require('../controller/leadController');
const {adminAuth}=require('../controller/authController')
const {agentAuthController}=require('../controller/agentController')
const {checkRole}=require('../middleware/checkRole')
const upload = require('../utils/upload')
const combinedAuthenticate=require('../middleware/permission')

const leadRoute = (app) => {
    app.post('/create-lead',combinedAuthenticate, checkRole(['admin','agent']), leadController.createLead);
    app.get('/get-lead',combinedAuthenticate, checkRole(['admin','agent']), leadController.readLead);
    app.get('/get-lead/:leadId',combinedAuthenticate, checkRole(['admin','agent']), leadController.getLeadById);
    app.get('/get-all-lead/:agentId',combinedAuthenticate, checkRole(['admin','agent']), leadController.getallSpecificLeadByAgentId);
    app.put('/update-lead/:leadId',combinedAuthenticate, checkRole(['admin','agent']), leadController.updateLead);
    app.delete('/delete-lead/:leadId',combinedAuthenticate, checkRole(['admin']), leadController.deleteLead);
    app.post('/upload-csv',combinedAuthenticate, checkRole(['admin','agent']), upload.single('file'), leadController.saveExcelFileData)
    

};

module.exports = leadRoute;
