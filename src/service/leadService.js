const bcrypt = require('bcryptjs');
const redis = require('../infrastructure/redis');
const leadRepository = require('../repository/leadRepository');
const { logger } = require('../../logger');
const jwt = require('jsonwebtoken');

const secretKey = process.env.SCERET_KEY;


const leadService = {

  leadCreateService: async (data) => {
    const password=data.password
    const hashedPassword = await bcrypt.hash(password, 10);
    data.password=hashedPassword
    const lead =data;
    return await leadRepository.saveLead(lead);
  },


 
 
};


module.exports = leadService;
