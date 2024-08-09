const dataSource = require("../infrastructure/psql");
const { logger } = require("../../logger");
const agentAuth=require('../entities/agent')
const agentTask=require('../entities/agentTask')

const agentRepository = {
findByEmail: async (email) => {
        return await dataSource.getRepository(agentAuth).findOne({ where: { email } });
      },

  saveAgent: async (agent) => {
    return await dataSource.getRepository(agentAuth).save(agent);
  },
  getAgentData:async()=>{
    try{
        return await dataSource.getRepository(agentAuth).find()

    }catch(error){

    }
  },
  getAgentDataById:async(agentId)=>{
    try{
      const data= await dataSource.getRepository(agentAuth).findOne({where:{agentId}})
      if(data){
        return data
      }
    }catch(error){
      throw error
    }
  },
  updateAgentDataById:async(agentId,{firstName,lastName,email,phone},user)=>{
    try{
      const data= await dataSource.getRepository(agentAuth).findOne({where:{agentId}})
      if(data){
        const result = await dataSource.getRepository(agentAuth).update({ agentId }, {firstName,lastName,email,phone},user)
        return result
      }
    }catch(error){
      throw error
    }
  },
  deleteAgentDataById:async(agentId,user)=>{
    try{
      const data= await dataSource.getRepository(agentAuth).findOne({where:{agentId}})
      if(data){
        const result = await dataSource.getRepository(agentAuth).delete({ agentId },user)
        return result
      }
    }catch(error){
      throw error
    }
  },
  assignTaskToAgentById: async (agentId, task) => {
    try {
      const agentRepository = dataSource.getRepository('agent'); // Use entity name as string
      const agent = await agentRepository.findOne({ where: { agentId } });
  
      if (!agent) {
        console.log("No agent found with ID:", agentId);
        return null; // Return null if no agent is found
      }
  
      // Create and save the task
      const agentTaskRepository = dataSource.getRepository('agentTask'); // Use entity name as string
      const taskEntity = agentTaskRepository.create({
        task: task.task, // Assuming task has a `task` field
        agent: agent, // Associate the task with the agent
        leadId:agent.leadId
      });
  
      await agentTaskRepository.save(taskEntity);
  
      return taskEntity;
    } catch (error) {
      console.error('Error in assignTaskToAgentById:', error.message);
      throw new Error('Error assigning task to agent');
    }
  }
  
  
};
const agent = require('../entities/agent');
const dataSouece=require('../infrastructure/psql')

const authAgentRepository = {
  findByUserName: async (userName) => {
    return await dataSouece.getRepository(agent).findOne({ where: { userName } });
  },

  findByEmail: async (email) => {
    return await dataSouece.getRepository(agent).findOne({ where: { email } });
  },

  findByToken: async (token) => {
    return await dataSouece.getRepository(agent).findOne({ where: { resetCode: token } });
  },

  save: async (admin) => {
    return await dataSouece.getRepository(agent).save(admin);
  },

  findTokenByToken: async (token) => {
    return await dataSouece.getRepository(agent).findOne({ where: { verifyToken: token } });

  },
};

module.exports = {agentRepository,authAgentRepository};

