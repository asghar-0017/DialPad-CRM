const dataSource = require("../infrastructure/psql");
const { logger } = require("../../logger");
const Lead=require('../entities/lead')

const leadRepository = {
  findByEmail: async (email) => {
        return await dataSource.getRepository(Lead).findOne({ where: { email } });
      },
  saveLead: async (lead) => {
    return await dataSource.getRepository(Lead).save(lead);
  },
  getLeadData:async()=>{
    try{
        return await dataSource.getRepository(Lead).find()

    }catch(error){
        throw error
    }
  },
  getLeadData:async()=>{
    try{
      const data =await dataSource.getRepository(Lead).find()
      if(data){
        return data
      }else{
        return "No data Found"
      }
    }catch(error){
        throw error
        }
    },
    updateLeadData:async({ data,leadId, agent })=>{
        try{
            const lead = await dataSource.getRepository(Lead).findOne({ where: { id: leadId, agent: agent.id } });
            if (!lead) {
                throw new Error('Lead not found or does not belong to the agent');
              }
              lead.leadName = data.leadName || lead.leadName;
              lead.leadDetails = data.leadDetails || lead.leadDetails;
              await leadRepo.save(lead);
        
              return lead;
        }catch(error){

        }

    }
    };

    module.exports = leadRepository;
