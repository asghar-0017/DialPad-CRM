const {leadController}  = require('../controller/leadController');
const {adminAuth}=require('../controller/authController')
const {checkRole}=require('../middleware/checkRole')
const upload = require('../utils/upload')

const leadRoute = (app) => {
    app.post('/create-lead', adminAuth.authenticate, checkRole(['admin', 'agent']), leadController.createLead);
    app.get('/get-lead', adminAuth.authenticate, checkRole(['admin', 'agent']), leadController.readLead);
    app.put('/update-lead/:leadId', adminAuth.authenticate, checkRole(['admin', 'agent']), leadController.updateLead);
//   app.delete('/lead/delete', adminAuth.authenticate, checkRole(['admin']), adminAuth.deleteLead);

    app.post('/upload-csv',adminAuth.authenticate, checkRole(['admin', 'agent']), upload.single('file'), leadController.saveExcelFileData)
    

};

module.exports = leadRoute;
