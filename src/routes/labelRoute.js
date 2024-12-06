const labelController = require('../controller/labelController');
const {checkRole}=require('../middleware/checkRole')
const upload = require('../utils/upload')
const combinedAuthenticate=require('../middleware/permission')

const labelRoute = (app,io) => {
    app.post('/create-label/:sheetId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => labelController.createLabel(io, req, res));
    app.get('/get-label/:sheetId',combinedAuthenticate, checkRole(['admin','agent']),(req, res) => labelController.getLabel(io, req, res));


};

module.exports = labelRoute;
