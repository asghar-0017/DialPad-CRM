const dataSource = require("../infrastructure/psql");
const other = require('../entities/otherDetail'); // Adjust the path as needed
const Lead = require('../entities/lead');

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
    const repository = dataSource.getRepository(other);
    const other = await repository.findOne(id);
    if (other) {
      repository.merge(other, data);
      return await repository.save(other);
    }
    return null;
  },
  delete: async (id, user) => {
    const otherRepository = dataSource.getRepository(other);
    const leadRepository = dataSource.getRepository(other);

    const others = await repository.findOneBy({ leadId: id });

    console.log("others:", others, "user:", user);

    if (others) {
        await otherRepository.remove(others);
        await leadRepository.remove(others);
        return true;
    }

    return false;
},
};

module.exports = followUpRepository;
