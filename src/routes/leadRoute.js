const {leadController}  = require('../controller/leadController');
const {adminAuth}=require('../controller/authController')
const {checkRole}=require('../middleware/checkRole')
const upload = require('../utils/upload')

const leadRoute = (app) => {
    app.post('/create-lead', adminAuth.authenticate, checkRole(['admin', 'agent']), leadController.createLead);
    app.get('/get-lead', adminAuth.authenticate, checkRole(['admin', 'agent']), leadController.readLead);
    app.post('/update-lead', adminAuth.authenticate, checkRole(['admin', 'agent']), leadController.updateLead);
//   app.delete('/lead/delete', adminAuth.authenticate, checkRole(['admin']), adminAuth.deleteLead);

    // app.post('/upload-csv', adminAuth.authenticate, checkRole(['admin', 'agent']), upload.single('file'), leadController.uploadCSV);
    app.post('/data/import/upload-excel-file',adminAuth.authenticate,  upload.single('file'), async (req, res) => {
        try {
          const response = await leadController.saveExcelFileData(req);
          return res.status(200).send(response);
        } catch (error) {
          return res.status(error.httpCode || 503).send({ error: error.message });
        }
    });

};

module.exports = leadRoute;
