const {agentService,agentAuthService}= require('../service/agentService');
const {agentRepository,authAgentRepository}=require('../repository/agentRepository')
const agentId=require('../utils/token')
const taskId=require('../utils/token')
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');



const agentController = {

    createAgent: async (req, res) => {
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
          res.status(201).json({ message: 'Agent registered successfully', agent });
        } catch (error) {
          res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },

    getAgent:async(req,res)=>{
    try{
        const result=await agentService.agentGetInService(); 
       
    const data = result.map(agent => {
        const { id,agentId, firstName, lastName, email, phone, role } = agent;
        return {id, agentId, firstName, lastName, email, phone, role };
      });
        res.status(201).json({ message: 'success', data:data });
      }
     catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
    },

    getAgentById:async(req,res)=>{
      try{
        const agentId=req.params.agentId
        const result=await agentService.agentGetByIdInService(agentId); 
       
    const data = {
         id:result.id,agentId:result.agentId, firstName:result.firstName, lastName:result.lastName, email:result.email, phone:result.phone, role : result.role
    };
        res.status(201).json({ message: 'success', data:data });
      }
     catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
    },

    updateAgent:async(req,res)=>{
      try{
        const agentId=req.params.agentId
        const {firstName,lastName,email,phone}=req.body
        const user = req.user;
        const result=await agentService.agentUpdateByIdInService(agentId,{firstName,lastName,email,phone},user); 
        res.status(201).json({ message: 'success', data:result });
      }
     catch (error) {
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
    assignTask: async (req, res) => {
      try {
        const leadId = req.params.leadId;
        const task = req.body;
        task.taskId = taskId(); 
        console.log("Task Id", task.taskId);
    
        const data = await agentService.assignTaskToAgent(leadId, task, task.taskId);
    
        if (data) {
          res.status(200).send({ message: "success", data: data });
        } else {
          res.status(404).send({ message: "data Not Found" });
        }
      } catch (error) {
        console.error('Error in assignTask:', error.message);
        res.status(500).send({ message: 'Error assigning task' });
      }
    },
    
    getAssignTask:async(req,res)=>{
      try{
        const data=await agentService.getAssignTaskToAgent()
        if(data){
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
    getAssignTaskByTaskId:async (req, res) => {
      try {
        const taskId = req.params.taskId;
        const data = await agentService.getAssignTaskToAgentByTaskId(taskId);
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
    updateAssignTaskById: async (req, res) => {
      try {
        const { agentId, taskId } = req.params;  // Correct destructuring
        const bodyData = req.body;
        console.log("agentId",agentId)
        console.log("TaskId",taskId)
        console.log("task",bodyData)
        const data = await agentService.updateAssignTaskToAgentById(agentId, taskId, bodyData);
        if (data === 'Data Not Found') {
          res.status(404).send({ message: 'Data Not Found' });
        } else {
          res.status(200).send({ message: 'Task Updated Successfully', data });
        }
      } catch (error) {
        console.error('Error Updating task:', error.message);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    },
    
    deleteAssignTaskById: async (req, res) => {
      try {
        const { agentId, taskId } = req.params;  // Pass both agentId and taskId
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
    // const path = require('path');
    // const fs = require('fs');
    // const xlsx = require('xlsx');
    // const agentRepository = require('../repositories/agentRepository'); // Adjust import based on your project structure
    // const leadService = require('../services/leadService'); // Adjust import based on your project structure
    
    saveExcelFileData: async (req, res) => {
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
                  continue; // Skip this row and move to the next one
              }
  
              const agent = await agentRepository.getAgentDataById(row.agentId);
              if (agent) {
                  row.taskId = taskId(); // Assuming taskId() is a function that generates a unique ID
                  console.log("Task Id", taskId);
  
                  const assignedTask = await agentService.assignTaskToAgent(row.agentId, row.task, row.taskId);
                  tasksAssigned.push(assignedTask);
  
              } else {
                  console.error("Agent not found for agentId:", row.agentId);
                  continue; // Skip this row if the agent is not found
              }
          }
  
          if (tasksAssigned.length > 0) {
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
   


    


};
  

const adminService = require('../service/authService');
const generateResetCode = require('../utils/token');
const { sendResetEmail } = require('../service/resetEmail');
const jwt = require('jsonwebtoken');
const authRepository=require('../repository/authRepository')
const {logger}=require('../../logger');
const dataSource = require('../infrastructure/psql');
const { request } = require('express');

require('dotenv').config()

const secretKey = process.env.SCERET_KEY;

const agentAuthController = {
  login: async (req,res) => {
    try {
      const { email, password } = req.body;
      console.log("body",req.body)
      const agent = await agentAuthService.login( { email, password })
      if(agent){
        res.status(200).send({token:agent})
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
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).send({ message: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        const agent = await authAgentRepository.findTokenByToken(token);

        if (agent) {
          agent.verifyToken = ''; 
          await authAgentRepository.save(agent);
          logger.info('Agent Logout Success');
          res.status(200).send({ message: 'Logged out successfully' });
        } else {
          res.status(401).send({ message: 'Invalid token' });
        }
      } catch (error) {
        logger.error('Error during agent logout', error);
        res.status(500).send({ message: 'Internal Server Error', error: error.message });
        throw error
      }
    },
    
  forgotPassword: async (request, response) => {
    try {
      const { email } = request.body;
      const checkEmail=await authAgentRepository.findByEmail(email)
      if(checkEmail){
        const code = generateResetCode();
        console.log("Generate code",code)
        await agentAuthService.saveResetCode(code,email);
        await sendResetEmail(email, code);
        response.status(200).send({ message: 'Password reset code sent.' });
      } else {
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
      const isValidToken = await agentAuthService.validateAgentToken(token);
      console.log("Is validate Token",isValidToken)
      if (!isValidToken) {
        return response.status(401).send({ message: 'Invalid token' });
      }

      const decoded = jwt.verify(token, secretKey);
      const user = await agentAuthService.findUserById(decoded.userName);
      console.log("User",user)
      if (!user) {
        return response.status(401).send({ message: 'User not found' });
      }

      request.user = user;
      console.log("agent User", user);
      next();   
    } catch (error) {
      response.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
  },

  verifyToken: async (request, response) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).send({ code: 401, message: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, secretKey);


      const user = await agentAuthService.findUserById(decoded.userName);
      if (!user) {
        return response.status(401).send({ code: 401, message: 'Invalid token' });
      }

      return response.status(200).send({ code: 200, isValid: true });
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return response.status(401).send({ code: 401, message: 'Invalid token' });
      }
      return response.status(500).send({ code: 500, message: 'Internal Server Error', error: error.message });
    }
  },
};

module.exports = { agentAuthController,agentController };


