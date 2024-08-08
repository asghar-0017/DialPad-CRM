// services/followUpService.js
const otherRepository = require('../repository/otherRepository');

const OtherService = {

  getAllOthers: async () => {
    return await otherRepository.findAll();
  },

  getOthersUpById: async (leadId) => {
    return await otherRepository.findById(leadId);
  },

  updateOtherById: async (id, data) => {
    return await otherRepository.update(id, data);
  },

  deleteOthers: async (id,user) => {
    return await otherRepository.delete(id,user);
  },
};

module.exports = OtherService;
