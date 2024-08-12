const followUpController  = require('../controller/followUpController');
const {adminAuth}=require('../controller/authController')
const {checkRole}=require('../middleware/checkRole')

const followUpRoute = (app) => {
    app.get('/get-followUp', adminAuth.authenticate, checkRole(['admin']),followUpController.getAllFollowUps);
    app.get('/get-followUp/:leadId',adminAuth.authenticate, checkRole(['admin']), followUpController.getFollowUpById);
    app.put('/update-followUp/:leadId', adminAuth.authenticate, checkRole(['admin']),followUpController.updateFollowUp);
    app.delete('/delete-followUp/:leadId',adminAuth.authenticate, checkRole(['admin']), followUpController.deleteFollowUp);

};

module.exports = followUpRoute;
