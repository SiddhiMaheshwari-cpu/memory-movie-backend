const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const generateScreenplay = async (media) => {
  try {
    console.log("Generating screenplay...");

    const prompt = `
You are a professional cinematic storyteller.

Create a screenplay for a memory movie using the given media.

Media:
${JSON.stringify(media)}

Return ONLY valid JSON.

Format:

{
  "scenes":[
    {
      "sceneNumber":1,
      "title":"",
      "visual":"",
      "narration":"",
      "emotion":"",
      "duration":5
    }
  ]
}

Rules:
- Create emotional cinematic scenes.
- Match scenes with available media.
- Keep narration meaningful.
- Duration should be in seconds.
`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],

      model: "llama-3.3-70b-versatile",

      temperature: 0.7,
    });

    let result = completion.choices[0].message.content;

    // Remove markdown code block
    result = result
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const screenplay = JSON.parse(result);

    return screenplay;
  } catch (error) {
    console.log("Screenplay Generation Error:", error);

    throw error;
  }
};

module.exports = {
  generateScreenplay,
};
