const {taskRepository}=require('../repository/taskRepository')

const trashService = {
    createTaskService:async(taskData)=>{
    try{
        const data=await taskRepository.uploadTaskDb(taskData)
        return data
    }catch(error){
        throw error
    }
}
}

module.exports=trashService