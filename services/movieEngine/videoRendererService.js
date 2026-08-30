const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");

// ==========================================
// 1. HELPER: GET MEDIA DURATION
// ==========================================
const getMediaDuration = (mediaPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(mediaPath, (err, metadata) => {
      if (err) {
        console.error("❌ Error getting duration for:", mediaPath);
        return reject(err);
      }
      resolve(metadata.format.duration);
    });
  });
};

// ==========================================
// 2. CREATE INDIVIDUAL SCENE (Zoom & Fade)
// ==========================================
const createSceneVideo = (imagePath, duration, animationType, outputPath) => {
  return new Promise((resolve, reject) => {
    let zoomExpression = "min(zoom+0.0001,1.01)";
    let xExpression = "iw/2-(iw/zoom/2)";

    if (animationType && animationType.type === "slow_zoom_out") {
      zoomExpression = "if(lte(zoom,1.0),1.005,max(1.001,zoom-0.0001))";
    }

    const safeDuration = duration || 5;

    ffmpeg(imagePath)
      .loop(safeDuration)
      .complexFilter([
        {
          filter: "zoompan",
          options: {
            z: zoomExpression,
            x: xExpression,
            y: "ih/2-(ih/zoom/2)",
            d: safeDuration * 25,
            s: "1920x1080",
            fps: 25
          },
          inputs: "0:v",
          outputs: "composedScene"
        },
        { filter: "fade", options: { t: "in", st: 0, d: 0.5 }, inputs: "composedScene", outputs: "fadedIn" },
        { filter: "fade", options: { t: "out", st: safeDuration - 0.5, d: 0.5 }, inputs: "fadedIn", outputs: "fadedScene" }
      ])
      .outputOptions([
        "-map", "[fadedScene]",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-t", safeDuration.toString()
      ])
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err))
      .save(outputPath);
  });
};

// ==========================================
// 3. MERGE ALL SCENES
// ==========================================
const mergeVideos = (videoPaths, outputPath) => {
  return new Promise((resolve, reject) => {
    if (!videoPaths || videoPaths.length === 0) {
      return reject(new Error("No video files provided for merging."));
    }

    const listPath = path.join(path.dirname(outputPath), "concat_list.txt");
    const listContent = videoPaths.map((vid) => `file '${vid.replace(/\\/g, "/")}'`).join("\n");
    fs.writeFileSync(listPath, listContent);

    ffmpeg()
      .input(listPath)
      .inputOptions(["-f", "concat", "-safe", "0"])
      .outputOptions(["-c", "copy"])
      .on("end", () => {
        if (fs.existsSync(listPath)) fs.unlinkSync(listPath);
        resolve(outputPath);
      })
      .on("error", (err) => {
        if (fs.existsSync(listPath)) fs.unlinkSync(listPath);
        reject(err);
      })
      .save(outputPath);
  });
};

// ==========================================
// 4. ADD VOICE & MUSIC MIXING
// ==========================================
const addAudioLayers = async (videoPath, voicePath, musicPath, outputPath) => {
  return new Promise(async (resolve, reject) => {
    try {
      const videoDuration = await getMediaDuration(videoPath);
      let command = ffmpeg().input(videoPath);

      let filterComplex = [];
      let inputCount = 1;

      if (voicePath && fs.existsSync(voicePath)) {
        command.input(voicePath);
        inputCount++;
      }

      if (musicPath && fs.existsSync(musicPath)) {
        command.input(musicPath);
        inputCount++;
      }

      if (inputCount === 3) {
        filterComplex.push(
          "[1:a]volume=1.0[voice]; [2:a]volume=0.3[music]; [music][voice]sidechaincompress=threshold=0.05:ratio=4[musicDucked]; [voice][musicDucked]amix=inputs=2:duration=first[finalAudio]"
        );
        command.complexFilter(filterComplex);
        command.outputOptions([
          "-map", "0:v:0", "-map", "[finalAudio]",
          "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
          "-t", videoDuration.toString(), "-movflags", "+faststart"
        ]);
      } else if (inputCount === 2) {
        command.outputOptions([
          "-map", "0:v:0", "-map", "1:a:0",
          "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
          "-t", videoDuration.toString(), "-movflags", "+faststart"
        ]);
      } else {
        command.outputOptions([
          "-map", "0:v:0", "-c:v", "copy",
          "-t", videoDuration.toString(), "-movflags", "+faststart"
        ]);
      }

      command
        .on("end", () => resolve(outputPath))
        .on("error", (err) => reject(err))
        .save(outputPath);

    } catch (error) {
      reject(error);
    }
  });
};

// ==========================================
// 5. INTERNAL RENDER FUNCTION
// ==========================================
const renderMovieInternal = async ({ scenes, voicePath, musicPath, outputPath }) => {
  let tempDir = null;
  try {
    console.log("🎬 Starting FFmpeg Render Pipeline...");
    
    tempDir = path.join(path.dirname(outputPath), `temp-render-${Date.now()}`);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const sceneVideos = [];

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const sceneDuration = Number(scene.duration) || 5;
      const mediaUrl = scene.media?.url || scene.mediaUrl || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23";
      
      const localImagePath = path.join(tempDir, `scene-${i}.jpg`);
      
      try {
        const response = await fetch(mediaUrl);
        const buffer = await response.arrayBuffer();
        await fsPromises.writeFile(localImagePath, Buffer.from(buffer));
      } catch (e) {
        console.warn(`⚠️ Warning: Could not fetch image for scene ${i}`);
      }

      const sceneOutputPath = path.join(tempDir, `output-scene-${i}.mp4`);
      if (fs.existsSync(localImagePath)) {
        await createSceneVideo(localImagePath, sceneDuration, scene.animation, sceneOutputPath);
        sceneVideos.push(sceneOutputPath);
      }
    }

    if (sceneVideos.length === 0) {
      throw new Error("No valid scenes could be processed into videos.");
    }

    const mergedVideoPath = path.join(tempDir, "merged_no_audio.mp4");
    await mergeVideos(sceneVideos, mergedVideoPath);

    await addAudioLayers(mergedVideoPath, voicePath, musicPath, outputPath);

    console.log(`✅ Video Successfully Rendered at: ${outputPath}`);
    return outputPath;

  } catch (error) {
    console.error("❌ Render Pipeline Error:", error);
    throw error;
  } finally {
    if (tempDir && fs.existsSync(tempDir)) {
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
    }
  }
};

// ==========================================
// 6. MAIN CONTROLLER EXPORT (createMovie)
// ==========================================
const { collectMedia } = require("./mediaCollector");
const { composeScenes } = require("./sceneComposerService");
const { applyBackgroundMusic } = require("./backgroundMusicService");
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

    const collectedMedia = collectMedia(movie);
    if (!collectedMedia || !Array.isArray(collectedMedia.visualMedia)) {
      throw new Error("Media collection failed. visualMedia is missing.");
    }

    const visualMedia = collectedMedia.visualMedia;
    if (visualMedia.length === 0) {
      throw new Error("No visual media available for movie rendering.");
    }

    console.log("🤖 Generating AI Screenplay...");
    const screenplay = await generateScreenplay(visualMedia);
    if (!screenplay || !Array.isArray(screenplay.scenes) || screenplay.scenes.length === 0) {
      throw new Error("AI screenplay generated no scenes.");
    }

    movie.screenplay = screenplay;
    await movie.save();

    let scenes = composeScenes({ scenes: screenplay.scenes }, visualMedia);
    if (!Array.isArray(scenes) || scenes.length === 0) {
      throw new Error("No scenes were created from screenplay.");
    }

    scenes = scenes.map((scene, index) => ({
      ...scene,
      animation: scene.animation || { type: "slow_zoom_in", intensity: "medium" },
      transition: scene.transition || { type: index === 0 ? "none" : "fade", duration: index === 0 ? 0 : 0.8 },
      caption: scene.caption || { text: "", position: "bottom" },
      importance: scene.importance || 0.5,
      backgroundMusic: null,
    }));

    scenes = applyBackgroundMusic(scenes);

    const primaryScene = scenes[0];
    const musicRecommendation = await recommendMusic(primaryScene);
    const musicTracks = await getMusicTracks(musicRecommendation);

    movie.musicRecommendations = musicTracks;
    const selectedMusic = Array.isArray(musicTracks) && musicTracks.length > 0 ? musicTracks[0]?.audioUrl : null;
    scenes.forEach((scene) => { scene.backgroundMusic = selectedMusic || null; });
    await movie.save();

    console.log("🎙️ Generating Narration...");
    const narrationText = scenes
      .map((scene) => scene.narration || "")
      .filter((text) => text.trim().length > 0)
      .join(". ");

    let voicePath = null;
    if (narrationText && narrationText.trim().length > 0) {
      voicePath = await generateVoice(narrationText);
    }

    const musicPath = scenes.find((scene) => scene.backgroundMusic)?.backgroundMusic || null;

    console.log("🎥 Starting Video Render...");
    const outputPath = path.join(__dirname, '..', '..', 'public', `finalMovie-${movie._id}.mp4`);

    const videoPath = await renderMovieInternal({
      scenes,
      voicePath,
      musicPath,
      outputPath,
    });

    console.log("☁️ Uploading Video to Cloudinary...");
    const uploadedVideo = await uploadVideo(videoPath);

    return {
      videoUrl: uploadedVideo.url,
      publicId: uploadedVideo.publicId,
    };

  } catch (error) {
    console.error("❌ MOVIE ENGINE ERROR:", error);
    throw error;
  }
};

module.exports = {
  createMovie
};