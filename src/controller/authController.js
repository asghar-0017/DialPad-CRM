const adminService = require('../service/authService');
const generateResetCode = require('../utils/token');
const { sendResetEmail } = require('../service/resetEmail');
const jwt = require('jsonwebtoken');
const authRepository=require('../repository/authRepository')
const {logger}=require('../../logger');
const { authAgentRepository, agentRepository } = require('../repository/agentRepository');

require('dotenv').config()

const secretKey = process.env.SCERET_KEY;

const adminAuth = {
  login: async (req,res) => {
    try {
      const { userName, password } = req.body;
      const admin = await adminService.login( { userName, password })
      if(admin){
        res.status(200).send({token:admin})
      }else{
        res.status(404).send({message:"invalid UserName and Password"})
      }
    }
     catch (error) {
      logger.error('Error during admin login', error);
      throw error;
    }
  },

  logout: async (req, res) => {
    try {
        console.log("API Hit: Logout");

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).send({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        const admin = await authRepository.findTokenByToken(token);
        if (admin) {
            admin.verifyToken = '';
            await authRepository.save(admin);
            logger.info('Admin Logout Success');
            return res.status(200).send({ message: 'Logged out successfully' });
        }
        const agent = await authAgentRepository.findTokenByToken(token);
        if (agent) {
            agent.verifyToken = '';
            await agentRepository.saveAgent(agent);
            logger.info('Agent Logout Success');
            return res.status(200).send({ message: 'Logged out successfully' });
        }
        return res.status(401).send({ message: 'Invalid token' });

    } catch (error) {
        logger.error('Error during logout:', error);
        return res.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
},


    
  forgotPassword: async (request, response) => {
    try {
      const { email } = request.body;
      if (email === "rajaasgharali009@gmail.com") {
        const code = generateResetCode();
        console.log("Generate code",code)
        await adminService.saveResetCode(code,email);
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
        const admin = await authRepository.findByToken(code);
          admin.resetCode = ''; 
          await authRepository.save(admin);

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
      console.log("API hit");
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).send({ message: 'No token provided' });
      }
      const token = authHeader.split(' ')[1];
      const isValidToken = await adminService.validateAdminToken(token,next);
      console.log("Is validate Token",isValidToken)
      if (!isValidToken) {
        next()
        return response.status(401).send({ message: 'Invalid token' });
      }

      const decoded = jwt.verify(token, secretKey);
      const user = await adminService.findUserById(decoded.userName);
      console.log("User",user)
      if (!user) {
        return response.status(401).send({ message: 'User not found' });
      }

      request.user = user;
      console.log("User", user);
      next();   
    } catch (error) {
      response.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
  },
 
  

  verifyToken: async (request, response) => {
    try {
      console.log("Aoi hit")
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return response.status(401).send({ code: 401, message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        let decoded;

        try {
            decoded = jwt.verify(token, secretKey);
        } catch (error) {
            console.log('Token verification error:', error);
            return response.status(401).send({ code: 401, message: 'Invalid or expired token' });
        }

        let user;
        if (decoded.role === 'admin') {
            user = await adminService.findUserById(decoded.userName);
        } else if (decoded.role === 'agent') {
            user = await authAgentRepository.findByEmail(decoded.email);
        }
        console.log("User",user)
        if (!user || user.verifyToken !== token) {
            return response.status(401).send({ code: 401, message: 'Invalid token or role' });
        }

        return response.status(200).send({ code: 200, isValid: true, role: decoded.role });

    } catch (error) {
        console.error('Unexpected error:', error);
        return response.status(500).send({ code: 500, message: 'Internal Server Error', error: error.message });
    }
},


};

module.exports = { adminAuth };
