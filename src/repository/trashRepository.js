const dataSource=require('../infrastructure/psql')
const leadTrash=require('../entities/trash/leadTrash')

const trashRepository = {
    getLeadTrashDataFromRepo:async()=>{
        try{
            const data=await dataSource.getRepository(leadTrash).find()
            return data
        }catch(error){

        }
    }
}
module.exports= trashRepository