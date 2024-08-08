const dataSource = require("../infrastructure/psql");
const other = require('../entities/otherDetail'); // Adjust the path as needed
const Lead = require('../entities/lead');
const lead = require("../entities/lead");

const followUpRepository = {
  createOther: async (otherData) => {
    try {
        return await dataSource.getRepository(other).save(otherData);
    } catch (error) {
        throw error;
    }
},
  findAll: async () => {
    const repository = dataSource.getRepository(other);
    return await repository.find();
  },

  findById: async (leadId) => {
    const data= await dataSource.getRepository(other).findOne({ where: { leadId } });
    console.log("data",data)
    if(data){
      return data
    }else{
      return `Data not Found With id ${leadId}` 
    }
  },
  update: async (id, data) => {
    const otherRepository = dataSource.getRepository(other);
    const leadRepository = dataSource.getRepository(lead);
    const otherEntity = await otherRepository.findOneBy({ leadId: id });

    if (otherEntity) {
        const updatedOtherData = {
            ...otherEntity,
            otherDetail: data.otherDetail,
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
                phone: data.phone,
                email: data.email,
                updated_at: new Date()  
            };

            await otherRepository.save(updatedOtherData);
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
      const otherRepository = dataSource.getRepository(other);
      const leadRepository = dataSource.getRepository(lead);

      const otherEntity = await otherRepository.findOneBy({ leadId: id });

      if (otherEntity) {
          await otherRepository.remove(otherEntity);

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


}

module.exports = followUpRepository;
