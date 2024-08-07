const followUpController  = require('../controller/followUpController');
const {adminAuth}=require('../controller/authController')
const {checkRole}=require('../middleware/checkRole')

const followUpRoute = (app) => {
    app.get('/get-followUp', adminAuth.authenticate, checkRole(['admin', 'agent']), followUpController.getAllFollowUps);
    app.get('/get-followUp/:leadId', adminAuth.authenticate, checkRole(['admin', 'agent']), followUpController.getFollowUpById);

};

module.exports = followUpRoute;
