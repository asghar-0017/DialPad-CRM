const otherController  = require('../controller/otherController');
const {adminAuth}=require('../controller/authController')
const {checkRole}=require('../middleware/checkRole')

const otherRoute = (app) => {
    app.get('/get-other', adminAuth.authenticate, checkRole(['admin', 'agent']), otherController.getAllOthers);
    app.get('/get-other/:leadId', adminAuth.authenticate, checkRole(['admin', 'agent']), otherController.getOtherUpById);
    app.put('/update-other/:leadId', adminAuth.authenticate, checkRole(['admin', 'agent']), otherController.updateOther);
    app.delete('/delete-other/:leadId', adminAuth.authenticate, checkRole(['admin']), otherController.deleteOther);

};

module.exports = otherRoute;
