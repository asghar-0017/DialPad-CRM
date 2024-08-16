const dataSource = require("../infrastructure/psql");
const Lead = require('../entities/lead');
const FollowUp = require('../entities/followUp'); // Adjust the path as needed
const other = require('../entities/otherDetail'); // Adjust the path as needed
const leadsTrash=require('../entities/trash/leadTrash')
const otherTrash=require('../entities/trash/otherTrash')
const followUpTrash=require('../entities/trash/followUpTrash')


const leadRepository = {
    
    saveLead: async (lead) => {
        try {
            console.log("Lead in Repo",lead)
            return await dataSource.getRepository(Lead).save(lead);
        } catch (error) {
            throw error;
        }
    },

    getLeadData: async () => {
        try {
            const data=await dataSource.getRepository(Lead).find();
            return data
        } catch (error) {
            throw error;
        }
    },
    updateLeadData: async ({ data, leadId, user }) => {
        try {
            if (!leadId) {
                throw new Error('leadId is required');
            }
            let lead;
            if (user.role === 'agent') {
                lead = await dataSource.getRepository(Lead).findOne({ where: { leadId, agent: user.id } });
            } else if (user.role === 'admin') {
                lead = await dataSource.getRepository(Lead).findOne({ where: { leadId } });
            }
            if (!lead) {
                throw new Error('Lead not found or does not belong to the agent');
            }    
            if (data.customer_feedBack === 'followUp') {
                const followUpData = {
                    followUpDetail: data.followUpDetail,
                    leadId: lead.leadId, 
                    address: data.address,
                    leadName: data.leadName,
                    phone: data.phone,
                    email: data.email,
                    role:user.role
                };
                const existingFollowUp = await dataSource.getRepository(FollowUp).findOne({ where: { leadId } });
                if (existingFollowUp) {
                    await dataSource.getRepository(FollowUp).update({ leadId }, followUpData);
                } else {
                    await dataSource.getRepository(FollowUp).save(followUpData);
                }
            } else if (data.customer_feedBack === 'other') {
                const otherData = {
                    otherDetail: data.otherDetail,
                    leadId: lead.leadId,
                    leadName: data.leadName,
                    phone: data.phone,
                    email: data.email,
                    role:user.role
                };
                const existingOther = await dataSource.getRepository(other).findOne({ where: { leadId } });
                if (existingOther) {
                    await dataSource.getRepository(other).update({ leadId }, otherData);
                } else {
                    await dataSource.getRepository(other).save(otherData);
                }
            } else {
                await dataSource.getRepository(FollowUp).delete({ leadId });
                await dataSource.getRepository(other).delete({ leadId });
                data.followUpDetail = null; 
                data.otherDetail = null; 
            }
            await dataSource.getRepository(Lead).update({ leadId }, data);
            const updatedLead = await dataSource.getRepository(Lead).findOne({ where: { leadId } });
            return updatedLead;
        } catch (error) {
            console.error('Error updating lead data:', error);
            throw error;
        }
    },
    
    getLeadDataById: async (leadId) => {
        try {
            const data=  await dataSource.getRepository(Lead).findOne({ where: { leadId } });
            return data 
        } catch (error) {
            throw error;
        }
    },
    getAllSpecificLeadDataByAgentId: async (agentId) => {
        try {
            const data = await dataSource.getRepository(Lead).find({ where: { agentId } });
            console.log("Retrieved leads:", data);
            return data;
        } catch (error) {
            console.error('Error in repository layer:', error);
            throw error;
        }
    },
    
    delete: async (leadId, user) => {
        console.log("APi Hit Delete")
        const leadRepository = dataSource.getRepository(Lead);
        const followUpRepository = dataSource.getRepository(FollowUp);
        const otherRepository = dataSource.getRepository(other);
      
        const otherTrashRepository = dataSource.getRepository(otherTrash);
        const leadTrashRepository = dataSource.getRepository(leadsTrash);
        const followUpTrashRepository = dataSource.getRepository(followUpTrash);
      
        const leadData = await leadRepository.findOne({where:{ leadId} });
        console.log("Lead Data",leadData)
      let createOtherTrash;
      let createFollowUpInTrash;
        if (leadData) {
          const createLeadInTrash = await leadTrashRepository.save(leadTrashRepository.create(leadData));
          console.log("CreateOtherTrash",createLeadInTrash)
          if(leadData.customer_feedBack=='other'){
           createOtherTrash=  await otherTrashRepository.save(otherTrashRepository.create(leadData)) 
           console.log("Create Other In Trash",createOtherTrash)
          }
            if(leadData.customer_feedBack=='followUp'){
            createFollowUpInTrash=await followUpTrashRepository.save(followUpTrashRepository.create(leadData)) 
            console.log("FollowUp in Trash",createFollowUpInTrash)
            } 
          await followUpRepository.delete({ leadId });
          await otherRepository.delete({ leadId});
          await leadRepository.remove(leadData);
          
            return {
            createLeadInTrash,
            createOtherTrash,
            createFollowUpInTrash
          };
        }
      
        return false; 
      },
      
      
    
    
    
    
    
};

module.exports = leadRepository;
