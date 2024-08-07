// services/followUpService.js
const followUpRepository = require('../repository/followUpRepository');

const followUpService = {
    createFollowUp: async (data) => {
        console.log("data", data);
        return await followUpRepository.createFollowUp(data);
      },

  getAllFollowUps: async () => {
    return await followUpRepository.findAll();
  },

  getFollowUpById: async (leadId) => {
    return await followUpRepository.findById(leadId);
  },

  updateFollowUp: async (id, data) => {
    return await followUpRepository.update(id, data);
  },

  deleteFollowUp: async (id) => {
    return await followUpRepository.delete(id);
  },
};

module.exports = followUpService;
