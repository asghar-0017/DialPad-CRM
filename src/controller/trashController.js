const leadRepository = require("../repository/leadRepository");
const leadService = require("../service/leadService");
const trashService = require("../service/trashService");
const trashRepository = require("../repository/trashRepository");
const dataSource = require("../infrastructure/psql");
const trashController = {
  getLeadTrash: async (req, res) => {
    try {
      const data = await trashService.getDataFromTrash();
      if (!data || data.length === 0) {
        return res.status(404).json({ message: "Data Not Found" });
      }
      const processedData = data.map((lead) => {
        const { dynamicLead = {}, ...otherDetails } = lead;
        const mergedLead = {
          ...dynamicLead,
          ...otherDetails,
        };

        if (mergedLead.customer_feedBack !== "followUp") {
          delete mergedLead.followUpDetail;
        }
        if (mergedLead.customer_feedBack !== "other") {
          delete mergedLead.otherDetail;
        }
        if (mergedLead.role === "admin") {
          delete mergedLead.agentId;
        }

        return mergedLead;
      });
      return res.status(200).send({ message: "success", data: processedData });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },

  getLeadOtherTrash: async (req, res) => {
    try {
      const { role } = req.user;
      const others = await trashService.getAllOthersfromTrash();

      const data = others.map((other) => {
        const { dynamicLead, agentId, ...rest } = other;
        const flattenedLead = dynamicLead ? { ...dynamicLead } : {};

        if (role === "admin") {
          return {
            ...rest,
            ...flattenedLead,
          };
        } else {
          return {
            ...rest,
            agentId,
            ...flattenedLead,
          };
        }
      });

      return res.status(200).json({ message: "success", data });
    } catch (error) {
      console.error("Error fetching lead other trash:", error);
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },

  getLeadFollowUpTrash: async (req, res) => {
    try {
      const followUps = await trashService.getAllFollowUps();

      if (!followUps || followUps.length === 0) {
        return res.status(404).json({ message: "No follow-ups found" });
      }

      const data = followUps.map((followUp) => {
        const { followUpDetail, agentId, ...rest } = followUp;
        const flattenedFollowUp = followUpDetail ? { ...followUpDetail } : {};

        if (followUp.role === "admin") {
          return {
            ...rest,
            ...flattenedFollowUp,
          };
        } else {
          return {
            ...rest,
            agentId,
            ...flattenedFollowUp,
          };
        }
      });

      //   io.emit('receive_message', data);

      return res.status(200).json({ message: "success", data });
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },

  getLeadById: async (req, res) => {
    try {
      const leadId = req.params.leadId;
      const data = await trashService.leadGetServiceById(leadId);
      if (data) {
        if (data && data.customer_feedBack !== "followUp") {
          delete data.followUpDetail;
        }
        if (data && data.customer_feedBack !== "other") {
          delete data.otherDetail;
        }
        res.status(200).send({ message: "success", data: data });
      } else {
        res.status(200).send({ message: "Data Not Found" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  },
  retrieveLeadFromTrash: async (req, res) => {
    try {
      const leadId = req.params.leadId;
      const checkDataIsInLead = await trashRepository.getLeadDataById(leadId);
      const leadTrashRepository = dataSource.getRepository("leadsTrash");

      if (checkDataIsInLead) {
        const data = checkDataIsInLead;
        const user = checkDataIsInLead.role;
        const lead = await leadService.leadCreateService(data, user);
        if (lead) {
          //  io.emit('send_message', lead);
          res.status(201).json({ message: "Lead Retrieve successfully", lead });
          await leadTrashRepository.delete({ leadId });
          console.log(`Lead with ID ${leadId} removed from trash.`);
        }
      }
    } catch (error) {
      throw error;
    }
  },
};

module.exports = trashController;
