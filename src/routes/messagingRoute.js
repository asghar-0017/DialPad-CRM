const messageController = require('../controller/messageController');
const combinedAuthenticate=require('../middleware/permission')
const {checkRole}=require('../middleware/checkRole')

const messageRoute = (app,io) => {
    app.post('/send-message-to-agent/:agentId',combinedAuthenticate, checkRole(['admin']),(req,res)=> messageController.sendMessageToAgent(io,req,res));
    app.get('/get-send-message-to-agent/:agentId',combinedAuthenticate, checkRole(['admin','agent']),(req,res)=> messageController.getAssignMessagesById(io,req,res));
    app.post('/send-message-to-admin/:adminId/:agentId',combinedAuthenticate, checkRole(['agent']),(req,res)=> messageController.sendMessageToAdmin(io,req,res));
    app.get('/get-send-message-to-admin/:adminId/:agentId',combinedAuthenticate, checkRole(['admin','agent']),(req,res)=> messageController.getSendMessagesToAdminById(io,req,res));

    app.get('/get-all-messages-to-admin/:adminId', combinedAuthenticate, checkRole(['admin']), (req, res) => messageController.getAllMessagesFromAdmin(io,req, res));
    app.get('/get-all-messages/:adminId/:agentId', combinedAuthenticate, checkRole(['admin', 'agent']), (req, res) => messageController.getAllMessages(io, req, res));


};

module.exports = messageRoute;
