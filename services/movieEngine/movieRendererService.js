const path = require("path");

const { collectMedia } = require("./mediaCollector");

const { composeScenes } = require("./sceneComposerService");

const { applyBackgroundMusic } = require("./backgroundMusicService");

const { renderMovie } = require("./videoRendererService");

const { uploadVideo } = require("../videoUploaderService");

const { generateScreenplay } = require("../screenplay");

const { generateVoice } = require("../voiceService");

const { recommendMusic } = require("../musicService");

const { getMusicTracks } = require("../musicProviderService");

const createMovie = async (movie) => {
  try {
    console.log("\n================================");
    console.log("🎬 MOVIE ENGINE STARTED");
    console.log("================================");

    // =====================================================
    // 1. COLLECT ALL MEDIA
    // =====================================================

    const collectedMedia = collectMedia(movie);

    if (!collectedMedia || !Array.isArray(collectedMedia.visualMedia)) {
      throw new Error("Media collection failed. visualMedia is missing.");
    }

    const visualMedia = collectedMedia.visualMedia;

    const audioMedia = Array.isArray(collectedMedia.audioMedia)
      ? collectedMedia.audioMedia
      : [];

    console.log("\n================================");
    console.log("📦 MEDIA COLLECTION RESULT");
    console.log("================================");

    console.log("Visual Media:", visualMedia.length);

    console.log("Audio Media:", audioMedia.length);

    visualMedia.forEach((item, index) => {
      console.log(`${index + 1}.`, item.type, item.url);
    });

    // Safety check

    if (visualMedia.length === 0) {
      throw new Error("No visual media available for movie rendering.");
    }

    // =====================================================
    // 2. GENERATE AI SCREENPLAY
    // =====================================================

    console.log("\n================================");
    console.log("🤖 GENERATING AI SCREENPLAY");
    console.log("================================");

    const screenplay = await generateScreenplay(visualMedia);

    if (
      !screenplay ||
      !Array.isArray(screenplay.scenes) ||
      screenplay.scenes.length === 0
    ) {
      throw new Error("AI screenplay generated no scenes.");
    }

    movie.screenplay = screenplay;

    await movie.save();

    console.log("✅ Screenplay Saved");

    console.log("AI Scene Count:", screenplay.scenes.length);

    // =====================================================
    // 3. COMPOSE SCENES
    // =====================================================

    console.log("\n================================");
    console.log("🎬 COMPOSING SCENES");
    console.log("================================");

    let scenes = composeScenes(
      {
        scenes: screenplay.scenes,
      },
      visualMedia,
    );

    if (!Array.isArray(scenes) || scenes.length === 0) {
      throw new Error("No scenes were created from screenplay.");
    }

    console.log("Scenes Created:", scenes.length);

    scenes.forEach((scene, index) => {
      console.log(`Scene ${index + 1}:`, {
        title: scene.title,
        mediaType: scene.media?.type,
        mediaUrl: scene.media?.url,
        duration: scene.duration,
        animation: scene.animation,
        transition: scene.transition,
      });
    });

    // =====================================================
    // 4. CINEMATIC SCENE DEFAULTS
    // =====================================================

    scenes = scenes.map((scene, index) => {
      return {
        ...scene,

        // -----------------------------------------
        // Animation
        // -----------------------------------------

        animation: scene.animation || {
          type: "slow_zoom_in",

          intensity: "medium",
        },

        // -----------------------------------------
        // Transition
        // -----------------------------------------

        transition: scene.transition || {
          type: index === 0 ? "none" : "fade",

          duration: index === 0 ? 0 : 0.8,
        },

        // -----------------------------------------
        // Caption
        // -----------------------------------------

        caption: scene.caption || {
          text: "",

          position: "bottom",
        },

        // -----------------------------------------
        // Importance
        // -----------------------------------------

        importance: scene.importance || 0.5,

        // -----------------------------------------
        // Background Music
        // -----------------------------------------

        backgroundMusic: null,
      };
    });

    console.log("\n================================");
    console.log("🎞️ ENHANCED SCENES");
    console.log("================================");

    console.log(JSON.stringify(scenes, null, 2));

    // =====================================================
    // 5. BACKGROUND MUSIC
    // =====================================================

    console.log("\n================================");
    console.log("🎵 APPLYING MUSIC LOGIC");
    console.log("================================");

    scenes = applyBackgroundMusic(scenes);

    if (!Array.isArray(scenes)) {
      throw new Error(
        "Background music service must return an array of scenes.",
      );
    }

    console.log("✅ Background Music Applied");

    // =====================================================
    // 6. AI MUSIC RECOMMENDATION
    // =====================================================

    console.log("\n================================");
    console.log("🎼 AI MUSIC RECOMMENDATION");
    console.log("================================");

    const primaryScene = scenes[0];

    const musicRecommendation = await recommendMusic(primaryScene);

    console.log("Music Recommendation:", musicRecommendation);

    // =====================================================
    // 7. FETCH MUSIC TRACKS
    // =====================================================

    const musicTracks = await getMusicTracks(musicRecommendation);

    console.log("Music Tracks:", musicTracks);

    movie.musicRecommendations = musicTracks;

    // Attach first suitable music track

    const selectedMusic =
      Array.isArray(musicTracks) && musicTracks.length > 0
        ? musicTracks[0]?.audioUrl
        : null;

    scenes.forEach((scene) => {
      scene.backgroundMusic = selectedMusic || null;
    });

    await movie.save();

    console.log("Selected Music:", selectedMusic);

    // =====================================================
    // 8. GENERATE NARRATION
    // =====================================================

    console.log("\n================================");
    console.log("🎙️ GENERATING NARRATION");
    console.log("================================");

    const narrationText = scenes
      .map((scene) => scene.narration || "")
      .filter((text) => text.trim().length > 0)
      .join(". ");

    let voicePath = null;

    if (narrationText && narrationText.trim().length > 0) {
      console.log("🎙 FINAL NARRATION TEXT:");
      console.log(narrationText);

      voicePath = await generateVoice(narrationText);
    }

    console.log("Voice Path:", voicePath);

    // =====================================================
    // 9. SELECT MUSIC FOR FINAL RENDER
    // =====================================================

    const musicPath =
      scenes.find((scene) => scene.backgroundMusic)?.backgroundMusic || null;

    console.log("Music Path:", musicPath);

    // =====================================================
    // 10. RENDER MOVIE
    // =====================================================

    console.log("\n================================");
    console.log("🎥 STARTING VIDEO RENDER");
    console.log("================================");

    const outputPath = path.join(__dirname, "finalMovie.mp4");

    const videoPath = await renderMovie({
      scenes,

      voicePath,

      musicPath,

      outputPath,
    });

    console.log("✅ Video Rendered:", videoPath);

    // =====================================================
    // 11. UPLOAD TO CLOUDINARY
    // =====================================================

    console.log("\n================================");
    console.log("☁️ UPLOADING VIDEO");
    console.log("================================");

    const uploadedVideo = await uploadVideo(videoPath);

    console.log("Cloudinary URL:", uploadedVideo.url);

    // =====================================================
    // 12. RETURN RESULT
    // =====================================================

    return {
      videoUrl: uploadedVideo.url,

      publicId: uploadedVideo.publicId,
    };
  } catch (error) {
    console.error("\n================================");

    console.error("❌ MOVIE ENGINE ERROR");

    console.error("================================");

    console.error(error);

    console.error("Message:", error.message);

    throw error;
  }
};

module.exports = {
  createMovie,
};
