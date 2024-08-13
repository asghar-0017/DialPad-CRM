const otherController  = require('../controller/otherController');
const {adminAuth}=require('../controller/authController')
const {checkRole}=require('../middleware/checkRole')
const combinedAuthenticate=require('../middleware/permission')

const otherRoute = (app) => {
    app.get('/get-other',combinedAuthenticate, checkRole(['admin','agent']),  otherController.getAllOthers);
    app.get('/get-other/:leadId', combinedAuthenticate, checkRole(['admin','agent']), otherController.getOtherUpById);
    app.put('/update-other/:leadId', combinedAuthenticate, checkRole(['admin','agent']), otherController.updateOther);
    app.delete('/delete-other/:leadId',combinedAuthenticate, checkRole(['admin','agent']),  otherController.deleteOther);

};

module.exports = otherRoute;
