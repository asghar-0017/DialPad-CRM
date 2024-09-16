const dataSource = require("../infrastructure/psql");
const { logger } = require("../../logger");
const agentAuth=require('../entities/agent')
const agentTask=require('../entities/agentTask')
const agentTrash=require('../entities/agentTrash')
const tempAgent=require('../entities/tempAgent')
const agentReview=require('../entities/reviewToAgent')
const FollowUp=require('../entities/followUp')
const Other=require('../entities/otherDetail')



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
  

assignTaskToAgentById: async (agentId, taskData, leadId, taskNo) => {
    try {
        const agentRepository = dataSource.getRepository('agent');
        const agentTaskRepository = dataSource.getRepository('agentTask');
        const followUpRepository = dataSource.getRepository(FollowUp);
        const otherRepository = dataSource.getRepository(Other);

        const agent = await agentRepository.findOne({ where: { agentId } });
        if (!agent) {
            console.log("No agent found with ID:", agentId);
            return null;
        }

        let taskEntity = {
            agentId,
            leadId,
            taskNo,
            DynamicData: taskData, 
        };
        taskEntity = agentTaskRepository.create(taskEntity);
        await agentTaskRepository.save(taskEntity);
        if (taskData.CustomerFeedBack === 'followUp') {
            const followUpData = {
                dynamicLead: taskData,
                agentId: taskData.agentId,
                leadId: leadId,
            };
            const followUpEntity = followUpRepository.create(followUpData);
            await followUpRepository.save(followUpEntity);
            console.log("Task saved in FollowUp repository");
        }

        if (taskData.CustomerFeedBack === 'other') {
            const otherData = {
                dynamicLead: taskData,
                agentId: taskData.agentId,
                leadId: leadId,
            };
            const otherEntity = otherRepository.create(otherData);
            await otherRepository.save(otherEntity);
        }

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
      return tasks; 
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Error fetching tasks');
    }
  },


  
  
  getAssignTaskToAgentByTaskId: async (leadId) => {
    try {
      const agentTaskRepository =  dataSource.getRepository(agentTask);
      const task = await agentTaskRepository.findOne({ where: { leadId } })
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



// updateAssignTaskToAgentById: async ({ data, leadId, user }) => {
//   try {
//     if (!leadId) {
//       throw new Error('leadId is required');
//     }

//     console.log("Data in Repo", data);

//     const agentTaskRepository = dataSource.getRepository(agentTask);
//     const followUpRepository = dataSource.getRepository(FollowUp);
//     const otherRepository = dataSource.getRepository(Other);

//     const existingTask = await agentTaskRepository.findOne({ where: { leadId } });

//     if (!existingTask) {
//       throw new Error('Task not found');
//     }

//     const currentFeedback = existingTask.DynamicData?.CustomerFeedBack;
//     console.log('Current Feedback from task:', currentFeedback);

//     if (data.CustomerFeedBack === 'followUp') {
//       delete existingTask.DynamicData.OtherDetail;
//       delete existingTask.DynamicData.onGoing;
//       const existingOther = await otherRepository.findOne({ where: { leadId } });
//       if (existingOther) {
//         await otherRepository.delete({ leadId });
//       }
//       existingTask.DynamicData.FollowUpDetail = data.FollowUpDetail;
//       const existingFollowUp = await followUpRepository.findOne({ where: { leadId } });
//       if (existingFollowUp) {
//         await followUpRepository.update(
//           { leadId },
//           { dynamicLead: { ...existingFollowUp.dynamicLead, ...data } }
//         );
//       } else {
//         await followUpRepository.save({
//           leadId,
//           dynamicLead: existingTask.DynamicData,
//           userId: user.id,
//         });
//       }

//     } else if (data.CustomerFeedBack === 'other') {
//       existingTask.DynamicData.OtherDetail = data.OtherDetail;
//       const existingFollowUp = await followUpRepository.findOne({ where: { leadId } });
//       if (existingFollowUp) {
//         await followUpRepository.delete({ leadId });
//       }
//       const existingOther = await otherRepository.findOne({ where: { leadId } });
//       const updatedOtherData = existingOther
//         ? { ...existingOther.dynamicLead, ...data }
//         : { ...data };

//       if (existingOther) {
//         await otherRepository.update({ leadId }, { dynamicLead: updatedOtherData });
//       } else {
//         await otherRepository.save({
//           leadId,
//           dynamicLead: existingTask.DynamicData,
//           userId: user.id,
//         });
//       }

//     } else if (data.CustomerFeedBack === 'onGoing') {
//       delete existingTask.DynamicData.OtherDetail;
//       const existingOther = await otherRepository.findOne({ where: { leadId } });
//       if (existingOther) {
//         await otherRepository.delete({ leadId });
//       }
//       const existingFollowUp = await followUpRepository.findOne({ where: { leadId } });
//       if (existingFollowUp) {
//         await followUpRepository.delete({ leadId });
//       }
//     }
//     const updatedTaskData = { ...existingTask.DynamicData, ...data };
//     if (['onGoing', 'hangUp', 'other'].includes(updatedTaskData.CustomerFeedBack)) {
//       delete updatedTaskData.FollowUpDetail;
//     }
//     await agentTaskRepository.update(
//       { leadId },
//       { DynamicData: updatedTaskData, updated_at: new Date() }
//     );
//     const updatedTask = await agentTaskRepository.findOne({ where: { leadId } });
//     return updatedTask;

//   } catch (error) {
//     console.error('Error updating task for agent:', error.message);
//     throw new Error('Failed to update task for agent.');
//   }
// },

// updateAssignTaskToAgentById: async ({ data, leadId, user }) => {
//   try {
//     if (!leadId) {
//       throw new Error('leadId is required');
//     }

//     const agentTaskRepository = dataSource.getRepository(agentTask);
//     const followUpRepository = dataSource.getRepository(FollowUp);
//     const otherRepository = dataSource.getRepository(Other);

//     // Find the existing task by leadId
//     const existingTask = await agentTaskRepository.findOne({ where: { leadId } });
//     if (!existingTask) {
//       throw new Error('Task not found');
//     }

//     // Check for "onGoing", "voiceMail", "hangUp" and remove FollowUpDetail and OtherDetail
//     if (['onGoing', 'voiceMail', 'hangUp'].includes(data.CustomerFeedBack)) {
//       // Remove FollowUpDetail and OtherDetail
//       delete existingTask.DynamicData.FollowUpDetail;
//       delete existingTask.DynamicData.OtherDetail;

//       // Also remove from FollowUp and Other repositories if they exist
//       const existingFollowUp = await followUpRepository.findOne({ where: { leadId } });
//       if (existingFollowUp) {
//         await followUpRepository.delete({ leadId });
//       }

//       const existingOther = await otherRepository.findOne({ where: { leadId } });
//       if (existingOther) {
//         await otherRepository.delete({ leadId });
//       }
//     }

//     // Handle update when changing CustomerFeedBack to "followUp"
//     else if (data.CustomerFeedBack === 'followUp') {
//       // Remove OtherDetail
//       delete existingTask.DynamicData.OtherDetail;

//       const existingFollowUp = await followUpRepository.findOne({ where: { leadId } });
//       if (existingFollowUp) {
//         // Update the existing FollowUp record
//         await followUpRepository.update(
//           { leadId },
//           { dynamicLead: { ...existingFollowUp.dynamicLead, ...data } }
//         );
//       } else {
//         // Create a new FollowUp record
//         await followUpRepository.save({
//           leadId,
//           dynamicLead: existingTask.DynamicData,
//           userId: user.id,
//         });
//       }
//     }

//     // Handle update when changing CustomerFeedBack to "other"
//     else if (data.CustomerFeedBack === 'other') {
//       // Remove FollowUpDetail
//       delete existingTask.DynamicData.FollowUpDetail;

//       const existingOther = await otherRepository.findOne({ where: { leadId } });
//       if (existingOther) {
//         // Update the existing Other record
//         await otherRepository.update(
//           { leadId },
//           { dynamicLead: { ...existingOther.dynamicLead, ...data } }
//         );
//       } else {
//         // Create a new Other record
//         await otherRepository.save({
//           leadId,
//           dynamicLead: existingTask.DynamicData,
//           userId: user.id,
//         });
//       }
//     }

//     // Update the task's DynamicData with the latest changes
//     existingTask.DynamicData = { ...existingTask.DynamicData, ...data };

//     // Ensure FollowUpDetail is removed if feedback is not "followUp"
//     if (data.CustomerFeedBack !== 'followUp') {
//       delete existingTask.DynamicData.FollowUpDetail;
//     }

//     // Ensure OtherDetail is removed if feedback is not "other"
//     if (data.CustomerFeedBack !== 'other') {
//       delete existingTask.DynamicData.OtherDetail;
//     }

//     // Update the task in the agentTaskRepository
//     await agentTaskRepository.update(
//       { leadId },
//       { DynamicData: existingTask.DynamicData, updated_at: new Date() }
//     );

//     // Retrieve and return the updated task
//     const updatedTask = await agentTaskRepository.findOne({ where: { leadId } });
//     return updatedTask;

//   } catch (error) {
//     console.error('Error updating task for agent:', error.message);
//     throw new Error('Failed to update task for agent.');
//   }
// },

updateAssignTaskToAgentById: async ({ data, leadId, user }) => {
  try {
    if (!leadId) {
      throw new Error('leadId is required');
    }

    const agentTaskRepository = dataSource.getRepository(agentTask);
    const followUpRepository = dataSource.getRepository(FollowUp);
    const otherRepository = dataSource.getRepository(Other);

    const existingTask = await agentTaskRepository.findOne({ where: { leadId } });
    if (!existingTask) {
      throw new Error('Task not found');
    }

    const previousFeedback = existingTask.DynamicData.CustomerFeedBack;

    if (previousFeedback !== data.CustomerFeedBack) {
      if (['onGoing', 'voiceMail', 'hangUp'].includes(data.CustomerFeedBack)) {
        delete existingTask.DynamicData.FollowUpDetail;
        delete existingTask.DynamicData.otherDetail;

        await followUpRepository.delete({ leadId });
        await otherRepository.delete({ leadId });
      } else if (data.CustomerFeedBack === 'followUp') {
        delete existingTask.DynamicData.otherDetail;

        await otherRepository.delete({ leadId });
      } else if (data.CustomerFeedBack === 'other') {
        delete existingTask.DynamicData.FollowUpDetail;

        await followUpRepository.delete({ leadId });
      }
    }

    if (data.CustomerFeedBack === 'followUp') {
      const existingFollowUp = await followUpRepository.findOne({ where: { leadId } });
      if (existingFollowUp) {
        await followUpRepository.update(
          { leadId },
          { dynamicLead: { ...existingFollowUp.dynamicLead, ...data } }
        );
      } else {
        await followUpRepository.save({
          leadId,
          dynamicLead: { ...existingTask.DynamicData, ...data },
          userId: user.id,
        });
      }
    } else if (data.CustomerFeedBack === 'other') {
      const existingOther = await otherRepository.findOne({ where: { leadId } });
      if (existingOther) {
        // Update the existing Other record
        await otherRepository.update(
          { leadId },
          { dynamicLead: { ...existingOther.dynamicLead, ...data } }
        );
      } else {
        // Create a new Other record
        await otherRepository.save({
          leadId,
          dynamicLead: { ...existingTask.DynamicData, ...data },
          userId: user.id,
        });
      }
    }

    existingTask.DynamicData = { ...existingTask.DynamicData, ...data };

    if (data.CustomerFeedBack !== 'followUp') {
      delete existingTask.DynamicData.FollowUpDetail;
    }

    if (data.CustomerFeedBack !== 'other') {
      delete existingTask.DynamicData.OtherDetail;
    }

    await agentTaskRepository.update(
      { leadId },
      { DynamicData: existingTask.DynamicData, updated_at: new Date() }
    );

    const updatedTask = await agentTaskRepository.findOne({ where: { leadId } });
    return updatedTask;

  } catch (error) {
    console.error('Error updating task for agent:', error.message);
    throw new Error('Failed to update task for agent.');
  }
},






  
  deleteAssignTaskToAgentByTaskIds: async (taskId) => {
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

  // deleteAssignTaskToAgentByTaskId: async (agentId, taskNo) => {
  //   try {
  //     const agentTaskRepository = dataSource.getRepository(agentTask);
  //     const agentReviewRepository = dataSource.getRepository(agentReview);
  
  //     // Fetch the tasks assigned to the agent with the provided task number
  //     const tasksToDelete = await agentTaskRepository.find({
  //       where: {
  //         agentId,
  //         taskNo
  //       }
  //     });
  
  //     if (tasksToDelete.length === 0) {
  //       return 'Task Data Not Found';
  //     }
  
  //     // Remove the found tasks
  //     const deleteTaskResult = await agentTaskRepository.remove(tasksToDelete);
  
  //     // Check for reviews related to the agent and task
  //     const reviewsToDelete = await agentReviewRepository.find({
  //       where: {
  //         agentId,
  //         taskNo
  //       }
  //     });
  
  //     if (reviewsToDelete.length > 0) {
  //       await agentReviewRepository.remove(reviewsToDelete);
  //     }
  
  //     return {
  //       message: 'Task and associated reviews deleted successfully',
  //       deletedTasks: deleteTaskResult,
  //       deletedReviews: reviewsToDelete.length > 0 ? reviewsToDelete : 'No reviews found'
  //     };
  
  //   } catch (error) {
  //     console.error('Error deleting task and reviews for agent:', error.message);
  //     throw new Error('Error deleting task and reviews for agent');
  //   }
  // },
  
  deleteAssignTaskToAgentByTaskId: async (agentId, taskNo) => {
    try {
      const agentTaskRepository = dataSource.getRepository(agentTask);
      const agentReviewRepository = dataSource.getRepository(agentReview);
      const followUpRepository = dataSource.getRepository(FollowUp); // Assuming the followUp repository exists
      const leadsTrashRepository = dataSource.getRepository(leadTrash); // Repository for saving deleted data
      const otherRepository = dataSource.getRepository(Other); // Assuming otherRepo is mapped to some entity


      
      // Fetch the tasks assigned to the agent with the provided task number
      const tasksToDelete = await agentTaskRepository.find({
        where: {
          agentId,
          taskNo
        }
      });
  
      if (tasksToDelete.length === 0) {
        return 'Task Data Not Found';
      }
  
      // Fetch associated follow-up data using taskId or other valid property
      const followUpsToDelete = await followUpRepository.find({
        where: {
          agentId, // Or some other valid linking property to followUp
        }
      });
  
      // Fetch related reviews
      const reviewsToDelete = await agentReviewRepository.find({
        where: {
          agentId,
          taskNo
        }
      });

      const otherDataToDelete = await otherRepository.find({
        where: {
          agentId,
        }
      });
  
      // Prepare data to save into leadsTrash
      const leadTrashData = tasksToDelete.map(task => ({
        leadId: task.leadId,
        agentId: task.agentId,
        dynamicLead: task.DynamicData, // Assuming DynamicData contains task information
        created_at: task.created_at,
        updated_at: task.updated_at
      }));
  
      // Save the tasks, follow-ups, and reviews into leadsTrash before deletion
      await leadsTrashRepository.save(leadTrashData);
  
      // Remove the task, follow-ups, and reviews from the main tables
      await agentTaskRepository.remove(tasksToDelete);
  
      if (followUpsToDelete.length > 0) {
        await followUpRepository.remove(followUpsToDelete);
      }
  
      if (reviewsToDelete.length > 0) {
        await agentReviewRepository.remove(reviewsToDelete);
      }
  
      return {
        message: 'Task, follow-ups, reviews, and associated data deleted successfully and saved in leadsTrash',
        deletedTasks: tasksToDelete,
        deletedFollowUps: followUpsToDelete.length > 0 ? followUpsToDelete : 'No follow-ups found',
        deletedReviews: reviewsToDelete.length > 0 ? reviewsToDelete : 'No reviews found'
      };
  
    } catch (error) {
      console.error('Error deleting task, follow-ups, and reviews for agent:', error.message);
      throw new Error('Error deleting task, follow-ups, and reviews for agent');
    }
  },deleteAssignTaskToAgentByTaskId: async (agentId, taskNo) => {
    try {
      const agentTaskRepository = dataSource.getRepository(agentTask);
      const agentReviewRepository = dataSource.getRepository(agentReview);
      const followUpRepository = dataSource.getRepository(FollowUp);
      const otherRepository = dataSource.getRepository(Other); // Assuming the repository for "other" data exists
      const leadsTrashRepository = dataSource.getRepository(leadTrash);
  
      const tasksToDelete = await agentTaskRepository.find({
        where: {
          agentId,
          taskNo
        }
      });
  
      if (tasksToDelete.length === 0) {
        return 'Task Data Not Found';
      }
  
      const followUpsToDelete = await followUpRepository.find({
        where: {
          agentId,
        }
      });
        const reviewsToDelete = await agentReviewRepository.find({
        where: {
          agentId,
          taskNo
        }
      });
  
      const othersToDelete = await otherRepository.find({
        where: {
          agentId,
        }
      });
  
      const leadTrashData = tasksToDelete.map(task => ({
        leadId: task.leadId,
        agentId: task.agentId,
        dynamicLead: task.DynamicData, 
        created_at: task.created_at,
        updated_at: task.updated_at
      }));
  
      await leadsTrashRepository.save(leadTrashData);
  
      await agentTaskRepository.remove(tasksToDelete);
  
      if (followUpsToDelete.length > 0) {
        await followUpRepository.remove(followUpsToDelete);
      }
  
      if (reviewsToDelete.length > 0) {
        await agentReviewRepository.remove(reviewsToDelete);
      }
  
      if (othersToDelete.length > 0) {
        await otherRepository.remove(othersToDelete);
      }
  
      return {
        message: 'Task, follow-ups, reviews, others, and associated data deleted successfully and saved in leadsTrash',
        deletedTasks: tasksToDelete,
        deletedFollowUps: followUpsToDelete.length > 0 ? followUpsToDelete : 'No follow-ups found',
        deletedReviews: reviewsToDelete.length > 0 ? reviewsToDelete : 'No reviews found',
        deletedOthers: othersToDelete.length > 0 ? othersToDelete : 'No others found'
      };
  
    } catch (error) {
      console.error('Error deleting task, follow-ups, reviews, others for agent:', error.message);
      throw new Error('Error deleting task, follow-ups, reviews, and others for agent');
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
  
  assignReviewToAgentById: async (agentId, review, reviewId, taskNo) => {
    try {
      console.log("AgentID in repo:", agentId);
      
      const agentRepository = dataSource.getRepository('agent');
      const agent = await agentRepository.findOne({ where: { agentId } });

      if (!agent) {
        console.log("No agent found with ID:", agentId);
        return null;
      }
      
      console.log("Agent:", agent);

      const agentTaskRepository = dataSource.getRepository(agentTask);
      const task = await agentTaskRepository.findOne({ where: { taskNo, agentId } });

    if (!task || task.status !== 'complete') {
      console.log("Task is not complete or task not found.");
      return null;
    }
      
      console.log("Task:", task);

      const agentReviewRepository = dataSource.getRepository(agentReview);
      const reviewEntity = agentReviewRepository.create({
        id: reviewId,
        review: review,
        agent: agent,
        taskNo: taskNo, 
        reviewId: reviewId,
      });

      await agentReviewRepository.save(reviewEntity);

      return reviewEntity;
    } catch (error) {
      console.error('Error in assignReviewToAgentById:', error.message);
      throw new Error('Error assigning review to agent');
    }
  },
  getTaskByTaskNo: async (agentId, taskNo) => {
    try {
      const taskRepository = dataSource.getRepository('agentTask');
      const task = await taskRepository.findOne({ where: { agentId, taskNo } });
      return task;
    } catch (error) {
      console.error('Error fetching task:', error.message);
      throw error;
    }
  },


  getAssignReviewsToAgentById: async (agentId, taskNo) => {
    try {
      const agentReviewRepository = dataSource.getRepository('agentReview');
            const reviews = await agentReviewRepository.find({
        where: { 
           agentId ,  
           taskNo 
        },
      });
  
      return reviews.length > 0 ? reviews : []; 
    } catch (error) {
      console.error('Error fetching reviews by taskNo:', error.message);
      throw new Error('Error fetching reviews');
    }
  },

  updateTaskStatus: async (agentId, taskNo, status) => {
    try {
      const agentTaskRepository = dataSource.getRepository(agentTask);
  
      const tasks = await agentTaskRepository.find({ where: { agentId, taskNo } });
  
      if (tasks.length === 0) {
        return null;
      }
  
      await agentTaskRepository.update({ agentId, taskNo }, { status });
  
      const updatedTasks = await agentTaskRepository.find({ where: { agentId, taskNo } });
  
      if (updatedTasks.length > 0) {
        return updatedTasks;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error in updateTaskStatus:', error.message);
      throw error;
    }
  },

  getTaskStatusByTaskNo: async (agentId, taskNo) => {
    try {
      const taskRepository = dataSource.getRepository('agentTask');
      const task = await taskRepository.findOne({ where: { agentId, taskNo } });
      return task; 
    } catch (error) {
      console.error('Error in getTaskStatusByTaskNo:', error.message); 
      throw new Error('Failed to get task status'); 
    }
  },
  
  
  
  
};
const agent = require('../entities/agent');
const dataSouece=require('../infrastructure/psql');
const leadTrash = require("../entities/leadTrash");

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

