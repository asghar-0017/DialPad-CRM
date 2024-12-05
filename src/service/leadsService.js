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
      console.log("Existing Lead:", lead);
  
      if (!lead) {
        throw new Error("Lead not found");
      }
  
      const originalLabel = lead.dynamicLead.label;
  
      const updatedDynamicLead = {
        ...lead.dynamicLead,
        ...updates,
        label: originalLabel, 
      };
  
      if (updates.label) {
        updatedDynamicLead.Status = updates.label;
      }
        const updatedLead = await leadRepository.updateLead(leadId, {
        dynamicLead: updatedDynamicLead,
      });
  
      console.log("Updated Lead:", updatedLead);
      return updatedLead;
    } catch (error) {
      console.error("Error updating lead:", error.message);
      throw error;
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
      console.error("Error in service while fetching grouped leads:", error.message);
      throw error;
    }
  },

};

module.exports = leadService;
