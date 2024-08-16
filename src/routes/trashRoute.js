const trashController = require('../controller/trashController');
const combinedAuthenticate=require('../middleware/permission')
const {checkRole}=require('../middleware/checkRole')

const TrashRoute = (app) => {
    app.get('/get-lead-trash',combinedAuthenticate, checkRole(['admin']), trashController.getLeadTrash);
    app.get('/get-other-trash',combinedAuthenticate, checkRole(['admin']), trashController.getLeadOtherTrash);
    app.get('/get-followUp-trash',combinedAuthenticate, checkRole(['admin']),trashController.getLeadFollowUpTrash);
    // app.post('/get-agent-trash', adminAuth.resetPassword);
};

module.exports = TrashRoute;
