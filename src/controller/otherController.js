// controllers/followUpController.js
const otherService = require('../service/otherService');

const otherController = {

  getAllOthers: async (io, req, res) => {
    try {
      const { role } = req.user;
      const others = await otherService.getAllOthers();
  
      if (others && others.length > 0) {
        const processedData = others.map(other => {
          const { dynamicLead = {}, ...otherDetails } = other;
  
          const mergedOther = {
            ...dynamicLead,
            ...otherDetails,
          };
  
          if (role === 'admin') {
            delete mergedOther.agentId;
          }
            delete mergedOther.customerFeedBack;
            return mergedOther;
        });
          io.emit('receive_message', processedData);
          res.status(200).json({ message: 'success', data: processedData });
      } else {
        res.status(404).json({ message: 'No others found' });
      }
    } catch (error) {
      console.error('Error fetching others:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
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
getallSpecificOtherByAgentId: async (req, res) => {
  try {
    const agentId = req.params.agentId;
    const { role } = req.user; 
    const data = await otherService.otherAllGetServiceByAgentId(agentId);

    if (data && data.length > 0) {
      const processedData = data.map(other => {
        const { dynamicLead = {}, ...otherDetails } = other;
        const mergedOther = {
          ...dynamicLead,
          ...otherDetails,
        };
        if (role === 'admin') {
          delete mergedOther.agentId;
        }
        delete mergedOther.customerFeedBack;

        return mergedOther;
      });

      res.status(200).json({ message: "success", data: processedData });
    } else {
      res.status(404).json({ message: `No others found for agentId ${agentId}` });
    }
  } catch (error) {
    console.error('Error fetching others:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
},


  updateOther: async (io,req, res) => {
    try {
      const { leadId } = req.params;
      const otherData = req.body;
      const updatedOther = await otherService.updateOtherById(leadId, otherData);
      if (updatedOther) {
        io.emit('receive_message', updatedOther);
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
