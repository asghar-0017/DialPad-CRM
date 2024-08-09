const {leadController}  = require('../controller/leadController');
const {adminAuth}=require('../controller/authController')
const {agentAuthController}=require('../controller/agentController')
const {checkRole}=require('../middleware/checkRole')
const upload = require('../utils/upload')

const leadRoute = (app) => {
    app.post('/create-lead', agentAuthController.authenticate, checkRole(['admin', 'agent']), leadController.createLead);
    app.get('/get-lead', adminAuth.authenticate, checkRole(['admin', 'agent']), leadController.readLead);
    app.get('/get-lead/:leadId', adminAuth.authenticate, checkRole(['admin', 'agent']), leadController.getLeadById);
    app.put('/update-lead/:leadId', adminAuth.authenticate, checkRole(['admin', 'agent']), leadController.updateLead);
    app.delete('/delete-lead/:leadId', adminAuth.authenticate, checkRole(['admin']), leadController.deleteLead);

    app.post('/upload-csv',adminAuth.authenticate, checkRole(['admin', 'agent']), upload.single('file'), leadController.saveExcelFileData)
    

};

module.exports = leadRoute;
