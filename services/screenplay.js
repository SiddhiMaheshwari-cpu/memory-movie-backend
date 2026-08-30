const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ============================================================
// RATE LIMIT & RETRY SETTINGS
// ============================================================
const BATCH_SIZE = 5;
const BATCH_DELAY = 10000; 
const MAX_API_RETRIES = 2; 
const MAX_BATCH_RETRIES = 3; 

// ============================================================
// SLEEP
// ============================================================
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================
// GROQ CALL WITH AUTOMATIC 429 RETRY
// ============================================================
const callGroqWithRetry = async (prompt, batchStart, batchEnd) => {
  let attempt = 0;

  while (attempt < MAX_API_RETRIES) {
    try {
      console.log(`🤖 Calling Groq for batch ${batchStart}-${batchEnd}...`);

      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "openai/gpt-oss-120b", // Ensure this is the correct model ID on Groq
        temperature: 0.5, // Bumped slightly to allow the AI to adapt to crazy themes better
        response_format: { type: "json_object" },
      });

      return completion;
    } catch (error) {
      if (error?.status === 429) {
        attempt++;
        if (attempt >= MAX_API_RETRIES) {
          console.error(
            `❌ Groq rate limit: max retries reached for batch ${batchStart}-${batchEnd}`,
          );
          throw error;
        }

        let waitTime = 15000;
        const retryAfterHeader =
          error?.headers?.get?.("retry-after") ||
          error?.headers?.["retry-after"];

        if (retryAfterHeader) {
          const retrySeconds = Number(retryAfterHeader);
          if (Number.isFinite(retrySeconds))
            waitTime = Math.min(retrySeconds * 1000, 30000);
        }

        waitTime += attempt * 3000;
        console.log(
          `⏳ Groq rate limit reached. Waiting ${Math.ceil(waitTime / 1000)} seconds before retry ${attempt}/${MAX_API_RETRIES}...`,
        );
        await sleep(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Groq request failed after API retries.");
};

// ============================================================
// CLEAN AI JSON
// ============================================================
const cleanJsonResponse = (result) => {
  if (!result || typeof result !== "string") return "";
  return result
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
};

// ============================================================
// VALIDATE / NORMALIZE ONE AI SCENE
// ============================================================
const validateScene = (scene, batchItem, batchPosition) => {
  if (!scene || typeof scene !== "object") {
    throw new Error(`Invalid scene at batch position ${batchPosition}.`);
  }

  scene.mediaIndex = batchItem.mediaIndex;
  scene.sceneNumber = batchPosition + 1;

  const duration = Number(scene.duration);
  scene.duration = !Number.isFinite(duration)
    ? 5
    : Math.min(Math.max(duration, 4), 8);

  scene.title =
    typeof scene.title === "string" && scene.title.trim().length > 0
      ? scene.title.trim()
      : `Scene ${batchItem.mediaIndex + 1}`;
  scene.visual =
    typeof scene.visual === "string" && scene.visual.trim().length > 0
      ? scene.visual.trim()
      : batchItem.description || "";
  scene.narration =
    typeof scene.narration === "string" ? scene.narration.trim() : "";
  scene.emotion =
    typeof scene.emotion === "string" && scene.emotion.trim().length > 0
      ? scene.emotion.trim()
      : batchItem.emotion || "neutral";

  return scene;
};

// ============================================================
// GENERATE SCREENPLAY
// ============================================================
// 👈 WE ADDED THE THEME PARAMETER HERE
const generateScreenplay = async (media, theme = "Cinematic & Emotional") => {
  try {
    console.log("\n========================================");
    console.log(`🎬 GENERATING SCREENPLAY (THEME: ${theme})`);
    console.log("========================================");

    if (!Array.isArray(media) || media.length === 0) {
      throw new Error("No media available for screenplay generation.");
    }

    console.log(`📸 Total visual media: ${media.length}`);
    const allScenes = [];

    for (let start = 0; start < media.length; start += BATCH_SIZE) {
      const originalBatch = media.slice(start, start + BATCH_SIZE);
      const batch = originalBatch.map((item, index) => ({
        ...item,
        mediaIndex: start + index,
      }));
      const batchEnd = start + batch.length - 1;

      console.log(
        `\n🎬 SCREENPLAY BATCH ${start}-${batchEnd} (Progress: ${start}/${media.length})`,
      );
      console.log("\n📸 ----------------- CHECKING IMAGE DATA -----------------");
      console.log("Media Batch Sample:", JSON.stringify(batch[0], null, 2));
      console.log("----------------------------------------------------------\n");

      // 👈 WE INJECTED THE THEME INTO THE PROMPT HERE
      const prompt = `
You are an expert documentary narrator and storyteller reviewing a sequence of ${batch.length} moments.
CREATE EXACTLY ONE SCENE FOR EVERY MEDIA ITEM.

============================================================
DIRECTORIAL THEME (CRITICAL)
============================================================
The user has selected the following directorial vibe: "${theme}". 
You MUST adjust your tone, vocabulary, pacing, and emotion to perfectly match this specific vibe!
- If the theme is "Cinematic & Emotional", be nostalgic, deep, and moving.
- If the theme is "Upbeat & Fast-Paced", be energetic, enthusiastic, and vlog-style.
- If the theme is "Tech Documentary", be highly professional, analytical, and process-oriented.
- If the theme is "Cyberpunk Sci-Fi", be dark, gritty, futuristic, and dramatic.

============================================================
MEDIA INPUT DATA
============================================================
${JSON.stringify(batch, null, 2)}

============================================================
STRICT NARRATION RULES (CRITICAL)
============================================================
1. FIRST PERSON NARRATIVE: Speak strictly in the FIRST PERSON ("I", "We", "My"). Tell a cohesive, flowing story from your perspective.
2. BAN REPETITIVE STARTERS (CRITICAL RULE):
   - NEVER start sentences with formulas like:
     * "I look at this picture..."
     * "I see this image..."
     * "I revisit this snapshot..."
     * "I glance at this photo..."
     * "I cherish this image..."
   - Jump straight into the action, emotion, or reflection (e.g., "Designing the core layout in CSS...", "Wrestling with the database configuration...", "Finally reaching the top of the mountain...").
3. STRICT VISION ALIGNMENT: Do NOT invent context that is not visible in the media descriptions. The story MUST strictly align with the visual evidence provided. 
   - If the image is of code or dashboards, talk about the project development. 
   - If the image is of a vacation, family, or outdoors, talk about those specific memories. 
   - Do not force a software/tech theme unless the images explicitly show tech.
4. VARIETY & FLOW: Ensure the text sounds like a natural, flowing monologue rather than a robotic caption for each slide.
5. Return ONLY valid JSON matching the format below.

OUTPUT FORMAT:
{
  "scenes": [
    {
      "title": "Short title",
      "visual": "Literal description",
      "narration": "Natural, varied first-person sentence without repetitive openers.",
      "emotion": "Matched to the image (e.g., joyful, focused, nostalgic)",
      "duration": 4
    }
  ]
}
`;

      let batchSuccess = false;
      let batchAttempt = 0;
      let validatedBatchScenes = [];

      while (!batchSuccess && batchAttempt < MAX_BATCH_RETRIES) {
        batchAttempt++;
        try {
          const completion = await callGroqWithRetry(prompt, start, batchEnd);
          let result = completion?.choices?.[0]?.message?.content;

          if (!result) throw new Error("AI returned empty screenplay.");

          result = cleanJsonResponse(result);
          let screenplay;

          try {
            screenplay = JSON.parse(result);
          } catch (e) {
            throw new Error(`Invalid JSON returned by AI: ${e.message}`);
          }

          if (!Array.isArray(screenplay.scenes)) {
            throw new Error("AI response missing 'scenes' array.");
          }

          if (screenplay.scenes.length !== batch.length) {
            throw new Error(
              `Mismatch: Expected ${batch.length} scenes, got ${screenplay.scenes.length}.`,
            );
          }

          validatedBatchScenes = screenplay.scenes.map((scene, index) =>
            validateScene(scene, batch[index], index),
          );
          batchSuccess = true; 
        } catch (batchError) {
          console.error(
            `⚠️ Batch ${start}-${batchEnd} failed on attempt ${batchAttempt}: ${batchError.message}`,
          );
          if (batchAttempt >= MAX_BATCH_RETRIES) {
            throw new Error(
              `Batch ${start}-${batchEnd} completely failed after ${MAX_BATCH_RETRIES} attempts. Cannot continue movie generation.`,
            );
          }
          console.log(`⏳ Retrying batch ${start}-${batchEnd} in 3 seconds...`);
          await sleep(3000);
        }
      }

      allScenes.push(...validatedBatchScenes);
      console.log(`✅ Batch ${start}-${batchEnd} completed successfully.`);

      if (start + BATCH_SIZE < media.length) {
        await sleep(BATCH_DELAY);
      }
    }

    allScenes.sort((a, b) => a.mediaIndex - b.mediaIndex);

    if (allScenes.length !== media.length) {
      throw new Error(
        `FINAL SCREENPLAY MISMATCH: expected ${media.length} scenes but received ${allScenes.length}.`,
      );
    }

    const usedIndexes = new Set();
    allScenes.forEach((scene, index) => {
      scene.sceneNumber = index + 1;
      if (scene.mediaIndex !== index)
        throw new Error(
          `MAPPING ERROR: expected ${index}, got ${scene.mediaIndex}.`,
        );
      if (usedIndexes.has(scene.mediaIndex))
        throw new Error(`DUPLICATE INDEX: ${scene.mediaIndex}`);
      usedIndexes.add(scene.mediaIndex);
    });

    console.log("\n✅ FINAL SCREENPLAY VALIDATED");
    return { scenes: allScenes };
  } catch (error) {
    console.error("❌ Screenplay Generation Error:", error.message);
    throw error;
  }
};

module.exports = {
  generateScreenplay,
};