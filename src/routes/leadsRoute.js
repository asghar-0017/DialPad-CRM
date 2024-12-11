const {leadController}  = require('../controller/leadsController');
const {checkRole}=require('../middleware/checkRole')
const upload = require('../utils/upload')
const combinedAuthenticate=require('../middleware/permission')

const leadsRoute = (app) => {
    app.post('/create-leads/:sheetId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => leadController.createLead(req, res));
    app.put('/leads/:leadId', combinedAuthenticate, checkRole(['admin', 'agent']), (req, res) =>leadController.updateLeadDynamicFields(req, res));
    app.put(
        '/sheet/update-keys/:sheetId',
        combinedAuthenticate,
        checkRole(['admin', 'agent']),
        async (req, res) => {
          try {
            await leadController.updateKeysOnly(req, res);
          } catch (error) {
            console.error("Error in route handler:", error);
            res.status(500).json({ message: "An unexpected error occurred." });
          }
        }
      );
    app.get('/leads/status/:sheetId', (req, res) => leadController.getLabels(req, res));
    app.get('/get-leads',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => leadController.readLead(req, res));
    app.get('/get-leads/:sheetId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => leadController.readLeadBySheetId(req, res));
    app.delete('/delete-leads/:leadId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => leadController.deleteLead(req, res));
    app.post('/upload-lead-csv/:sheetId', combinedAuthenticate, checkRole(['admin', 'agent']), upload.single('file'), (req, res) => leadController.saveExcelFileData( req, res));
    app.get('/leads/by-status/:sheetId', combinedAuthenticate, checkRole(['admin', 'agent']), (req, res) => leadController.getLeadsByLabels(req, res));


};

module.exports = leadsRoute;
