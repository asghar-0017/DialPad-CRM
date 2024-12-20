const followUpRepository = require("../repository/followUpRepository");
const followUpService = {
  getAllFollowUps: async () => {
    return await followUpRepository.findAll();
  },

  getFollowUpById: async (leadId) => {
    return await followUpRepository.findById(leadId);
  },
  followUpAllGetServiceByAgentId: async (agentId) => {
    try {
      const result =
        await followUpRepository.getAllSpecificFollowUpDataByAgentId(agentId);
      return result;
    } catch (error) {
      throw error;
    }
  },

  updateFollowUp: async (leadId, data, user) => {
    return await followUpRepository.updateFollowUpOrTask(leadId, data, user);
  },

  deleteFollowUp: async (id, user) => {
    return await followUpRepository.delete(id, user);
  },
};

module.exports = followUpService;
