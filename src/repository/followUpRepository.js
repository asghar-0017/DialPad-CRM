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

 
//  updateFollowUpOrTask: async (leadId, data, user) => {
//     try {
//       if (!leadId) {
//         throw new Error('leadId is required');
//       }
  
//       console.log("Data in Repo", data);
  
//       const agentTaskRepository = dataSource.getRepository(agentTask);
//       const followUpRepository = dataSource.getRepository(FollowUp);
//       const otherRepository = dataSource.getRepository(Other);
//       const leadRepository = dataSource.getRepository(Lead);
  
//       // Find existing entities
//       const existingTask = await agentTaskRepository.findOne({ where: { leadId } });
//       const existingLead = await leadRepository.findOne({ where: { leadId } });
  
//       if (!existingTask && !existingLead) {
//         throw new Error('Task and Lead not found');
//       }
  
//       console.log('Task found for leadId:', leadId);
//       console.log('Lead found for leadId:', leadId);
  
//       // Update task if it exists
//       if (existingTask) {
//         if (data.CustomerFeedBack === 'followUp') {
//           // Remove FollowUpDetail and OtherDetail from task's DynamicData if they exist
//           if (existingTask.DynamicData.Followupdetail) {
//             console.log('Removing Followupdetail for leadId:', leadId);
//             delete existingTask.DynamicData.Followupdetail;
//           }
//           delete existingTask.DynamicData.OtherDetail;
  
//           // Save or update follow-up details
//           const updatedFollowUpData = { ...data };
//           const existingFollowUp = await followUpRepository.findOne({ where: { leadId } });
  
//           if (existingFollowUp) {
//             console.log(`Updating FollowUp for leadId: ${leadId}`);
//             await followUpRepository.update(
//               { leadId },
//               { dynamicLead: updatedFollowUpData, updated_at: new Date() }
//             );
//           } else {
//             console.log(`Saving new FollowUp for leadId: ${leadId}`);
//             await followUpRepository.save({
//               leadId,
//               dynamicLead: updatedFollowUpData,
//               userId: user.id,
//             });
//           }
  
//         } else if (data.CustomerFeedBack === 'other') {
//           // Handle 'other' feedback
//           existingTask.DynamicData.OtherDetail = data.OtherDetail;
  
//           const existingFollowUp = await followUpRepository.findOne({ where: { leadId } });
//           if (existingFollowUp) {
//             console.log(`Deleting FollowUp for leadId: ${leadId}`);
//             await followUpRepository.delete({ leadId });
//           }
  
//           const existingOther = await otherRepository.findOne({ where: { leadId } });
//           const updatedOtherData = existingOther
//             ? { ...existingOther.dynamicLead, ...data }
//             : { ...data };
  
//           if (existingOther) {
//             await otherRepository.update({ leadId }, { dynamicLead: updatedOtherData });
//           } else {
//             await otherRepository.save({
//               leadId,
//               dynamicLead: existingTask.DynamicData,
//               userId: user.id,
//             });
//           }
  
//         } else if (data.CustomerFeedBack === 'onGoing') {
//           // Handle 'onGoing' feedback
//           delete existingTask.DynamicData.Followupdetail;  // Ensure Followupdetail is removed
//           delete existingTask.DynamicData.OtherDetail;    // Ensure OtherDetail is removed
  
//           // Check for and delete FollowUp and Other data for the leadId
//           const existingFollowUp = await followUpRepository.findOne({ where: { leadId } });
//           if (existingFollowUp) {
//             console.log(`Deleting FollowUp for leadId: ${leadId}`);
//             await followUpRepository.delete({ leadId });
//           }
  
//           const existingOther = await otherRepository.findOne({ where: { leadId } });
//           if (existingOther) {
//             console.log(`Deleting Other for leadId: ${leadId}`);
//             await otherRepository.delete({ leadId });
//           }
//         }
  
//         // Update task with the merged data
//         const updatedTaskData = { ...existingTask.DynamicData, ...data };
//         if (['onGoing', 'hangUp', 'other'].includes(updatedTaskData.CustomerFeedBack)) {
//           delete updatedTaskData.Followupdetail;  // Ensure Followupdetail is removed if feedback is 'onGoing'
//         }
  
//         await agentTaskRepository.update(
//           { leadId },
//           { DynamicData: updatedTaskData, updated_at: new Date() }
//         );
  
//         console.log('Task updated successfully');
//       }
  
//       // Update lead if it exists
//       if (existingLead) {
//         const updatedLeadData = { ...existingLead.dynamicLead, ...data };
//         if (data.CustomerFeedBack === 'onGoing') {
//           delete updatedLeadData.Followupdetail;  // Ensure Followupdetail is removed if feedback is 'onGoing'
//           delete updatedLeadData.OtherDetail;    // Ensure OtherDetail is removed if feedback is 'onGoing'
//         }
  
//         await leadRepository.update(
//           { leadId },
//           { dynamicLead: updatedLeadData, updated_at: new Date() }
//         );
  
//         console.log('Lead updated successfully');
//       }
  
//       return { message: 'Task and/or Lead updated successfully' };
  
//     } catch (error) {
//       console.error('Error updating follow-up or task:', error.message);
//       throw new Error('Failed to update follow-up or task.');
//     }
//   },
  
  
updateFollowUpOrTask: async (taskLeadId, data, user) => {
  try {
    if (!taskLeadId) {
      throw new Error('taskLeadId is required');
    }

    console.log("Data in Repo", data);

    const agentTaskRepository = dataSource.getRepository(agentTask);
    const followUpRepository = dataSource.getRepository(FollowUp);
    const otherRepository = dataSource.getRepository(Other);
    const leadRepository = dataSource.getRepository(Lead);

    // Fetch the existing task based on the taskLeadId
    const existingTask = await agentTaskRepository.findOne({ where: { leadId: taskLeadId } });

    if (!existingTask) {
      console.log(`Task not found for leadId: ${taskLeadId}. Checking lead...`);

      // If no task is found, check if a lead exists with the provided leadId
      const existingLead = await leadRepository.findOne({ where: { leadId: taskLeadId } });

      if (!existingLead) {
        throw new Error('Task and Lead not found');
      }

      console.log(`Lead found for leadId: ${taskLeadId}. Proceeding with Lead updates.`);

      // Proceed with updating Lead if found (similar to how task updates are handled)
      const updatedLeadData = { ...existingLead.dynamicLead, ...data };
      if (data.CustomerFeedBack === 'onGoing') {
        delete updatedLeadData.Followupdetail;  // Ensure Followupdetail is removed
        delete updatedLeadData.OtherDetail;    // Ensure OtherDetail is removed
      }

      await leadRepository.update(
        { leadId: taskLeadId },
        { dynamicLead: updatedLeadData, updated_at: new Date() }
      );

      console.log('Lead updated successfully', updatedLeadData);

      // Handle follow-up data when CustomerFeedBack is 'followUp'
      if (data.CustomerFeedBack === 'followUp') {
        const existingFollowUp = await followUpRepository.findOne({ where: { leadId: taskLeadId } });

        if (existingFollowUp) {
          console.log(`Updating FollowUp for leadId: ${taskLeadId}`);
          await followUpRepository.update(
            { leadId: taskLeadId },
            { dynamicLead: { ...existingFollowUp.dynamicLead, ...data }, updated_at: new Date() }
          );
        } else {
          console.log(`Saving new FollowUp for leadId: ${taskLeadId}`);
          await followUpRepository.save({
            leadId: taskLeadId,
            dynamicLead: { ...data }, // Save the new follow-up data
            userId: user.id,
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      }

      return { message: 'Lead updated successfully, no task found but follow-up handled' };
    }

    console.log('Task found for taskLeadId:', taskLeadId);

    // Update task-related follow-up or other data
    if (data.CustomerFeedBack === 'followUp') {
      // Handle follow-up
      const existingFollowUp = await followUpRepository.findOne({ where: { leadId: taskLeadId } });

      if (existingFollowUp) {
        console.log(`Updating FollowUp for taskLeadId: ${taskLeadId}`);
        await followUpRepository.update(
          { leadId: taskLeadId },
          { dynamicLead: { ...existingFollowUp.dynamicLead, ...data }, updated_at: new Date() }
        );
      } else {
        console.log(`Saving new FollowUp for taskLeadId: ${taskLeadId}`);
        await followUpRepository.save({
          leadId: taskLeadId,
          dynamicLead: { ...data }, // Save the new follow-up data
          userId: user.id,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    } else if (data.CustomerFeedBack === 'other') {
      // Handle 'other' feedback
      existingTask.DynamicData.OtherDetail = data.OtherDetail;

      // Delete FollowUp for 'other' feedback if exists
      const existingFollowUp = await followUpRepository.findOne({ where: { leadId: taskLeadId } });
      if (existingFollowUp) {
        console.log(`Deleting FollowUp for taskLeadId: ${taskLeadId}`);
        await followUpRepository.delete({ leadId: taskLeadId });
      }

      // Update Other repository
      const existingOther = await otherRepository.findOne({ where: { leadId: taskLeadId } });
      if (existingOther) {
        await otherRepository.update({ leadId: taskLeadId }, { dynamicLead: { ...existingOther.dynamicLead, ...data } });
      } else {
        await otherRepository.save({
          leadId: taskLeadId,
          dynamicLead: { ...existingTask.DynamicData, ...data },
          userId: user.id,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    } else if (data.CustomerFeedBack === 'onGoing') {
      // Handle 'onGoing' feedback
      delete existingTask.DynamicData.Followupdetail; // Remove Followupdetail if it exists
      delete existingTask.DynamicData.OtherDetail;    // Remove OtherDetail if it exists

      // Delete FollowUp and Other data for the taskLeadId
      const existingFollowUp = await followUpRepository.findOne({ where: { leadId: taskLeadId } });
      if (existingFollowUp) {
        console.log(`Deleting FollowUp for taskLeadId: ${taskLeadId}`);
        await followUpRepository.delete({ leadId: taskLeadId });
      }

      const existingOther = await otherRepository.findOne({ where: { leadId: taskLeadId } });
      if (existingOther) {
        console.log(`Deleting Other for taskLeadId: ${taskLeadId}`);
        await otherRepository.delete({ leadId: taskLeadId });
      }
    }

    // Update task with the merged data
    const updatedTaskData = { ...existingTask.DynamicData, ...data };
    if (['onGoing', 'hangUp', 'other'].includes(updatedTaskData.CustomerFeedBack)) {
      delete updatedTaskData.Followupdetail;  // Clean up unnecessary fields
    }

    await agentTaskRepository.update(
      { leadId: taskLeadId },
      { DynamicData: updatedTaskData, updated_at: new Date() }
    );

    console.log('Task updated successfully');
    return { message: 'Task updated successfully' };

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
