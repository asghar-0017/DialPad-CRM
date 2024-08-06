const leadService = require('../service/leadService');
const leadId=require('../utils/token')


const leadController = {
    createLead: async (req, res) => {
        try {
            const data = req.body;
            data.leadId = leadId(); 

            if (data.customer_feedBack === 'followUp') {
                if (!data.followUpDetail) {
                    return res.status(400).json({ message: 'followUpDetail is required when customer_feedBack is followUp' });
                } else {
                    delete data.followUpDetail;  // This will remove followUpDetail from the data object
                }
            }
            const lead = await leadService.leadCreateService(data);
            if (lead.customer_feedBack === 'followUp') {
                delete lead.followUpDetail;  // This will remove followUpDetail from the lead object
            }
            res.status(201).json({ message: 'Lead created successfully', lead });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },
    
      readLead:async(req,res)=>{
        try {
            const data = await leadService.leadReadService();
            const processedData = data.map(lead => {
                if (lead.customer_feedBack !== 'followUp') {
                    delete lead.followUpDetail;
                }
                return lead;
            });

            res.status(200).json({ message: 'Success', data: processedData });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
      },
      updateLead:async(req,res)=>{
        try {
            const data = req.body;
            const leadId=req.params.id
            console.log("Lead Id",leadId)
            const agent = req.user; 
            console.log("Agent",agent)
            const lead = await leadService.updateLeadByService({ data,leadId, agent });
            res.status(201).json({ message: 'Lead Updated successfully', lead });
          } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
          }
      }
};
  



module.exports = {leadController} 
