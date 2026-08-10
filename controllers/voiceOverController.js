const Movie = require("../models/movieModel");
const { generateVoiceOver } = require("../services/voiceOverService");
const { parseAIResponse } = require("../utils/parser");

const createVoiceOver = async (req, res) => {
  try {
    const movie = req.movie;

    const prompt = `You are writing a nostalgic personal memory narration.

Write like a real human remembering moments.

Use contractions like I'm, We've, It's.

Keep sentences short.

Sound conversational.

Avoid documentary language.

Add natural pauses.

Make it emotional but simple.

Create a voice-over narration for each movie scene.

Movie Title:
${movie.title}

Theme:
${movie.theme}

Story:
${movie.story}

Scenes:
${movie.screenplay?.scenes
  ?.map(
    (scene) => `
Scene ${scene.sceneNumber}
Title: ${scene.title}
Visual: ${scene.visual}
`
  )
  .join("\n")}

Return ONLY this JSON:

{
  "voiceOver": [
    {
      "sceneNumber": 1,
      "text": "..."
    }
  ]
}

Rules:
- One narration for each scene.
- Narration should be emotional.
- Keep each narration between 20 and 40 words.
- Return valid JSON only.
- No markdown.
- No explanation.
`;

    const response = await generateVoiceOver(prompt);
    const voiceOver = parseAIResponse(response);

    movie.voiceOver = voiceOver;
    await movie.save();

    res.status(200).json({
      success: true,
      message: "Voice-over generated successfully",
      data: { voiceOver },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to generate voice-over",
      error: error.message,
    });
  }
};

module.exports = {
  createVoiceOver,
};
