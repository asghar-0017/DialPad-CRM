const {leadController}  = require('../controller/agentController');
const {adminAuth}=require('../controller/authController')
const {checkRole}=require('../middleware/checkRole')

const leadRoute = (app) => {
    app.post('/lead/create', adminAuth.authenticate, checkRole(['admin', 'agent']), leadController.createLead );
//   app.post('/lead/update', adminAuth.authenticate, checkRole(['admin', 'agent']), adminAuth.updateLead);
//   app.delete('/lead/delete', adminAuth.authenticate, checkRole(['admin']), adminAuth.deleteLead);
};

module.exports = leadRoute;
