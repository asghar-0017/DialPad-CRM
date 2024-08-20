const leadRepository = require('../repository/leadRepository');
const leadService = require('../service/leadService');
const trashService=require('../service/trashService')
const trashRepository=require('../repository/trashRepository')
const dataSource=require('../infrastructure/psql')
const trashController = {
    getLeadTrash: async (req, res) => {
        try {
            const data = await trashService.getDataFromTrash();
            if (!data || data.length === 0) {
                return res.status(404).json({ message: 'Data Not Found' });
            }
            const processedData = data.map(lead => {
                if (lead.customer_feedBack !== 'followUp') {
                    delete lead.followUpDetail;
                }
                if (lead.customer_feedBack !== 'other') {
                    delete lead.otherDetail;
                }
                if (lead.role === 'admin') {
                    delete lead.agentId;
                }
                return lead;
            });
            return res.status(200).send({ message: "success", data: processedData });

        } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },
    getLeadOtherTrash:async(req,res)=>{
        try {
            const { role } = req.user;
            const others = await trashService.getAllOthersfromTrash();
        
            if (role === 'admin') {
              const data = others.map(other => {
                const { id, leadId, leadName, phone, email, role, otherDetail } = other;
                return { id, leadId, leadName, phone, email, role, otherDetail };
              });
              return res.status(200).json({ message: 'success', data });
            } 
            // io.emit('receive_message', others);
      
              return res.status(200).json({ message: 'success', data: others });
          } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error', error: error.message });
          }
    },
    getLeadFollowUpTrash:async(req,res)=>{
        try {
            const followUps = await trashService.getAllFollowUps();
            if (!followUps || followUps.length === 0) {
                return res.status(404).json({ message: 'No follow-ups found' });
            }
            const data = followUps.map(followUp => {
                if (followUp.role === 'admin') {
                    const { id, leadId, leadName, phone, email, role, followUpDetail } = followUp;
                    return { id, leadId, leadName, phone, email, role, followUpDetail };
                } else {
                    return followUp;
                }
            });
            // io.emit('receive_message', data);
            res.status(200).json({ message: 'success', data });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },
    getLeadById: async (req, res) => {
        try {
            const leadId = req.params.leadId;
            console.log("LeadId",leadId)
            const data = await trashService.leadGetServiceById(leadId);
            if (data) {
                if (data && data.customer_feedBack !== 'followUp') {
                    delete data.followUpDetail;
                }
                if (data && data.customer_feedBack !== 'other') {
                    delete data.otherDetail;
                }
                res.status(200).send({ message: "success", data: data });
            }else{
                res.status(200).send({ message: "Data Not Found", });

            }
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },
    retrieveLeadFromTrash:async(req,res)=>{
        try{
            console.log("Api Hit")
            const leadId = req.params.leadId;
            console.log("leadId",leadId)
            const checkDataIsInLead=await trashRepository.getLeadDataById(leadId);
            console.log("Data in Trash",checkDataIsInLead)
            const leadTrashRepository = dataSource.getRepository('leadsTrash');  

            if(checkDataIsInLead){
                const data=checkDataIsInLead
                const user=checkDataIsInLead.role
                const lead = await leadService.leadCreateService(data, user);
                if(lead){
                //  io.emit('send_message', lead);
                 res.status(201).json({ message: 'Lead Retrieve successfully', lead });
                 await leadTrashRepository.delete({leadId});
                 console.log(`Lead with ID ${leadId} removed from trash.`);
                }
            }
         } catch (error) {
            //  res.status(500).json({ message: 'Internal Server Error', error: error.message });
            throw error
         }
        }
};

module.exports = trashController;
