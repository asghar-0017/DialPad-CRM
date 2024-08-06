const adminService = require('../service/authService');
const  generateResetCode  = require('../utils/token');
const { sendResetEmail } = require('../service/resetEmail');
const redis = require('../infrastructure/redis');

const jwt = require('jsonwebtoken');

const secretKey = process.env.SCERET_KEY; // Replace with your secret key


const adminAuth = {
  login: async (request, response) => {
    try {
      const adminData = request.body;
      const data = await adminService.login(adminData);
      if (data) {
        await adminService.storeAdminToken(data.token);
        response.status(200).send({ message: 'Login Success', data });
      }else{
        response.status(404).send({message:"admin not Found"})
      }
    } catch (error) {
      throw error
    }
  },
 
  logout: async (request, response) => {
    try {
      const token = request.headers.authorization.split(' ')[1];
      const isValidToken = await adminService.validateAdminToken(token);
      if (isValidToken) {
        await adminService.logout(token);
        response.status(200).send({ message: 'Logout Success' });
      } else {
        response.status(400).send({ message: 'Failed to Logout: Invalid token or user.' });
      }
    } catch (error) {
      response.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
  },

  forgotPassword: async (request, response) => {
    try {
      const { email } = request.body;
      if(email === process.env.ADMIN_EMAIL){
        const code = generateResetCode();
        await adminService.saveResetCode(code);
        await sendResetEmail(email, code);
        response.status(200).send({ message: 'Password reset code sent.' });
      } else {
        response.status(400).send({ message: "Invalid Email Address" });
      }
    } catch (error) {
      response.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
  },

  verifyResetCode: async (request, response) => {
    try {
      const { code } = request.body;
      const isCodeValid = await adminService.validateResetCode(code);
      if (isCodeValid) {
        await redis.del(`${code}:resetCode`);
        response.status(200).send({ message: 'Code verified successfully.' });

      } else {
        response.status(400).send({ message: 'Invalid or expired code.' });
      }
    } catch (error) {
      response.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
  },

  resetPassword: async (request, response) => {
    try {
      const { newPassword } = request.body;
        await adminService.updatePassword(newPassword);
        response.status(200).send({ message: 'Password reset successfully.' });
 
    } catch (error) {
      response.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
  },
  authenticate: async (request, response, next) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).send({ message: 'No token provided' });
      }
  
      const token = authHeader.split(' ')[1];
      const isValidToken = await adminService.validateAdminToken(token);
      if (!isValidToken) {
        return response.status(401).send({ message: 'Invalid token' });
      }
  
      const storedToken = await redis.get(`admin:${token}`);
      if (storedToken !== token) {
        return response.status(401).send({ message: 'Token mismatch' });
      }
  
      next(); 
    } catch (error) {
      response.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
  },
  

  verifyToken: async (request, response) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).send({code:401, message: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, secretKey);
      
      const storedToken = await redis.get(`admin:${token}`);
      if (storedToken !== token) {
        return response.status(401).send({code:401, message: 'Token mismatch' });
      }

      const user = await adminService.findUserById(decoded.userName);
      if (!user) {
        return response.status(401).send({ code:401,message: 'Invalid token' });
      }

      return response.status(200).send({code:200, isValid: true });
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return response.status(401).send({code:401, message: 'Invalid token' });
      }
      return response.status(500).send({code:401, message: 'Internal Server Error', error: error.message });
    }
  },
};


module.exports = {adminAuth} ;
