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
  }
};

module.exports = agentRepository;
