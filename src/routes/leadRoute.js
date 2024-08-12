const {leadController}  = require('../controller/leadController');
const {adminAuth}=require('../controller/authController')
const {agentAuthController}=require('../controller/agentController')
const {checkRole}=require('../middleware/checkRole')
const upload = require('../utils/upload')
const combinedAuthenticate=require('../middleware/permission')

const leadRoute = (app) => {
    app.post('/create-lead',adminAuth.authenticate, checkRole(['admin']), leadController.createLead);
    app.get('/get-lead',adminAuth.authenticate, checkRole(['admin']), leadController.readLead);
    app.get('/get-lead/:leadId',adminAuth.authenticate, checkRole(['admin']), leadController.getLeadById);
    app.put('/update-lead/:leadId',adminAuth.authenticate, checkRole(['admin']), leadController.updateLead);
    app.delete('/delete-lead/:leadId',adminAuth.authenticate, checkRole(['admin']), leadController.deleteLead);

    app.post('/upload-csv',adminAuth.authenticate, checkRole(['admin']), upload.single('file'), leadController.saveExcelFileData)
    

};

module.exports = leadRoute;
