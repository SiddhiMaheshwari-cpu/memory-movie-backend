const multeer=require('multer');
const path=require('path');
const storage=multeer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads/');
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+path.extname(file.originalname));
    }
});
const upload=multeer({storage:storage});
module.exports=upload;