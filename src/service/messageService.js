const messageRepository=require('../repository/messageRepository')
const messageService={
    assignMessageToAgent:async(adminId,agentId,message,messageId)=>{
        try{
        const data=await messageRepository.assignMessageToAgentById(adminId,agentId,message,messageId)
        return data
        }catch(error){
        throw error
        }
    },
    getAssignMessagesToAgentById:async(agenId)=>{
        try{
          const data=await messageRepository.getAssignMessagesToAgentById(agenId)
          return data
        }catch(error){
          throw error
        }
      },
      getSendMessagesFromAdminById:async(agenId,adminId)=>{
        try{
          const data=await messageRepository.getSendMessagesFromAdminById(agenId,adminId)
          return data
        }catch(error){
          throw error
        }
      },
      sendMessageToAdminInService:async(agentId,adminId,message,messageId)=>{
        try{
        const data=await messageRepository.sendMessageToAdminById(agentId,adminId,message,messageId)
        return data
        }catch(error){
        throw error
        }
    },
    getAllMessagesFromAdmin:async(adminId)=>{
      try {
        const data = await messageRepository.getAllMessagesFromAdminByAdminId(adminId);
        return data;
    } catch (error) {
        throw error;
    }
    }

}
module.exports=messageService