const dataSource = require("../infrastructure/psql");
const { logger } = require("../../logger");
const agentAuth=require('../entities/agent')
const agentTask=require('../entities/agentTask')
const agentTrash=require('../entities/agentTrash')
const tempAgent=require('../entities/tempAgent')
const agentReview=require('../entities/reviewToAgent')


const agentRepository = {
findByEmail: async (email) => {
        return await dataSource.getRepository(agentAuth).findOne({ where: { email } });
      },

  saveAgent: async (agent) => {
    return await dataSource.getRepository(agentAuth).save(agent);
  },
  saveTempAgent: async (agent) => {
    return await dataSource.getRepository(tempAgent).save(agent);
  },

  findTempAgentByEmailAndToken: async (email, token) => {
    const repository = dataSource.getRepository('tempAgent');
    return repository.findOne({
      where: { email, verifyToken: token },
    });
  },

  deleteTempAgentById: async (id) => {
    const repository = dataSource.getRepository('tempAgent');
    return repository.delete(id);
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
       return data
    } catch (error) {
        console.error('Error fetching agent data:', error);
        throw error;
    }
},

  updateAgentDataById:async(agentId,{firstName,lastName,email,phone},user)=>{
    try {
      const data = await dataSource.getRepository(agentAuth).findOne({ where: { agentId } });
      if (data) {
          await dataSource.getRepository(agentAuth).update({ agentId }, { firstName, lastName, email, phone });
          const updatedData = await dataSource.getRepository(agentAuth).findOne({ where: { agentId } });
            return updatedData;
      } else {
          return `No data found with agentId: ${agentId}`;
      }
  } catch (error) {
      throw new Error(`Error updating agent data: ${error.message}`);
  }
  
  
  },
  deleteAgentDataById: async (agentId, user) => {
    try {
      const repository = dataSource.getRepository(agentAuth);
      const trashRepository = dataSource.getRepository(agentTrash);
      const data = await repository.findOne({ where: { agentId } });
      if (data) {
        const createAgentInTrash = await trashRepository.save(trashRepository.create(data));
          const result = await repository.delete({ agentId });
          return {
          result,
          dataTrash: createAgentInTrash
        };
      } else {
        return null;
      }
    } catch (error) {
      throw new Error(`Error deleting agent: ${error.message}`);
    }
  },
  

  // assignTaskToAgentById: async (agentId, taskData, taskId) => {
  //   try {
  //     console.log("AgentID in repo:", agentId);
  //     console.log("Task Id in Repo:", taskId);
  //     console.log("Task Data in Repo:", taskData);
  
  //     // Get the agent repository
  //     const agentRepository = dataSource.getRepository('agent');
      
  //     // Find the agent by ID
  //     const agent = await agentRepository.findOne({ where: { agentId } });
  
  //     if (!agent) {
  //       console.log("No agent found with ID:", agentId);
  //       return null;
  //     }
  
  //     console.log("Agent:", agent);
  
  //     // Get the agentTask repository
  //     const agentTaskRepository = dataSource.getRepository(agentTask);
  
      
  //     let taskEntity = {
  //       agentId,
  //       taskId,
  //       ...taskData
  //     };
  
  //     console.log("Task Entity before saving:", taskEntity);
  
  //     // Create and save the task entity to the database
  //     taskEntity = agentTaskRepository.create(taskEntity);
  //     await agentTaskRepository.save(taskEntity);
  
  
  //     return taskEntity;
  //   } catch (error) {
  //     console.error('Error in assignTaskToAgentById:', error.message);
  //     throw new Error('Error assigning task to agent');
  //   }
  // },

  assignTaskToAgentById: async (agentId, taskData, taskId, taskNo) => {
    try {
      console.log("AgentID in repo:", agentId);
      console.log("Task Id in Repo:", taskId);
      console.log("Task Data in Repo:", taskData);
  
      const agentRepository = dataSource.getRepository('agent');
      const agentTaskRepository = dataSource.getRepository(agentTask);
  
      const agent = await agentRepository.findOne({ where: { agentId } });
  
      if (!agent) {
        console.log("No agent found with ID:", agentId);
        return null;
      }
  
      let taskEntity = {
        agentId,
        taskId,
        taskNo, // Pass the task number from the controller
        DynamicData: taskData
      };
  
      taskEntity = agentTaskRepository.create(taskEntity);
      await agentTaskRepository.save(taskEntity);
  
      return taskEntity;
    } catch (error) {
      console.error('Error in assignTaskToAgentById:', error.message);
      throw new Error('Error assigning task to agent');
    }
  },
  
  
  
  getAssignTaskToAgent: async () => {
    try {
      const agentTaskRepository = dataSource.getRepository(agentTask);
      const agentTasks = await agentTaskRepository.find();
      
        if (agentTasks) {
          return {
            agentTasks
          };
        } 
      
    } catch (error) {
      throw error;
    }
  },
  
  getAssignTaskToAgentById: async (agentId) => {
    try {
      const agentTaskRepository = dataSource.getRepository(agentTask);
      const tasks = await agentTaskRepository.find({ where: { agentId } });
    
      return tasks.length > 0 ? tasks : [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Error fetching tasks');
    }
  },

  getAssignTaskToAgentByTaskNo: async (agentId,taskNo) => {
    try {
      const agentTaskRepository = dataSource.getRepository(agentTask);
      const tasks = await agentTaskRepository.find({ where: { agentId,taskNo } });
    
      return tasks.length > 0 ? tasks : [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Error fetching tasks');
    }
  },


  
  
  getAssignTaskToAgentByTaskId: async (taskId) => {
    try {
      const agentTaskRepository =  dataSource.getRepository(agentTask);
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
      const agentTaskRepository = dataSource.getRepository(agentTask);
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
      const agentTaskRepository = dataSource.getRepository(agentTask);
      
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
      const agentTaskRepository = dataSource.getRepository(agentTask);
      
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
  },
  assignReviewToAgentById: async (agentId,review,reviewId) => {
    try {
      console.log("AgentID in repo",agentId)
      const agentRepository = dataSource.getRepository('agent');
      const agent = await agentRepository.findOne({ where: { agentId } });
  
      if (!agent) {
        console.log("No agent found with ID:", agentId);
        return null;
      }
      console.log("Agent",agent)

   
      const agentReviewRepository = dataSource.getRepository(agentReview);
      const reviewEntity = agentReviewRepository.create({
        id: reviewId,
        review: review ,
        agent: agent, 
        reviewId:reviewId
      });
  
      await agentReviewRepository.save(reviewEntity);
  
      return reviewEntity;
    } catch (error) {
      console.error('Error in assignTaskToAgentById:', error.message);
      throw new Error('Error assigning task to agent');
    }
  },
  getAssignReviewsToAgentById: async (agentId) => {
    try {
      const agentTaskRepository = dataSource.getRepository(agentReview);
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
  
  getAssignReviewToAgentByReviewId: async (reviewId) => {
    try {
      const agentReviewRepository =  dataSource.getRepository(agentReview);
      const review = await agentReviewRepository.findOne({ where: { reviewId } })
      if (review) {
        return review;
      } else {
        return null; 
      }
    } catch (error) {
      console.error('Error fetching task:', error.message);
      throw new Error('Error fetching task');
    }
  },
  updateAssignReviewToAgentById: async ( reviewId, updatedTaskData) => {
    try {
      const agentReviewRepository = dataSource.getRepository(agentReview);
      const existingReview = await agentReviewRepository.findOne({
        where: {
          reviewId: reviewId,
        }
      });  
      if (existingReview) {
        await agentReviewRepository.update({ reviewId }, updatedTaskData);
        const updatedTask = await agentReviewRepository.findOne({ where: { reviewId } });
        return updatedTask;
      } else {
        return 'Data Not Found';
      }
    } catch (error) {
      console.error('Error updating task for agent:', error.message);
      throw new Error('Error updating task for agent');
    }
  },
  deleteAssignReviewToAgentByReviewId: async (reviewId) => {
    try {
      const agentReviewRepository = dataSource.getRepository(agentReview);
      
      const existingReview = await agentReviewRepository.findOne({
        where: {
          reviewId: reviewId,
  
        }
      });
      
      if (existingReview) {
        const deleteReview = await agentReviewRepository.remove(existingReview);
        return deleteReview;
      } else {
        return 'Data Not Found';
      }
    } catch (error) {
      console.error('Error deleting task for agent:', error.message);
      throw new Error('Error deleting task for agent');
    }
  },
  
  
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

