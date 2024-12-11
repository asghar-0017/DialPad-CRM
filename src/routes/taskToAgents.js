const taskController = require('../controller/taskController');
const {checkRole}=require('../middleware/checkRole')
const upload = require('../utils/upload')
const combinedAuthenticate=require('../middleware/permission')

const taskToAgents = (app) => {
    app.post('/upload-task-to-agents',combinedAuthenticate, checkRole(['admin']), upload.single('file'),(req, res) => taskController.saveExcelFileData( req, res))
    app.get('/get-uploaded-Data', combinedAuthenticate, checkRole(['admin']),(req, res) => taskController.getTaskData( req, res))
    app.delete('/delete-remaining-data',combinedAuthenticate, checkRole(['admin']),(req, res) => taskController.deleteRemainingTasks(req, res))   

};

module.exports = taskToAgents;
