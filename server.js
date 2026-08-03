
    
    require("dotenv").config();
    const express=require("express");
    const app=express();
    app.use(express.json());
    const routes=require("./routes/testRoutes");
    const movieRoutes=require("./routes/movieRoutes");
    const aiRoutes=require("./routes/aiRoutes");
 
    const connectDB=require("./config/db");

    const uploadRoutes=require("./routes/uploadRoutes");
    const cloudinary = require("./config/cloudinary");
    const scenePlannerRoutes = require("./routes/scenePlannerRoutes");

    const videoRendererRoutes = require("./routes/videoRendererRoutes");
    
    app.use("/api/test",routes);
    app.use("/",movieRoutes);
    app.use("/",uploadRoutes);
    app.use("/",aiRoutes);
    app.use("/movies", scenePlannerRoutes);
    app.use("/movies", videoRendererRoutes);
    connectDB();

           
    const PORT=process.env.PORT || 5000;
    app.listen(PORT,()=>{
        console.log(`Server is running on port ${PORT}`);
    });

   