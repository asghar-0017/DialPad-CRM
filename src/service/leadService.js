const leadRepository = require('../repository/leadRepository');
const followUpRepository = require('../repository/followUpRepository');
const otherRepository=require('../repository/otherRepository');
const agent = require('../entities/agent');
const dataSource=require('../infrastructure/psql')
const {agentRepository}=require('../repository/agentRepository')

const leadService = {
    leadCreateService: async (data, user) => {
        try {
            // Set role and relevant IDs based on the user's role
            if (user.role === 'agent') {
                data.agentId = user.agentId;
                data.role = 'agent';
            } else if (user.role === 'admin') {
                data.createdByAdmin = user.id;
                data.role = 'admin';
            }
    
            // Validate if the agent exists (if applicable)
            if (data.agentId) {
                const agentExists = await agentRepository.getAgentDataById(data.agentId);
                if (!agentExists) {
                    throw new Error('Agent ID does not exist in the agent table');
                }
            }
    
            // Save the lead
            const lead = await leadRepository.saveLead(data);
            
            // Check if lead was created successfully
            if (!lead || !lead.leadId) {
                throw new Error('Failed to create lead');
            }
    
            // Create follow-up record if feedback type is 'followUp'
            if (data.customer_feedBack === 'followUp') {
                const followUpData = {
                    followUpDetail: data.followUpDetail,
                    leadId: lead.leadId,
                    leadName: data.leadName,
                    phone: data.phone,
                    email: data.email,
                    role: data.role,
                    agentId: data.agentId,
                    createdByAdmin: data.createdByAdmin,
                };
                await followUpRepository.createFollowUp(followUpData);
            }
    
            // Create other record if feedback type is 'other'
            if (data.customer_feedBack === 'other') {
                const otherData = {
                    otherDetail: data.otherDetail,
                    leadId: lead.leadId,
                    leadName: data.leadName,
                    phone: data.phone,
                    email: data.email,
                    role: data.role,
                    agentId: data.agentId,
                    createdByAdmin: data.createdByAdmin,
                };
                await otherRepository.createOther(otherData);
            }
    
            return lead;
        } catch (error) {
            console.error("Error creating lead:", error.message);
            throw new Error('Error creating lead');
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
