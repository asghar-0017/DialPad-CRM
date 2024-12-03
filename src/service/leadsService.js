const leadRepository = require("../repository/leadsRepository");

const leadService = {
    leadCreateService: async (data, user, sheetId) => {
        try {
      if (user.role === "agent") {
        data.agentId = user.agentId;
      }
      if (sheetId) {
        data.sheetId = sheetId;
      }


      const lead = await leadRepository.saveLead(user.role, data.leadId, {
        dynamicLead: data,
        agentId: data.agentId || null,
        sheetId: data.sheetId || null,
      });

      if (!lead || !lead.leadId) {
        throw new Error("Failed to create lead");
      }
      return lead;
    } catch (error) {
      console.error("Error creating lead:", error.message);
      throw error;
    }
  },

  updateLeadDynamicFields: async (leadId, updates, user) => {
    try {
      const lead = await leadRepository.getLeadById(leadId);
      if (!lead) {
        throw new Error("Lead not found");
      }
      const updatedDynamicLead = {
        ...lead.dynamicLead,
        ...updates,
      };

      return await leadRepository.updateLead(leadId, {
        dynamicLead: updatedDynamicLead,
      });
    } catch (error) {
      console.error("Error updating lead:", error.message);
      throw error;
    }
  },
  getAllLabels: async () => {
    try {
      return await leadRepository.getAllUniqueLabels();
    } catch (error) {
      console.error("Error in service while fetching labels:", error.message);
      throw error;
    }
  },

  leadReadService: async () => {
    try {
      const result = await leadRepository.getLeadData();
      return result;
    } catch (error) {
      throw error;
    }
  },

  deleteLeadById: async (leadId, user) => {
    return await leadRepository.delete(leadId, user);
  },

  getLeadsGroupedByLabels: async () => {
    try {
      return await leadRepository.getAllLeadsGroupedByLabels();
    } catch (error) {
      console.error("Error in service while fetching grouped leads:", error.message);
      throw error;
    }
  },
  getLeadsBySheetId: async (sheetId) => {
    try {
      return await leadRepository.getLeadsBySheetId(sheetId);
    } catch (error) {
      console.error("Error fetching leads for sheet:", error.message);
      throw error;
    }
  },
};

module.exports = leadService;
