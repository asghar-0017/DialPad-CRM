// controllers/followUpController.js
const followUpService = require('../service/followUpService');

const followUpController = {

  getAllFollowUps: async (req, res) => {
    try {
      const followUps = await followUpService.getAllFollowUps();
      res.status(200).json({ message: 'success', data:followUps });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },

  getFollowUpById: async (req, res) => {
    try {
      const { leadId } = req.params;
      const followUp = await followUpService.getFollowUpById(leadId);
      if (followUp) {
        res.status(200).json({ message: 'Success', data:followUp });
      } else {
        res.status(404).json({ message: 'Follow-up not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },

  updateFollowUp: async (req, res) => {
    try {
      const { id } = req.params;
      const followUpData = req.body;
      const updatedFollowUp = await followUpService.updateFollowUp(id, followUpData);
      if (updatedFollowUp) {
        res.status(200).json({ message: 'Follow-up updated successfully', updatedFollowUp });
      } else {
        res.status(404).json({ message: 'Follow-up not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },

  deleteFollowUp: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedFollowUp = await followUpService.deleteFollowUp(id);
      if (deletedFollowUp) {
        res.status(200).json({ message: 'Follow-up deleted successfully' });
      } else {
        res.status(404).json({ message: 'Follow-up not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },
};

module.exports = followUpController;
