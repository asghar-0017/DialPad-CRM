const leadRepository = require('../repository/leadRepository');
const followUpRepository = require('../repository/followUpRepository');
const otherRepository=require('../repository/otherRepository')

const leadService = {
     leadCreateService :async (data, user) => {
        try {
            if (user.role === 'agent') {
                data.agent = user.id;
            } else if (user.role === 'admin') {
                data.createdByAdmin = user.id;
            }
    
            const lead = await leadRepository.saveLead(data);
            console.log("lead id", lead.leadId);
    
            let followUpData;
    
            if (data.customer_feedBack === 'followUp') {
                followUpData = {
                    followUpDetail: data.followUpDetail,
                    leadId: lead.leadId, // Corrected to use the lead's leadId
                    leadName: lead.leadName,
                    phone: lead.phone,
                    email: lead.email,
                    role: user.role,
                };
                await followUpRepository.createFollowUp(followUpData);
            } else if (data.customer_feedBack === 'other') {
                const otherData = {
                    otherDetail: data.otherDetail,
                    leadId: lead.leadId,
                    leadName: lead.leadName,
                    phone: lead.phone,
                    email: lead.email,
                    role: user.role,
                };
                await otherRepository.createOther(otherData);
            }
    
            return lead;
        } catch (error) {
            console.error("Error creating lead:", error);
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
    },
    leadGetServiceById: async (leadId) => {
        try {
            const result = await leadRepository.getLeadDataById(leadId);
            return result;
        } catch (error) {
            throw error;
        }
    },
    deleteLeadById: async (id,user) => {
        return await leadRepository.delete(id,user);
      },

};

module.exports = leadService;
