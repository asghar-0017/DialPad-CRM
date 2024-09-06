const {agentService,agentAuthService}= require('../service/agentService');
const {agentRepository,authAgentRepository}=require('../repository/agentRepository')
const agentId=require('../utils/token')
const reviewId=require('../utils/token')
const taskId=require('../utils/token')
const fs = require('fs');
const agentTask=require('../entities/agentTask')
const path = require('path');
const xlsx = require('xlsx');
const { TableColumn, Table } = require("typeorm");

const generateResetCode = require('../utils/token');
const { sendResetEmail } = require('../service/resetEmail');
const jwt = require('jsonwebtoken');
const {logger}=require('../../logger');
const adminService = require('../service/authService');
require('dotenv').config()
const secretKey = process.env.SCERET_KEY;
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const sendVerificationEmail=require('../mediater/sendMail')
const dataSource=require('../infrastructure/psql')



const getLatestTaskForAgent=async (agentId) => {
  try {
    const agentTaskRepository = dataSource.getRepository('agentTask');

    // Find the highest taskNo for the given agentId
    const latestTask = await agentTaskRepository
      .createQueryBuilder('agentTask')
      .where('agentTask.agentId = :agentId', { agentId })
      .orderBy('agentTask.taskNo', 'DESC')
      .getOne();

    return latestTask;
  } catch (error) {
    console.error('Error fetching latest task for agent:', error.message);
    throw new Error('Error fetching latest task number');
  }
};


const toPascalCase = (str) => {
  return str
    .replace(/\s(.)/g, function (match, group1) {
      return group1.toUpperCase();
    })
    .replace(/^(.)/, function (match, group1) {
      return group1.toUpperCase();
    })
    .replace(/\s+/g, ''); // Remove remaining spaces
};

const convertKeysToPascalCase = (data) => {
  const result = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      // Convert the column name to PascalCase
      const pascalCaseKey = toPascalCase(key);

      // Set the value for the PascalCase key
      result[pascalCaseKey] = data[key];
    }
  }
  return result;
};



const agentController = {

  createAgent: async (io, req, res) => {
    try {
      const data = req.body;
      const email = data.email;
      data.agentId=agentId()
      const existingAgent = await agentRepository.findByEmail(email);
      
      if (existingAgent) {
        return res.status(400).json({ message: 'User already registered' });
      }

      const verificationToken = uuidv4();
      data.verifyToken = verificationToken;
      data.isActivated = false; 
      await agentRepository.saveTempAgent(data);

      await sendVerificationEmail(email, verificationToken, data.firstName);

      res.status(201).json({ message: 'Verification email sent successfully' });

    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },

  verifyEmail: async (req, res) => {
    try {
      const { email, verificationToken } = req.query;
      const tempAgent = await agentRepository.findTempAgentByEmailAndToken(email, verificationToken);

      if (!tempAgent) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
      }
      const hashedPassword = await bcrypt.hash(tempAgent.password, 10);
      tempAgent.password = hashedPassword;
      tempAgent.isActivated = true;
      await agentRepository.saveAgent(tempAgent);
      await agentRepository.deleteTempAgentById(tempAgent.id);
      res.status(200).send("Email Verified Successfully");

    } catch (error) {
      console.error("Error verifying email:", error.message);
      res.status(500).send({ message: 'Internal Server Error' });
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
        const agentId = req.params.agentId;
        const taskData = req.body;
        taskData.taskId = taskId(); 
        console.log("agent Id", agentId);

        const latestTask = await getLatestTaskForAgent(agentId);
        let taskNo = latestTask ? latestTask.taskNo + 1 : 1; // Increment taskNo for new upload
    
        const data = await agentService.assignTaskToAgent(agentId, taskData, taskData.taskId,taskNo);
    
        if (data) {
          res.status(200).send({ message: "success", data: data });
          io.emit('send_message', data);
        } else {
          res.status(404).send({ message: "data Not Found" });
        }
      } catch (error) {
        console.error('Error in assignTask:', error.message);
        res.status(500).send({ message: 'Error assigning task' });
      }
    },
    
    getAssignTask: async (io, req, res) => {
      try {
        const data = await agentService.getAssignTaskToAgent();
        console.log("Data in controller", data);
    
        if (data && data.agentTasks && data.agentTasks.length > 0) {
          // Filter out null or undefined values from each task
          const filteredData = data.agentTasks.map(task => {
            return Object.fromEntries(
              Object.entries(task).filter(([key, value]) => value !== null && value !== undefined)
            );
          });
              io.emit('receive_message', filteredData);
    
          res.status(200).send({ message: "Success", data: filteredData });
        } else {
          res.status(404).send({ message: "Data Not Found" });
        }
      } catch (error) {
        console.error('Error fetching tasks:', error.message);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    },
    
    

    getAssignTaskById: async (io, req, res) => {
      try {
        const agentId = req.params.agentId;
        const data = await agentService.getAssignTaskToAgentById(agentId);
        
        if (!data || data.length === 0) {
          return res.status(404).send({ message: 'No tasks found for this agent.' });
        }
        
        const filteredData = data.map(task => {
          return Object.fromEntries(
            Object.entries(task).filter(([key, value]) => value !== null && value !== undefined)
          );
        });
    
        io.emit('receive_message', filteredData);
        res.status(200).send({ message: 'Success', data: filteredData });
      } catch (error) {
        console.error('Error fetching tasks by agent ID:', error.message);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    },


    getAssignTaskByTaskNo: async (io, req, res) => {
      try {
        const agentId = req.params.agentId;
        const taskNo = req.params.taskNo;
        console.log("Task No", taskNo);
    
        // Fetch tasks using the service method
        const data = await agentService.getAssignTaskToAgentByTaskNO(agentId, taskNo);
    
        if (!data || data.length === 0) {
          return res.status(404).send({ message: 'No tasks found for this agent.' });
        }
            const formattedData = data.map(task => {
          const { agentId, id, taskId, taskNo, created_at, updated_at, ...dynamicData } = task;
    
          return {
            DynamicData: dynamicData
          };
        });
    
        io.emit('receive_message', formattedData);
        res.status(200).send({ message: 'Success', data: formattedData });
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

 
    


    saveExcelFileData: async (io, req, res) => {
      if (!req.file) {
        return res.status(400).json({ message: 'Please upload an Excel file.' });
      }
    
      const agentId = req.params.agentId;
      const filePath = path.join(__dirname, '../uploads/', req.file.filename);
    
      try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const results = xlsx.utils.sheet_to_json(sheet);
    
        if (results.length === 0) {
          return res.status(400).json({ message: 'No data found in the Excel file.' });
        }
    
        const tasksAssigned = [];
    
        // Find the highest taskNo for the agent
        const latestTask = await getLatestTaskForAgent(agentId);
        let taskNo = latestTask ? latestTask.taskNo + 1 : 1; // Increment taskNo for new upload
    
        const taskid = taskId(); // Generate a new taskId for the current upload
    
        for (const row of results) {
          const convertedRow = convertKeysToPascalCase(row);
          const agent = await agentRepository.getAgentDataById(agentId);
    
          if (agent) {
            const taskData = {
              agentId,
              taskId: taskid,
              ...convertedRow,
            };
    
            if (taskData.PhoneNumber) {
              taskData.PhoneNumber = String(taskData.PhoneNumber);
            }
    
            // Assign incremented taskNo for each CSV upload
            const assignedTask = await agentRepository.assignTaskToAgentById(agentId, taskData, taskid, taskNo);
            tasksAssigned.push(assignedTask);
          } else {
            console.error("Agent not found for agentId:", agentId);
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
        fs.unlinkSync(filePath); // Clean up the uploaded file
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
          io.emit('send_message', createAgent);

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


