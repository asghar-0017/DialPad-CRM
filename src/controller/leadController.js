const leadService = require('../service/leadService');
const leadId=require('../utils/token')


const leadController = {
    createLead: async (req, res) => {
        try {
          const data = req.body;
          data.leadId = leadId(); 
          const lead = await leadService.leadCreateService(data);
          res.status(201).json({ message: 'Lead created successfully', lead });
        } catch (error) {
          res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
      },
    
      readLead:async(req,res)=>{
        try{
            const data = await leadService.leadReadService();
            if(data){
             res.status(201).json({ message: 'Success', data:data });
            }
        }catch(error){
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
      }
};
  



module.exports = {leadController} 
