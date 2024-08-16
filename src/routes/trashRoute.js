const trashController = require('../controller/trashController');

const TrashRoute = (app) => {
    app.get('/get-lead-trash', trashController.getLeadTrash);
    // app.post('/get-lead-other-trash', adminAuth.forgotPassword);
    // app.post('/get-lead-followUp-trash', adminAuth.verifyResetCode);
    // app.post('/get-agent-trash', adminAuth.resetPassword);
};

module.exports = TrashRoute;
