const agentMessage = require('../entities/agentMessage');
const adminMessage=require('../entities/adminMessage')
const dataSource=require('../infrastructure/psql')
const messageRepository={
  assignMessageToAgentById: async (adminId, agentId, message, messageId, role) => {
    try {
      const agentRepository = dataSource.getRepository('agent');
      const agent = await agentRepository.findOne({ where: { agentId } });
      console.log("Agent In Repo:", agent);
  
      if (!agent) {
        console.log("No agent found with ID:", agentId);
        throw new Error('Agent not found');
      }
  
      const agentMessageRepository = dataSource.getRepository(agentMessage);
      console.log("Creating message entity with data:", { agentId: agent.id, adminId, message, messageId, role });
  
      const messageEntity = agentMessageRepository.create({
        agentId: agent.agentId,
        adminId,
        message,
        messageId,
        role,
      });
  
      await agentMessageRepository.save(messageEntity);
      console.log("Message successfully assigned to agent:", messageEntity);
      return messageEntity;
    } catch (error) {
      console.error('Error in assignMessageToAgentById:', error);
      throw new Error('Error assigning message to agent');
    }
  },
  
  getAssignMessagesToAgentById: async (agentId) => {
    try {
      const agentTaskRepository = dataSource.getRepository(agentMessage);
      const review = await agentTaskRepository.find({ where: { agentId } });
      if (review.length > 0) {
        
        return review;
      } else {
        return []; 
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Error fetching tasks');
    }
  },
  getSendMessagesFromAdminById: async (agentId,adminId) => {
    try {
      const agentTaskRepository = dataSource.getRepository(adminMessage);
      const adminRepository = dataSource.getRepository('adminauth');
      const AdminMessage = await agentTaskRepository.find({ where: { agentId } }); 
      const admin = await adminRepository.find({ where: { adminId } }); 
      if (admin && AdminMessage.length > 0) {
        
        return AdminMessage;
      } else {
        return []; 
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Error fetching tasks');
    }
  },
  sendMessageToAdminById: async (agentId,adminId,message,messageId,role) => {
    try {
      console.log("AgentID in repo",agentId)
      const agentRepository = dataSource.getRepository('agent');
      const adminRepository = dataSource.getRepository('adminauth');
      const admin = await adminRepository.findOne({ where: { adminId } });

      const agent = await agentRepository.findOne({ where: { agentId } });
  
      if (!agent || !admin) {
        return null;
      }
      console.log("Agent",agent)
      console.log("admin",admin)

   
      const adminMessageRepository = dataSource.getRepository(adminMessage);
      const messageEntity = adminMessageRepository.create({
        adminId:admin.adminId,
        agentId: agentId,
        message: message ,
        messageId:messageId,
        role:role
      });
  
      await adminMessageRepository.save(messageEntity);
  
      return messageEntity;
    } catch (error) {
      console.error('Error in assignTaskToAgentById:', error.message);
      throw new Error('Error assigning task to agent');
    }
  },
  getAllMessagesFromAdminByAdminId:async(adminId)=>{
    try {
      const adminMessageRepository = dataSource.getRepository(adminMessage);
      const messages = await adminMessageRepository.find({
          where: { adminId },
      });
    
      return messages;
  } catch (error) {
      console.error('Error fetching messages sent to admin:', error.message);
      throw new Error('Error fetching messages');
  }
  }
  
}

module.exports=messageRepository