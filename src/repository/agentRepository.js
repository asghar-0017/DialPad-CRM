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
  assignTaskToAgentById: async (agentId, task, taskId) => {
    try {
      const agentRepository = dataSource.getRepository('agent');
      const agent = await agentRepository.findOne({ where: { agentId } });
  
      if (!agent) {
        console.log("No agent found with ID:", agentId);
        return null;
      }
  
      const agentTaskRepository = dataSource.getRepository('agentTask');
      const taskEntity = agentTaskRepository.create({
        id: taskId,
        task: task.task,
        agent: agent, 
        leadId: task.leadId,
        taskId:task.taskId
      });
  
      await agentTaskRepository.save(taskEntity);
  
      return taskEntity;
    } catch (error) {
      console.error('Error in assignTaskToAgentById:', error.message);
      throw new Error('Error assigning task to agent');
    }
  },
  
  getAssignTaskToAgent:async()=>{
    try{
      const agentTaskRepository = dataSource.getRepository('agentTask');
      const agent = await agentTaskRepository.find();
      if(agent){
        return agent
      }else{
        return 'Data Not Found'
      }
    }catch(error){
      throw error
    }
  },
  getAssignTaskToAgentById :async (agentId) => {
    try {
      const agentTaskRepository = dataSource.getRepository('agentTask');
      const tasks = await agentTaskRepository.find({ where: { agentId } }); // Use find to get all records with the same agentId
      
      console.log("Tasks", tasks); 
  
      if (tasks.length > 0) {
        return tasks;
      } else {
        return 'Data Not Found';
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Error fetching tasks');
    }
  },
  updateAssignTaskToAgentById:async ({agentId,taskId}, task) => {
    try {
      const agentTaskRepository = dataSource.getRepository('agentTask');
        const existingTask = await agentTaskRepository.findOne({ where: { agentId } });
      if (existingTask) {
        await agentTaskRepository.update({ agentId,taskId} , task);
          const updatedTask = await agentTaskRepository.findOne({ where: { agentId } });
        return updatedTask;
      } else {
        return 'Data Not Found';
      }
    } catch (error) {
      console.error('Error updating task for agent:', error.message);
      throw new Error('Error updating task for agent');
    }
  },
  deleteAssignTaskToAgentById:async (agentId) => {
    try {
      const agentTaskRepository = dataSource.getRepository('agentTask');
        const existingTask = await agentTaskRepository.findOne({ where: { agentId } });
      if (existingTask) {
       const deleteTask= await agentTaskRepository.remove(existingTask);
       return deleteTask
         
      } else {
        return 'Data Not Found'; 
      }
    } catch (error) {
      console.error('Error deleting task for agent:', error.message);
      throw new Error('Error deleting task for agent');
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

  save: async (agent) => {
    return await dataSouece.getRepository(agent).save(agent);
  },

  findTokenByToken: async (token) => {
    return await dataSouece.getRepository(agent).findOne({ where: { verifyToken: token } });

  },
};

module.exports = {agentRepository,authAgentRepository};

