const trashRepository=require('../repository/trashRepository')

const trashService = {
    getDataFromTrash:async()=>{
    try{
        const data=await trashRepository.getLeadTrashDataFromRepo()
        return data
    }catch(error){
        throw error
    }
}
}
module.exports=  trashService