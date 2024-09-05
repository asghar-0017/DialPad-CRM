const dataSource = require("../infrastructure/psql");
const { logger } = require("../../logger");
const agentAuth=require('../entities/agent')
const agentTask=require('../entities/agentTask')
const agentTrash=require('../entities/agentTrash')
const tempAgent=require('../entities/tempAgent')
const agentReview=require('../entities/reviewToAgent')

const normalizeColumnName = (name) => {
  return name
      .replace(/[^a-zA-Z0-9\s]/g, '')  // Remove non-alphanumeric characters
      .split(' ')  // Split the string by spaces
      .map((word, index) => 
          index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('');  // Join the words together
};


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
  

//   assignTaskToAgentById: async (agentId, taskData, taskId) => {
//     try {
//         console.log("AgentID in repo:", agentId);
//         console.log("Task Id in Repo:", taskId);
//         console.log("Task Data in Repo:", taskData);

//         // Get the agent repository
//         const agentRepository = dataSource.getRepository('agent');
        
//         // Find the agent by ID
//         const agent = await agentRepository.findOne({ where: { agentId } });

//         if (!agent) {
//             console.log("No agent found with ID:", agentId);
//             return null;
//         }

//         console.log("Agent:", agent);

//         // Get the agentTask repository
//         const agentTaskRepository = dataSource.getRepository('agentTask');

//         // Create the task entity with the provided data
//         let taskEntity = {
//             agentId,
//             taskId,
//             ...taskData,  // Spread the taskData to include all dynamic columns
//             agent  // Include the agent relation
//         };

//         console.log("Task Entity before saving:", taskEntity);

//         // Create and save the task entity to the database
//         taskEntity = agentTaskRepository.create(taskEntity);
//         await agentTaskRepository.save(taskEntity);

//         // Prepare response with the dynamic taskData columns
//         const response = {
//             agentId: taskEntity.agentId,
//             taskId: taskEntity.taskId,
//             ...taskData  // Include all task data in the response
//         };

//         return response;
//     } catch (error) {
//         console.error('Error in assignTaskToAgentById:', error.message);
//         throw new Error('Error assigning task to agent');
//     }
// },


//  assignTaskToAgentById :async (agentId, taskData, taskId) => {
//   const queryRunner = dataSource.createQueryRunner();
//   await queryRunner.connect();

//   try {
//     // Get the agent from repository
//     const agentRepository = dataSource.getRepository('agent');
//     const agent = await agentRepository.findOne({ where: { agentId } });

//     if (!agent) {
//       console.log("No agent found with ID:", agentId);
//       return null;
//     }

//     // Dynamically construct the task data including the agentId and taskId
//     const dynamicTaskData = {
//       agentId: agent.agentId,
//       taskId: taskId,
//       ...taskData,
//     };

//     // Prepare a list of column names and values for the SQL insert
//     const columns = Object.keys(dynamicTaskData);
//     const values = Object.values(dynamicTaskData);

//     // Construct the SQL query to insert the data into `agentTask`
//     const query = `
//       INSERT INTO "agentTask" (${columns.join(", ")})
//       VALUES (${columns.map((_, i) => `$${i + 1}`).join(", ")})
//       ON CONFLICT (taskId, agentId) DO UPDATE
//       SET ${columns.map((col, i) => `"${col}" = EXCLUDED."${col}"`).join(", ")}
//       RETURNING *;
//     `;

//     // Execute the query with the dynamic values
//     const result = await queryRunner.query(query, values);

//     console.log("Saved Task:", result[0]);

//     return result[0];
//   } catch (error) {
//     console.error("Error in assignTaskToAgentById:", error.message);
//     throw new Error("Error assigning task to agent");
//   } finally {
//     await queryRunner.release();
//   }
// },



// assignTaskToAgentById : async (agentId, taskData, taskId) => {
//   const queryRunner = dataSource.createQueryRunner();
//   await queryRunner.connect();

//   try {
//     // Dynamically construct the task data including agentId, leadId, and taskId
//     const dynamicTaskData = {
//       ...taskData,
//     };
//     console.log("Dynamic Task Data",dynamicTaskData)
  

//     // Prepare a list of column names and values for the SQL insert
//     const columns = Object.keys(dynamicTaskData);
//     const values = Object.values(dynamicTaskData);

//     // Construct the SQL query to insert the data into `agentTask`
//     const query = `
//     INSERT INTO "agentTask" (agentId, taskId, Name, Address, PhoneNumber, Email)
//     VALUES ($1, $2, $3, $4, $5, $6)
//     ON CONFLICT (taskId, agentId) DO UPDATE
//     SET "Name" = EXCLUDED."Name",
//         "Address" = EXCLUDED."Address",
//         "PhoneNumber" = EXCLUDED."PhoneNumber",
//         "Email" = EXCLUDED."Email"
//     RETURNING *;
//   `;
  
  
//     // Execute the query with the dynamic values
//     const result = await queryRunner.query(query, values);

//     console.log("Saved Task:", result[0]);

//     return result[0];
//   } catch (error) {
//     console.error("Error in assignTaskToAgentById:", error.message);
//     throw new Error("Error assigning task to agent");
//   } finally {
//     await queryRunner.release();
//   }
// },

 assignTaskToAgentById :async (agentId, taskData, taskId) => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Get the agent from repository
    const agentRepository = dataSource.getRepository('agent');
    const agent = await agentRepository.findOne({ where: { agentId } });

    if (!agent) {
      console.log("No agent found with ID:", agentId);
      return null;
    }

    // Dynamically construct the task data including the agentId and taskId
    const dynamicTaskData = {
      agentId,
      taskId,
      ...taskData, // Include additional task data
    };

    const agentTaskRepository = dataSource.getRepository('agentTask');

    // Fetch current columns of the agentTask table
    const currentColumns = await queryRunner.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'agentTask';
    `);
    const existingColumns = currentColumns.map(col => col.column_name.toLowerCase());

    // Identify missing columns in the table
    const missingColumns = Object.keys(dynamicTaskData).filter(col => !existingColumns.includes(col.toLowerCase()));

    // Add missing columns to the agentTask table
    for (const column of missingColumns) {
      let columnType = 'TEXT'; // Default column type

      if (typeof dynamicTaskData[column] === 'number') {
        columnType = 'INTEGER';
      } else if (typeof dynamicTaskData[column] === 'boolean') {
        columnType = 'BOOLEAN';
      } else if (typeof dynamicTaskData[column] === 'string' && column.toLowerCase().includes('phone')) {
        columnType = 'VARCHAR';
      } else if (typeof dynamicTaskData[column] === 'string' && column.toLowerCase().includes('date')) {
        columnType = 'TIMESTAMP';
      }

      await queryRunner.query(`
        ALTER TABLE "agentTask"
        ADD COLUMN "${column}" ${columnType};
      `);
    }

    // Create and save the task entity to the database
    const taskEntity = agentTaskRepository.create(dynamicTaskData);
    const result = await agentTaskRepository.save(taskEntity);

    // Commit the transaction
    await queryRunner.commitTransaction();

    console.log("Saved Task:", result);

    return result;
  } catch (error) {
    // Rollback the transaction in case of error
    await queryRunner.rollbackTransaction();
    console.error("Error in assignTaskToAgentById:", error.message);
    throw new Error("Error assigning task to agent");
  } finally {
    // Release the query runner
    await queryRunner.release();
  }
},



  
  getAssignTaskToAgent: async () => {
    try {
      const agentTaskRepository = dataSource.getRepository('agentTask');
      const agentRepository = dataSource.getRepository('agent');
      const agentTasks = await agentTaskRepository.find();
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

