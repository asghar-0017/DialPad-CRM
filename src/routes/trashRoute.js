const trashController = require('../controller/trashController');
const combinedAuthenticate=require('../middleware/permission')
const {checkRole}=require('../middleware/checkRole')

const TrashRoute = (app) => {
    app.get('/get-lead-trash',combinedAuthenticate, checkRole(['admin','agent']), trashController.getLeadTrash);
    app.get('/get-other-trash',combinedAuthenticate, checkRole(['admin','agent']), trashController.getLeadOtherTrash);
    app.get('/get-followUp-trash',combinedAuthenticate, checkRole(['admin','agent']),trashController.getLeadFollowUpTrash);
    // app.post('/get-agent-trash', adminAuth.resetPassword);
    app.get('/get-lead-trash/:leadId',combinedAuthenticate, checkRole(['admin','agent']), trashController.getLeadById);

};

module.exports = TrashRoute;
