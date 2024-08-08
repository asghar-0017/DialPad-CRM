const dataSource = require("../infrastructure/psql");
const FollowUp = require('../entities/followUp'); // Adjust the path as needed
const Lead = require('../entities/lead');
const followUp = require("../entities/followUp");

const followUpRepository = {
  createFollowUp: async (followUpData) => {
    try {
        return await dataSource.getRepository(FollowUp).save(followUpData);
    } catch (error) {
        throw error;
    }
},
  findAll: async () => {
    const repository = dataSource.getRepository(FollowUp);
    return await repository.find();
  },

  findById: async (leadId) => {
    const data= await dataSource.getRepository(FollowUp).findOne({ where: { leadId } });
    console.log("data",data)
    if(data){
      return data
    }else{
      return `Data not Found With id ${leadId}` 
    }
  },

  update: async (id, data) => {
    const followUpRepository = dataSource.getRepository(followUp);
    const leadRepository = dataSource.getRepository(Lead);
    const followUpEntity = await followUpRepository.findOneBy({ leadId: id });

    if (followUpEntity) {
        const updatedFollowUpData = {
            ...followUpEntity,
            followUpDetail: data.followUpDetail,
            leadName: data.leadName,
            phone: data.phone,
            email: data.email,
            updated_at: new Date() 
        };

        const leadEntity = await leadRepository.findOneBy({ leadId: id });
        if (leadEntity) {
            const updatedLeadData = {
                ...leadEntity,
                otherDetail: data.otherDetail,
                leadName: data.leadName,
                customerFeedBack:data.customerFeedBack,
                phone: data.phone,
                email: data.email,
                updated_at: new Date()  
            };

            await followUpRepository.save(updatedFollowUpData);
            await leadRepository.save(updatedLeadData);

            console.log("Update successful");
            return true;
        } else {
            console.log("No corresponding lead entity found for update.");
            return false;
        }
    } else {
        console.log("No 'other' entity found with leadId:", id);
        return false;
    }
},

  
delete: async (id, user) => {
  try {
      const followUpRepository = dataSource.getRepository(followUp);
      const leadRepository = dataSource.getRepository(Lead);

      const otherEntity = await followUpRepository.findOneBy({ leadId: id });

      if (otherEntity) {
          await followUpRepository.remove(otherEntity);

          const leadEntity = await leadRepository.findOneBy({ leadId: id });
          if (leadEntity) {
              await leadRepository.remove(leadEntity);
          } else {
              console.log(`No 'lead' entity found with leadId: ${id}`);
          }

          return true;
      } else {
          return false;
      }
  } catch (error) {
      console.error("Error during deletion:", error);
      return false;
  }
},

};

module.exports = followUpRepository;
