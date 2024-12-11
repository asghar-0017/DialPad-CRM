const labelController = require('../controller/labelController');
const {checkRole}=require('../middleware/checkRole')
const upload = require('../utils/upload')
const combinedAuthenticate=require('../middleware/permission')

const labelRoute = (app) => {
    app.post('/create-label/:sheetId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => labelController.createLabel( req, res));
    app.get('/get-label/:sheetId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => labelController.getLabel( req, res));
    app.put('/update-label/:labelId', combinedAuthenticate, checkRole(['admin', 'agent']), (req, res) => labelController.updateLabel(req, res));


};

module.exports = labelRoute;
