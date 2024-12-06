const sheetController = require("../controller/sheetController");
const { checkRole } = require('../middleware/checkRole');
const combinedAuthenticate = require('../middleware/permission');

const sheerRoute = (app, io) => {
    app.post("/create-sheet", combinedAuthenticate, checkRole(['admin', 'agent']), (req, res) => sheetController.createSheet(io, req, res));
    app.get("/get-sheets", combinedAuthenticate, checkRole(['admin', 'agent']), (req, res) => sheetController.getAllSheets(req, res));
    app.get("/get-sheet/:sheetId", combinedAuthenticate, checkRole(['admin', 'agent']), (req, res) => sheetController.getSheetById(req, res));
    app.get("/get-sheet-columns/:sheetId", combinedAuthenticate, checkRole(['admin', 'agent']), (req, res) => sheetController.getSheetColumns(req, res));
    app.put("/update-sheet-columns/:sheetId", combinedAuthenticate, checkRole(['admin', 'agent']), (req, res) => sheetController.updateSheetColumns(req, res)); // New route for updating columns
    app.post("/add-column/:sheetId", combinedAuthenticate, checkRole(['admin']), (req, res) => sheetController.addColumn(req, res)); // Route for adding a new column

};

module.exports = sheerRoute;
