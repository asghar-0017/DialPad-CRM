const cloudnaryController=require('../controller/cloudnaryController')
const combinedAuthenticate=require('../middleware/permission')
const {checkRole}=require('../middleware/checkRole')
const upload=require('../config/multerConfig')

const cloudnaryRoute = (app) => {
    app.post('/upload',combinedAuthenticate, checkRole(['admin']), upload.single('image') , cloudnaryController.uploadImage);
    app.get('/image/:id',combinedAuthenticate, checkRole(['admin']), upload.single('image') , cloudnaryController.getImageFromCloudnary);
};

module.exports = cloudnaryRoute;
