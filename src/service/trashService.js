const trashRepository = require("../repository/trashRepository");

const trashService = {
  getDataFromTrash: async () => {
    try {
      const data = await trashRepository.getLeadTrashDataFromRepo();
      return data;
    } catch (error) { 
      throw error;
    }
  },
  getAllOthersfromTrash: async () => {
    try {
      const data = await trashRepository.findAllOthers();
      return data;
    } catch (error) {
      throw error;
    }
  },
  getAllFollowUps: async () => {
    try {
      const data = await trashRepository.findAllFollowUps();
      return data;
    } catch (error) {
      throw error;
    }
  },
  leadGetServiceById: async (leadId) => {
    try {
      const result = await trashRepository.getLeadDataById(leadId);
      return result;
    } catch (error) {
      throw error;
    }
  },
};
module.exports = trashService;
