const { getCompletionText } = require("../utils/groqClient");

const analyzeMovie = async (movie) => {
  const mediaSummary = [
    movie.photos?.length
      ? `Photos: ${movie.photos.map((p) => p.description || "photo").join(", ")}`
      : null,
    movie.videos?.length
      ? `Videos: ${movie.videos.map((v) => v.description || "video").join(", ")}`
      : null,
    movie.audio?.length
      ? `Audio clips: ${movie.audio.length}`
      : null,
    movie.chatScreenshots?.length
      ? `Chat screenshots: ${movie.chatScreenshots.length}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `
You are an expert AI Memory Movie Assistant.

Analyze the following movie information and generate meaningful content.

Movie Title:
${movie.title}

Theme:
${movie.theme}

Media:
${mediaSummary || "No media uploaded yet"}

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

  return getCompletionText({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });
};

const generateStory = async (prompt) => {
  return getCompletionText({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
  });
};

module.exports = {
  generateStory,
  analyzeMovie,
};
