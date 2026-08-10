const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ============================================================
// RATE LIMIT SETTINGS
// ============================================================

const BATCH_SIZE = 5;

// Keep this reasonably high because your account has a
// 12,000 TPM limit.
const BATCH_DELAY = 30000;

const MAX_RETRIES = 2;

// ============================================================
// SLEEP
// ============================================================

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// ============================================================
// GROQ CALL WITH AUTOMATIC 429 RETRY
// ============================================================

const callGroqWithRetry = async (prompt, batchStart, batchEnd) => {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      console.log(
        `🤖 Calling Groq for batch ${batchStart}-${batchEnd}...`
      );

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],

        model: "llama-3.3-70b-versatile",

        temperature: 0.3,

        response_format: {
          type: "json_object",
        },
      });

      return completion;
    } catch (error) {
      // ======================================================
      // HANDLE 429 RATE LIMIT
      // ======================================================

      if (error?.status === 429) {
        attempt++;

        if (attempt >= MAX_RETRIES) {
          console.error(
            `❌ Groq rate limit: maximum retries reached for batch ${batchStart}-${batchEnd}`
          );

          throw error;
        }
        let waitTime = 15000;

const retryAfterHeader =
  error?.headers?.get?.("retry-after") ||
  error?.headers?.["retry-after"];

if (retryAfterHeader) {
  const retrySeconds = Number(retryAfterHeader);

  if (Number.isFinite(retrySeconds)) {
    waitTime = Math.min(retrySeconds * 1000, 30000);
  }
}

waitTime += attempt * 3000;

        console.log("");
        console.log("⏳ Groq rate limit reached.");
        console.log(
          `⏳ Waiting ${Math.ceil(
            waitTime / 1000
          )} seconds before retry ${attempt}/${MAX_RETRIES}...`
        );
        console.log("");

        await sleep(waitTime);

        continue;
      }

      // ======================================================
      // OTHER ERRORS
      // ======================================================

      throw error;
    }
  }

  throw new Error("Groq request failed after retries.");
};

// ============================================================
// CLEAN AI JSON
// ============================================================

const cleanJsonResponse = (result) => {
  if (!result || typeof result !== "string") {
    return "";
  }

  return result
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
};

// ============================================================
// VALIDATE / NORMALIZE ONE AI SCENE
//
// IMPORTANT:
// mediaIndex is NOT trusted from AI.
//
// JavaScript supplies the correct mediaIndex.
// ============================================================

const validateScene = (scene, batchItem, batchPosition) => {
  if (!scene || typeof scene !== "object") {
    throw new Error(
      `Invalid scene at batch position ${batchPosition}.`
    );
  }

  // ==========================================================
  // IMPORTANT FIX
  //
  // NEVER trust scene.mediaIndex returned by Groq.
  // The batch item already knows the correct index.
  // ==========================================================

  scene.mediaIndex = batchItem.mediaIndex;

  // Scene number will be assigned globally later.
  scene.sceneNumber = batchPosition + 1;

  // ==========================================================
  // DURATION
  // ==========================================================

  const duration = Number(scene.duration);

  if (!Number.isFinite(duration)) {
    scene.duration = 5;
  } else {
    scene.duration = Math.min(
      Math.max(duration, 4),
      8
    );
  }

  // ==========================================================
  // FALLBACK VALUES
  // ==========================================================

  scene.title =
    typeof scene.title === "string" &&
    scene.title.trim().length > 0
      ? scene.title.trim()
      : `Scene ${batchItem.mediaIndex + 1}`;

  scene.visual =
    typeof scene.visual === "string" &&
    scene.visual.trim().length > 0
      ? scene.visual.trim()
      : batchItem.description || "";

  scene.narration =
    typeof scene.narration === "string"
      ? scene.narration.trim()
      : "";

  scene.emotion =
    typeof scene.emotion === "string" &&
    scene.emotion.trim().length > 0
      ? scene.emotion.trim()
      : batchItem.emotion || "neutral";

  return scene;
};

// ============================================================
// GENERATE SCREENPLAY
// ============================================================

const generateScreenplay = async (media) => {
  try {
    console.log("");
    console.log("========================================");
    console.log("🎬 GENERATING SCREENPLAY");
    console.log("========================================");

    // ========================================================
    // BASIC MEDIA VALIDATION
    // ========================================================

    if (!Array.isArray(media) || media.length === 0) {
      throw new Error(
        "No media available for screenplay generation."
      );
    }

    console.log(
      `📸 Total visual media: ${media.length}`
    );

    const allScenes = [];

    // ========================================================
    // PROCESS MEDIA IN SMALL BATCHES
    // ========================================================

    for (
      let start = 0;
      start < media.length;
      start += BATCH_SIZE
    ) {
      const originalBatch = media.slice(
        start,
        start + BATCH_SIZE
      );

      // ======================================================
      // GIVE EACH MEDIA ITEM ITS ORIGINAL INDEX
      //
      // THIS IS THE SOURCE OF TRUTH.
      // ======================================================

      const batch = originalBatch.map(
        (item, index) => ({
          ...item,

          mediaIndex: start + index,
        })
      );

      const batchEnd =
        start + batch.length - 1;

      console.log("");
      console.log("========================================");
      console.log(
        `🎬 SCREENPLAY BATCH ${start}-${batchEnd}`
      );
      console.log(
        `📸 Media in batch: ${batch.length}`
      );
      console.log(
        `📊 Progress: ${start}/${media.length}`
      );
      console.log("========================================");

      // ======================================================
      // PROMPT
      //
      // NOTICE:
      // We DO NOT ask Groq to determine mediaIndex.
      // JavaScript will assign it afterward.
      // ======================================================

      const prompt = `
You are a professional cinematic memory movie editor.

You are given a SMALL batch of visual media.

Your task is extremely strict:

CREATE EXACTLY ONE SCENE FOR EVERY MEDIA ITEM.

This batch contains ${batch.length} media items.

Therefore you MUST return exactly ${batch.length} scenes.

============================================================
MEDIA
============================================================

${JSON.stringify(batch, null, 2)}

============================================================
SCENE RULES
============================================================

For EVERY media item:

1. Create exactly one scene.
2. Use every media item exactly once.
3. Do not skip any media item.
4. Do not duplicate any media item.
5. Describe the specific media.
6. Narration must relate specifically to that media.
7. Do not invent unsupported events.
8. Use the emotion provided by the media when available.
9. Duration must be between 4 and 8 seconds.
10. Keep narration cinematic and natural.

============================================================
IMPORTANT
============================================================

The mediaIndex is controlled by the application.

DO NOT create or modify mediaIndex.

The application will automatically assign the correct mediaIndex
after receiving your response.

Your job is ONLY to create the cinematic content.

============================================================
OUTPUT
============================================================

Return ONLY valid JSON.

Return exactly this structure:

{
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Short title",
      "visual": "Description of what is visible",
      "narration": "Specific narration for this memory",
      "emotion": "Emotion",
      "duration": 5
    }
  ]
}

CRITICAL:

- scenes.length MUST equal ${batch.length}
- Return exactly ${batch.length} scenes.
- Do not return fewer scenes.
- Do not return more scenes.
- Do not return mediaIndex.
- Return JSON only.
- No markdown.
- No explanation.
`;

      // ======================================================
      // CALL GROQ
      // ======================================================

      const completion = await callGroqWithRetry(
        prompt,
        start,
        batchEnd
      );

      // ======================================================
      // READ RESPONSE
      // ======================================================

      let result =
        completion?.choices?.[0]?.message?.content;

      if (!result) {
        throw new Error(
          `AI returned an empty screenplay for batch ${start}-${batchEnd}.`
        );
      }

      console.log("");
      console.log("===== RAW AI RESPONSE =====");
      console.log(result);
      console.log("===========================");
      console.log("");

      // ======================================================
      // CLEAN JSON
      // ======================================================

      result = cleanJsonResponse(result);

      let screenplay;

      try {
        screenplay = JSON.parse(result);
      } catch (parseError) {
        console.error(
          "❌ AI returned invalid JSON:"
        );

        console.error(result);

        throw new Error(
          `Invalid JSON returned by AI for batch ${start}-${batchEnd}.`
        );
      }

      // ======================================================
      // SCENES ARRAY CHECK
      // ======================================================

      if (!Array.isArray(screenplay.scenes)) {
        throw new Error(
          `AI screenplay batch ${start}-${batchEnd} does not contain a scenes array.`
        );
      }

      // ======================================================
      // BATCH COUNT VALIDATION
      // ======================================================

      if (
        screenplay.scenes.length !== batch.length
      ) {
        throw new Error(
          `AI screenplay batch mismatch: expected ${batch.length} scenes but received ${screenplay.scenes.length}. Batch range: ${start}-${batchEnd}`
        );
      }

      // ======================================================
      // NORMALIZE SCENES
      //
      // IMPORTANT:
      // We assign mediaIndex HERE.
      // ======================================================

      const validatedBatchScenes =
        screenplay.scenes.map(
          (scene, index) => {
            const batchItem = batch[index];

            return validateScene(
              scene,
              batchItem,
              index
            );
          }
        );

      // ======================================================
      // ADD BATCH TO ALL SCENES
      // ======================================================

      allScenes.push(
        ...validatedBatchScenes
      );

      console.log(
        `✅ Batch ${start}-${batchEnd} completed.`
      );

      console.log(
        `📊 Total scenes so far: ${allScenes.length}/${media.length}`
      );

      // ======================================================
      // WAIT BEFORE NEXT BATCH
      // ======================================================

      if (
        start + BATCH_SIZE < media.length
      ) {
        console.log(
          `⏳ Waiting ${
            BATCH_DELAY / 1000
          } seconds before next batch...`
        );

        await sleep(BATCH_DELAY);
      }
    }

    // ========================================================
    // SORT BY MEDIA INDEX
    // ========================================================

    allScenes.sort(
      (a, b) =>
        a.mediaIndex - b.mediaIndex
    );

    // ========================================================
    // FINAL GLOBAL COUNT
    // ========================================================

    if (
      allScenes.length !== media.length
    ) {
      throw new Error(
        `FINAL SCREENPLAY MISMATCH: expected ${media.length} scenes but received ${allScenes.length}.`
      );
    }

    // ========================================================
    // FINAL GLOBAL VALIDATION
    // ========================================================

    const usedIndexes = new Set();

    allScenes.forEach(
      (scene, index) => {
        // ----------------------------------------------------
        // GLOBAL SCENE NUMBER
        // ----------------------------------------------------

        scene.sceneNumber =
          index + 1;

        // ----------------------------------------------------
        // MEDIA INDEX MUST MATCH ORIGINAL MEDIA POSITION
        // ----------------------------------------------------

        if (
          scene.mediaIndex !== index
        ) {
          throw new Error(
            `FINAL MEDIA MAPPING ERROR: expected mediaIndex ${index} but received ${scene.mediaIndex}.`
          );
        }

        // ----------------------------------------------------
        // DUPLICATE CHECK
        // ----------------------------------------------------

        if (
          usedIndexes.has(
            scene.mediaIndex
          )
        ) {
          throw new Error(
            `FINAL DUPLICATE MEDIA INDEX: ${scene.mediaIndex}`
          );
        }

        usedIndexes.add(
          scene.mediaIndex
        );
      }
    );

    // ========================================================
    // FINAL SAFETY CHECK
    // ========================================================

    for (
      let i = 0;
      i < media.length;
      i++
    ) {
      if (
        !usedIndexes.has(i)
      ) {
        throw new Error(
          `FINAL SCREENPLAY ERROR: Media item ${i} was not assigned to a scene.`
        );
      }
    }

    // ========================================================
    // SUCCESS
    // ========================================================

    console.log("");
    console.log("========================================");
    console.log("✅ FINAL SCREENPLAY VALIDATED");
    console.log("========================================");

    console.log(
      `🎬 Media: ${media.length}`
    );

    console.log(
      `🎬 Scenes: ${allScenes.length}`
    );

    console.log("========================================");
    console.log("");

    allScenes.forEach(
      (scene) => {
        console.log({
          sceneNumber:
            scene.sceneNumber,

          mediaIndex:
            scene.mediaIndex,

          title:
            scene.title,

          duration:
            scene.duration,

          emotion:
            scene.emotion,
        });
      }
    );

    // ========================================================
    // RETURN
    // ========================================================

    return {
      scenes: allScenes,
    };
  } catch (error) {
    console.error(
      "Screenplay Generation Error:",
      error
    );

    throw error;
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  generateScreenplay,
};