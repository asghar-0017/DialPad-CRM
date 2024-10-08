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
    const tokenEntity = {
      adminId,
      token,
    };
    return await dataSource.getRepository(AdminToken).save(tokenEntity);
  },

  deleteToken: async (token) => {
    return await dataSource.getRepository(AdminToken).delete({ token });
  },

  findTokenByToken: async (token) => {
    return await dataSource.getRepository(AdminToken).findOne({ where: { token } });
  },

};

module.exports = authRepository;
