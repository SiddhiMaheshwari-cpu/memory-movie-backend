const { getCompletionText } = require("../utils/groqClient");

// ======================================================
// HELPER: SAFE JSON PARSING
// ======================================================
// AI models frequently disobey "Return only JSON" instructions and include markdown.
// This function strips markdown to prevent JSON.parse() from crashing the app.
const parseAIResponse = (text) => {
  try {
    const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("❌ AI JSON Parsing Error:", error.message);
    console.error("Raw AI Output:", text);
    throw new Error("AI returned malformed data. Please try again.");
  }
};

// ======================================================
// HELPER: RETRY LOGIC (Exponential Backoff)
// ======================================================
// AI APIs fail often due to rate limits or network timeouts.
// This wrapper automatically retries failed requests 3 times before giving up.
const withRetry = async (fn, retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.warn(`⚠️ AI Call failed (Attempt ${i + 1} of ${retries}): ${error.message}`);
      if (i === retries - 1) throw error;
      await new Promise((res) => setTimeout(res, delay * (i + 1))); // Wait before retrying
    }
  }
};

// ======================================================
// ANALYZE MOVIE
// ======================================================
const analyzeMovie = async (movie) => {
  try {
    console.log(`\n🤖 ANALYZING MOVIE: ${movie.title || 'Untitled'}`);

    const mediaSummary = [
      movie.photos?.length ? `Photos: ${movie.photos.map((p) => p.description || "photo").join(", ")}` : null,
      movie.videos?.length ? `Videos: ${movie.videos.map((v) => v.description || "video").join(", ")}` : null,
      movie.audio?.length ? `Audio clips: ${movie.audio.length}` : null,
      movie.chatScreenshots?.length ? `Chat screenshots: ${movie.chatScreenshots.length}` : null,
    ].filter(Boolean).join("\n");

    // 👉 YAHAN PROMPT UPDATE KIYA GAYA HAI 👈
    const prompt = `
You are an expert AI Memory Movie Assistant.

Analyze the following movie information and generate meaningful content.

Movie Title:
${movie.title || 'Untitled'}

Theme:
${movie.theme || 'General Memory'}

Media:
${mediaSummary || "No media uploaded yet"}

Return ONLY a valid JSON object.

Requirements:
- Fill every field. Do NOT leave anything empty.
- Do NOT return markdown. Do NOT use \`\`\`json.
- Timeline should contain 3-5 important events.
- Emotion MUST match the exact content. If the media shows code, software, or dashboards, use "Focused", "Analytical", or "Productive". Otherwise, use a suitable emotion.
- BackgroundMusic MUST be a single, simple keyword. If the media contains tech/coding/workspaces, output "electronic" or "synthwave". If it contains food/lifestyle/nature, output "upbeat" or "chill". NEVER use "melancholic" or "piano" for tech screenshots.
- PosterPrompt should describe a cinematic movie poster.
- Story should fit the exact theme of the media (e.g., an energetic tech journey, a peaceful vacation, etc.). Do NOT force sadness or melancholy unless explicitly shown.

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

    // Make the API call with retry protection
    const aiResponseText = await withRetry(async () => {
      return await getCompletionText({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });
    });

    // Safely parse the response into an object
    const parsedData = parseAIResponse(aiResponseText);
    console.log("✅ Movie Analysis Complete");
    
    return parsedData;

  } catch (error) {
    console.error("\n❌ MOVIE ANALYSIS FAILED:", error.message);
    throw new Error("Failed to analyze movie with AI.");
  }
};

// ======================================================
// GENERATE STORY
// ======================================================
const generateStory = async (prompt) => {
  try {
    console.log("\n🤖 GENERATING STORY...");
    
    const aiResponseText = await withRetry(async () => {
      return await getCompletionText({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "user", content: prompt }],
      });
    });

    console.log("✅ Story Generation Complete");
    return aiResponseText;

  } catch (error) {
    console.error("\n❌ STORY GENERATION FAILED:", error.message);
    throw new Error("Failed to generate story with AI.");
  }
};

module.exports = {
  generateStory,
  analyzeMovie,
};