const dataSource = require("../infrastructure/psql");
const Lead = require('../entities/lead');
const FollowUp = require('../entities/followUp');
const other = require('../entities/otherDetail'); 
const leadsTrash=require('../entities/leadTrash')
const otherTrash=require('../entities/otherTrash')
const followUpTrash=require('../entities/followUpTrash')


const leadRepository = {
     saveLead :async (role, leadId, lead) => {
        try {
            let leadEntity = {
            agentId:lead.agentId,
            role,
            leadId,

            dynamicLead: lead.dynamicLead, 
          };
      
          return await dataSource.getRepository(Lead).save(leadEntity);
        } catch (error) {
          console.error("Error saving lead:", error.message);
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
    
            const leadRepository = dataSource.getRepository(Lead);
            const followUpRepository = dataSource.getRepository(FollowUp);
            const otherRepository = dataSource.getRepository(other);

            const leadData= await otherRepository.findOne({where:{leadId}})
            console.log("Lead Data in Rpo",leadData)
            let lead;
            if (user.role === 'agent') {
                lead = await leadRepository.findOne({ where: { leadId, agent: user.id } });
            } else if (user.role === 'admin') {
                lead = await leadRepository.findOne({ where: { leadId } });
            }
    
            if (!lead) {
                throw new Error('Lead not found or does not belong to the agent');
            }
            console.log("Lead Data in Rpo",lead)

    
            const customerFeedBack = lead.dynamicLead.CustomerFeedBack;
            console.log('CustomerFeedBack from lead:', customerFeedBack);
    
            if (customerFeedBack === 'followUp') {
                const existingFollowUp = await followUpRepository.findOne({ where: { leadId } });
                const updatedFollowUpData = existingFollowUp
                    ? { ...existingFollowUp.dynamicLead, ...data }
                    : { ...data };
    
                if (existingFollowUp) {
                    await followUpRepository.update({ leadId }, { dynamicLead: updatedFollowUpData });
                } else {
                    await followUpRepository.save({
                        leadId: lead.leadId,
                        dynamicLead: leadData,
                        agentId: user.agentId,
                    });
                }
            }

            else if (customerFeedBack === 'other') {
                const existingOther = await otherRepository.findOne({ where: { leadId } });
                const updatedOtherData = existingOther
                    ? { ...existingOther.dynamicLead, ...data }
                    : { ...data };
    
                if (existingOther) {
                    await otherRepository.update({ leadId }, { dynamicLead: updatedOtherData });
                } else {
                    await otherRepository.save({
                        leadId: lead.leadId,
                        dynamicLead: leadData,
                        agentId: user.agentId,
                    });
                }
            }
    
            if (data.CustomerFeedBack ==='onGoing' || data.CustomerFeedBack ==='voiceMail' || data.CustomerFeedBack ==='hangUp' ||  data.CustomerFeedBack ==='other' ) {
                const existingFollowUp = await followUpRepository.findOneBy({  leadId  });
                console.log("Existing followUp",existingFollowUp)
                if (existingFollowUp) {
                    await followUpRepository.delete({ leadId });
                }
                    const existingOther = await otherRepository.findOne({ where: { leadId } });
                if (existingOther) {
                    await otherRepository.delete({ leadId });
                }
            }
       
                const updatedLeadData = { ...lead.dynamicLead, ...data };
                if (updatedLeadData.CustomerFeedBack === 'onGoing' || updatedLeadData.CustomerFeedBack === 'hangUp'|| updatedLeadData.CustomerFeedBack=== 'voiceMail' || updatedLeadData.CustomerFeedBack=== 'other' ) {
                    if ('followUpDetail' in updatedLeadData) {
                        delete updatedLeadData.followUpDetail;
                    }
                    if ('FollowUpDetail' in updatedLeadData) {
                        delete updatedLeadData.FollowUpDetail;
                    }
                }
                if (updatedLeadData.CustomerFeedBack === 'onGoing' || updatedLeadData.CustomerFeedBack === 'hangUp'|| updatedLeadData.CustomerFeedBack=== 'voiceMail' || updatedLeadData.CustomerFeedBack=== 'other' ) {
                    if ('otherDetail' in updatedLeadData) {
                        delete updatedLeadData.otherDetail;
                    }
                    if ('otherDetail' in updatedLeadData) {
                        delete updatedLeadData.otherDetail;
                    }
                }
                
            await leadRepository.update({ leadId }, { dynamicLead: updatedLeadData });
            console.log("Updated Lead ........................",updatedLeadData)

         
    
            if (data.deleteOther) {
                await otherRepository.delete({ leadId });
                data.otherDetail = null; 
            }

    
            const updatedLead = await leadRepository.findOne({ where: { leadId } })
            const updateFeedBack = updatedLead.dynamicLead.CustomerFeedBack;
            console.log('CustomerFeedBack from lead:', updateFeedBack);
            if(updateFeedBack==='followUp'){
                const followUpInsert=await followUpRepository.save(followUpRepository.create(updatedLead))
                 console.log("Insert into FollowUp",followUpInsert)
            }
            if(updateFeedBack==='other'){
                const otherInsert=await otherRepository.save(otherRepository.create(updatedLead))
                 console.log("Insert into FollowUp",otherInsert)
            }
            return updatedLead;
    
        } catch (error) {
            console.error('Error updating lead data:', error.message);
            throw new Error('Failed to update lead data.');
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
        try {
            console.log("API Hit Delete");
    
            const leadRepository = dataSource.getRepository(Lead);
            const followUpRepository = dataSource.getRepository(FollowUp);
            const otherRepository = dataSource.getRepository(other);  
            const otherTrashRepository = dataSource.getRepository(otherTrash); 
            const leadTrashRepository = dataSource.getRepository(leadsTrash);  
            const followUpTrashRepository = dataSource.getRepository(followUpTrash);
    
            const leadData = await leadRepository.findOne({ where: { leadId } });
            console.log("Lead Data:", leadData);
    
            if (!leadData) {
                console.log("No lead data found for the given leadId");
                return { success: false, message: "No lead data found" };
            }
    
            const leadEntity = {
                agentId: leadData.agentId,
                role: user.role,
                leadId: leadData.leadId,
                dynamicLead: leadData.dynamicLead,  
            };
            const leadDataDynamic= {...leadEntity.dynamicLead}
            console.log("Lead Dynamic Data",leadDataDynamic)
    
            const createLeadInTrash = await leadTrashRepository.save(leadTrashRepository.create(leadEntity));
            console.log("Created Lead In Trash:", createLeadInTrash);
    
            let createdOtherTrash = null;
            let createdFollowUpInTrash = null;
    
            if (leadDataDynamic.CustomerFeedBack === 'other') {
                const otherEntity={
                agentId: leadData.agentId,
                role: user.role,
                leadId: leadData.leadId,
                dynamicLead: leadDataDynamic,  
                }
                console.log("OtherEntity",otherEntity)
                createdOtherTrash = await otherTrashRepository.save(otherTrashRepository.create(otherEntity))
                console.log("Created Other In Trash:", createdOtherTrash);
            }
    
            if (leadDataDynamic.CustomerFeedBack === 'followUp') {
                const followUpEntiry={
                    agentId: leadData.agentId,
                    role: user.role,
                    leadId: leadData.leadId,
                    dynamicLead: leadDataDynamic, 
                }
                console.log("FollowUp Entity",followUpEntiry)
                createdFollowUpInTrash = await followUpTrashRepository.save(followUpTrashRepository.create(followUpEntiry));
                console.log("Created FollowUp In Trash:", createdFollowUpInTrash);
            }
    
            await followUpRepository.delete({ leadId });
            await otherRepository.delete({ leadId });
            await leadRepository.remove(leadData);  
    
            const TrashData = {
                createdOtherTrash,
                createdFollowUpInTrash,
                createLeadInTrash,
            };
            return {
                success: true,
                TrashData,
            };
        } catch (error) {
            console.error("Error deleting lead:", error);
            return {
                success: false,
                message: "An error occurred while deleting the lead",
                error,
            };
        }
    },
     
    
};

module.exports = leadRepository;
