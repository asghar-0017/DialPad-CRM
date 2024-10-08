const dataSource = require("../infrastructure/psql");
const FollowUp = require("../entities/followUp"); // Adjust the path as needed
const Lead = require("../entities/lead");
const followUp = require("../entities/followUp");
const agentTask = require("../entities/agentTask");
const OtherDetail = require("../entities/otherDetail");
const otherDetail = require("../entities/otherDetail");

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
    const data = await dataSource
      .getRepository(FollowUp)
      .findOne({ where: { leadId } });
    return data;
  },
  getAllSpecificFollowUpDataByAgentId: async (agentId) => {
    try {
      const data = await dataSource
        .getRepository(FollowUp)
        .find({ where: { agentId } });
      return data;
    } catch (error) {
      console.error("Error in repository layer:", error);
      throw error;
    }
  },

  updateFollowUpOrTask: async (taskLeadId, data, user) => {
    try {
      if (!taskLeadId) {
        throw new Error("taskLeadId is required");
      }

      console.log("Data in Repo", data);

      const agentTaskRepository = dataSource.getRepository(agentTask);
      const followUpRepository = dataSource.getRepository(FollowUp);
      const leadRepository = dataSource.getRepository(Lead);
      const otherDetailRepository = dataSource.getRepository(otherDetail);

      const existingTask = await agentTaskRepository.findOne({
        where: { leadId: taskLeadId },
      });
      console.log("Existing Task", existingTask);
      const existingLead = await leadRepository.findOne({
        where: { leadId: taskLeadId },
      });
      console.log("Existing Lead", existingLead);
      if (existingTask) {
        existingTask.DynamicData = { ...existingTask.DynamicData, ...data };
      }

      if (data.CustomerFeedBack !== "followUp") {
        if (existingTask) {
          delete existingTask.DynamicData.FollowUpDetail;
          delete existingTask.DynamicData.Followupdetail;
        } else {
          delete existingLead.dynamicLead.FollowUpDetail;
          delete existingLead.dynamicLead.Followupdetail;
        }
      }

      if (data.CustomerFeedBack !== "other") {
        if (existingTask) {
          delete existingTask.DynamicData.OtherDetail;
        } else {
          delete existingLead.FollowUpDetail;
        }
      }

      if (!existingTask) {
        console.log(
          `Task not found for leadId: ${taskLeadId}. Checking lead...`
        );

        if (!existingLead) {
          throw new Error("Task and Lead not found");
        }

        console.log(
          `Lead found for leadId: ${taskLeadId}. Proceeding with Lead updates.`
        );

        const updatedLeadData = { ...existingLead.dynamicLead, ...data };
        console.log("UpdateLeadData", updatedLeadData);

        if (data.CustomerFeedBack === "followUp") {
          console.log(`Handling FollowUp for leadId: ${taskLeadId}`);
          console.log(`Removing OtherDetail entity for leadId: ${taskLeadId}`);
          await otherDetailRepository.delete({ leadId: taskLeadId });

          const existingFollowUp = await followUpRepository.findOne({
            where: { leadId: taskLeadId },
          });

          if (existingFollowUp) {
            console.log(
              `Existing FollowUp found for leadId: ${taskLeadId}. Updating FollowUp.`
            );
            await followUpRepository.update(
              { leadId: taskLeadId },
              {
                dynamicLead: { ...existingLead.dynamicLead, ...data },
              }
            );
            console.log("FollowUp updated successfully.");
          } else {
            console.log(
              `No FollowUp found for leadId: ${taskLeadId}. Creating new FollowUp.`
            );
            await followUpRepository.save({
              leadId: taskLeadId,
              dynamicLead: { ...existingLead.dynamicLead, ...data },
              userId: user.id,
            });
            console.log("New FollowUp saved successfully.");
          }
        } else if (data.CustomerFeedBack === "other") {
          console.log(`Handling 'Other' feedback for leadId: ${taskLeadId}`);

          const existingFollowUp = await followUpRepository.findOne({
            where: { leadId: taskLeadId },
          });
          if (existingFollowUp) {
            console.log(`Removing existing FollowUp for leadId: ${taskLeadId}`);
            await followUpRepository.delete({ leadId: taskLeadId });
          }

          if (data.OtherDetail) {
            const existingOtherDetail = await otherDetailRepository.findOne({
              where: { leadId: taskLeadId },
            });

            if (existingOtherDetail) {
              console.log(
                `Existing OtherDetail found for leadId: ${taskLeadId}. Updating OtherDetail.`
              );
              await otherDetailRepository.update(
                { leadId: taskLeadId },
                {
                  dynamicLead: { ...existingLead.dynamicLead, ...data },
                }
              );
              console.log("OtherDetail updated successfully.");
            } else {
              console.log(
                `No OtherDetail found for leadId: ${taskLeadId}. Creating new OtherDetail.`
              );
              await otherDetailRepository.save({
                leadId: taskLeadId,
                dynamicLead: { ...existingLead.dynamicLead, ...data },
              });
              console.log("New OtherDetail saved successfully.");
            }
          }
        } else if (
          data.CustomerFeedBack === "onGoing" ||
          data.CustomerFeedBack === "voiceMail" ||
          data.CustomerFeedBack === "hangUp"
        ) {
          console.log(`Handling 'onGoing' feedback for leadId: ${taskLeadId}`);
          3;
          await followUpRepository.delete({ leadId: taskLeadId });
          await otherDetailRepository.delete({ leadId: taskLeadId });

          const updatedLeadData = { ...existingLead.dynamicLead, ...data };
          await leadRepository.update(
            { leadId: taskLeadId },
            { dynamicLead: updatedLeadData, updated_at: new Date() }
          );

          console.log(
            "Lead updated successfully, and follow-up and other feedback removed as applicable."
          );
        }

        await leadRepository.update(
          { leadId: taskLeadId },
          { dynamicLead: updatedLeadData, updated_at: new Date() }
        );

        return {
          message:
            "Lead updated successfully, and follow-up or other feedback handled as applicable",
        };
      }

      console.log("Task found for taskLeadId:", taskLeadId);

      if (data.CustomerFeedBack === "followUp") {
        console.log(`Handling FollowUp for taskLeadId: ${taskLeadId}`);
        console.log("Existing Task in FollowUp", existingTask);
        console.log("Existing Task in FollowUp", {
          ...existingTask.DynamicData.CustomerFeedBack,
        });
        if (existingTask.DynamicData.OtherDetail) {
          console.log(`Removing OtherDetail from taskLeadId: ${taskLeadId}`);
          delete existingTask.DynamicData.OtherDetail;

          console.log(`Removing Other entity for leadId: ${taskLeadId}`);
          await otherDetailRepository.delete({ leadId: taskLeadId });
        }

        const existingFollowUp = await followUpRepository.findOne({
          where: { leadId: taskLeadId },
        });

        if (existingFollowUp) {
          console.log(
            `Existing FollowUp found for taskLeadId: ${taskLeadId}. Updating FollowUp.`
          );
          await followUpRepository.update(
            { leadId: taskLeadId },
            {
              dynamicLead: { ...existingTask.DynamicData, ...data },
            }
          );
          console.log("FollowUp updated successfully.");
        } else {
          console.log(
            `No FollowUp found for taskLeadId: ${taskLeadId}. Creating new FollowUp.`
          );
          await followUpRepository.save({
            leadId: taskLeadId,
            dynamicLead: { ...existingTask.DynamicData, ...data },
            userId: user.id,
          });
          console.log("New FollowUp saved successfully.");
        }

        await agentTaskRepository.update(
          { leadId: taskLeadId },
          {
            DynamicData: { ...existingTask.DynamicData, ...data },
            updated_at: new Date(),
          }
        );

        console.log("Task updated successfully");
        return {
          message:
            "Task updated successfully and follow-up handled as applicable",
        };
      } else if (
        data.CustomerFeedBack === "onGoing" ||
        data.CustomerFeedBack === "voiceMail" ||
        data.CustomerFeedBack === "hangUp"
      ) {
        console.log(
          `Handling 'onGoing' feedback for taskLeadId: ${taskLeadId}`
        );

        await followUpRepository.delete({ leadId: taskLeadId });
        await otherDetailRepository.delete({ leadId: taskLeadId });

        const updatedTaskData = { ...existingTask.DynamicData, ...data };

        await agentTaskRepository.update(
          { leadId: taskLeadId },
          { DynamicData: updatedTaskData, updated_at: new Date() }
        );

        console.log("Task updated successfully");
        return {
          message:
            "Task updated successfully and follow-up and other feedback removed as applicable",
        };
      } else if (data.CustomerFeedBack === "other") {
        console.log(`Handling 'Other' feedback for taskLeadId: ${taskLeadId}`);

        const existingFollowUp = await followUpRepository.findOne({
          where: { leadId: taskLeadId },
        });
        if (existingFollowUp) {
          console.log(
            `Removing existing FollowUp for taskLeadId: ${taskLeadId}`
          );
          await followUpRepository.delete({ leadId: taskLeadId });
        }

        if (data.OtherDetail) {
          const existingOtherDetail = await otherDetailRepository.findOne({
            where: { leadId: taskLeadId },
          });

          if (existingOtherDetail) {
            console.log(
              `Existing OtherDetail found for taskLeadId: ${taskLeadId}. Updating OtherDetail.`
            );
            await otherDetailRepository.update(
              { leadId: taskLeadId },
              {
                dynamicLead: { ...existingTask.DynamicData, ...data },
                updated_at: new Date(),
              }
            );
            console.log("OtherDetail updated successfully.");
          } else {
            console.log(
              `No OtherDetail found for taskLeadId: ${taskLeadId}. Creating new OtherDetail.`
            );
            await otherDetailRepository.save({
              leadId: taskLeadId,
              dynamicLead: { ...existingTask.DynamicData, ...data },
            });
            console.log("New OtherDetail saved successfully.");
          }
        }

        await agentTaskRepository.update(
          { leadId: taskLeadId },
          {
            DynamicData: { ...existingTask.DynamicData, ...data },
            updated_at: new Date(),
          }
        );

        console.log("Task updated successfully");
        return {
          message:
            "Task updated successfully and other feedback handled as applicable",
        };
      }
      if (existingLead) {
        console.log("Updating existing lead", existingLead.dynamicLead);

        let updatedLeadData = { ...existingLead.dynamicLead, ...data };

        // Remove FollowUpDetail or OtherDetail based on CustomerFeedBack
        if (data.CustomerFeedBack !== "followUp") {
          delete updatedLeadData.FollowUpDetail;
        }
        if (data.CustomerFeedBack !== "other") {
          delete updatedLeadData.OtherDetail;
        }

        // Update the lead in the repository
        await leadRepository.update(
          { leadId: taskLeadId },
          { dynamicLead: updatedLeadData, updated_at: new Date() }
        );

        console.log("Lead updated successfully", updatedLeadData);
      }
    } catch (error) {
      console.error("Error updating FollowUp or Task:", error);
      throw new Error("Error updating FollowUp or Task");
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
