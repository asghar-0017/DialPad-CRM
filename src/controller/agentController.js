const agentService = require('../service/agentService');
const agentRepository=require('../repository/agentRepository')
const agentId=require('../utils/token')





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
          data.agentId=agentId()
          
    
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
       
    const data = result.map(agent => {
        const { id,agentId, firstName, lastName, email, phone, role } = agent;
        return {id, agentId, firstName, lastName, email, phone, role };
      });
        res.status(201).json({ message: 'success', data:data });
      }
     catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
    },

    getAgentById:async(req,res)=>{
      try{
        const agentId=req.params.agentId
        const result=await agentService.agentGetByIdInService(agentId); 
       
    const data = {
         id:result.id,agentId:result.agentId, firstName:result.firstName, lastName:result.lastName, email:result.email, phone:result.phone, role : result.role
    };
        res.status(201).json({ message: 'success', data:data });
      }
     catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
    },

    updateAgent:async(req,res)=>{
      try{
        const agentId=req.params.agentId
        const {firstName,lastName,email,phone}=req.body
        const user = req.user;
        const result=await agentService.agentUpdateByIdInService(agentId,{firstName,lastName,email,phone},user); 
        res.status(201).json({ message: 'success', data:result });
      }
     catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
    },
    deleteAgent:async(req,res)=>{
      try{
        const agentId=req.params.agentId
        const user = req.user;
        const result=await agentService.agentDeleteByIdInService(agentId,user); 
        res.status(201).json({ message: 'success', data:result });
      }
     catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
        throw error
      }
    }

};
  

module.exports = {agentController} 
