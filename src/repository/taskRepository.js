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
  
  assignTaskToAgents: async () => {
    try {
      const agentRepo = dataSource.getRepository(agents);
      const allAgents = await agentRepo.find(); 

      const taskRepo = dataSource.getRepository(agentsTaskAssign);
      const tasks = await taskRepo
        .createQueryBuilder('task')
        .where('task.status = :status', { status: 'progress' })  
        .limit(100)  
        .getMany();

      if (tasks.length === 0 || allAgents.length === 0) {
        console.log("No tasks available");
        return;
      }

      for (let agent of allAgents) {
        const hasIncompleteTasks = await hasIncompleteTasksForAgent(agent.agentId);
        if (hasIncompleteTasks) {
          console.log(`Agent ${agent.agentId} has incomplete tasks, skipping assignment.`);
          continue; 
        }
        const latestTask = await getLatestTaskForAgent(agent.agentId);
        const currentTaskNo = latestTask ? latestTask.taskNo + 1 : 1;

        const taskBatch = tasks.splice(0, 10);  
        if (taskBatch.length > 0) {
          await Promise.all(taskBatch.map(async (task) => {
            let agentTaskEntity = {
              agentId: agent.agentId,
              taskNo: currentTaskNo,
              leadId: task.leadId,
              status: 'progress',  
              DynamicData: task.DynamicData,
            };

            await dataSource.getRepository(agentTask).save(agentTaskEntity);
            await taskRepo.delete({ id: task.id });  
            
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

  reassignTasks: async (agentId) => {
    try {
      const agentTaskRepo = dataSource.getRepository(agentTask);

      const hasIncompleteTasks = await hasIncompleteTasksForAgent(agentId);
      if (!hasIncompleteTasks) {
        const taskRepo = dataSource.getRepository(agentsTaskAssign);
        const remainingTasks = await taskRepo.find({
          where: { status: 'progress' }, 
          take: 10, 
        });

        if (remainingTasks.length > 0) {
          const latestTask = await getLatestTaskForAgent(agentId);
          const currentTaskNo = latestTask ? latestTask.taskNo + 1 : 1;

          await Promise.all(remainingTasks.map(async (task) => {
            let agentTaskEntity = {
              agentId: agentId,
              taskNo: currentTaskNo,
              leadId: task.leadId,
              status: 'progress',  
              DynamicData: task.DynamicData,
            };

            await agentTaskRepo.save(agentTaskEntity);
            await taskRepo.delete({ id: task.id });  
            
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
    
  getTaskFromUploadRepo: async () => {
    try {
      const agentTaskSaveRepository = dataSource.getRepository(agentsTaskAssign);
      const agentTasksData = await agentTaskSaveRepository.find();
      console.log("data in Repo",agentTasksData)
      return agentTasksData
      
    } catch (error) {
      throw error;
    }
  },

  remainingDeleteData:async()=>{
    try{
      const agentTaskSaveRepository = await dataSource.getRepository(agentsTaskAssign);
      const deleteData = await agentTaskSaveRepository.createQueryBuilder()
      .delete()
      .from(agentsTaskAssign)
      .execute();

    return deleteData;
    }catch(error){
      throw error
    }
  }


};

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

const hasIncompleteTasksForAgent = async (agentId) => {
  try {
    const agentTaskRepository = dataSource.getRepository(agentTask);

    const incompleteTasks = await agentTaskRepository.find({
      where: { agentId, status: 'progress' },  
    });

    return incompleteTasks.length > 0;
  } catch (error) {
    console.error('Error checking incomplete tasks for agent:', error.message);
    throw new Error('Error checking incomplete tasks');
  }
};

const markTaskCompleteAndReassign = async (agentId, taskId) => {
  try {
    const agentTaskRepo = dataSource.getRepository(agentTask);
    await agentTaskRepo.update({ agentId, id: taskId }, { status: 'complete' });
    await taskRepository.reassignTasks(agentId);
  } catch (error) {
    console.error("Error completing task and reassigning:", error.message);
  }
};

// const cronJob = new cron.CronJob('* * * * *', async () => {
//   console.log('Running task assignment every minute...');
//   await taskRepository.assignTaskToAgents();
// });

// cronJob.start();

module.exports = {
  taskRepository,
  markTaskCompleteAndReassign,
};
