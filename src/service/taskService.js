const {taskRepository}=require('../repository/taskRepository')

const trashService = {
    createTaskService:async(taskData)=>{
    try{
        const data=await taskRepository.uploadTaskDb(taskData)
        return data
    }catch(error){
        throw error
    }
},
getTaskFromDb:async()=>{
    try{
      const data=await taskRepository.getTaskFromUploadRepo()
      return data
    }catch(error){
      throw error
    }
  },
  deleteData:async()=>{
    try{
      const data=await taskRepository.remainingDeleteData()
      return data
    }catch(error){
      throw error
    }
  }
}

module.exports=trashService