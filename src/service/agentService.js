const bcrypt = require('bcryptjs');
const redis = require('../infrastructure/redis');
const agentRepository = require('../repository/agentRepository');
const { logger } = require('../../logger');
const jwt = require('jsonwebtoken');

const secretKey = process.env.SCERET_KEY;


const agentService = {
//   login: async (adminData) => {
//     try {
//       const { userName, password } = adminData;
//       const admin = await authRepository.findByUserName(userName);

//       if (admin) {
//         const match = await bcrypt.compare(password, admin.password);
//         if (match) {
//           const token = jwt.sign({ userName: admin.userName }, secretKey, { expiresIn: '1h' });
//           logger.info('Admin Login Success');
//           return { token };
//         }else{
//           return "incorrect userName And password"
//         }
//       }

//       logger.warn('Admin Login Failed');
//       return null;
//     } catch (error) {
//       logger.error('Error during admin login', error);
//       throw error;
//     }
//   },
  agentCreateService: async (data) => {
    const password=data.password
    const hashedPassword = await bcrypt.hash(password, 10);
    data.password=hashedPassword
    const agent =data;
    return await agentRepository.saveAgent(agent);
  },

  agentGetInService:async()=>{
    try{
        const data=await agentRepository.getAgentData()
        return data
    }catch(error){
        throw error
    }
  },
  agentGetByIdInService:async(agentId)=>{
    try{
      const data=await agentRepository.getAgentDataById(agentId)
      return data
    }catch(error){
      throw error
    }
  },
  agentUpdateByIdInService:async(agentId,{firstName,lastName,email,phone},user)=>{
    try{
      const data=await agentRepository.updateAgentDataById(agentId,{firstName,lastName,email,phone},user)
      return data
    }catch(error){
      throw error
    }
  },
  agentDeleteByIdInService:async(agentId,user)=>{
    try{
      const data=await agentRepository.deleteAgentDataById(agentId,user)
      return data
    }catch(error){
      throw error
    }
  }

 
 
};


module.exports = agentService;
