const taskController = require('../controller/taskController');

const {checkRole}=require('../middleware/checkRole')
const upload = require('../utils/upload')
const combinedAuthenticate=require('../middleware/permission')

const taskToAgents = (app,io) => {
  
    app.post('/upload-task-to-agents',combinedAuthenticate, checkRole(['admin']), upload.single('file'),(req, res) => taskController.saveExcelFileData(io, req, res))

};

module.exports = taskToAgents;
