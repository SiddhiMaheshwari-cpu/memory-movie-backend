const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const cleanMediaUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  const markdownMatch = url.match(/\]\((https?:\/\/[^)]+)\)/);
  if (markdownMatch) return markdownMatch[1];
  return url.trim();
};

// 🤖 AI VISION CORTEX: Looks at the image and describes it literally and strictly
const analyzeImageWithVision = async (imageUrl, type) => {
  try {
    console.log(`👁️ Vision AI analyzing ${type}: ${imageUrl}`);
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "You are a literal, emotionless image analyzer. Describe EXACTLY what text or UI elements are visible in 1 short sentence. Rule 1: NEVER invent or guess UI panels, tables, or buttons that are not explicitly visible. Rule 2: If there is an error message, read the error message. Rule 3: Do not add any filler text."
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      model: "qwen/qwen3.6-27b",
      temperature: 0.1, // Lowered slightly to ensure maximum literal accuracy
      max_tokens: 40,
    });

    return completion.choices[0]?.message?.content?.replace(/\n/g, " ").trim() || "";
  } catch (error) {
    console.warn(`⚠️ Vision AI skipped (Rate limit or format issue): ${error.message}`);
    return type === "chat" ? "A chat conversation screenshot." : "A visual memory.";
  }
};

const collectMedia = async (movie) => {
  console.log("\n================================");
  console.log("🎞️ COLLECT MEDIA (WITH VISION AI)");
  console.log("================================");
  console.log("Movie ID:", movie?._id);

  const visualMedia = [];
  const audioMedia = [];

  // ==========================================
  // PHOTOS
  // ==========================================
  if (Array.isArray(movie?.photos)) {
    for (let i = 0; i < movie.photos.length; i++) {
      const photo = movie.photos[i];
      if (!photo?.url) continue;

      const url = cleanMediaUrl(photo.url);
      let desc = photo.description || "";

      // Trigger Vision AI if description is generic or empty
      if (!desc || desc.trim().toLowerCase() === "memory photo" || desc.trim() === "") {
        desc = await analyzeImageWithVision(url, "photo");
        await new Promise((r) => setTimeout(r, 1200)); // Pause to prevent Groq API rate limits
      }

      visualMedia.push({
        mediaId: photo._id,
        type: "photo",
        url: url,
        publicId: photo.publicId,
        description: desc,
        emotion: photo.emotion || "neutral",
        transcript: "",
        order: visualMedia.length + 1
      });
    }
  }

  // ==========================================
  // VIDEOS
  // ==========================================
  if (Array.isArray(movie?.videos)) {
    for (let i = 0; i < movie.videos.length; i++) {
      const video = movie.videos[i];
      if (!video?.url) continue;

      visualMedia.push({
        mediaId: video._id,
        type: "video",
        url: cleanMediaUrl(video.url),
        publicId: video.publicId,
        description: video.description || "A video clip",
        emotion: video.emotion || "neutral",
        transcript: video.transcript || "",
        order: visualMedia.length + 1
      });
    }
  }

  // ==========================================
  // CHAT SCREENSHOTS
  // ==========================================
  if (Array.isArray(movie?.chatScreenshots)) {
    for (let i = 0; i < movie.chatScreenshots.length; i++) {
      const chat = movie.chatScreenshots[i];
      if (!chat?.url) continue;

      const url = cleanMediaUrl(chat.url);
      let desc = chat.description || "";

      if (!desc || desc.trim() === "") {
        desc = await analyzeImageWithVision(url, "chat");
        await new Promise((r) => setTimeout(r, 1200));
      }

      visualMedia.push({
        mediaId: chat._id,
        type: "chat",
        url: url,
        publicId: chat.publicId,
        description: desc,
        emotion: chat.emotion || "neutral",
        transcript: chat.transcript || "",
        order: visualMedia.length + 1
      });
    }
  }

  // ==========================================
  // AUDIO
  // ==========================================
  if (Array.isArray(movie?.audio)) {
    movie.audio.forEach((audio, index) => {
      if (!audio?.url) return;
      audioMedia.push({
        mediaId: audio._id,
        type: "audio",
        url: cleanMediaUrl(audio.url),
        publicId: audio.publicId,
        description: audio.description || "",
        emotion: audio.emotion || "",
        transcript: audio.transcript || "",
        order: audioMedia.length + 1
      });
    });
  }

  visualMedia.sort((a, b) => a.order - b.order);

  console.log("\n========== MEDIA SUMMARY ==========");
  console.log("🎬 Visual Media:", visualMedia.length);
  console.log("🎙 Audio Media:", audioMedia.length);
  console.log("================================\n");

  return { visualMedia, audioMedia };
};

module.exports = { collectMedia };