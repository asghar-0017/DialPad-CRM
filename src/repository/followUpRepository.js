const dataSource = require("../infrastructure/psql");
const FollowUp = require('../entities/followUp'); // Adjust the path as needed
const Lead = require('../entities/lead');

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
    const repository = dataSource.getRepository(FollowUp);
    const followUp = await repository.findOne(id);
    if (followUp) {
      repository.merge(followUp, data);
      return await repository.save(followUp);
    }
    return null;
  },

  delete: async (id) => {
    const repository = dataSource.getRepository(FollowUp);
    const followUp = await repository.findOne(id);
    if (followUp) {
      await repository.remove(followUp);
      return true;
    }
    return false;
  },
};

module.exports = followUpRepository;
