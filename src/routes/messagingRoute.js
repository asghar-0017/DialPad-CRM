const messageController = require('../controller/messageController');
const combinedAuthenticate=require('../middleware/permission')
const {checkRole}=require('../middleware/checkRole')

const messageRoute = (app) => {
    app.post('/send-message-to-agent/:agentId',combinedAuthenticate, checkRole(['admin']),(req,res)=> messageController.sendMessageToAgent(req,res));
    app.get('/get-send-message-to-agent/:agentId',combinedAuthenticate, checkRole(['admin','agent']),(req,res)=> messageController.getAssignMessagesById(req,res));
    app.post('/send-message-to-admin/:adminId/:agentId',combinedAuthenticate, checkRole(['agent']),(req,res)=> messageController.sendMessageToAdmin(req,res));
    app.get('/get-send-message-to-admin/:adminId/:agentId',combinedAuthenticate, checkRole(['admin','agent']),(req,res)=> messageController.getSendMessagesToAdminById(req,res));
    app.get('/get-all-messages-to-admin/:adminId', combinedAuthenticate, checkRole(['admin']), (req, res) => messageController.getAllMessagesFromAdmin(req, res));
    app.get('/get-all-messages/:adminId/:agentId', combinedAuthenticate, checkRole(['admin', 'agent']), (req, res) => messageController.getAllMessages(req, res));


};

module.exports = messageRoute;
