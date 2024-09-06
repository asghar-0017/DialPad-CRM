const leadRepository = require('../repository/leadRepository');
const followUpRepository = require('../repository/followUpRepository');
const otherRepository=require('../repository/otherRepository');
const agent = require('../entities/agent');
const dataSource=require('../infrastructure/psql')
const {agentRepository}=require('../repository/agentRepository')
const leadIdGenerator=require('../utils/token')


const leadService = {
    //     leadCreateService: async (data, user) => {
    //     try {
    //         if (user.role === 'agent') {
    //             data.agentId = user.agentId;
    //             data.role = 'agent';
    //         } else if (user.role === 'admin') {
    //             data.role = 'admin';
    //         }
    //         console.log("AgentId",data.agentId)
    //             if (data.agentId) {
    //             const agentExists = await agentRepository.getAgentDataById(data.agentId);
    //             if (!agentExists) {
    //                 throw new Error('Agent ID does not exist in the agent table');
    //             }
    //         }
    //         const lead = await leadRepository.saveLead(data);
            
    //         if (!lead || !lead.leadId) {
    //             throw new Error('Failed to create lead');
    //         }
    
    //         if (data.customerFeedBack === 'followUp') {
    //             const followUpData = {
    //                 followUpDetail: data.followUpDetail,
    //                 leadId: lead.leadId,
    //                 leadName: data.leadName,
    //                 phone: data.phone,
    //                 email: data.email,
    //                 role: data.role,
    //                 agentId: data.agentId,
    //             };
    //             await followUpRepository.createFollowUp(followUpData);
    //         }
    //             if (data.customerFeedBack === 'other') {
    //             const otherData = {
    //                 otherDetail: data.otherDetail,
    //                 leadId: lead.leadId,
    //                 leadName: data.leadName,
    //                 phone: data.phone,
    //                 email: data.email,
    //                 role: data.role,
    //                 agentId: data.agentId,
    //             };
    //             await otherRepository.createOther(otherData);
    //         }
    //         return lead;
    //     } catch (error) {
    //         console.error("Error creating lead:", error.message);
    //         throw new Error('Error creating lead');
    //     }
    // },
     leadCreateService :async (data, user) => {
        try {
          if (user.role === 'agent') {
            data.agentId = user.agentId;
            data.role = 'agent';
          } else if (user.role === 'admin') {
            data.role = 'admin';
          }
      
        //   console.log("Agent Id",data.agentId)
        //   if (data.agentId) {
        //     const agentExists = await agentRepository.getAgentDataById(data.agentId);
        //     if (!agentExists) {
        //       throw new Error('Agent ID does not exist in the agent table');
        //     }
        //   }
      
          const leadId = await leadIdGenerator();  
          
      
          const lead = await leadRepository.saveLead(user.role, leadId,{
            dynamicLead: data,  
            role: user.role,
            agentId: data.agentId || null,
          });      
          if (!lead || !lead.leadId) {
            throw new Error('Failed to create lead');
          }
      
        if (data.CustomerFeedBack === 'followUp') {
            const followUpData = {
              dynamicLead: data,  
              agentId: data.agentId,
              leadId:leadId,

            };
            console.log("FollouYP",followUpData)
          
            await followUpRepository.createFollowUp(followUpData); 
          }
      
          if (data.CustomerFeedBack === 'other') {
            const otherData = {
                dynamicLead: data, 
                agentId: data.agentId,
                leadId:leadId,



            };
            console.log("Other",otherData)
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
    leadAllGetServiceByAgentId:async(agentId)=>{
        try {
            const result = await leadRepository.getAllSpecificLeadDataByAgentId(agentId);
            return result;
        } catch (error) {
            throw error;
        }
    },
    deleteLeadById: async (leadId,user) => {
        return await leadRepository.delete(leadId,user);
      },

};

module.exports = leadService;
