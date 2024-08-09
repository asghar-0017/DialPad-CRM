const bcrypt = require('bcryptjs');
const authRepository = require('../repository/authRepository');
const { logger } = require('../../logger');
const jwt = require('jsonwebtoken');
const dataSource = require('../infrastructure/psql');
const auth = require('../entities/auth');
require('dotenv').config(); // Ensure this line is at the top

const secretKey = process.env.SCERET_KEY; // Fixed typo
if (!secretKey) {
  throw new Error('SECRET_KEY environment variable is not set.');
}
const adminService = {
  login: async ( { userName, password }) => {
    try {
      const admin=await authRepository.findByUserName(userName)
      if (admin) {
        const match = await bcrypt.compare(password, admin.password);
        if (match) {
          const token = jwt.sign({ userName: admin.userName }, secretKey, { expiresIn: '10h' });
          admin.verifyToken = token;
          await authRepository.save(admin);
          logger.info('Admin Login Success');
          return token
        }
      }
      logger.warn('Admin Login Failed');
      return null;
    } catch (error) {
      logger.error('Error during admin login', error);
      throw error;
    }
  },

   saveResetCode :async (code, email) => {
    try {
      const admin = await authRepository.findByEmail(email);
      if (!admin) {
        throw new Error('Admin not found');
      }
      admin.resetCode = code;
            await dataSource.getRepository(auth).save(admin);
      
      console.log("Reset code stored successfully:", code);
    } catch (error) {
      logger.error('Error saving reset code', error);
      throw error;
    }
  },
  


  validateAdminToken: async (token) => {
    try {
      console.log("Token",token)
      const storedToken = await authRepository.findTokenByToken(token)
      console.log("Store token find",storedToken.verifyToken)
       if(storedToken.verifyToken==token){
        return true
       }
      
    } catch (error) {
      logger.error('Error validating admin token', error);
      throw error;
    }
  },


  validateResetCode: async (code) => {
    try {
     const token= await authRepository.findByToken(code); 
      if(token){
        return true
      }else{
        return false
      }
    } catch (error) {
      logger.error('Error validating reset code', error);
      throw error;
    }
  },

  updatePassword: async (newPassword) => {
    try {
      const email = authRepository.email;
      const admin = await authRepository.findByEmail(email);

      if (admin) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        admin.password = hashedPassword;
        await authRepository.save(admin);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Error updating password', error);
      throw error;
    }
  },

  findUserById: async (userName) => {
    try {
      const user = await authRepository.findByUserName(userName);
      return user;
    } catch (error) {
      logger.error('Error finding user by ID', error);
      throw error;
    }
  },
};

module.exports = adminService;
