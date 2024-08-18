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
        
            const data = await messageService.assignMessageToAgent(adminId,agentId, message.message, message.messageId);
        
            if (data) {
              io.to(agentId).emit('new_message', data); // Broadcast to the specific agent
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

          sendMessageToAdmin : async (io,req, res) => {
            try {
                const agentId = req.params.agentId;
                const adminId = req.params.adminId;
                const message = req.body;
                message.messageId = messageId(); 
            
                const data = await messageService.sendMessageToAdminInService(agentId,adminId, message.message, message.messageId);
            
                if (data) {
                  io.to(adminId).emit('new_message', data);
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
};

module.exports = messageController;
