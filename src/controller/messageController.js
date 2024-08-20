const { request } = require('express');
const messageService=require('../service/messageService')
const messageId =require('../utils/token')
const messageController = {
    sendMessageToAgent : async (io,req, res) => {
        try {
            const agentId = req.params.agentId;
            adminId=req.user
            const message = req.body;
            message.messageId = messageId(); 
            const role=req.user.role
        
            const data = await messageService.assignMessageToAgent(adminId,agentId, message.message, message.messageId,role);
        
            if (data) {
              io.to(agentId).emit('send_message', data);
              res.status(200).send({ message: "success", data: data });
            } else {
              res.status(404).send({ message: "data Not Found" });
            }
          } catch (error) {
            console.error('Error in SerdingMessageToAgent:', error.message);
            res.status(500).send({ message: 'Error assigning task' });
          }
        } ,
        getAssignMessagesById:async (io,req, res) => {
            try {
              const agentId = req.params.agentId;
              console.log("AgentId",agentId)
              const data = await messageService.getAssignMessagesToAgentById(agentId);
              console.log("Data",data)
              if (data === 'Data Not Found') {
                res.status(404).send({ message: 'Data Not Found' });
              } 
                const Messagedata = data.map(newData => {
                    const {messageId,message,role} = newData;
                return {messageId,message,role};
                }
            )
            io.emit('receive_message', Messagedata);

        
        res.status(201).json({ message: 'success', data:Messagedata });
            } catch (error) {
              console.error('Error fetching Reviews by agent ID:', error.message);
              res.status(500).send({ message: 'Internal Server Error' });
            }
          },

          sendMessageToAdmin : async (io,req, res) => {
            try {
                const agentId = req.params.agentId;
                const adminId = req.params.adminId;
                const message = req.body;
                message.messageId = messageId(); 
                const role=req.user.role
                const data = await messageService.sendMessageToAdminInService(agentId,adminId, message.message, message.messageId,role);
            
                if (data) {
                  io.to(adminId).emit('send_message', data);
                  res.status(200).send({ message: "success", data: data });
                } else {

                  res.status(404).send({ message: "data Not Found" });
                }
              } catch (error) {
                console.error('Error in SerdingMessageToAgent:', error.message);
                res.status(500).send({ message: 'Error assigning task' });
              }
            } ,

            getSendMessagesToAdminById:async (io,req, res) => {
              try {
                const agentId = req.params.agentId;
                const adminId=req.params.adminId
                console.log("AgentId",agentId)
                const data = await messageService.getSendMessagesFromAdminById(agentId,adminId);
                console.log("Data",data)
                if (data === 'Data Not Found') {
                  res.status(404).send({ message: 'Data Not Found' });
                } 
                  const Messagedata = data.map(newData => {
                      const {messageId,message} = newData;
                  return {messageId,message};
                  }
              )
              io.emit('receive_message', Messagedata);
  
          
          res.status(201).json({ message: 'success', data:Messagedata });
              } catch (error) {
                console.error('Error fetching Reviews by agent ID:', error.message);
                res.status(500).send({ message: 'Internal Server Error' });
              }
            },

           getAllMessagesFromAdmin:async(io,req,res)=>{
            try {
              const adminId = req.params.adminId;
              const data = await messageService.getAllMessagesFromAdmin(adminId);
              if (data.length > 0) {
                  res.status(200).json({ message: 'success', data: data });
                  io.emit('receive_message', data);
              } else {
                  res.status(404).json({ message: 'No messages found' });
              }
          } catch (error) {
              console.error('Error fetching messages sent to admin:', error.message);
              res.status(500).json({ message: 'Internal Server Error' });
          }
      },
      getAllMessages: async (io, req, res) => {
        try {
            const { adminId, agentId } = req.params;
            const agentMessages = await messageService.getAssignMessagesToAgentById(agentId);
            const adminMessages = await messageService.getSendMessagesFromAdminById(agentId, adminId);
            const allMessages = {
                agentMessages,
                adminMessages,
            };
            io.emit('receive_message', allMessages);
            res.status(200).json({ message: 'success', data: allMessages });
        } catch (error) {
            console.error('Error fetching all messages:', error.message);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
}


module.exports = messageController;
