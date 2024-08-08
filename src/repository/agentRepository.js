const dataSource = require("../infrastructure/psql");
const { logger } = require("../../logger");
const agentAuth=require('../entities/agent')

const agentRepository = {
findByEmail: async (email) => {
        return await dataSource.getRepository(agentAuth).findOne({ where: { email } });
      },

  saveAgent: async (agent) => {
    return await dataSource.getRepository(agentAuth).save(agent);
  },
  getAgentData:async()=>{
    try{
        return await dataSource.getRepository(agentAuth).find()

    }catch(error){

    }
  },
  getAgentDataById:async(agentId)=>{
    try{
      const data= await dataSource.getRepository(agentAuth).findOne({where:{agentId}})
      if(data){
        return data
      }
    }catch(error){
      throw error
    }
  },
  updateAgentDataById:async(agentId,{firstName,lastName,email,phone},user)=>{
    try{
      const data= await dataSource.getRepository(agentAuth).findOne({where:{agentId}})
      if(data){
        const result = await dataSource.getRepository(agentAuth).update({ agentId }, {firstName,lastName,email,phone},user)
        return result
      }
    }catch(error){
      throw error
    }
  },
  deleteAgentDataById:async(agentId,user)=>{
    try{
      const data= await dataSource.getRepository(agentAuth).findOne({where:{agentId}})
      if(data){
        const result = await dataSource.getRepository(agentAuth).delete({ agentId },user)
        return result
      }
    }catch(error){
      throw error
    }
  }
};

module.exports = agentRepository;
