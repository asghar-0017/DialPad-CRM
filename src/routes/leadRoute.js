const {leadController}  = require('../controller/leadController');
const {adminAuth}=require('../controller/authController')
const {agentAuthController}=require('../controller/agentController')
const {checkRole}=require('../middleware/checkRole')
const upload = require('../utils/upload')
const combinedAuthenticate=require('../middleware/permission')

const leadRoute = (app) => {
    app.post('/create-lead', leadController.createLead);
    app.get('/get-lead', leadController.readLead);
    app.get('/get-lead/:leadId', leadController.getLeadById);
    app.put('/update-lead/:leadId', leadController.updateLead);
    app.delete('/delete-lead/:leadId', leadController.deleteLead);

    app.post('/upload-csv', upload.single('file'), leadController.saveExcelFileData)
    

};

module.exports = leadRoute;
