const dataSource = require("../infrastructure/psql");
const FollowUp = require('../entities/followUp'); // Adjust the path as needed
const Lead = require('../entities/lead');
const followUp = require("../entities/followUp");
const agentTask=require('../entities/agentTask')
const Other=require('../entities/otherDetail')

const followUpRepository = {
  createFollowUp: async (followUpData) => {
    try {   
      
       
        return await dataSource.getRepository(FollowUp).save(followUpData);
    } catch (error) {
        throw error;
    }
},
  findAll: async () => {
    const repository = dataSource.getRepository(FollowUp);
    return await repository.find();
  },

  findById: async (leadId) => {
    const data= await dataSource.getRepository(FollowUp).findOne({ where: { leadId } });
    return data
  },
  getAllSpecificFollowUpDataByAgentId:async(agentId)=>{
    try {
        const data = await dataSource.getRepository(FollowUp).find({ where: { agentId } });
        return data;
    } catch (error) {
        console.error('Error in repository layer:', error);
        throw error;
    }
  },

 
  updateFollowUpOrTask :async (leadId,data) => {
    try {
      if (!leadId) {
        throw new Error('leadId is required');
      }
  
      console.log("Data in Repo", data);
  
      const agentTaskRepository = dataSource.getRepository(agentTask);
      const followUpRepository = dataSource.getRepository(FollowUp);
      const otherRepository = dataSource.getRepository(Other);
      const leadRepository = dataSource.getRepository(Lead);
  
      // Check if the leadId exists in followUp repository
      const existingFollowUp = await followUpRepository.findOne({ where: { leadId } });
  
      if (existingFollowUp) {
        console.log(`FollowUp found for leadId: ${leadId}`);
  
        // Update the follow-up with the new data
        const updatedFollowUpData = { ...existingFollowUp.dynamicLead, ...data };
  
        await followUpRepository.update(
          { leadId },
          { dynamicLead: updatedFollowUpData, updated_at: new Date() }
        );
  
        // Also update lead if necessary
        const leadEntity = await leadRepository.findOne({ where: { leadId } });
        if (leadEntity) {
          const updatedLeadData = { ...leadEntity.dynamicLead, ...data };
          await leadRepository.update(
            { leadId },
            { dynamicLead: updatedLeadData, updated_at: new Date() }
          );
        }
  
        return { message: 'Follow-up updated successfully' };
      } else {
        console.log(`No followUp found for leadId: ${leadId}. Checking task repository...`);
  
        // Check if the leadId exists in agentTask repository
        const existingTask = await agentTaskRepository.findOne({ where: { leadId } });
        if (!existingTask) {
          throw new Error('Task not found');
        }
  
        console.log('Task found for leadId:', leadId);
        const currentFeedback = existingTask.DynamicData?.CustomerFeedBack;
        console.log('Current Feedback from task:', currentFeedback);
  
        if (data.CustomerFeedBack === 'followUp') {
          // Handling follow-up feedback
          delete existingTask.DynamicData.OtherDetail;
          delete existingTask.DynamicData.onGoing;
  
          const existingOther = await otherRepository.findOne({ where: { leadId } });
          if (existingOther) {
            await otherRepository.delete({ leadId });
          }
  
          existingTask.DynamicData.FollowUpDetail = data.FollowUpDetail;
          const updatedFollowUpData = { ...data };
  
          // Save or update in followUpRepository
          await followUpRepository.save({
            leadId,
            dynamicLead: updatedFollowUpData,
            userId: user.id,
          });
  
        } else if (data.CustomerFeedBack === 'other') {
          // Handling 'other' feedback
          existingTask.DynamicData.OtherDetail = data.OtherDetail;
  
          const existingFollowUp = await followUpRepository.findOne({ where: { leadId } });
          if (existingFollowUp) {
            await followUpRepository.delete({ leadId });
          }
  
          const existingOther = await otherRepository.findOne({ where: { leadId } });
          const updatedOtherData = existingOther
            ? { ...existingOther.dynamicLead, ...data }
            : { ...data };
  
          if (existingOther) {
            await otherRepository.update({ leadId }, { dynamicLead: updatedOtherData });
          } else {
            await otherRepository.save({
              leadId,
              dynamicLead: existingTask.DynamicData,
              userId: user.id,
            });
          }
  
        } else if (data.CustomerFeedBack === 'onGoing') {
          // Handling 'onGoing' feedback: Delete both followUp and other data for the leadId
  
          // Check for and delete from FollowUp repository
          const existingFollowUp = await followUpRepository.findOne({ where: { leadId } });
          if (existingFollowUp) {
            console.log(`Deleting FollowUp for leadId: ${leadId}`);
            await followUpRepository.delete({ leadId });
          }
  
          // Check for and delete from Other repository
          const existingOther = await otherRepository.findOne({ where: { leadId } });
          if (existingOther) {
            console.log(`Deleting Other for leadId: ${leadId}`);
            await otherRepository.delete({ leadId });
          }
  
          // Delete from Lead repository if exists
          const leadEntity = await leadRepository.findOne({ where: { leadId } });
          if (leadEntity) {
            console.log(`Deleting Lead for leadId: ${leadId}`);
            await leadRepository.delete({ leadId });
          }
        }
  
        // Update task with the merged data
        const updatedTaskData = { ...existingTask.DynamicData, ...data };
        if (['onGoing', 'hangUp', 'other'].includes(updatedTaskData.CustomerFeedBack)) {
          delete updatedTaskData.FollowUpDetail;
        }
  
        await agentTaskRepository.update(
          { leadId },
          { DynamicData: updatedTaskData, updated_at: new Date() }
        );
  
        const updatedTask = await agentTaskRepository.findOne({ where: { leadId } });
        return { message: 'Task updated successfully', updatedTask };
      }
    } catch (error) {
      console.error('Error updating follow-up or task:', error.message);
      throw new Error('Failed to update follow-up or task.');
    }
  },
  
  
  
  
  
  

  
delete: async (id, user) => {
  try {
      const followUpRepository = dataSource.getRepository(followUp);
      const leadRepository = dataSource.getRepository(Lead);

      const otherEntity = await followUpRepository.findOneBy({ leadId: id });

      if (otherEntity) {
          await followUpRepository.remove(otherEntity);

          const leadEntity = await leadRepository.findOneBy({ leadId: id });
          if (leadEntity) {
              await leadRepository.remove(leadEntity);
          } else {
              console.log(`No 'lead' entity found with leadId: ${id}`);
          }

          return true;
      } else {
          return false;
      }
  } catch (error) {
      console.error("Error during deletion:", error);
      return false;
  }
},

};

module.exports = followUpRepository;
