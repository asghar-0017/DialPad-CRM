const leadTrash = require('../entities/leadTrash')
const dataSource=require('../infrastructure/psql')
const otherTrash=require('../entities/trash/otherTrash')
const followUpTrash=require('../entities/trash/followUpTrash')


const trashRepository = {
    getLeadTrashDataFromRepo:async()=>{
        try{
            const data=await dataSource.getRepository(leadTrash).find()
            return data
        }catch(error){

        }
    },
    findAllOthers: async () => {
        try {
          const repository = dataSource.getRepository('otherTrash'); 
          const dataArray = await repository.find(); 
          console.log('data',dataArray)
          const result = await Promise.all(dataArray.map(async (data) => {
            const agentId = data.agentId;
            const agentData = await dataSource.getRepository('agent').findOne({ where: { agentId } });
      
            if (agentData) {
              return {
                ...data,
              };
            }
          }));
          return result;
        } catch (error) {
          throw error;
        }
      },
      findAllFollowUps: async () => {
        const repository = dataSource.getRepository(followUpTrash);
        const followUps = await repository.find();    
        return followUps;
    },
    getLeadDataById: async (leadId) => {
      try {
          const data=  await dataSource.getRepository(leadTrash).findOne({ where: { leadId } });
          return data 
      } catch (error) {
          throw error;
      }
  },
    
}
module.exports= trashRepository