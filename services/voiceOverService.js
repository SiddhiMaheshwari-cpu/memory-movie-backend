const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const generateVoiceOver = async (prompt) => {

    const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",

        messages: [
            {
                role: "user",
                content: prompt
            }
        ],

        response_format: {
            type: "json_object"
        }
    });

    return completion.choices[0].message.content;
};

module.exports = {
    generateVoiceOver
};