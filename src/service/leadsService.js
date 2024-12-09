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
      // Validate leadId
      if (!leadId) {
        throw new Error("Lead ID is required");
      }
  
      // Fetch the lead from the database
      const lead = await leadRepository.getLeadById(leadId);
      if (!lead) {
        throw new Error("Lead not found");
      }
  
      console.log("Existing Lead:", lead);
  
      // Merge the existing dynamicLead with the updates
      const updatedDynamicLead = {
        ...lead.dynamicLead,
        ...updates,
      };
  
      // Save the updated lead back to the database
      const updatedLead = await leadRepository.updateLead(leadId, {
        dynamicLead: updatedDynamicLead,
      });
  
      console.log("Updated Lead:", updatedLead);
  
      return updatedLead;
    } catch (error) {
      console.error("Error updating lead:", error.message);
      throw new Error("Failed to update lead: " + error.message);
    }
  },
  

  getAllLabels: async (sheetId) => {
    try {
      return await leadRepository.getAllUniqueStatuses(sheetId);
    } catch (error) {
      console.error("Error in service while fetching labels:", error.message);
      throw error;
    }
  },

  leadReadService: async (sheetId) => {
    try {
      const result = await leadRepository.getLeadData(sheetId);
      return result;
    } catch (error) {
      throw error;
    }
  },

  deleteLeadById: async (leadId, user) => {
    return await leadRepository.delete(leadId, user);
  },

  getLeadsGroupedByLabels: async (sheetId) => {
    try {
      return await leadRepository.getAllLeadsGroupedByLabels(sheetId);
    } catch (error) {
      console.error(
        "Error in service while fetching grouped leads:",
        error.message
      );
      throw error;
    }
  },
};

module.exports = leadService;
