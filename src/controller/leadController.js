const leadService = require('../service/leadService');


const leadController = {
    createLead:async(req,res)=>{
        try {
            const data = req.body;
            const agent = req.user;
            const lead = await leadService.leadCreateService({ data, agent });
            res.status(201).json({ message: 'Lead created successfully', lead });
          } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
          }
    },
};
  



module.exports = {leadController} 
