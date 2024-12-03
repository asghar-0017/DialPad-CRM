const {leadController}  = require('../controller/leadsController');
const {checkRole}=require('../middleware/checkRole')
const upload = require('../utils/upload')
const combinedAuthenticate=require('../middleware/permission')

const leadsRoute = (app,io) => {
    app.post('/create-leads/:sheetId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => leadController.createLead(io, req, res));
    app.put('/leads/:leadId/dynamic-fields', combinedAuthenticate, checkRole(['admin', 'agent']), (req, res) =>leadController.updateLeadDynamicFields(io, req, res));
    app.get('/leads/labels', (req, res) => leadController.getLabels(req, res));
    app.get('/get-leads',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => leadController.readLead(io, req, res));
    app.delete('/delete-leads/:leadId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => leadController.deleteLead(io, req, res));
    app.post('/upload-lead-csv',combinedAuthenticate, checkRole(['admin','agent']), upload.single('file'),(req, res) => leadController.saveExcelFileData(io, req, res))
    app.get('/leads/by-labels', (req, res) => leadController.getLeadsByLabels(req, res));
    app.get('/leads/sheet/:sheetId', combinedAuthenticate, checkRole(['admin', 'agent']), (req, res) => leadController.getLeadsForSheet(req, res));

};

module.exports = leadsRoute;
