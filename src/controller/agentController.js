const {agentService,agentAuthService}= require('../service/agentService');
const {agentRepository,authAgentRepository}=require('../repository/agentRepository')
const agentId=require('../utils/token')
const reviewId=require('../utils/token')
const taskId=require('../utils/token')
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const generateResetCode = require('../utils/token');
const { sendResetEmail } = require('../service/resetEmail');
const jwt = require('jsonwebtoken');
const {logger}=require('../../logger');
const adminService = require('../service/authService');
require('dotenv').config()
const secretKey = process.env.SCERET_KEY;


const agentController = {

    createAgent: async (io,req, res) => {
        try {
          const data = req.body;
          console.log("data",data)
          const email = req.body.email;
          data.agentId=agentId()
          const existingAgent = await agentRepository.findByEmail(email);
          if (existingAgent) {
            return res.status(400).json({ message: 'User already registered' });
          }
          const agent = await agentService.agentCreateService(data);
          io.emit('send_message', agent);

          res.status(201).json({ message: 'Agent registered successfully', agent });

        } catch (error) {
          res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },

    getAgent:async(io,req,res)=>{
    try{
        const result=await agentService.agentGetInService(); 
        if(!result || result.length==0){
          return res.status(404).send({Data:`Data not Found with ${agentId}`})
        }
        const data = result.map(agent => {
        const { id,agentId, firstName, lastName, email, phone, role ,isActivated} = agent;
        return {id, agentId, firstName, lastName, email, phone, role,isActivated };
     
    });
    io.emit('receive_message', data);

        res.status(201).json({ message: 'success', data:data });
      }
     catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
    },

    getAgentById: async (req, res) => {
      try {
          const agentId = req.params.agentId;
          const result = await agentService.agentGetByIdInService(agentId); 
          if (result) {
              const data = {
                  id: result.id,
                  agentId: result.agentId,
                  firstName: result.firstName,
                  lastName: result.lastName,
                  email: result.email,
                  phone: result.phone,
                  role: result.role,
                  isActivated:result.isActivated
              };
              res.status(200).json({ message: 'Success', data });
          } else {
              res.status(404).json({ message: `Data not found for agentId ${agentId}` });
          }
      } catch (error) {
          console.error('Error fetching agent data:', error);
          res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
  },
  
    updateAgent:async(io,req,res)=>{
      try {
        const agentId = req.params.agentId;
        const { firstName, lastName, email, phone } = req.body;
        const user = req.user;
            const result = await agentService.agentUpdateByIdInService(agentId, { firstName, lastName, email, phone }, user);
    
        if (result) {
            res.status(201).json({ message: 'success', data: result });
            io.emit('receive_message', result);
          } else {
            res.status(404).json({ message: 'Agent not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },

    deleteAgent:async(req,res)=>{
      try{
        const agentId=req.params.agentId
        const user = req.user;
        const result=await agentService.agentDeleteByIdInService(agentId,user); 
        res.status(201).json({ message: 'success', data:result });
      }
     catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
        throw error
      }
    },

    assignTask: async (io,req, res) => {
      try {
        const agenId = req.params.agentId;
        const task = req.body;
        task.taskId = taskId(); 
        console.log("agent Id", agenId);
    
        const data = await agentService.assignTaskToAgent(agenId, task.task, task.taskId);
    
        if (data) {
          io.emit('send_message', data);
          res.status(200).send({ message: "success", data: data });
        } else {
          res.status(404).send({ message: "data Not Found" });
        }
      } catch (error) {
        console.error('Error in assignTask:', error.message);
        res.status(500).send({ message: 'Error assigning task' });
      }
    },
    
    getAssignTask:async(io,req,res)=>{
      try{
        const data=await agentService.getAssignTaskToAgent()
        if(data){
          io.emit('receive_message', data);
          res.status(200).send({message:"success",data:data})
        }else{
          res.status(404).send({message:"data Not Found"})
        }
      }catch(error){
        throw error
      }
    },

    getAssignTaskById:async (req, res) => {
      try {
        const agentId = req.params.agentId;
        const data = await agentService.getAssignTaskToAgentById(agentId);
        if (data === 'Data Not Found') {
          res.status(404).send({ message: 'Data Not Found' });
        } else {
          res.status(200).send({ message: 'Success', data });
        }
      } catch (error) {
        console.error('Error fetching tasks by agent ID:', error.message);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    },

    getAssignTaskByTaskId: async (req, res) => {
      try {
        const taskId = req.params.taskId;
        const task = await agentService.getAssignTaskToAgentByTaskId(taskId);
    
        if (task) {
          res.status(200).send({ message: 'Success', data: task });
        } else {
          res.status(404).send({ message: 'Data Not Found' });
        }
      } catch (error) {
        console.error('Error fetching task by task ID:', error.message);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    },
    
    updateAssignTaskById: async (io,req, res) => {
      try {
        const { taskId } = req.params;
        const bodyData = req.body;
        console.log("TaskId",taskId)
        console.log("task",bodyData)
        const data = await agentService.updateAssignTaskToAgentById(taskId, bodyData);
        if (data === 'Data Not Found') {
          res.status(404).send({ message: 'Data Not Found' });
        } else {
          io.emit('receive_message', data);
          res.status(200).send({ message: 'Task Updated Successfully', data });
        }
      } catch (error) {
        console.error('Error Updating task:', error.message);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    },
    
    deleteAssignTaskById: async (req, res) => {
      try {
        const { agentId, taskId } = req.params; 
        const data = await agentService.deleteAssignTaskToAgentById(agentId, taskId);
        if (data === 'Data Not Found') {
          res.status(404).send({ message: 'Data Not Found' });
        } else {
          res.status(200).send({ message: 'Task Deleted Successfully', data });
        }
      } catch (error) {
        console.error('Error Deleting task:', error.message);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    },

    deleteAssignTaskByTaskId: async (req, res) => {
      try {
        const { taskId } = req.params; 
        const data = await agentService.deleteAssignTaskToAgentByTaskId(taskId);
        if (data === 'Data Not Found') {
          res.status(404).send({ message: 'Data Not Found' });
        } else {
          res.status(200).send({ message: 'Task Deleted Successfully', data });
        }
      } catch (error) {
        console.error('Error Deleting task:', error.message);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    },
    assignReview: async (io,req, res) => {
      try {
        const agenId = req.params.agentId;
        const review = req.body;
        review.reviewId = reviewId(); 
    
        const data = await agentService.assignReviewToAgent(agenId, review.review, review.reviewId);
    
        if (data) {
          io.emit('send_message', data);
          res.status(200).send({ message: "success", data: data });
        } else {
          res.status(404).send({ message: "data Not Found" });
        }
      } catch (error) {
        console.error('Error in assignTask:', error.message);
        res.status(500).send({ message: 'Error assigning task' });
      }
    },
    getAssignReviewsById:async (req, res) => {
      try {
        const agentId = req.params.agentId;
        console.log("AgentId",agentId)
        const data = await agentService.getAssignReviewToAgentById(agentId);
        if (data === 'Data Not Found') {
          res.status(404).send({ message: 'Data Not Found' });
        } else {
          res.status(200).send({ message: 'Success', data });
        }
      } catch (error) {
        console.error('Error fetching Reviews by agent ID:', error.message);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    },
    getAssignReviewByReviewId: async (req, res) => {
      try {
        const reviewId = req.params.reviewId;
        const review = await agentService.getAssignReviewToAgentByReviewId(reviewId);
    
        if (review) {
          res.status(200).send({ message: 'Success', data: review });
        } else {
          res.status(404).send({ message: 'Data Not Found' });
        }
      } catch (error) {
        console.error('Error fetching task by task ID:', error.message);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    },
    updateAssignReviewById: async (io,req, res) => {
      try {
        const { reviewId } = req.params;
        const bodyData = req.body;
        console.log("ReviewId",reviewId)
        console.log("Review",bodyData)
        const data = await agentService.updateAssignReviewToAgentById(reviewId, bodyData);
        if (data === 'Data Not Found') {
          res.status(404).send({ message: 'Data Not Found' });
        } else {
          io.emit('receive_message', data);
          res.status(200).send({ message: 'Task Updated Successfully', data });
        }
      } catch (error) {
        console.error('Error Updating task:', error.message);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    },
    deleteAssignReviewByReviewId: async (req, res) => {
      try {
        const { reviewId } = req.params; 
        const data = await agentService.deleteAssignReviewToAgentByReviewId(reviewId);
        if (data === 'Data Not Found') {
          res.status(404).send({ message: 'Data Not Found' });
        } else {
          res.status(200).send({ message: 'Task Deleted Successfully', data });
        }
      } catch (error) {
        console.error('Error Deleting task:', error.message);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    },

    saveExcelFileData: async (io,req, res) => {
      if (!req.file) {
          return res.status(400).json({ message: 'Please upload an Excel file.' });
      }
      const filePath = path.join(__dirname, '../uploads/', req.file.filename);
      try {
          const workbook = xlsx.readFile(filePath);
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const results = xlsx.utils.sheet_to_json(sheet);
  
          if (results.length === 0) {
              return res.status(400).json({ message: 'No data found in the Excel file.' });
          }
          const requiredColumns = ['agentId', 'task'];
          const sampleRow = results[0];
          const missingColumns = requiredColumns.filter(col => !sampleRow.hasOwnProperty(col));
  
          if (missingColumns.length > 0) {
              return res.status(400).json({ message: `Missing required columns: ${missingColumns.join(', ')}` });
          }
          const tasksAssigned = [];
          for (const row of results) {
              if (!row.agentId || !row.task) {
                  console.error("Missing required fields in row:", row);
                  continue;
              }
              const agent = await agentRepository.getAgentDataById(row.agentId);
              if (agent) {
                  row.taskId = taskId();   
                  const assignedTask = await agentService.assignTaskToAgent(row.agentId, row.task, row.taskId);
                  tasksAssigned.push(assignedTask);
              } else {
                  console.error("Agent not found for agentId:", row.agentId);
                  continue; 
              }
          }
          if (tasksAssigned.length > 0) {
            io.emit('send_message', tasksAssigned);

              return res.status(200).json({ message: 'Tasks assigned successfully', data: tasksAssigned });
          } else {
              return res.status(400).json({ message: 'No tasks were assigned due to missing data or agent not found.' });
          }
      } catch (error) {
          console.error('Error processing the Excel file:', error);
          res.status(500).json({ message: 'Internal Server Error', error: error.message });
      } finally {
          fs.unlinkSync(filePath); 
      }
  },
   


  saveExcelFileDataOfCreateAgent: async (io,req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload an Excel file.' });
    }
    const filePath = path.join(__dirname, '../uploads/', req.file.filename);
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const results = xlsx.utils.sheet_to_json(sheet);
        if (results.length === 0) {
            return res.status(400).json({ message: 'No data found in the Excel file.' });
        }
        const requiredColumns = ['firstName', 'lastName', 'email', 'phone', 'password'];
        const sampleRow = results[0];
        const missingColumns = requiredColumns.filter(col => !sampleRow.hasOwnProperty(col));

        if (missingColumns.length > 0) {
            return res.status(400).json({ message: `Missing required columns: ${missingColumns.join(', ')}` });
        }
        const createAgent = [];
        for (const row of results) {
            if (!row.firstName || !row.lastName || !row.email || !row.phone || !row.password) {
                console.error("Missing required fields in row:", row);
                continue; 
            }
            const email = row.email;
            try {
                const existingAgent = await agentRepository.findByEmail(email);
                if (existingAgent) {
                    console.log(`User with email ${email} already registered.`);
                    continue;
                }
                row.agentId = agentId(); 
                const agent = await agentService.agentCreateService(row);
                createAgent.push(agent); 
            } catch (err) {
                console.error(`Error creating agent for email ${email}:`, err.message);
            }
        }
        if (createAgent.length > 0) {
          io.emit('send_message', tasksAssigned);

            return res.status(201).json({ message: 'Agents registered successfully', agents: createAgent });
        } else {
            return res.status(400).json({ message: 'No agents were created.' });
        }
    } catch (error) {
        console.error('Error processing the Excel file:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    } finally {
        fs.unlinkSync(filePath); 
    }
}

};
  

const agentAuthController = {
  login: async (req,res) => {
    try {
      const { email, password } = req.body;
      const agent = await agentAuthService.login( { email, password })
      console.log("Agent Login ",agent)
      if(agent){

        res.status(200).send(agent)
      }
      else{
        res.status(404).send({message:"invalid UserName and Password"})
      }
    }
     catch (error) {
      logger.error('Error during agent login', error);
      throw error;
    }
  },

//   logout: async (req, res) => {
//     try {
//         console.log("API Hit: Logout");

//         const authHeader = req.headers.authorization;
//         if (!authHeader || !authHeader.startsWith('Bearer ')) {
//             return res.status(401).send({ message: 'No token provided' });
//         }

//         const token = authHeader.split(' ')[1];

//         // Check if token belongs to an admin
//         const admin = await authRepository.findTokenByToken(token);
//         if (admin) {
//             admin.verifyToken = '';
//             await authRepository.save(admin);
//             logger.info('Admin Logout Success');
//             return res.status(200).send({ message: 'Logged out successfully' });
//         }

//         // Check if token belongs to an agent
//         const agent = await authAgentRepository.findTokenByToken(token);
//         if (agent) {
//             agent.verifyToken = '';
//             await agentRepository.saveAgent(agent);
//             logger.info('Agent Logout Success');
//             return res.status(200).send({ message: 'Logged out successfully' });
//         }

//         // If token doesn't match any user
//         return res.status(401).send({ message: 'Invalid token' });

//     } catch (error) {
//         logger.error('Error during logout:', error);
//         res.status(500).send({ message: 'Internal Server Error', error: error.message });
//         throw error;
//     }
// },


    
  forgotPassword: async (request, response) => {
    try {
      const { email } = request.body;
      const checkEmail=await authAgentRepository.findByEmail(email)
      if(checkEmail){
        if(checkEmail.isActivated==true){
        const code = generateResetCode();
        console.log("Generate code",code)
        await agentAuthService.saveResetCode(code,email);
        await sendResetEmail(email, code);
        response.status(200).send({ message: 'Password reset code sent.' });
      }else{
        response.status(200).send({ message: 'You Are Blocked By Admin.' });
      } 
    }else {
        response.status(400).send({ message: "Invalid Email Address" });
      }
    }
    catch (error) {
      response.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
  
  },

  verifyResetCode: async (request, response) => {
    try {
      const { code } = request.body;
      console.log("code",code)
      const isCodeValid = await agentAuthService.validateResetCode(code);
      if (isCodeValid) {
        const agent = await authAgentRepository.findByToken(code);
        agent.resetCode = ''; 
          await authAgentRepository.save(agent);
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
      await agentAuthService.updatePassword(newPassword);
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
      const isValidToken = await agentAuthService.validateAgentToken(token,next);
      console.log("Is validate Token",isValidToken)
      if (!isValidToken) {
        next()
        return response.status(401).send({ message: 'Invalid token' });
      }

      const decoded = jwt.verify(token, secretKey);
      console.log("decode",decoded)
      const user = await authAgentRepository.findByEmail(decoded.email);
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
//   verifyToken: async (request, response) => {
//     try {
//         const authHeader = request.headers.authorization;
//         if (!authHeader || !authHeader.startsWith('Bearer ')) {
//             return response.status(401).send({ code: 401, message: 'No token provided' });
//         }

//         const token = authHeader.split(' ')[1];
//         let decoded;

//         try {
//             decoded = jwt.verify(token, secretKey);
//         } catch (error) {
//             console.log('Token verification error:', error);
//             return response.status(401).send({ code: 401, message: 'Invalid token' });
//         }

//         console.log("Decoded Token:", decoded);
//         console.log("Decoded UserName:", decoded.email);

//         console.log("Decoded Role:", decoded.role);

//         let user;
//         if (decoded.role === 'admin') {
//             user = await adminService.findUserById(decoded.userName);
//         } else if (decoded.role === 'agent') {
//             user = await authAgentRepository.findByEmail(decoded.email);
//         }

//         console.log("User from DB:", user);

//         // Check if the user exists and token matches
//         if (!user || user.verifyToken !== token) {
//             return response.status(401).send({ code: 401, message: 'Invalid token or role' });
//         }

//         return response.status(200).send({ code: 200, isValid: true, role: decoded.role });

//     } catch (error) {
//         if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
//             return response.status(401).send({ code: 401, message: 'Invalid token' });
//         }
//         return response.status(500).send({ code: 500, message: 'Internal Server Error', error: error.message });
//     }
// },




  updateAgentStatus: async (io,req, res) => {
    try {
        const { status } = req.body;
        const agentId = req.params.agentId;
        if (typeof status !== 'boolean') {
            return res.status(400).json({ message: 'Invalid status. Status must be a boolean value.' });
        }
        const data = await agentAuthService.updateAgentStatusByAgentId(status, agentId);
        if (!data) {
            return res.status(404).json({ message: 'Agent not found or update failed.' });
        }
        io.emit('send_message', data);

        res.status(200).json({ message: 'Status updated successfully', data: data });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
        console.error('Error updating agent status:', error); 
    }
}

  
};

module.exports = { agentAuthController,agentController };


