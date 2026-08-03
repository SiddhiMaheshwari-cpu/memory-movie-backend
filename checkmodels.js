require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

async function listModels() {
    const models = await genAI.listModels();

    models.forEach((model) => {
        console.log(model.name);
        console.log(model.supportedGenerationMethods);
        console.log("----------------");
    });
}

listModels();