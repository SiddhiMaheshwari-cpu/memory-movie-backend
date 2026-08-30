const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const ffmpegStatic = require("ffmpeg-static");
const ffprobeStatic = require("ffprobe-static"); 
const Movie = require("../../models/movieModel");

// Set both FFmpeg and FFprobe paths automatically
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path); 

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
// 📝 Helper: Convert scenes array into a standard SRT subtitle string
const generateSRTContent = (scenes) => {
  let srtContent = "";
  let currentTime = 0;

  scenes.forEach((scene, index) => {
    const startTime = formatSRTTime(currentTime);
    const duration = Number(scene.duration) || 5;
    currentTime += duration;
    const endTime = formatSRTTime(currentTime);

    srtContent += `${index + 1}\n${startTime} --> ${endTime}\n${scene.narration}\n\n`;
  });

  return srtContent;
};

// Helper: Format seconds into HH:MM:SS,ms
const formatSRTTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  const milliseconds = Math.floor((totalSeconds % 1) * 1000).toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds},${milliseconds}`;
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

    // Completely avoid -loop command to bypass "Option loop not found"
    ffmpeg()
      .input(imagePath)
      .inputFPS(1 / safeDuration)
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
        "-t", safeDuration.toString(),
        "-r", "25"
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
// 4. ADD VOICE, MUSIC MIXING & BURN SUBTITLES
// ==========================================
// 4. ADD VOICE, MUSIC MIXING & BURN SUBTITLES
// ==========================================
// ==========================================
// 4. ADD VOICE, MUSIC MIXING & BURN SUBTITLES
// ==========================================
// ==========================================
// 4. ADD VOICE, MUSIC MIXING & BURN SUBTITLES
// ==========================================
// ==========================================
// 4. ADD VOICE, MUSIC MIXING & BURN SUBTITLES
// ==========================================
const addAudioLayers = async (videoPath, voicePath, musicPath, srtPath, outputPath) => {
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

      // 📝 Clean relative path (e.g., "public/captions-123.srt") avoids Windows username spaces and drive colons
      let escapedSrtPath = path.relative(process.cwd(), srtPath).replace(/\\/g, '/');
      
      // Styling: Cyan text, slight black transparent background box, centered at bottom
      const subStyle = "FontName=Arial,FontSize=20,PrimaryColour=&H005DD8E2&,OutlineColour=&H00000000&,BackColour=&H80000000&,BorderStyle=1,Outline=2,Shadow=1,Alignment=2";
      const videoFilter = `subtitles='${escapedSrtPath}':force_style='${subStyle}'`;

      if (inputCount === 3) {
        filterComplex.push(
          `[1:a]volume=1.0[voice]; [2:a]volume=0.3[music]; [music][voice]sidechaincompress=threshold=0.05:ratio=4[musicDucked]; [voice][musicDucked]amix=inputs=2:duration=first,afade=t=out:st=${Math.max(0, videoDuration - 2)}:d=2[finalAudio]`
        );
        command.complexFilter(filterComplex);
        command.outputOptions([
          "-map", "0:v:0", "-map", "[finalAudio]",
          "-vf", videoFilter,
          "-c:v", "libx264", "-preset", "fast", "-crf", "23",
          "-c:a", "aac", "-b:a", "192k",
          "-t", videoDuration.toString(), "-movflags", "+faststart"
        ]);
      } else if (inputCount === 2) {
        command.outputOptions([
          "-map", "0:v:0", "-map", "1:a:0",
          "-vf", videoFilter,
          "-c:v", "libx264", "-preset", "fast", "-crf", "23",
          "-c:a", "aac", "-b:a", "192k",
          "-t", videoDuration.toString(), "-movflags", "+faststart"
        ]);
      } else {
        command.outputOptions([
          "-map", "0:v:0",
          "-vf", videoFilter,
          "-c:v", "libx264", "-preset", "fast", "-crf", "23",
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
// 5. INTERNAL RENDER FUNCTION
// ==========================================
const renderMovieInternal = async ({ scenes, voicePath, musicPath, outputPath }) => {
  let tempDir = null;
  let publicSrtPath = null;
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

    // 📝 WRITE SRT TO A CLEAN PATH IN THE PUBLIC FOLDER (NO SPACES IN USERNAME ISSUES)
    const srtContent = generateSRTContent(scenes);
    publicSrtPath = path.join(__dirname, '..', '..', 'public', `captions-${Date.now()}.srt`);
    await fsPromises.writeFile(publicSrtPath, srtContent);
    console.log("📝 Clean Subtitle SRT file generated at:", publicSrtPath);

    // Pass this clean path to addAudioLayers
    await addAudioLayers(mergedVideoPath, voicePath, musicPath, publicSrtPath, outputPath);

    console.log(`✅ Video Successfully Rendered at: ${outputPath}`);
    return outputPath;

  } catch (error) {
    console.error("❌ Render Pipeline Error:", error);
    throw error;
  } finally {
    // Clean up temp folder and the standalone srt file
    if (tempDir && fs.existsSync(tempDir)) {
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
    }
    if (publicSrtPath && fs.existsSync(publicSrtPath)) {
      try { fs.unlinkSync(publicSrtPath); } catch (e) {}
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

// 👈 INJECT THEME HERE
const createMovie = async (movie, theme = "Cinematic & Emotional") => { 
  try {
    console.log("\n================================");
    console.log("🎬 MOVIE ENGINE STARTED");
    console.log(`🎛️ APPLYING THEME: ${theme}`);
    console.log("================================");

    const collectedMedia = await collectMedia(movie);
    if (!collectedMedia || !Array.isArray(collectedMedia.visualMedia)) {
      throw new Error("Media collection failed. visualMedia is missing.");
    }

    const visualMedia = collectedMedia.visualMedia;
    if (visualMedia.length === 0) {
      throw new Error("No visual media available for movie rendering.");
    }

    console.log("🤖 Generating AI Screenplay...");
    // 👈 PASS THEME TO SCREENPLAY GENERATOR
    const screenplay = await generateScreenplay(visualMedia, theme);
    
    if (!screenplay || !Array.isArray(screenplay.scenes) || screenplay.scenes.length === 0) {
      throw new Error("AI screenplay generated no scenes.");
    }

    // Use findByIdAndUpdate to avoid Mongoose version mismatch errors
    await Movie.findByIdAndUpdate(movie._id, { screenplay: screenplay });

    let scenes = composeScenes({ scenes: screenplay.scenes }, visualMedia);
    if (!Array.isArray(scenes) || scenes.length === 0) {
      throw new Error("No scenes were created from screenplay.");
    }

    // 🎙️ GENERATE VOICE FIRST TO GET EXACT DURATION
    console.log("🎙️ Generating Narration...");
    const narrationText = scenes
      .map((scene) => scene.narration || "")
      .filter((text) => text.trim().length > 0)
      .join(". ");

    let voicePath = null;
    let voiceDuration = 0;

    if (narrationText && narrationText.trim().length > 0) {
      voicePath = await generateVoice(narrationText);
      try {
        // Measure the exact length of the generated audio
        voiceDuration = await getMediaDuration(voicePath);
        console.log(`⏱️ Generated Voice Duration: ${voiceDuration.toFixed(2)}s`);
      } catch (err) {
        console.warn("⚠️ Could not calculate voice duration, using fallback.");
        voiceDuration = scenes.length * 5; // Fallback
      }
    }

    // ⏱️ DYNAMIC SCENE DURATION SYNC
    const totalScenes = scenes.length;
    // We add a 2-second buffer to the voice duration to let the video breathe at the end
    const minRequiredTotalDuration = voiceDuration > 0 ? voiceDuration + 2 : totalScenes * 5;
    
    // Divide the total required time evenly across all scenes (minimum 4s per scene)
    const perSceneDuration = Math.max(4, Math.ceil(minRequiredTotalDuration / totalScenes));
    console.log(`⏱️ Synchronizing visuals: Setting each scene to ${perSceneDuration}s to match audio...`);

    scenes = scenes.map((scene, index) => ({
      ...scene,
      duration: perSceneDuration, // Injecting the dynamically calculated duration
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

    const selectedMusic = Array.isArray(musicTracks) && musicTracks.length > 0 ? musicTracks[0]?.audioUrl : null;
    scenes.forEach((scene) => { scene.backgroundMusic = selectedMusic || null; });

    await Movie.findByIdAndUpdate(movie._id, { musicRecommendations: musicTracks });

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