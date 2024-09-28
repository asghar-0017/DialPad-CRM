const {agentService,agentAuthService}= require('../service/agentService');
const {agentRepository,authAgentRepository}=require('../repository/agentRepository')
const agentId=require('../utils/token')
const reviewId=require('../utils/token')
const taskId=require('../utils/token')
const generateAgentId=require('../utils/token')
const fs = require('fs');
const agentTask=require('../entities/agentTask')
const path = require('path');
const xlsx = require('xlsx');

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

const isPascalCase = (str) => {
  return /^[A-Z][a-z]+(?:[A-Z][a-z]+)*$/.test(str); // Matches only PascalCase format
};

const toPascalCase = (str) => {
  if (isPascalCase(str)) {
    return str;
  }
  const words = str.match(/[A-Za-z][a-z]*/g) || []; 

  const pascalCaseStr = words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
    .join(''); 

  // Special cases for customer feedback
  if (['customer', 'feedback', 'customerfeedback', 'feedbackcustomer'].includes(pascalCaseStr.toLowerCase())) {
    return 'CustomerFeedBack'; 
  }

  return pascalCaseStr;
};

const convertKeysToPascalCase = (data) => {
  const result = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const pascalCaseKey = toPascalCase(key);
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
      return res.status(400).send(`
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
                text-align: center;
              }
              .container {
                max-width: 600px;
                margin: auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                background-color: #007bff;
                color: #ffffff;
                padding: 20px;
                border-radius: 8px 8px 0 0;
              }
              .content {
                padding: 20px;
              }
              .btn {
                display: inline-block;
                padding: 10px 20px;
                font-size: 16px;
                color: #fcfffe;
                background-color: #28a745;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
                text-align: center;
              }
              .footer {
                background-color: #333;
                color: #ffffff;
                padding: 10px;
                font-size: 12px;
                border-radius: 0 0 8px 8px;
              }
              img {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
              }
              @media (max-width: 768px) {
                .container {
                  padding: 15px;
                }
                .btn {
                  font-size: 14px;
                  padding: 8px 16px;
                }
              }
              @media (max-width: 480px) {
                .header {
                  font-size: 18px;
                  padding: 15px;
                }
                .content {
                  padding: 15px;
                }
                .btn {
                  font-size: 12px;
                  padding: 6px 12px;
                }
                img {
                  width: 100%;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Email Verification</h1>
              </div>
              <div class="content">
                <h2>Invalid or Expired Token</h2>
                <p>It seems that the verification link is invalid or expired. Please try again.</p>
                <a href="https://dialpad-crm-production.up.railway.app/login" class="btn">Back to Login</a>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} SoftMark Solutions. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `);
    }

    if (tempAgent.isActivated) {
      return res.status(400).send(`
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
                text-align: center;
              }
              .container {
                max-width: 600px;
                margin: auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                background-color: #007bff;
                color: #ffffff;
                padding: 20px;
                border-radius: 8px 8px 0 0;
              }
              .content {
                padding: 20px;
              }
              .btn {
                display: inline-block;
                padding: 10px 20px;
                font-size: 16px;
                color: #fcfffe;
                background-color: #28a745;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
                text-align: center;
              }
              .footer {
                background-color: #333;
                color: #ffffff;
                padding: 10px;
                font-size: 12px;
                border-radius: 0 0 8px 8px;
              }
              @media (max-width: 768px) {
                .container {
                  padding: 15px;
                }
                .btn {
                  font-size: 14px;
                  padding: 8px 16px;
                }
              }
              @media (max-width: 480px) {
                .header {
                  font-size: 18px;
                  padding: 15px;
                }
                .content {
                  padding: 15px;
                }
                .btn {
                  font-size: 12px;
                  padding: 6px 12px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Email Verification</h1>
              </div>
              <div class="content">
                <h2>User Already Registered</h2>
                <p>Your email has already been verified. You can proceed to login.</p>
                <a href="https://dialpad-crm-production.up.railway.app/login" class="btn">Proceed to Login</a>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} SoftMark Solutions. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `);
    }

    const hashedPassword = await bcrypt.hash(tempAgent.password, 10);
    tempAgent.password = hashedPassword;
    tempAgent.isActivated = true;

    try {
      await agentRepository.saveAgent(tempAgent);
      await agentRepository.deleteTempAgentById(tempAgent.id);

      res.status(200).send(`
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
                text-align: center;
              }
              .container {
                max-width: 600px;
                margin: auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                background-color: #007bff;
                color: #ffffff;
                padding: 20px;
                border-radius: 8px 8px 0 0;
              }
              .content {
                padding: 20px;
              }
              .btn {
                display: inline-block;
                padding: 10px 20px;
                font-size: 16px;
                color: #fcfffe;
                background-color: #28a745;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
                text-align: center;
              }
              .footer {
                background-color: #333;
                color: #ffffff;
                padding: 10px;
                font-size: 12px;
                border-radius: 0 0 8px 8px;
              }
              img {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
              }
              @media (max-width: 768px) {
                .container {
                  padding: 15px;
                }
                .btn {
                  font-size: 14px;
                  padding: 8px 16px;
                }
              }
              @media (max-width: 480px) {
                .header {
                  font-size: 18px;
                  padding: 15px;
                }
                .content {
                  padding: 15px;
                }
                .btn {
                  font-size: 12px;
                  padding: 6px 12px;
                }
                img {
                  width: 100%;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Email Verification</h1>
              </div>
              <div class="content">
              <img src="/public/images/Logo.png" alt="Success" class="success-image">
                <h2>Email Verified Successfully!</h2>
                <p>Your email has been successfully verified.</p>
                <a href="https://dialpad-crm-production.up.railway.app/login" class="btn">Proceed to Login</a>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} SoftMark Solutions. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `);

    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).send(`
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
                  text-align: center;
                }
                .container {
                  max-width: 600px;
                  margin: auto;
                  background-color: #ffffff;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                  background-color: #007bff;
                  color: #ffffff;
                  padding: 20px;
                  border-radius: 8px 8px 0 0;
                }
                .content {
                  padding: 20px;
                }
                .btn {
                  display: inline-block;
                  padding: 10px 20px;
                  font-size: 16px;
                  color: #fcfffe;
                  background-color: #28a745;
                  text-decoration: none;
                  border-radius: 5px;
                  margin-top: 20px;
                  text-align: center;
                }
                .footer {
                  background-color: #333;
                  color: #ffffff;
                  padding: 10px;
                  font-size: 12px;
                  border-radius: 0 0 8px 8px;
                }
                @media (max-width: 768px) {
                  .container {
                    padding: 15px;
                  }
                  .btn {
                    font-size: 14px;
                    padding: 8px 16px;
                  }
                }
                @media (max-width: 480px) {
                  .header {
                    font-size: 18px;
                    padding: 15px;
                  }
                  .content {
                    padding: 15px;
                  }
                  .btn {
                    font-size: 12px;
                    padding: 6px 12px;
                  }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Email Verification</h1>
                </div>
                <div class="content">
                  <h2>User Already Registered</h2>
                  <p>Your email is already registered. Please proceed to login.</p>
                  <a href="https://dialpad-crm-production.up.railway.app/login" class="btn">Back to Login</a>
                </div>
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} SoftMark Solutions. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `);
      }
      console.error("Error verifying email:", error.message);
      res.status(500).send(`
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
                text-align: center;
              }
              .container {
                max-width: 600px;
                margin: auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                background-color: #007bff;
                color: #ffffff;
                padding: 20px;
                border-radius: 8px 8px 0 0;
              }
              .content {
                padding: 20px;
              }
              .btn {
                display: inline-block;
                padding: 10px 20px;
                font-size: 16px;
                color: #fcfffe;
                background-color: #28a745;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
                text-align: center;
              }
              .footer {
                background-color: #333;
                color: #ffffff;
                padding: 10px;
                font-size: 12px;
                border-radius: 0 0 8px 8px;
              }
              @media (max-width: 768px) {
                .container {
                  padding: 15px;
                }
                .btn {
                  font-size: 14px;
                  padding: 8px 16px;
                }
              }
              @media (max-width: 480px) {
                .header {
                  font-size: 18px;
                  padding: 15px;
                }
                .content {
                  padding: 15px;
                }
                .btn {
                  font-size: 12px;
                  padding: 6px 12px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Email Verification</h1>
              </div>
              <div class="content">
                <h2>Oops!</h2>
                <p>There was an issue verifying your email. Please try again later.</p>
                <a href="https://dialpad-crm-production.up.railway.app/login" class="btn">Back to Login</a>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} SoftMark Solutions. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('Error verifying email:', error.message);
    res.status(500).send(`
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
              text-align: center;
            }
            .container {
              max-width: 600px;
              margin: auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              background-color: #007bff;
              color: #ffffff;
              padding: 20px;
              border-radius: 8px 8px 0 0;
            }
            .content {
              padding: 20px;
            }
            .btn {
              display: inline-block;
              padding: 10px 20px;
              font-size: 16px;
              color: white;
              background-color: #28a745;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
              text-align: center;
            }
            .footer {
              background-color: #333;
              color: #ffffff;
              padding: 10px;
              font-size: 12px;
              border-radius: 0 0 8px 8px;
            }
            @media (max-width: 768px) {
              .container {
                padding: 15px;
              }
              .btn {
                font-size: 14px;
                padding: 8px 16px;
              }
            }
            @media (max-width: 480px) {
              .header {
                font-size: 18px;
                padding: 15px;
              }
              .content {
                padding: 15px;
              }
              .btn {
                font-size: 12px;
                padding: 6px 12px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verification</h1>
            </div>
            <div class="content">
              <h2>Oops!</h2>
              <p>There was an issue verifying your email. Please try again later.</p>
              <a href="https://dialpad-crm-production.up.railway.app/agentLogin" class="btn">Back to Login</a>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} SoftMark Solutions. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `);
    }
},


    getAgent:async(io,req,res)=>{
    try{
        const result=await agentService.agentGetInService(); 
        if(!result || result.length==0){
          return res.status(404).send({Data:`Data not Found with ${agentId}`})
        }
        const data = result.map(agent => {
        const { id,agentId, firstName, lastName, email, phone, role ,isActivated,created_at,updated_at} = agent;
        return {id, agentId, firstName, lastName, email, phone, role,isActivated,created_at,updated_at };
     
    });
    io.emit('receive_message', data);

        res.status(201).json({ message: 'success', data:data });
      }
     catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
    },

    getAgentById: async (io,req, res) => {
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
                  isActivated:result.isActivated,
                  created_at:result.created_at,
                  update_at:result.updated_at

              };
              res.status(200).json({ message: 'Success', data });
              io.emit('receive_message', data);

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

    deleteAgent:async(io,req,res)=>{
      try{
        const agentId=req.params.agentId
        const user = req.user;
        const result=await agentService.agentDeleteByIdInService(agentId,user); 
        res.status(201).json({ message: 'success', data:result });
        io.emit('receive_message', result);

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
        taskData.leadId = taskId(); 
        taskData.agentId=agentId
        console.log("agent Id", agentId);

        const latestTask = await getLatestTaskForAgent(agentId);
        let taskNo = latestTask ? latestTask.taskNo + 1 : 1; 
    
        const data = await agentService.assignTaskToAgent(agentId, taskData, taskData.leadId,taskNo);
    
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
            if (!data || !Array.isArray(data.agentTasks)) {
          console.error('Unexpected data format received:', data);
          return res.status(500).send({ message: 'Unexpected data format received.' });
        }
    
        const agentTasks = data.agentTasks;
            if (agentTasks.length === 0) {
          return res.status(404).send({ message: 'No tasks found for this agent.' });
        }
            const transformedData = agentTasks.map(task => {
          const { DynamicData, ...rest } = task;
              const dynamicData = typeof DynamicData === 'object' && !Array.isArray(DynamicData) ? DynamicData : {};
    
          return {
            ...rest,
            ...dynamicData, 
            taskNo: task.taskNo,
            status: task.status,
            created_at: task.created_at,
            updated_at: task.updated_at
          };
        });
            io.emit('receive_message', transformedData);
            res.status(200).send({ message: 'Success', data: transformedData });
    
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
        console.log("Data",data)
    
        
        const transformedData = data.map(task => {
          if (task.DynamicData) {
            return {
              agentId:task.agentId,
              taskNo: task.taskNo, 
              status: task.status, 
              ...task.DynamicData,
              created_at:task.created_at,
              updated_at: task.updated_at


            };
          }
          return {
            agentId:task.agentId,
            taskNo: task.taskNo,
            ...task,
          };
        });
    
        io.emit('receive_message', transformedData);
        res.status(200).send({ message: 'Success',agentId:transformedData[0].agentId, data:transformedData });
      } catch (error) {
        console.error('Error fetching tasks by agent ID:', error.message);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    },

    getAssignTaskByTaskNo: async (io, req, res) => {
      try {
        const agentId = req.params.agentId;
        const taskNo = req.params.taskNo;
        const data = await agentService.getAssignTaskToAgentByTaskNO(agentId, taskNo);
        if (!data || data.length === 0) {
          return res.status(404).send({ message: 'No tasks found for this agent.' });

        }
        console.log("Dara",data)
            const transformedData = data.map(task => {
          if (task.DynamicData) {
            return {
              agentId,
              taskNo,
              status:data[0].status,
              ...task.DynamicData,
            };
          }
          return task; 
        });
    
        io.emit('receive_message', transformedData);
        res.status(200).send({ message: 'Success', taskNo:taskNo, data:transformedData });
      } catch (error) {
        console.error('Error fetching tasks by agent ID:', error.message);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    },
    
    
    getAssignTaskByTaskId: async (io,req, res) => {
      try {
        const leadId = req.params.leadId;
        const task = await agentService.getAssignTaskToAgentByTaskId(leadId);
    
        if (task) {
          res.status(200).send({ message: 'Success', data: task });
          io.emit('receive_message', task);

        } else {
          res.status(404).send({ message: 'Data Not Found' });
        }

      } catch (error) {
        console.error('Error fetching task by task ID:', error.message);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    },
    
    updateAssignTaskById: async (io, req, res) => {
      try {
        
        const data = req.body;
          const leadId = req.params.leadId;
          const user = req.user;
  
          const lead = await agentService.updateAssignTaskToAgentById({ data, leadId, user });
      const formattedLead = {
        ...lead.dynamicLead,
     
    };
          if (formattedLead && formattedLead.CustomerFeedBack !== 'followUp') {
              delete formattedLead.FollowUpDetail;
          }
          if (formattedLead && formattedLead.CustomerFeedBack !== 'other') {
              delete formattedLead.otherDetail;
          }
          
          io.emit('receive_message', lead);
          res.status(201).json({ message: 'Lead Updated successfully', data: formattedLead });
      } catch (error) {
          res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
  },

    
  

    deleteAssignTaskByTaskId: async (io,req, res) => {
      try {
        const { taskId } = req.params; 
        const data = await agentService.deleteAssignTaskToAgentByTaskId(taskId);
        if (data === 'Data Not Found') {
          res.status(404).send({ message: 'Data Not Found' });
        } else {
          res.status(200).send({ message: 'Task Deleted Successfully', data });
        }
        io.emit('receive_message', data);

      } catch (error) {
        console.error('Error Deleting task:', error.message);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    },

    deleteAssignTaskByAgentId: async (io,req, res) => {
      try {
        const { agentId,taskNo } = req.params; 
        const data = await agentService.deleteAssignTaskToAgentByAgentId(agentId,taskNo);
        if (data === 'Data Not Found') {
          res.status(404).send({ message: 'Data Not Found' });
        } else {
          res.status(200).send({ message: 'Task Deleted Successfully', data });
        }
        io.emit('receive_message', data);
      } catch (error) {
        console.error('Error Deleting task:', error.message);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    },

    updateTaskStatus: async (io, req, res) => {
      try {
        const agentId = req.params.agentId;
        const taskNo = req.params.taskNo;
        const { status } = req.body;
    
        const data = await agentRepository.updateTaskStatus(agentId, taskNo, status);
    
        if (data) {
          io.emit('send_message', data);
          res.status(200).send({ message: "Task status updated successfully",status:data[0].status, data: data });
        } else {
          res.status(404).send({ message: "Task not found" });
        }
      } catch (error) {
        console.error('Error in updateTaskStatus:', error.message);
        res.status(500).send({ message: 'Error updating task status' });
      }
    },

    getTaskStatus: async (io, req, res) => {
      try {
        const agentId = req.params.agentId;
        const taskNo = req.params.taskNo;
            const task = await agentRepository.getTaskStatusByTaskNo(agentId, taskNo);
    
        if (task) {
          io.emit('send_message', task);  
          res.status(200).send({data: task.status });  
        } else {
          res.status(404).send({ message: "Task not found" });  
        }
      } catch (error) {
        console.error('Error in getTaskStatus:', error.message); 
        res.status(500).send({ message: 'Error retrieving task status' });  
      }
    },
    
    getAssignReviewByReviewId: async (io,req, res) => {
      try {
        const reviewId = req.params.reviewId;
        const review = await agentService.getAssignReviewToAgentByReviewId(reviewId);
    
        if (review) {
          res.status(200).send({ message: 'Success', data: review });
          io.emit('receive_message', review);

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


    assignReview: async (io,req, res) => {
      try {
        const agentId = req.params.agentId;
        const taskNo=req.params.taskNo
        const review = req.body;
        review.reviewId = reviewId(); 
    const task = await agentRepository.getTaskByTaskNo(agentId, taskNo);
    
    if (!task || task.status !== 'complete') {
      return res.status(400).send({ message: "Task must be complete before adding a review." });
    }
        const data = await agentService.assignReviewToAgent(agentId, review.review, review.reviewId,taskNo);
    
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
 
    getAssignReviewsById:async (io,req, res) => {
      try {
        const agentId = req.params.agentId;
        const taskNo=req.params.taskNo
        console.log("AgentId",agentId)
        const data = await agentService.getAssignReviewToAgentById(agentId,taskNo);
        if (data === 'Data Not Found') {
          res.status(404).send({ message: 'Data Not Found' });
        } else {
          res.status(200).send({ message: 'Success', data });
          io.emit('receive_message', data);

        }
      } catch (error) {
        console.error('Error fetching Reviews by agent ID:', error.message);
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
    
        const latestTask = await getLatestTaskForAgent(agentId);
        let initialTaskNo = latestTask ? latestTask.taskNo + 1 : 1;
    
        for (const row of results) {
          const convertedRow = convertKeysToPascalCase(row);
          const agent = await agentRepository.getAgentDataById(agentId);
    
          if (agent) {
            const leadId = reviewId();
    
            const taskData = {
              agentId,
              leadId,
              ...convertedRow,
            };
    
            if (taskData.PhoneNumber) {
              taskData.PhoneNumber = String(taskData.PhoneNumber);
            }
    
            const assignedTask = await agentRepository.assignTaskToAgentById(agentId, taskData, leadId, initialTaskNo);
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
        fs.unlinkSync(filePath);
      }
    },
    
    
    saveExcelFileDataOfCreateAgent :async (io, req, res) => {
      if (!req.file) {
          return res.status(400).json({ message: 'Please upload a CSV file.' });
      }
  
      const filePath = path.join(__dirname, '../uploads/', req.file.filename);
      try {
          const workbook = xlsx.readFile(filePath);
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const results = xlsx.utils.sheet_to_json(sheet);
  
          if (results.length === 0) {
              return res.status(400).json({ message: 'No data found in the file.' });
          }
  
          const agents = [];
          for (const row of results) {
              const { email, firstName, lastName, phone, password } = row; 
  
              if (!email) {
                  console.error("Email is missing in row:", row);
                  continue;
              }
  
              const existingAgent = await agentRepository.findByEmail(email);
              if (existingAgent) {
                  console.log(`User with email ${email} is already in the system.`);
                  continue;
              }
  
              const verificationToken = uuidv4(); 
              const agentId = generateAgentId();

              const agentTemp = {
                
                 agentId,
                  email,
                  firstName,
                  lastName,
                  phone,
                  password,
                  verifyToken: verificationToken,
                  isActivated: false, 
              };
                await agentRepository.saveTempAgent(agentTemp);
                await sendVerificationEmail(email, verificationToken, firstName || 'User');
  
              agents.push({ email, status: 'Verification Email Sent' });
          }
          io.emit('send_message', agents);

          return res.status(200).json({ message: 'Emails sent', agents });
      } catch (error) {
          console.error('Error processing the CSV file:', error);
          return res.status(500).json({ message: 'Internal Server Error' });
      } finally {
          fs.unlinkSync(filePath); 
      }
    }
  }

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
    
  forgotPassword: async (request, response) => {
    try {
      const { email } = request.body;
      const checkEmail=await authAgentRepository.findByEmail(email)
      if(checkEmail){
        if(checkEmail.isActivated==true){
        const code = generateResetCode();
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
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).send({ message: 'No token provided' });
      }
      const token = authHeader.split(' ')[1];
      const isValidToken = await agentAuthService.validateAgentToken(token,next);
      if (!isValidToken) {
        next()
        return response.status(401).send({ message: 'Invalid token' });
      }

      const decoded = jwt.verify(token, secretKey);
      const user = await authAgentRepository.findByEmail(decoded.email);
      if (!user) {
        return response.status(401).send({ message: 'User not found' });
      }

      request.user = user;
      next();   
    } catch (error) {
      response.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
  },

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


