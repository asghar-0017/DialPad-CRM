const dataSource=require('../infrastructure/psql')
const messageRepository={
    assignMessageToAgentById: async (adminId,agentId,message,messageId) => {
    try {
      console.log("AgentID in repo",agentId)
      const agentRepository = dataSource.getRepository('agent');
      const agent = await agentRepository.findOne({ where: { agentId } });
      if (!agent) {
        console.log("No agent found with ID:", agentId);
        return null;
      }
      console.log("Agent",agent)

   
      const agentMessageRepository = dataSource.getRepository('agent_message');
      const messageEntity = agentMessageRepository.create({
        agentId: agent.agentId,
        adminId:adminId,
        message,
        messageId,
      });
  
      await agentMessageRepository.save(messageEntity);
  
      return messageEntity;
    } catch (error) {
      console.error('Error in assignTaskToAgentById:', error.message);
      throw new Error('Error assigning task to agent');
    }
  },
  getAssignMessagesToAgentById: async (agentId) => {
    try {
      const agentTaskRepository = dataSource.getRepository('agent_message');
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
      const agentTaskRepository = dataSource.getRepository('admin_message');
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
  sendMessageToAdminById: async (agentId,adminId,message,messageId) => {
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

   
      const adminMessageRepository = dataSource.getRepository('admin_message');
      const messageEntity = adminMessageRepository.create({
        adminId:admin.adminId,
        agentId: agentId,
        message: message ,
        messageId:messageId
      });
  
      await adminMessageRepository.save(messageEntity);
  
      return messageEntity;
    } catch (error) {
      console.error('Error in assignTaskToAgentById:', error.message);
      throw new Error('Error assigning task to agent');
    }
  },
  
}

module.exports=messageRepository