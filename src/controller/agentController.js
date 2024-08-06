const agentService = require('../service/agentService');
const agentRepository=require('../repository/agentRepository')




const agentController = {
//   login: async (request, response) => {
//     try {
//       const adminData = request.body;
//       const data = await adminService.login(adminData);
//       if (data) {
//         await adminService.storeAdminToken(data.token);
//         response.status(200).send({ message: 'Login Success', data });
//       }else{
//         response.status(404).send({message:"admin not Found"})
//       }
//     } catch (error) {
//       throw error
//     }
//   },
    createAgent: async (req, res) => {
        try {
          const data = req.body;
          const email = req.body.email;
    
          const existingAgent = await agentRepository.findByEmail(email);
          if (existingAgent) {
            return res.status(400).json({ message: 'User already registered' });
          }
    
          const agent = await agentService.agentCreateService(data);
          res.status(201).json({ message: 'Agent registered successfully', agent });
        } catch (error) {
          res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },

    getAgent:async(req,res)=>{
    try{
        const result=await agentService.agentGetInService();
        res.status(201).json({ message: 'success', data:result });
      }
     catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
    }
};
  



module.exports = {agentController} 
