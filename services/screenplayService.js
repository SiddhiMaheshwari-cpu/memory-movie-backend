const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const generateScreenplay = async (movie) => {
  const prompt = `
You are an award-winning Hollywood screenplay writer.

Your job is to convert user memories into a cinematic screenplay.

Movie Details:

Title: ${movie.title}

Theme: ${movie.theme}

AI Summary:
${movie.aiSummary}

Emotion:
${movie.emotion}

Story:
${movie.story}

Timeline:
${movie.timeline.join(", ")}

Photos Uploaded:
${movie.photos.length}

Videos Uploaded:
${movie.videos.length}

Audio Uploaded:
${movie.audio.length}

Chat Screenshots Uploaded:
${movie.chatScreenshots.length}

Rules:

1. Return ONLY valid JSON.
2. No markdown.
3. No explanation.
4. Create 5-8 scenes.
5. Every scene must have:
   - sceneNumber
   - title
   - visual
   - narration
   - backgroundMusic
   - transition
   - duration

JSON Format:

{
  "movieTitle": "",
  "totalDuration": 90,
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "",
      "visual": "",
      "narration": "",
      "backgroundMusic": "",
      "transition": "",
      "duration": 8
    }
  ]
}
  IMPORTANT:
Return ONLY valid JSON.
Do not use markdown.
Do not add explanations.
Your response must be directly parsable using JSON.parse().
`;
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",

    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],

    response_format: {
      type: "json_object",
    },
  });
  return completion.choices[0].message.content;
};

module.exports = {
  generateScreenplay,
};
