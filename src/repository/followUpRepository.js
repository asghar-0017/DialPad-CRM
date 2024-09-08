const dataSource = require("../infrastructure/psql");
const FollowUp = require('../entities/followUp'); // Adjust the path as needed
const Lead = require('../entities/lead');
const followUp = require("../entities/followUp");

const followUpRepository = {
  createFollowUp: async (followUpData) => {
    try {   
      
       
        return await dataSource.getRepository(FollowUp).save(followUpData);
    } catch (error) {
        throw error;
    }
},
  findAll: async () => {
    const repository = dataSource.getRepository(FollowUp);
    return await repository.find();
  },

  findById: async (leadId) => {
    const data= await dataSource.getRepository(FollowUp).findOne({ where: { leadId } });
    return data
  },
  getAllSpecificFollowUpDataByAgentId:async(agentId)=>{
    try {
        const data = await dataSource.getRepository(FollowUp).find({ where: { agentId } });
        return data;
    } catch (error) {
        console.error('Error in repository layer:', error);
        throw error;
    }
  },

  update: async (id, data) => {
    const followUpRepository = dataSource.getRepository(followUp);
    const leadRepository = dataSource.getRepository(Lead);
  
    console.log("Searching for followUp with leadId:", id);
    const followUpEntity = await followUpRepository.findOneBy({ leadId: String(id) });
  
    if (followUpEntity) {
      const existingFollowUpData = followUpEntity.dynamicLead || {};
      const updatedFollowUpData = { ...existingFollowUpData, ...data };
  
      const leadEntity = await leadRepository.findOneBy({ leadId: String(id) });
      if (leadEntity) {
        const existingLeadData = leadEntity.dynamicLead || {};
        const updatedLeadData = { ...existingLeadData, ...data };
  
        await followUpRepository.update({ leadId: String(id) }, { dynamicLead: updatedFollowUpData, updated_at: new Date() });
        await leadRepository.update({ leadId: String(id) }, { dynamicLead: updatedLeadData, updated_at: new Date() });
  
        console.log("Update successful");
        return true;
      } else {
        console.log("No corresponding lead entity found for update.");
        return false;
      }
    } else {
      console.log("No 'followUp' entity found with leadId:", id);
      return false;
    }
  },
  
  
  
  

  
delete: async (id, user) => {
  try {
      const followUpRepository = dataSource.getRepository(followUp);
      const leadRepository = dataSource.getRepository(Lead);

      const otherEntity = await followUpRepository.findOneBy({ leadId: id });

      if (otherEntity) {
          await followUpRepository.remove(otherEntity);

          const leadEntity = await leadRepository.findOneBy({ leadId: id });
          if (leadEntity) {
              await leadRepository.remove(leadEntity);
          } else {
              console.log(`No 'lead' entity found with leadId: ${id}`);
          }

          return true;
      } else {
          return false;
      }
  } catch (error) {
      console.error("Error during deletion:", error);
      return false;
  }
},

};

module.exports = followUpRepository;
