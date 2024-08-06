const bcrypt = require('bcryptjs');
const redis = require('../infrastructure/redis');
const authRepository = require('../repository/authRepository');
const { logger } = require('../../logger');
const jwt = require('jsonwebtoken');

const secretKey = process.env.SCERET_KEY;


const adminService = {
  login: async (adminData) => {
    try {
      const { userName, password } = adminData;
      const admin = await authRepository.findByUserName(userName);

      if (admin) {
        const match = await bcrypt.compare(password, admin.password);
        if (match) {
          const token = jwt.sign({ userName: admin.userName }, secretKey, { expiresIn: '1h' });
          logger.info('Admin Login Success');
          return { token };
        }else{
          return "incorrect userName And password"
        }
      }

      logger.warn('Admin Login Failed');
      return null;
    } catch (error) {
      logger.error('Error during admin login', error);
      throw error;
    }
  },
  

  saveResetCode: async (code) => {
    try {
      await redis.set(`${code}:resetCode`, code, 'EX', 3600); // Code expires in 1 hour
    } catch (error) {
      logger.error('Error saving reset code to Redis', error);
      throw error;
    }
  },
  
  storeAdminToken: async (token) => {
    try {
      const storeAdminToken= await redis.set(`admin:${token}`,token,); // Token expires in 1 hour
      console.log("Store Admin Token",storeAdminToken)
    } catch (error) {
      logger.error('Error saving admin token to Redis', error);
      throw error;
    }
  },
  
  validateAdminToken: async (token) => {
    try {
      const storedToken = await redis.get(`admin:${token}`);
      console.log("Store Token",storedToken)
      return storedToken === token;
    } catch (error) {
      logger.error('Error validating admin token from Redis', error);
      throw error;
    }
  },

  logout: async (token) => {
    try {
      const result = await redis.del(`admin:${token}`);
      logger.info('Admin Logout Success');
      return result === 1;
    } catch (error) {
      logger.error('Error during admin logout', error);
      throw error;
    }
  },

  validateResetCode: async (code) => {
    try {
      const storedCode = await redis.get(`${code}:resetCode`);
      return storedCode === code;
    } catch (error) {
      logger.error('Error validating reset code from Redis', error);
      throw error;
    }
  },

  updatePassword: async (newPassword) => {
    try {
      const email=authRepository.email;
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
