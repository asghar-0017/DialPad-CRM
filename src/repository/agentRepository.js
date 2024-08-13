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
  getAgentDataById: async (agentId) => {
    try {
        const data = await dataSource.getRepository(agentAuth).findOne({ where: { agentId } });
        if (data) {   
            return data;
        } if(data=='null'){
          return { message: `Data Not Found With ${agentId}` };
        }
    } catch (error) {
        console.error('Error fetching agent data:', error);
        throw error;
    }
},

  updateAgentDataById:async(agentId,{firstName,lastName,email,phone},user)=>{
    try{
      const data= await dataSource.getRepository(agentAuth).findOne({where:{agentId}})
      if(data){
        const result = await dataSource.getRepository(agentAuth).update({ agentId }, {firstName,lastName,email,phone},user)
        return result
      }
      else{
        return `Data Not Found With ${agentId}`
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
      console.log("AgentID in repo",agentId)
      const agentRepository = dataSource.getRepository('agent');
      const agent = await agentRepository.findOne({ where: { agentId } });
  
      if (!agent) {
        console.log("No agent found with ID:", agentId);
        return null;
      }
      console.log("Agent",agent)

   
      const agentTaskRepository = dataSource.getRepository('agentTask');
      const taskEntity = agentTaskRepository.create({
        id: taskId,
        task: task ,
        agent: agent, 
        leadId: task.leadId,
        taskId:taskId
      });
  
      await agentTaskRepository.save(taskEntity);
  
      return taskEntity;
    } catch (error) {
      console.error('Error in assignTaskToAgentById:', error.message);
      throw new Error('Error assigning task to agent');
    }
  },
  
  getAssignTaskToAgent: async () => {
    try {
      const agentTaskRepository = dataSource.getRepository('agentTask');
      const agentRepository = dataSource.getRepository('agent');
      const agentTasks = await agentTaskRepository.find();
  
      if (agentTasks.length === 0) {
        return 'No tasks found';
      }
      const tasksWithAgentNames = await Promise.all(agentTasks.map(async (task) => {
        const agentData = await agentRepository.findOne({ where: { agentId: task.agentId } });
        if (agentData) {
          return {
            taskId: task.taskId,
            agentId:task.agentId,
            task: task.task,
            // data:agentData
            // fullName: `${agentData.firstName} ${agentData.lastName}`
          };
        } 
      }));
      return tasksWithAgentNames;
    } catch (error) {
      throw error;
    }
  },
  
  getAssignTaskToAgentById: async (agentId) => {
    try {
      const agentTaskRepository = dataSource.getRepository('agentTask');
      const tasks = await agentTaskRepository.find({ where: { agentId } });
      if (tasks.length > 0) {
        return tasks;
      } else {
        return []; 
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Error fetching tasks');
    }
  },
  
  getAssignTaskToAgentByTaskId: async (taskId) => {
    try {
      const agentTaskRepository =  dataSource.getRepository('agentTask');
      const task = await agentTaskRepository.findOne({ where: { taskId } })
      if (task) {
        return task;
      } else {
        return null; 
      }
    } catch (error) {
      console.error('Error fetching task:', error.message);
      throw new Error('Error fetching task');
    }
  },

  updateAssignTaskToAgentById: async ( taskId, updatedTaskData) => {
    try {
      const agentTaskRepository = dataSource.getRepository('agentTask');
      const existingTask = await agentTaskRepository.findOne({
        where: {
          taskId: taskId,
        }
      });  
      if (existingTask) {
        await agentTaskRepository.update({ taskId }, updatedTaskData);
        const updatedTask = await agentTaskRepository.findOne({ where: { taskId } });
        return updatedTask;
      } else {
        return 'Data Not Found';
      }
    } catch (error) {
      console.error('Error updating task for agent:', error.message);
      throw new Error('Error updating task for agent');
    }
  },
  
  deleteAssignTaskToAgentById: async (agentId, taskId) => {
    try {
      const agentTaskRepository = dataSource.getRepository('agentTask');
      
      const existingTask = await agentTaskRepository.findOne({
        where: {
          taskId: taskId,
          agentId: agentId
        }
      });
      if (existingTask) {
        const deleteTask = await agentTaskRepository.remove(existingTask);
        return deleteTask;
      } else {
        return 'Data Not Found';
      }
    } catch (error) {
      console.error('Error deleting task for agent:', error.message);
      throw new Error('Error deleting task for agent');
    }
  },
  deleteAssignTaskToAgentByTaskId: async (taskId) => {
    try {
      const agentTaskRepository = dataSource.getRepository('agentTask');
      
      const existingTask = await agentTaskRepository.findOne({
        where: {
          taskId: taskId,
  
        }
      });
      
      if (existingTask) {
        const deleteTask = await agentTaskRepository.remove(existingTask);
        return deleteTask;
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
  updateStatusInRepo: async (status, agentId) => {
    try {
        const agentRepository = dataSource.getRepository(agent);
        const existingAgent = await agentRepository.findOne({ where: { agentId } });
        if (!existingAgent) {
            return (`Agent with ID ${agentId} not found`);
        }
        await agentRepository.update({ agentId }, { isActivated: status });
        const updatedAgent = await agentRepository.findOne({ where: { agentId } });
        return updatedAgent;

    } catch (error) {
        console.error('Error updating status:', error);
        throw new Error('Failed to update agent status');
    }
}

};

module.exports = {agentRepository,authAgentRepository};

