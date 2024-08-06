const dataSource = require("../infrastructure/psql");
const { logger } = require("../../logger");
const AdminAuth = require("../entities/auth"); // Adjust this import according to your entities structure
const agentAuth=require('../entities/agent')

const authRepository = {
  findByUserName: async (userName) => {
    return await dataSource.getRepository(AdminAuth).findOne({ where: { userName } });
  },

  findByEmail: async (email) => {
    return await dataSource.getRepository(AdminAuth).findOne({ where: { email } });
  },

  save: async (admin) => {
    return await dataSource.getRepository(AdminAuth).save(admin);
  },
};

module.exports = authRepository;
