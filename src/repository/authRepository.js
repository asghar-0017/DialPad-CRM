const { getRepository } = require('typeorm');
const dataSource=require('../infrastructure/psql')
const Auth = require('../entities/auth');
const AdminToken=require('../entities/adminToken')

const authRepository = {
  findByUserName: async (userName) => {
    return await dataSource.getRepository(Auth).findOne({ where: { userName } });
  },

  findByEmail: async (email) => {
    return await dataSource.getRepository(Auth).findOne({ where: { email } });
  },

  findByToken: async (token) => {
    return await dataSource.getRepository(Auth).findOne({ where: { resetCode: token } });
  },

  save: async (admin) => {
    return await dataSource.getRepository(Auth).save(admin);
  },

  findTokenByToken: async (token) => {
    const verifyToken=token
    console.log("verify Token",verifyToken)
    const dataToken= await dataSource.getRepository(Auth).findOne({ where: {  verifyToken:token } });
    console.log("Data Token",dataToken)
    return dataToken

  },
  saveToken: async (adminId, token) => {
    try {
      const adminTokenRepository = dataSource.getRepository(AdminToken);

      // Check if a token already exists for this admin
      let existingToken = await adminTokenRepository.findOne({ where: { adminId } });

      if (existingToken) {
        // Update existing token
        existingToken.token = token;
        console.log("Updating existing token:", existingToken);
      } else {
        // Create new token
        existingToken = adminTokenRepository.create({ adminId, token });
        console.log("Creating new token:", existingToken);
      }

      // Save token to the database
      const saveData= await adminTokenRepository.save(existingToken);
      console.log("Saved Data",saveData)
      return saveData
    } catch (error) {
      console.error("Error saving token:", error);
      throw error;
    }
  },

  deleteToken: async (token) => {
    return await dataSource.getRepository(AdminToken).delete({ token });
  },

  findTokenByToken: async (token) => {
    return await dataSource.getRepository(AdminToken).findOne({ where: { token } });
  },

};

module.exports = authRepository;
