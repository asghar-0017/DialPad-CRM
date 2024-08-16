const trashService=require('../service/trashService')
const trashController = {
    getLeadTrash: async (req, res) => {
        try {
            const data = await trashService.getDataFromTrash();
            if (!data || data.length === 0) {
                return res.status(404).json({ message: 'Data Not Found' });
            }
            const processedData = data.map(lead => {
                if (lead.customer_feedBack !== 'followUp') {
                    delete lead.followUpDetail;
                }
                if (lead.customer_feedBack !== 'other') {
                    delete lead.otherDetail;
                }
                if (lead.role === 'admin') {
                    delete lead.agentId;
                }
                return lead;
            });
            return res.status(200).send({ message: "success", data: processedData });

        } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },
    getLeadOtherTrash:async(req,res)=>{
        try {
            const { role } = req.user;
            const others = await trashService.getAllOthersfromTrash();
        
            if (role === 'admin') {
              const data = others.map(other => {
                const { id, leadId, leadName, phone, email, role, otherDetail } = other;
                return { id, leadId, leadName, phone, email, role, otherDetail };
              });
              return res.status(200).json({ message: 'success', data });
            } 
            // io.emit('receive_message', others);
      
              return res.status(200).json({ message: 'success', data: others });
          } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error', error: error.message });
          }
    },
    getLeadFollowUpTrash:async(req,res)=>{
        try {
            const followUps = await trashService.getAllFollowUps();
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
            // io.emit('receive_message', data);
            res.status(200).json({ message: 'success', data });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    }
};

module.exports = trashController;
