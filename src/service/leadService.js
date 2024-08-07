const leadRepository = require('../repository/leadRepository');
const followUpRepository = require('../repository/followUpRepository');

const leadService = {
    leadCreateService: async (data, user) => {
        try {
            if (user.role === 'agent') {
                data.agent = user.id;
            } else if (user.role === 'admin') {
                data.createdByAdmin = user.id;
            }

            const lead = await leadRepository.saveLead(data);
            console.log("lead id", lead.leadId);
            console.log("lead id", data.leadId);

            if (data.customer_feedBack === 'followUp') {
                const followUpData = {
                    followUpDetail: data.followUpDetail,
                    leadId:  data.leadId, 
                    leadName: lead.leadName,
                    phone: lead.phone,
                    email: lead.email,
                    role: user.role,
                };
                await followUpRepository.createFollowUp(followUpData);
            }

            return lead;
        } catch (error) {
            throw error;
        }
    },

    leadReadService: async () => {
        try {
            const result = await leadRepository.getLeadData();
            return result;
        } catch (error) {
            throw error;
        }
    },

    updateLeadByService: async ({ data, leadId, user }) => {
        try {
            const lead = await leadRepository.updateLeadData({ data, leadId, user });
            return lead;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = leadService;
