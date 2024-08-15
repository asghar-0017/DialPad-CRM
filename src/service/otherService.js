// services/followUpService.js
const otherRepository = require('../repository/otherRepository');

const OtherService = {

  getAllOthers: async () => {
    return await otherRepository.findAll();
  },

  getOthersUpById: async (leadId) => {
    return await otherRepository.findById(leadId);
  },
  otherAllGetServiceByAgentId:async(agentId)=>{
    try {
      const result = await otherRepository.getAllSpecificOtherDataByAgentId(agentId);
      return result;
  } catch (error) {
      throw error;
  }
  },

  updateOtherById: async (leadId, data) => {
    return await otherRepository.update(leadId, data);
  },

  deleteOthers: async (id,user) => {
    return await otherRepository.delete(id,user);
  },
};

module.exports = OtherService;
