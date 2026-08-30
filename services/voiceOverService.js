const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const generateVoiceOver = async (prompt) => {

    const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",

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