const dataSource = require('../infrastructure/psql');  
const agentsTaskAssign = require('../entities/taskAssignAgents');  
const agents = require('../entities/agent');  
const agentTask = require('../entities/agentTask'); 
const followUp = require('../entities/followUp');  
const other=require('../entities/otherDetail')
const followUpRepository = dataSource.getRepository(followUp);  
const otherRepository = dataSource.getRepository(other);  
const cron = require('cron');  

const taskRepository = {
  uploadTaskDb: async (taskData) => {
    try {
      let taskEntity = {
        leadId: taskData.leadId,
        DynamicData: taskData,
      };
      return await dataSource.getRepository(agentsTaskAssign).save(taskEntity);
    } catch (error) {
      console.error("Error saving task:", error.message);
      throw error;
    }
  },
  
  // Assign tasks to agents
  assignTaskToAgents: async () => {
    try {
      const agentRepo = dataSource.getRepository(agents);
      const allAgents = await agentRepo.find();  // Get all agents

      const taskRepo = dataSource.getRepository(agentsTaskAssign);
      const tasks = await taskRepo
        .createQueryBuilder('task')
        .where('task.status = :status', { status: 'progress' })  // Get tasks in progress
        .limit(100)  // Limit tasks to 100 for processing
        .getMany();

      if (tasks.length === 0 || allAgents.length === 0) {
        console.log("No tasks or agents available");
        return;
      }

      for (let agent of allAgents) {
        const hasIncompleteTasks = await hasIncompleteTasksForAgent(agent.agentId);
        if (hasIncompleteTasks) {
          console.log(`Agent ${agent.agentId} has incomplete tasks, skipping assignment.`);
          continue; 
        }

        // Get the latest task number for the agent
        const latestTask = await getLatestTaskForAgent(agent.agentId);
        const currentTaskNo = latestTask ? latestTask.taskNo + 1 : 1;

        const taskBatch = tasks.splice(0, 10);  // Assign tasks in batches of 10
        if (taskBatch.length > 0) {
          await Promise.all(taskBatch.map(async (task) => {
            let agentTaskEntity = {
              agentId: agent.agentId,
              taskNo: currentTaskNo,
              leadId: task.leadId,
              status: 'progress',  // Mark task as 'in progress'
              DynamicData: task.DynamicData,
            };

            await dataSource.getRepository(agentTask).save(agentTaskEntity);
            await taskRepo.delete({ id: task.id });  // Remove task after assignment
            
            // Check and save follow-up data if exists
            if (task.DynamicData.CustomerFeedBack === 'followUp') {
              const followUpData = {
                  dynamicLead: agentTaskEntity,
                  agentId: agentTaskEntity.agentId,
                  leadId: agentTaskEntity.leadId,
              };
              const followUpEntity = followUpRepository.create(followUpData);
              await followUpRepository.save(followUpEntity);
              console.log("Task saved in FollowUp repository");
            }

            if (task.DynamicData.CustomerFeedBack === 'other') {
              const otherData = {
                  dynamicLead: agentTaskEntity,
                  agentId: agentTaskEntity.agentId,
                  leadId: agentTaskEntity.leadId,
              };
              const otherEntity = otherRepository.create(otherData);
              await otherRepository.save(otherEntity);
          }
          }));
          console.log(`Assigned ${taskBatch.length} tasks to agent ${agent.agentId}`);
        }
      }
    } catch (error) {
      console.error("Error assigning tasks to agents:", error.message);
    }
  },

  // Reassign tasks when the agent completes their current tasks
  reassignTasks: async (agentId) => {
    try {
      const agentTaskRepo = dataSource.getRepository(agentTask);

      const hasIncompleteTasks = await hasIncompleteTasksForAgent(agentId);
      if (!hasIncompleteTasks) {
        const taskRepo = dataSource.getRepository(agentsTaskAssign);
        const remainingTasks = await taskRepo.find({
          where: { status: 'progress' },  // Get tasks in 'progress'
          take: 10,  // Limit reassigned tasks to 10
        });

        if (remainingTasks.length > 0) {
          // Get the latest task number for the agent
          const latestTask = await getLatestTaskForAgent(agentId);
          const currentTaskNo = latestTask ? latestTask.taskNo + 1 : 1;

          await Promise.all(remainingTasks.map(async (task) => {
            let agentTaskEntity = {
              agentId: agentId,
              taskNo: currentTaskNo,
              leadId: task.leadId,
              status: 'progress',  // Mark reassigned task as 'in progress'
              DynamicData: task.DynamicData,
            };

            await agentTaskRepo.save(agentTaskEntity);
            await taskRepo.delete({ id: task.id });  // Remove after reassignment
            
            // Check and save follow-up data if exists
            if (task.DynamicData.CustomerFeedBack === 'followUp') {
              const followUpData = {
                  dynamicLead: agentTaskEntity,
                  agentId: agentTaskEntity.agentId,
                  leadId: agentTaskEntity.leadId,
              };
              const followUpEntity = followUpRepository.create(followUpData);
              await followUpRepository.save(followUpEntity);
              console.log("Task saved in FollowUp repository");
            }
            if (task.DynamicData.CustomerFeedBack === 'other') {
              const otherData = {
                  dynamicLead: agentTaskEntity,
                  agentId: agentTaskEntity.agentId,
                  leadId: agentTaskEntity.leadId,
              };
              const otherEntity = otherRepository.create(otherData);
              await otherRepository.save(otherEntity);
          }
          }));
          console.log(`Reassigned ${remainingTasks.length} tasks to agent ${agentId}`);
        }
      }
    } catch (error) {
      console.error("Error reassigning tasks:", error.message);
    }
  },
};

// Helper function to get the latest task for the agent
const getLatestTaskForAgent = async (agentId) => {
  try {
    const agentTaskRepository = dataSource.getRepository(agentTask);

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

// Helper function to check if an agent has any incomplete tasks
const hasIncompleteTasksForAgent = async (agentId) => {
  try {
    const agentTaskRepository = dataSource.getRepository(agentTask);

    const incompleteTasks = await agentTaskRepository.find({
      where: { agentId, status: 'progress' },  // Check tasks in 'progress'
    });

    return incompleteTasks.length > 0;
  } catch (error) {
    console.error('Error checking incomplete tasks for agent:', error.message);
    throw new Error('Error checking incomplete tasks');
  }
};

// Mark task as complete and trigger reassignment
const markTaskCompleteAndReassign = async (agentId, taskId) => {
  try {
    const agentTaskRepo = dataSource.getRepository(agentTask);

    // Update the task status to 'complete'
    await agentTaskRepo.update({ agentId, id: taskId }, { status: 'complete' });

    // Reassign tasks if needed
    await taskRepository.reassignTasks(agentId);
  } catch (error) {
    console.error("Error completing task and reassigning:", error.message);
  }
};

// Cron job to automatically assign tasks every minute
const cronJob = new cron.CronJob('* * * * * *', async () => {
  console.log('Running task assignment every minute...');
  await taskRepository.assignTaskToAgents();
});

cronJob.start();

module.exports = {
  taskRepository,
  markTaskCompleteAndReassign,
};
