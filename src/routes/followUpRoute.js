const followUpController  = require('../controller/followUpController');
const {adminAuth}=require('../controller/authController')
const {checkRole}=require('../middleware/checkRole')

const followUpRoute = (app) => {
    app.get('/get-followUp', followUpController.getAllFollowUps);
    app.get('/get-followUp/:leadId', followUpController.getFollowUpById);
    app.put('/update-followUp/:leadId', followUpController.updateFollowUp);
    app.delete('/delete-followUp/:leadId', followUpController.deleteFollowUp);

};

module.exports = followUpRoute;
