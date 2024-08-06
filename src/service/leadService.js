const bcrypt = require('bcryptjs');
const redis = require('../infrastructure/redis');
const leadRepository = require('../repository/leadRepository');
const { logger } = require('../../logger');
const jwt = require('jsonwebtoken');



const leadService = {

  leadCreateService: async (data) => {
    try{
    const result= await leadRepository.saveLead(data);
    return result
    }catch(error){
        throw error
    }
  },
  leadReadService:async()=>{
    try{
        const result=await leadRepository.getLeadData()
        return result
    }catch(error){
        throw error
    }
  }

 
};


module.exports = leadService;
