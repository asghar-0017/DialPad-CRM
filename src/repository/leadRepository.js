const dataSource = require("../infrastructure/psql");
const Lead = require("../entities/lead");
const FollowUp = require("../entities/followUp");
const other = require("../entities/otherDetail");
const leadsTrash = require("../entities/leadTrash");
const otherTrash = require("../entities/otherTrash");
const followUpTrash = require("../entities/followUpTrash");

const leadRepository = {
  saveLead: async (role, leadId, lead) => {
    try {
      let leadEntity = {
        agentId: lead.agentId,
        role,
        leadId,

        dynamicLead: lead.dynamicLead,
      };

      return await dataSource.getRepository(Lead).save(leadEntity);
    } catch (error) {
      console.error("Error saving lead:", error.message);
      throw error;
    }
  },

  getLeadData: async () => {
    try {
      const data = await dataSource.getRepository(Lead).find();
      return data;
    } catch (error) {
      throw error;
    }
  },
  updateLeadData: async ({ data, leadId, user }) => {
    try {
      if (!leadId) {
        throw new Error("leadId is required");
      }
      console.log("Data in Repo", data);

      const leadRepository = dataSource.getRepository(Lead);
      const followUpRepository = dataSource.getRepository(FollowUp);
      const otherRepository = dataSource.getRepository(other);

      let lead;
      if (user.role === "agent") {
        lead = await leadRepository.findOne({
          where: { leadId, agentId: user.agentId },
        });
      } else if (user.role === "admin") {
        lead = await leadRepository.findOne({ where: { leadId } });
      }

      if (!lead) {
        throw new Error("Lead not found or does not belong to the agent");
      }
      const customerFeedBack = lead.dynamicLead?.CustomerFeedBack;
      if (customerFeedBack === "followUp") {
        const existingOther = await otherRepository.findOne({
          where: { leadId },
        });
        if (existingOther) {
          await otherRepository.delete({ leadId });
        }
        const existingFollowUp = await followUpRepository.findOne({
          where: { leadId },
        });
        const updatedFollowUpData = existingFollowUp
          ? { ...existingFollowUp.dynamicLead, ...data }
          : { ...data };

        if (existingFollowUp) {
          await followUpRepository.update(
            { leadId },
            { dynamicLead: updatedFollowUpData }
          );
        } else {
          await followUpRepository.save({
            leadId: lead.leadId,
            dynamicLead: data,
            agentId: user.agentId,
          });
        }
      } else if (customerFeedBack === "other") {
        const existingfollowUP = await followUpRepository.findOne({
          where: { leadId },
        });
        if (existingfollowUP) {
          await followUpRepository.delete({ leadId });
        }
        const existingOther = await otherRepository.findOne({
          where: { leadId },
        });
        const updatedOtherData = existingOther
          ? { ...existingOther.dynamicLead, ...data }
          : { ...data };

        if (existingOther) {
          await otherRepository.update(
            { leadId },
            { dynamicLead: updatedOtherData }
          );
        } else {
          await otherRepository.save({
            leadId: lead.leadId,
            dynamicLead: data,
            agentId: user.agentId,
          });
        }
      }

      if (
        ["onGoing", "voiceMail", "hangUp", "other"].includes(
          data.CustomerFeedBack
        )
      ) {
        const existingFollowUp = await followUpRepository.findOne({
          where: { leadId },
        });
        if (existingFollowUp) {
          await followUpRepository.delete({ leadId });
        }

        const existingOther = await otherRepository.findOne({
          where: { leadId },
        });
        if (existingOther) {
          await otherRepository.delete({ leadId });
        }
      }

      const updatedLeadData = { ...lead.dynamicLead, ...data };
      console.log("Updated Lead Data", updatedLeadData);

      if (
        ["onGoing", "hangUp", "voiceMail"].includes(
          updatedLeadData.CustomerFeedBack
        )
      ) {
        delete updatedLeadData.FollowUpDetail;
        delete updatedLeadData.OtherDetail;
      }
      if (updatedLeadData.CustomerFeedBack !== "followUp") {
        delete updatedLeadData.FollowUpDetail;
      }
      if (updatedLeadData.CustomerFeedBack !== "other") {
        delete updatedLeadData.OtherDetail;
      }

      await leadRepository.update({ leadId }, { dynamicLead: updatedLeadData });

      const updatedLead = await leadRepository.findOne({ where: { leadId } });
      const updateFeedBack = updatedLead.dynamicLead.CustomerFeedBack;

      if (updateFeedBack === "followUp") {
        await followUpRepository.save({
          leadId: updatedLead.leadId,
          dynamicLead: updatedLeadData,
          agentId: user.agentId,
        });
      } else if (updateFeedBack === "other") {
        await otherRepository.save({
          leadId: updatedLead.leadId,
          dynamicLead: updatedLeadData,
          agentId: user.agentId,
        });
      }

      return updatedLead;
    } catch (error) {
      console.error("Error updating lead data:", error.message);
      throw new Error("Failed to update lead data.");
    }
  },

  updateAssignTaskToAgentById: async ({ data, taskId, user }) => {
    try {
      if (!taskId) {
        throw new Error("taskId is required");
      }
      console.log("Data in Repo", data);

      const agentTaskRepository = dataSource.getRepository(agentTask);
      const followUpRepository = dataSource.getRepository(FollowUp);
      const otherRepository = dataSource.getRepository(Other);

      const existingTask = await agentTaskRepository.findOne({
        where: { taskId },
      });

      if (!existingTask) {
        throw new Error("Task not found");
      }
      existingTask.DynamicData = { ...existingTask.DynamicData, ...data };

      const taskFeedback = existingTask.DynamicData?.FeedbackType;

      if (taskFeedback !== "followUp") {
        delete existingTask.DynamicData.FollowUpDetail;
      }

      if (taskFeedback !== "other") {
        delete existingTask.DynamicData.OtherDetail;
      }

      if (taskFeedback === "followUp") {
        const existingFollowUp = await followUpRepository.findOne({
          where: { taskId },
        });
        const updatedFollowUpData = existingFollowUp
          ? { ...existingFollowUp.DynamicData, ...data }
          : { ...data };

        if (existingFollowUp) {
          await followUpRepository.update(
            { taskId },
            { DynamicData: updatedFollowUpData }
          );
        } else {
          await followUpRepository.save({
            taskId,
            DynamicData: data,
            userId: user.id,
          });
        }
      } else if (taskFeedback === "other") {
        const existingOther = await otherRepository.findOne({
          where: { taskId },
        });
        const updatedOtherData = existingOther
          ? { ...existingOther.DynamicData, ...data }
          : { ...data };

        if (existingOther) {
          await otherRepository.update(
            { taskId },
            { DynamicData: updatedOtherData }
          );
        } else {
          await otherRepository.save({
            taskId,
            DynamicData: data,
            userId: user.id,
          });
        }
      }

      if (["onGoing", "hangUp", "other"].includes(data.FeedbackType)) {
        const existingFollowUp = await followUpRepository.findOne({
          where: { taskId },
        });
        if (existingFollowUp) {
          await followUpRepository.delete({ taskId });
        }

        const existingOther = await otherRepository.findOne({
          where: { taskId },
        });
        if (existingOther) {
          await otherRepository.delete({ taskId });
        }
      }
      const updatedTaskData = { ...existingTask.DynamicData, ...data };
      if (
        ["onGoing", "hangUp", "other"].includes(updatedTaskData.FeedbackType)
      ) {
        delete updatedTaskData.FollowUpDetail;
        delete updatedTaskData.OtherDetail;
      }
      await agentTaskRepository.update(
        { taskId },
        { DynamicData: updatedTaskData, updated_at: new Date() }
      );
      console.log("Updated Task:", updatedTaskData);

      const updatedTask = await agentTaskRepository.findOne({
        where: { taskId },
      });

      return updatedTask;
    } catch (error) {
      console.error("Error updating task for agent:", error.message);
      throw new Error("Failed to update task for agent.");
    }
  },

  getLeadDataById: async (leadId) => {
    try {
      const data = await dataSource
        .getRepository(Lead)
        .findOne({ where: { leadId } });
      return data;
    } catch (error) {
      throw error;
    }
  },
  getAllSpecificLeadDataByAgentId: async (agentId) => {
    try {
      const data = await dataSource
        .getRepository(Lead)
        .find({ where: { agentId } });
      console.log("Retrieved leads:", data);
      return data;
    } catch (error) {
      console.error("Error in repository layer:", error);
      throw error;
    }
  },

  delete: async (leadId, user) => {
    try {
      console.log("API Hit Delete");

      const leadRepository = dataSource.getRepository(Lead);
      const followUpRepository = dataSource.getRepository(FollowUp);
      const otherRepository = dataSource.getRepository(other);
      const otherTrashRepository = dataSource.getRepository(otherTrash);
      const leadTrashRepository = dataSource.getRepository(leadsTrash);
      const followUpTrashRepository = dataSource.getRepository(followUpTrash);

      const leadData = await leadRepository.findOne({ where: { leadId } });
      console.log("Lead Data:", leadData);

      if (!leadData) {
        console.log("No lead data found for the given leadId");
        return { success: false, message: "No lead data found" };
      }

      const leadEntity = {
        agentId: leadData.agentId,
        role: user.role,
        leadId: leadData.leadId,
        dynamicLead: leadData.dynamicLead,
      };
      const leadDataDynamic = { ...leadEntity.dynamicLead };
      console.log("Lead Dynamic Data", leadDataDynamic);

      const createLeadInTrash = await leadTrashRepository.save(
        leadTrashRepository.create(leadEntity)
      );
      console.log("Created Lead In Trash:", createLeadInTrash);

      let createdOtherTrash = null;
      let createdFollowUpInTrash = null;

      if (leadDataDynamic.CustomerFeedBack === "other") {
        const otherEntity = {
          agentId: leadData.agentId,
          role: user.role,
          leadId: leadData.leadId,
          dynamicLead: leadDataDynamic,
        };
        console.log("OtherEntity", otherEntity);
        createdOtherTrash = await otherTrashRepository.save(
          otherTrashRepository.create(otherEntity)
        );
        console.log("Created Other In Trash:", createdOtherTrash);
      }

      if (leadDataDynamic.CustomerFeedBack === "followUp") {
        const followUpEntiry = {
          agentId: leadData.agentId,
          role: user.role,
          leadId: leadData.leadId,
          dynamicLead: leadDataDynamic,
        };
        console.log("FollowUp Entity", followUpEntiry);
        createdFollowUpInTrash = await followUpTrashRepository.save(
          followUpTrashRepository.create(followUpEntiry)
        );
        console.log("Created FollowUp In Trash:", createdFollowUpInTrash);
      }

      await followUpRepository.delete({ leadId });
      await otherRepository.delete({ leadId });
      await leadRepository.remove(leadData);

      const TrashData = {
        createdOtherTrash,
        createdFollowUpInTrash,
        createLeadInTrash,
      };
      return {
        success: true,
        TrashData,
      };
    } catch (error) {
      console.error("Error deleting lead:", error);
      return {
        success: false,
        message: "An error occurred while deleting the lead",
        error,
      };
    }
  },
};

module.exports = leadRepository;
