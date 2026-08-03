const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path;

const fs = require("fs");
const path = require("path");

// FFmpeg configuration

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

// Temp folder

const TEMP_FOLDER = path.join(__dirname, "temp");

if (!fs.existsSync(TEMP_FOLDER)) {
  fs.mkdirSync(TEMP_FOLDER, {
    recursive: true,
  });
}

// Helper: delete file

const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Helper: create folder

const createFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, {
      recursive: true,
    });
  }
};

// Helper: get file extension

const getExtension = (file) => {
  return path.extname(file).toLowerCase();
};
// Create video from single image

const createSceneVideo = (imagePath, outputPath, duration = 5) => {
  return new Promise((resolve, reject) => {
    ffmpeg(imagePath)
      .inputOptions(["-loop 1"])

      .videoFilters([
        {
          filter: "zoompan",
          options: {
            z: "zoom+0.0015",
            x: "iw/2-(iw/zoom/2)",
            y: "ih/2-(ih/zoom/2)",
            d: duration * 25,
            s: "1280x720",
          },
        },
      ])

      .outputOptions([
        "-t",
        duration.toString(),
        "-r",
        "25",
        "-pix_fmt",
        "yuv420p",
        "-c:v",
        "libx264",
      ])

      .on("start", (command) => {
        console.log("\n🎬 Creating Scene Video...");
        console.log(command);
      })

      .on("progress", (progress) => {
        console.log("Scene Progress:", Math.floor(progress.percent || 0) + "%");
      })

      .on("end", () => {
        console.log("✅ Scene Created");

        resolve();
      })

      .on("error", (error) => {
        console.log("❌ Scene Creation Error");
        console.log(error);

        reject(error);
      })

      .save(outputPath);
  });
};
// Merge all scene videos

const mergeVideos = (files, outputPath) => {
  return new Promise((resolve, reject) => {
    const listPath = path.join(TEMP_FOLDER, "files.txt");

    const content = files.map((file) => `file '${file}'`).join("\n");

    fs.writeFileSync(listPath, content);

    ffmpeg()
      .input(listPath)

      .inputOptions(["-f", "concat", "-safe", "0"])

      .outputOptions(["-c:v", "libx264", "-pix_fmt", "yuv420p"])

      .on("start", (command) => {
        console.log("\n🎬 Merging Scene Videos...");
        console.log(command);
      })

      .on("progress", (progress) => {
        console.log("Merge Progress:", Math.floor(progress.percent || 0) + "%");
      })

      .on("end", () => {
        console.log("✅ All Scenes Merged");

        deleteFile(listPath);

        resolve();
      })

      .on("error", (error) => {
        console.log("❌ Merge Error");

        console.log(error);

        reject(error);
      })

      .save(outputPath);
  });
};
// Add AI narration voice to video

const addVoice = (videoPath, audioPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoPath)

      .input(audioPath)

      .outputOptions([
        "-map",
        "0:v:0",

        "-map",
        "1:a:0",

        "-c:v",
        "copy",

        "-c:a",
        "aac",

        "-shortest",
      ])

      .on("start", (command) => {
        console.log("\n🎙 Adding Narration Voice...");
        console.log(command);
      })

      .on("progress", (progress) => {
        console.log("Voice Progress:", Math.floor(progress.percent || 0) + "%");
      })

      .on("end", () => {
        console.log("✅ Voice Added Successfully");

        resolve();
      })

      .on("error", (error) => {
        console.log("❌ Voice Add Error");

        console.log(error);

        reject(error);
      })

      .save(outputPath);
  });
};
// Add background music

const addMusic = (videoPath, musicPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoPath)

      .input(musicPath)

      .complexFilter([
        {
          filter: "volume",
          options: {
            volume: 0.18,
          },
          inputs: "1:a",
          outputs: "music",
        },

        {
          filter: "amix",
          options: {
            inputs: 2,
            duration: "first",
          },
          inputs: ["0:a", "music"],
          outputs: "mixed",
        },
      ])

      .outputOptions([
        "-map",
        "0:v",

        "-map",
        "[mixed]",

        "-c:v",
        "copy",

        "-c:a",
        "aac",

        "-shortest",
      ])

      .on("start", (command) => {
        console.log("\n🎵 Adding Background Music...");
        console.log(command);
      })

      .on("progress", (progress) => {
        console.log("Music Progress:", Math.floor(progress.percent || 0) + "%");
      })

      .on("end", () => {
        console.log("✅ Background Music Added");

        resolve();
      })

      .on("error", (error) => {
        console.log("❌ Music Error");

        console.log(error);

        reject(error);
      })

      .save(outputPath);
  });
};
const renderMovie = async ({ scenes, voicePath, musicPath, outputPath }) => {
  try {
    console.log("RENDER INPUT:", {
      scenes,
      voicePath,
      musicPath,
      outputPath
    });

    console.log("🎬 Movie Rendering Started");

    const sceneVideos = [];

    for (let i = 0; i < scenes.length; i++) {
        
      const scenePath = path.join(TEMP_FOLDER, `scene_${i}.mp4`);

      if (!scenes[i].media) {
        console.log("Skipping scene because media missing:", scenes[i].title);
        continue;
      }

      await createSceneVideo(
        scenes[i].media.url,
        scenePath,
        scenes[i].duration
      );

      sceneVideos.push(scenePath);
    }

    const mergedPath = path.join(TEMP_FOLDER, "merged.mp4");

    await mergeVideos(sceneVideos, mergedPath);

    let finalPath = mergedPath;

    if (voicePath) {
      const voicePathOutput = path.join(TEMP_FOLDER, "voice.mp4");

      await addVoice(finalPath, voicePath, voicePathOutput);

      finalPath = voicePathOutput;
    }

    if (musicPath) {
      const musicOutput = path.join(TEMP_FOLDER, "final.mp4");

      await addMusic(finalPath, musicPath, musicOutput);

      finalPath = musicOutput;
    }

    fs.copyFileSync(finalPath, outputPath);

    console.log("🎉 Movie Completed");

    return outputPath;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
module.exports = {
  createSceneVideo,
  mergeVideos,
  addVoice,
  addMusic,
  renderMovie,
};
