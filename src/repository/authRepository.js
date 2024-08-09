const { getRepository } = require('typeorm');
const dataSouece=require('../infrastructure/psql')
const Auth = require('../entities/auth');

const authRepository = {
  findByUserName: async (userName) => {
    return await dataSouece.getRepository(Auth).findOne({ where: { userName } });
  },

  findByEmail: async (email) => {
    return await dataSouece.getRepository(Auth).findOne({ where: { email } });
  },

  findByToken: async (token) => {
    return await dataSouece.getRepository(Auth).findOne({ where: { resetCode: token } });
  },

  save: async (admin) => {
    return await dataSouece.getRepository(Auth).save(admin);
  },

  findTokenByToken: async (token) => {
    return await dataSouece.getRepository(Auth).findOne({ where: { verifyToken: token } });

  },
};

module.exports = authRepository;
