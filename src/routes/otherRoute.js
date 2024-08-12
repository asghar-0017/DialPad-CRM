const otherController  = require('../controller/otherController');
const {adminAuth}=require('../controller/authController')
const {checkRole}=require('../middleware/checkRole')

const otherRoute = (app) => {
    app.get('/get-other',  otherController.getAllOthers);
    app.get('/get-other/:leadId',  otherController.getOtherUpById);
    app.put('/update-other/:leadId',  otherController.updateOther);
    app.delete('/delete-other/:leadId',  otherController.deleteOther);

};

module.exports = otherRoute;
