const trashService=require('../service/trashService')

const trashController = {
    getLeadTrash:async(req,res)=>{
        try{
            const data=await trashService.getDataFromTrash()
            if(data){
                res.status(200).send({message:"success",data:data})
            }
            return res.status(404).json({ message: 'Data Not Found' });
        }catch(error){
            return res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    }
}
module.exports= trashController