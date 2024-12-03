const sheetController = require("../controller/sheetController");
const { checkRole } = require('../middleware/checkRole');
const combinedAuthenticate = require('../middleware/permission');

const sheerRoute = (app, io) => {
    app.post("/create-sheet", combinedAuthenticate, checkRole(['admin', 'agent']), (req, res) => sheetController.createSheet(io, req, res));
    app.get("/get-sheets", combinedAuthenticate, checkRole(['admin', 'agent']), (req, res) => sheetController.getAllSheets(req, res));
    app.get("/get-sheet/:sheetId", combinedAuthenticate, checkRole(['admin', 'agent']), (req, res) => sheetController.getSheetById(req, res));
};

module.exports = sheerRoute;
