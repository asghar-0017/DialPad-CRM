const dataSource = require("../infrastructure/psql");
const Lead = require('../entities/lead');
const FollowUp = require('../entities/followUp'); // Adjust the path as needed
const other = require('../entities/otherDetail'); // Adjust the path as needed


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
            return data ? data : `data Not found`
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
            return data ? data : `Data not Found With Id ${leadId}`
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
