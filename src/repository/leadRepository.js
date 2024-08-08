const dataSource = require("../infrastructure/psql");
const Lead = require('../entities/lead');
const FollowUp = require('../entities/followUp'); // Adjust the path as needed
const other = require('../entities/otherDetail'); // Adjust the path as needed
const lead = require("../entities/lead");
const followUp = require("../entities/followUp");


const leadRepository = {
    saveLead: async (lead) => {
        try {
            return await dataSource.getRepository(Lead).save(lead);
        } catch (error) {
            throw error;
        }
    },

    getLeadData: async () => {
        try {
            return await dataSource.getRepository(Lead).find();
        } catch (error) {
            throw error;
        }
    },
    updateLeadData: async ({ data, leadId, user }) => {
        try {
            let lead;
            if (user.role === 'agent') {
                lead = await dataSource.getRepository(Lead).findOne({ where: { leadId, agent: user.id } });
            } else if (user.role === 'admin') {
                lead = await dataSource.getRepository(Lead).findOne({ where: { leadId } });
            }
    
            if (!lead) {
                throw new Error('Lead not found or does not belong to the agent');
            }
            console.log("Lead in Repo", lead);
    
            if (data.customer_feedBack === 'followUp') {
                const followUpData = {
                    followUpDetail: data.followUpDetail,
                    leadId: data.leadId,
                    leadName: data.leadName,
                    phone: data.phone,
                    email: data.email,
                    role: user.role,
                };
    
                const existingFollowUp = await dataSource.getRepository(FollowUp).findOne({ where: { leadId } });
                if (existingFollowUp) {
                    await dataSource.getRepository(FollowUp).update({ leadId }, followUpData);
                } else {
                    await dataSource.getRepository(FollowUp).save(followUpData);
                }
            }if (data.customer_feedBack === 'other') {
                const otherData = {
                    otherDetail: data.otherDetail,
                    leadId: data.leadId,
                    leadName: data.leadName,
                    phone: data.phone,
                    email: data.email,
                    role: user.role,
                };
    
                const existingOther = await dataSource.getRepository(other).findOne({ where: { leadId } });
                if (existingOther) {
                    await dataSource.getRepository(other).update({ leadId }, otherData);
                } else {
                    await dataSource.getRepository(other).save(otherData);
                }
            } 
            else {
                // Remove follow-up if customer_feedBack is not 'followUp'
                await dataSource.getRepository(FollowUp).delete({ leadId });
                await dataSource.getRepository(other).delete({ leadId });
                data.followUpDetail = null; 
                data.otherDetail = null; 
            }
    
            // Update the lead data
            await dataSource.getRepository(Lead).update({ leadId }, data);
            const updatedLead = await dataSource.getRepository(Lead).findOne({ where: { leadId } });
    
            // Remove followUpDetail from the response if it exists and customer_feedBack is not 'followUp'
            if (updatedLead && updatedLead.customer_feedBack !== 'followUp') {
                delete updatedLead.followUpDetail;
            }
            if (updatedLead && updatedLead.customer_feedBack !== 'other') {
                delete updatedLead.otherDetail;
            }
    
            return updatedLead;
        } catch (error) {
            throw error;
        }
    },
    getLeadDataById: async (leadId) => {
        try {
            const data=  await dataSource.getRepository(Lead).findOne({ where: { leadId } });
            if(data){
                return data
            }else{
                return `Data not Found With Id ${leadId}`
            }
        } catch (error) {
            throw error;
        }
    },
    delete: async (id, user) => {
        const leadRepository = dataSource.getRepository(Lead);
        const followUpRepository = dataSource.getRepository(FollowUp);
        const otherRepository = dataSource.getRepository(other);
    
        const leadData = await leadRepository.findOneBy({ leadId: id });
    
        if (leadData) {
            await followUpRepository.delete({ leadId: id });
            await otherRepository.delete({ leadId: id });
            await leadRepository.remove(leadData);
            return true;
        }
    
        return false;
    },
    
    
    
    
    
};

module.exports = leadRepository;
