const swaggerJsdoc = require("swagger-jsdoc");

const swaggerUi = require("swagger-ui-express");

const options = {

  definition:{
    openapi:"3.0.0",

    info:{
      title:"AI Memory Movie API",
      version:"1.0.0",
      description:
      "API documentation for AI Memory Movie Generator",
    },

    components:{
      securitySchemes:{
        bearerAuth:{
          type:"http",
          scheme:"bearer",
          bearerFormat:"JWT"
        }
      }
    }

  },

  apis:[
    "./routes/*.js"
  ]

};


const swaggerSpec = swaggerJsdoc(options);


module.exports={
swaggerUi,
swaggerSpec
};