const bcrypt = require("bcryptjs");
const {
  agentRepository,
  authAgentRepository,
} = require("../repository/agentRepository");
const sendVerificationEmail = require("../mediater/sendMail");
const { logger } = require("../../logger");
const jwt = require("jsonwebtoken");
const Agent = require("../entities/agent");
const secretKey = process.env.SCERET_KEY;

const agentService = {
  agentGetInService: async () => {
    try {
      const data = await agentRepository.getAgentData();
      return data;
    } catch (error) {
      throw error;
    }
  },
  agentGetByIdInService: async (agentId) => {
    try {
      const data = await agentRepository.getAgentDataById(agentId);
      return data;
    } catch (error) {
      throw error;
    }
  },
  agentUpdateByIdInService: async (
    agentId,
    { firstName, lastName, email, phone },
    user
  ) => {
    try {
      const data = await agentRepository.updateAgentDataById(
        agentId,
        { firstName, lastName, email, phone },
        user
      );
      return data;
    } catch (error) {
      throw error;
    }
  },
  agentDeleteByIdInService: async (agentId, user) => {
    try {
      const data = await agentRepository.deleteAgentDataById(agentId, user);
      return data;
    } catch (error) {
      throw error;
    }
  },
  assignTaskToAgent: async (agentId, taskData, leadId, taskNo) => {
    try {
      console.log("Task Data in Service", taskData);
      const data = await agentRepository.assignTaskToAgentById(
        agentId,
        taskData,
        leadId,
        taskNo
      );
      return data;
    } catch (error) {
      throw error;
    }
  },

  getAssignTaskToAgent: async () => {
    try {
      const data = await agentRepository.getAssignTaskToAgent();
      return data;
    } catch (error) {
      throw error;
    }
  },
  getAssignTaskToAgentById: async (agenId) => {
    try {
      const data = await agentRepository.getAssignTaskToAgentById(agenId);
      return data;
    } catch (error) {
      throw error;
    }
  },
  getAssignTaskToAgentById: async (agentId) => {
    try {
      const data = await agentRepository.getAssignTaskToAgentById(agentId);
      return data;
    } catch (error) {
      console.error("Error in service:", error);
      throw new Error("Error retrieving tasks");
    }
  },

  getAssignTaskToAgentByTaskNO: async (agentId, taskNo) => {
    try {
      const data = await agentRepository.getAssignTaskToAgentByTaskNo(
        agentId,
        taskNo
      );
      return data;
    } catch (error) {
      console.error("Error in service:", error);
      throw new Error("Error retrieving tasks");
    }
  },

  getAssignTaskToAgentByTaskId: async (leadId) => {
    try {
      const data = await agentRepository.getAssignTaskToAgentByTaskId(leadId);
      return data;
    } catch (error) {
      throw error;
    }
  },
  updateAssignTaskToAgentById: async ({ data, leadId, user }) => {
    try {
      const result = await agentRepository.updateAssignTaskToAgentById({
        data,
        leadId,
        user,
      });
      return result;
    } catch (error) {
      throw error;
    }
  },

  deleteAssignTaskToAgentByTaskId: async (taskId) => {
    try {
      const data =
        await agentRepository.deleteAssignTaskToAgentByTaskIds(taskId);
      return data;
    } catch (error) {
      throw error;
    }
  },
  deleteAssignTaskToAgentByAgentId: async (agentId, taskNo) => {
    try {
      const data = await agentRepository.deleteAssignTaskToAgentByTaskId(
        agentId,
        taskNo
      );
      return data;
    } catch (error) {
      throw error;
    }
  },

  getAssignReviewToAgentByReviewId: async (reviewId) => {
    try {
      const data =
        await agentRepository.getAssignReviewToAgentByReviewId(reviewId);
      return data;
    } catch (error) {
      throw error;
    }
  },
  updateAssignReviewToAgentById: async (reviewId, bodyData) => {
    try {
      const data = await agentRepository.updateAssignReviewToAgentById(
        reviewId,
        bodyData
      );
      return data;
    } catch (error) {
      throw error;
    }
  },
  deleteAssignReviewToAgentByReviewId: async (reviewId) => {
    try {
      const data =
        await agentRepository.deleteAssignReviewToAgentByReviewId(reviewId);
      return data;
    } catch (error) {
      throw error;
    }
  },

  assignReviewToAgent: async (agentId, review, reviewId, taskNo) => {
    try {
      const data = await agentRepository.assignReviewToAgentById(
        agentId,
        review,
        reviewId,
        taskNo
      );
      return data;
    } catch (error) {
      throw error;
    }
  },

  getAssignReviewToAgentById: async (agenId, taskNo) => {
    try {
      const data = await agentRepository.getAssignReviewsToAgentById(
        agenId,
        taskNo
      );
      return data;
    } catch (error) {
      throw error;
    }
  },
};

const authRepository = require("../repository/authRepository");
const dataSource = require("../infrastructure/psql");
require("dotenv").config();

if (!secretKey) {
  throw new Error("SECRET_KEY environment variable is not set.");
}
const agentAuthService = {
  login: async ({ email, password }) => {
    try {
      const agent = await authAgentRepository.findByEmail(email);
      if (agent) {
        if (agent.isActivated == true) {
          console.log("agent in Service", agent);
          if (agent && (await bcrypt.compare(password, agent.password))) {
            const token = jwt.sign(
              { email: agent.email, role: agent.role, agenId: agent.agentId },
              secretKey,
              { expiresIn: "10h" }
            );
            agent.verifyToken = token;
            const Token = {
              token: agent.verifyToken,
              agent: agent,
            };
            await agentRepository.saveAgent(agent);

            logger.info("Login Success");
            return Token;
          }
        } else {
          return "Account Blocked";
        }
        logger.warn("Login Failed");
        return null;
      }
    } catch (error) {
      logger.error("Error during Agent login", error);
      throw new Error("Error during Agent login");
    }
  },

  saveResetCode: async (code, email) => {
    try {
      const agent = await authAgentRepository.findByEmail(email);
      if (!agent) {
        throw new Error("agent not found");
      }
      agent.resetCode = code;
      await dataSource.getRepository(Agent).save(agent);

      console.log("Reset code stored successfully:", code);
    } catch (error) {
      logger.error("Error saving reset code", error);
      throw error;
    }
  },

  validateAgentToken: async (token) => {
    try {
      console.log("Token", token);
      const storedToken = await authRepository.findTokenByToken(token);
      console.log("Store token find", storedToken.verifyToken);
      if (storedToken.verifyToken == token) {
        return true;
      }
    } catch (error) {
      logger.error("Error validating admin token", error);
      throw error;
    }
  },

  validateResetCode: async (code) => {
    try {
      const token = await authAgentRepository.findByToken(code);
      if (token) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      logger.error("Error validating reset code", error);
      throw error;
    }
  },

  updatePassword: async (newPassword) => {
    try {
      const email = agentRepository.email;
      const agent = await agentRepository.findByEmail(email);

      if (agent) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        agent.password = hashedPassword;
        await authAgentRepository.save(agent);
        return true;
      }

      return false;
    } catch (error) {
      logger.error("Error updating password", error);
      throw error;
    }
  },

  findUserById: async (userName) => {
    try {
      const user = await authAgentRepository.findByUserName(userName);
      return user;
    } catch (error) {
      logger.error("Error finding user by ID", error);
      throw error;
    }
  },
  validateAgentToken: async (token) => {
    try {
      const storedToken = await authAgentRepository.findTokenByToken(token);
      return storedToken && storedToken.verifyToken === token;
    } catch (error) {
      console.log("Error validating agent token", error);
      return false;
    }
  },
  updateAgentStatusByAgentId: async (status, agentId) => {
    try {
      const data = await authAgentRepository.updateStatusInRepo(
        status,
        agentId
      );
      return data;
    } catch (error) {
      throw error;
    }
  },
}

module.exports = { agentService, agentAuthService };
