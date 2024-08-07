const dataSource = require("../infrastructure/psql");
const Lead = require('../entities/lead');
const FollowUp = require('../entities/followUp'); // Adjust the path as needed


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
    
            let followUpData;
    
            if (data.customer_feedBack === 'followUp') {
                followUpData = {
                    followUpDetail: data.followUpDetail,
                    leadId: data.leadId,
                    leadName: data.leadName,
                    phone: data.phone,
                    email: data.email,
                    role: user.role,
                };
    
                await dataSource.getRepository(FollowUp).update({ leadId }, followUpData);
            } else {
                await dataSource.getRepository(FollowUp).delete({ leadId });
            }
    
            await dataSource.getRepository(Lead).update({ leadId }, data);
            return await dataSource.getRepository(Lead).findOne({ where: { leadId } });
        } catch (error) {
            throw error;
        }
    }
    
};

module.exports = leadRepository;
