// controllers/followUpController.js
const otherService = require('../service/otherService');

const otherController = {

  getAllOthers: async (req, res) => {
    try {
      const { role } = req.user;
      const others = await otherService.getAllOthers();
  
      if (role === 'admin') {
        const data = others.map(other => {
          const { id, leadId, leadName, phone, email, role, otherDetail } = other;
          return { id, leadId, leadName, phone, email, role, otherDetail };
        });
        return res.status(200).json({ message: 'success', data });
      } 
        return res.status(200).json({ message: 'success', data: others });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },
  
  getOtherUpById: async (req, res) => {
    try {
        const { leadId } = req.params;
        const other = await otherService.getOthersUpById(leadId);

        if (other) {
            if (other.role === 'admin') {
                const { id, leadId, leadName, phone, email, role, otherDetail } = other;
                const data = { id, leadId, leadName, phone, email, role, otherDetail };
                return res.status(200).json({ message: 'success', data });
            } else {
                return res.status(200).json({ message: 'success', data: other });
            }
        } else {
            return res.status(404).json({ message: 'Data Not Found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
},
  getallSpecificOtherByAgentId:async(req,res)=>{
    try {
      const agentId = req.params.agentId;
      const data = await otherService.otherAllGetServiceByAgentId(agentId);   
      if (data && data.length > 0) {
          res.status(200).send({ message: "success", data: data });
      } else {
          res.status(404).send({ message: `No leads found for agentId ${agentId}` });
      }
  } catch (error) {
      console.error('Error fetching leads:', error);
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
