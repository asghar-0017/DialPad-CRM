// services/followUpService.js
const followUpRepository = require('../repository/followUpRepository');

const followUpService = {

  getAllFollowUps: async () => {
    return await followUpRepository.findAll();
  },

  getFollowUpById: async (leadId) => {
    return await followUpRepository.findById(leadId);
  },

  updateFollowUp: async (id, data) => {
    return await followUpRepository.update(id, data);
  },

  deleteFollowUp: async (id,user) => {
    return await followUpRepository.delete(id,user);
  },
};

module.exports = followUpService;
