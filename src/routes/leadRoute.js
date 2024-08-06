const {leadController}  = require('../controller/leadController');
const {adminAuth}=require('../controller/authController')
const {checkRole}=require('../middleware/checkRole')

const leadRoute = (app) => {
    app.post('/create-lead', adminAuth.authenticate, checkRole(['admin', 'agent']), leadController.createLead);
    app.get('/get-lead', adminAuth.authenticate, checkRole(['admin', 'agent']), leadController.readLead);

    //   app.post('/lead/update', adminAuth.authenticate, checkRole(['admin', 'agent']), adminAuth.updateLead);
//   app.delete('/lead/delete', adminAuth.authenticate, checkRole(['admin']), adminAuth.deleteLead);
};

module.exports = leadRoute;
