// controllers/followUpController.js
const followUpService = require('../service/followUpService');

const followUpController = {

  getAllFollowUps: async (req, res) => {
    try {
        const followUps = await followUpService.getAllFollowUps();
        if (!followUps || followUps.length === 0) {
            return res.status(404).json({ message: 'No follow-ups found' });
        }
        const data = followUps.map(followUp => {
            if (followUp.role === 'admin') {
                const { id, leadId, leadName, phone, email, role, followUpDetail } = followUp;
                return { id, leadId, leadName, phone, email, role, followUpDetail };
            } else {
                return followUp;
            }
        });
        res.status(200).json({ message: 'success', data });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
},

getFollowUpById: async (req, res) => {
  try {
      const { leadId } = req.params;
      const followUp = await followUpService.getFollowUpById(leadId);
      if (!followUp) {
          return res.status(404).json({ message: 'Follow-up not found' });
      }
      const data = followUp.role === 'admin'
          ? {
              id: followUp.id,
              leadId: followUp.leadId,
              leadName: followUp.leadName,
              phone: followUp.phone,
              email: followUp.email,
              role: followUp.role,
              followUpDetail: followUp.followUpDetail
            }
          : followUp;

      res.status(200).json({ message: 'Success', data });
  } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
},

  updateFollowUp: async (req, res) => {
    try {
      const { leadId } = req.params;
      const followUpData = req.body;
      const updatedFollowUp = await followUpService.updateFollowUp(leadId, followUpData);
      if (updatedFollowUp) {
        res.status(200).json({ message: 'Follow-up updated successfully', data:updatedFollowUp });
      } else {
        res.status(404).json({ message: 'Follow-up not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },

  deleteFollowUp: async (req, res) => {
    try {
        const leadId = req.params.leadId;
        console.log("LeadId:", leadId);
        const user = req.user;
        console.log("User:", user)
        const result = await followUpService.deleteFollowUp(leadId, user); 
        if (!result) {
            return res.status(404).json({ message: 'FollowUp not found' });
        }
        res.status(200).json({ message: 'FollowUp deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
},
};

module.exports = followUpController;
