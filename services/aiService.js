const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});


const generateStory = async (prompt) => {

    const completion = await groq.chat.completions.create({
        messages:[
            {
                role:"user",
                content:prompt
            }
        ],
        model:"llama-3.1-8b-instant"
    });


    return completion.choices[0].message.content;

}
const analyzeMovie = async (movie) => {
    const prompt = `
You are an expert AI Memory Movie Assistant.

Analyze the following movie information and generate meaningful content.

Movie Title:
${movie.title}

Theme:
${movie.theme}

Memories:
${movie.memories}

Photos Uploaded:
${movie.photos.length}

Videos Uploaded:
${movie.videos.length}

Audio Uploaded:
${movie.audio.length}

Chat Screenshots Uploaded:
${movie.chatScreenshots.length}

Return ONLY a valid JSON object.

Requirements:
- Fill every field.
- Do NOT leave anything empty.
- Do NOT return markdown.
- Do NOT use \`\`\`json.
- Timeline should contain 3-5 important events.
- Emotion should be a single dominant emotion.
- BackgroundMusic should suggest one music style.
- PosterPrompt should describe a cinematic movie poster.
- Story should be emotional and cinematic.

JSON format:

{
  "summary": "string",
  "emotion": "string",
  "timeline": ["event1", "event2", "event3"],
  "backgroundMusic": "string",
  "posterPrompt": "string",
  "story": "string"
}
`;



    const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 0.7
    });

    return completion.choices[0].message.content;

};



module.exports = {
    generateStory,
    analyzeMovie
};