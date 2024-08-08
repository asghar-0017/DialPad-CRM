// controllers/followUpController.js
const otherService = require('../service/otherService');

const otherController = {

  getAllOthers: async (req, res) => {
    try {
      const other = await otherService.getAllOthers();
      res.status(200).json({ message: 'success', data:other });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },

  getOtherUpById: async (req, res) => {
    try {
      const { leadId } = req.params;
      const other = await otherService.getOthersUpById(leadId);
      if (other) {
        res.status(200).json({ message: 'Success', data:other });
      } else {
        res.status(404).json({ message: 'other not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },

  updateOther: async (req, res) => {
    try {
      const { leadId } = req.params;
      const otherData = req.body;
      const updatedOther = await otherService.updateOtherById(leadId, otherData);
      if (updatedOther) {
        res.status(200).json({ message: 'Other updated successfully', updatedOther });
      } else {
        res.status(404).json({ message: 'Other not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },

  deleteOther: async (req, res) => {
    try {
        const leadId = req.params.leadId;
        console.log("LeadId:", leadId);
        const user = req.user;
        console.log("User:", user);

        const result = await otherService.deleteOthers(leadId, user);
        
        if (!result) {
            return res.status(404).json({ message: 'Other not found' });
        }

        res.status(200).json({ message: 'Other deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
},
};

module.exports = otherController;
