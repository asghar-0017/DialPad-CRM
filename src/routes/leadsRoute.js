const {leadController}  = require('../controller/leadsController');
const {checkRole}=require('../middleware/checkRole')
const upload = require('../utils/upload')
const combinedAuthenticate=require('../middleware/permission')

const leadsRoute = (app,io) => {
    app.post('/create-leads/:sheetId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => leadController.createLead(io, req, res));
    app.put('/leads/:leadId', combinedAuthenticate, checkRole(['admin', 'agent']), (req, res) =>leadController.updateLeadDynamicFields(io, req, res));
    app.get('/leads/status/:sheetId', (req, res) => leadController.getLabels(req, res));
    app.get('/get-leads',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => leadController.readLead(io, req, res));
    app.get('/get-leads/:sheetId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => leadController.readLeadBySheetId(io, req, res));
    app.delete('/delete-leads/:leadId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => leadController.deleteLead(io, req, res));
    app.post('/upload-lead-csv/:sheetId', combinedAuthenticate, checkRole(['admin', 'agent']), upload.single('file'), (req, res) => leadController.saveExcelFileData(io, req, res));
    app.get('/leads/by-status/:sheetId', combinedAuthenticate, checkRole(['admin', 'agent']), (req, res) => leadController.getLeadsByLabels(req, res));
 


};

module.exports = leadsRoute;
