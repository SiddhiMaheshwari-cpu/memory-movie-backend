const path = require("path");
const { collectMedia } = require("./mediaCollector");
const { composeScenes } = require("./sceneComposerService");
const { applyTransitions } = require("./transitionService");
const { applyBackgroundMusic } = require("./backgroundMusicService");
const { renderMovie } = require("./videoRendererService");
const { uploadVideo } = require("../videoUploaderService");

const { generateScreenplay } = require("../screenplay");
const { generateVoice } = require("../voiceService");
const { recommendMusic } = require("../musicService");
const { getMusicTracks } = require("../musicProviderService");

const createMovie = async (movie) => {
  try {
    console.log("Movie Engine Started...");

    // 1. Collect Media

    const media = collectMedia(movie);
    console.log("TOTAL MEDIA:", media.length);

    media.forEach((item, index) => {
      console.log(index, item.type, item.url);
    });

    console.log("Media Collected:", media.length);

    // 2. Generate AI Screenplay

    if (
      !movie.screenplay ||
      !movie.screenplay.scenes ||
      movie.screenplay.scenes.length === 0
    ) {
      console.log("Generating AI Screenplay...");

      const screenplay = await generateScreenplay(media);

      movie.screenplay = screenplay;

      await movie.save();

      console.log("Screenplay Saved");
    }

    // 3. Create Scenes

    let scenes = composeScenes(movie.screenplay, media);

    console.log("Scenes Created:", scenes.length);
    console.log(
      scenes.map((s) => ({
        title: s.title,
        media: s.media?.url,
      })),
    );

    // Check scenes before further processing

    if (scenes.length === 0) {
      throw new Error("No scenes available");
    }

    // 4. Apply Transitions

    scenes = applyTransitions(scenes);

    // 5. Apply Background Music

    scenes = applyBackgroundMusic(scenes);

    console.log("Final Scenes Ready");

    console.log(scenes);

    // 6. AI Music Recommendation

    const musicRecommendation = await recommendMusic(scenes[0]);

    console.log("AI Music Recommendation:", musicRecommendation);

    // 7. Fetch Music

    const musicTracks = await getMusicTracks(musicRecommendation);

    console.log("Recommended Tracks:", musicTracks);

    movie.musicRecommendations = musicTracks;

    // Attach music URL

    scenes.forEach((scene) => {
      scene.backgroundMusic = musicTracks[0]?.audioUrl || null;
    });

    await movie.save();

    console.log("Music Attached To Scenes");

    // 8. Generate Voice

    const narrationText = scenes.map((scene) => scene.narration).join(" ");

    let voicePath = null;

    if (narrationText) {
      voicePath = await generateVoice(narrationText);
    }

    console.log("Voice Path:", voicePath);

    // 9. Render Video

    const outputPath = path.join(__dirname, "finalMovie.mp4");
    const videoPath = await renderMovie({
      scenes,
      voicePath,
      musicPath: scenes[0]?.backgroundMusic || null,
      outputPath,
    });

    console.log("Video Rendered:", videoPath);

    // 10. Upload Video To Cloudinary

    console.log("Uploading Video To Cloudinary...");

    const uploadedVideo = await uploadVideo(videoPath);

    console.log("Cloudinary Video URL:", uploadedVideo.url);

    // 11. Return Result

    return {
      videoUrl: uploadedVideo.url,

      publicId: uploadedVideo.publicId,
    };
  } catch (error) {
    console.log("Movie Engine Error:", error);

    throw error;
  }
};

module.exports = {
  createMovie,
};
