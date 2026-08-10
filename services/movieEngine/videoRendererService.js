const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path;
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { applyTransitions } = require("./transition");
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
const getMediaDuration = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (error, metadata) => {
      if (error) {
        return reject(error);
      }

      const duration = Number(metadata?.format?.duration);

      if (!Number.isFinite(duration) || duration <= 0) {
        return reject(new Error(`Invalid media duration: ${filePath}`));
      }

      resolve(duration);
    });
  });
};

const downloadMedia = async (url, outputPath) => {
  const response = await axios({
    method: "GET",
    url,
    responseType: "stream",
  });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(outputPath);

    response.data.pipe(writer);

    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};
const deleteFolder = (folderPath) => {
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, {
      recursive: true,
      force: true,
    });
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
const normalizeDuration = (duration, fallback = 5) => {
  const value = Number(duration);

  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  // Production-safe range
  return Math.min(Math.max(value, 2), 15);
};

// Create video from single image
const createSceneVideo = (
  mediaPath,
  outputPath,
  duration = 5,
  animation = {},
  caption = {},
) => {
  return new Promise((resolve, reject) => {
    if (!mediaPath) {
      return reject(new Error("Media path is required."));
    }

    if (!fs.existsSync(mediaPath)) {
      return reject(new Error(`Media file not found: ${mediaPath}`));
    }

    if (!outputPath) {
      return reject(new Error("Output path is required."));
    }
    const outputDirectory = path.dirname(outputPath);

    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, {
        recursive: true,
      });
    }
    const safeDuration = Number(duration);

    if (!Number.isFinite(safeDuration) || safeDuration <= 0) {
      return reject(new Error(`Invalid scene duration: ${duration}`));
    }

    if (safeDuration > 30) {
      return reject(
        new Error(`Scene duration cannot exceed 30 seconds: ${safeDuration}`),
      );
    }
    const ext = path.extname(mediaPath).toLowerCase();

    const isImage = [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
    const allowedAnimations = [
      "slow_zoom_in",
      "slow_zoom_out",
      "pan_left",
      "pan_right",
    ];

    const animationType = allowedAnimations.includes(animation?.type)
      ? animation.type
      : "slow_zoom_in";

    const allowedIntensities = ["low", "medium", "high"];

    const intensity = allowedIntensities.includes(animation?.intensity)
      ? animation.intensity
      : "medium";

    const captionText = caption?.text || "";
    const captionPosition = caption?.position || "bottom";
    const safeCaptionText = captionText
      .replace(/\\/g, "\\\\")
      .replace(/:/g, "\\:")
      .replace(/'/g, "\\'")
      .replace(/%/g, "\\%")
      .replace(/\n/g, "\\n");
    console.log("Caption:", captionText);
    console.log("Caption Position:", captionPosition);

    console.log("\n==============================");
    console.log("🎬 CREATING CINEMATIC PHOTO SCENE");
    console.log("==============================");

    console.log("Media:", mediaPath);
    console.log("Duration:", duration);
    console.log("Animation:", animationType, intensity);

    let command = ffmpeg(mediaPath);

    if (isImage) {
      command.inputOptions(["-loop 1"]);

      let zoomExpression;
      let xExpression;

      switch (animationType) {
        case "slow_zoom_out":
          zoomExpression = "if(lte(zoom,1.0),1.02,max(1.001,zoom-0.0003))";

          xExpression = "iw/2-(iw/zoom/2)";

          break;

        case "pan_left":
          zoomExpression = "1.08";

          xExpression = "iw/2-(iw/zoom/2)-40";

          break;

        case "pan_right":
          zoomExpression = "1.08";

          xExpression = "iw/2-(iw/zoom/2)+40";

          break;

        case "slow_zoom_in":

        default:
          zoomExpression =
  intensity === "high"
    ? "min(zoom+0.0005,1.03)"
    : intensity === "low"
      ? "min(zoom+0.0002,1.015)"
      : "min(zoom+0.0003,1.02)";

          xExpression = "iw/2-(iw/zoom/2)";

          break;
      }

      command.complexFilter(
        [
          /*
 CREATE BACKGROUND
*/

          {
            filter: "split",
            options: 2,
            outputs: ["background", "foreground"],
          },

          /*
 BLURRED BACKGROUND
*/

          {
            filter: "scale",
            options: {
              w: 1920,
              h: 1080,
              force_original_aspect_ratio: "increase",
            },
            inputs: "background",
            outputs: "bgScale",
          },

          {
            filter: "crop",
            options: {
              w: 1920,
              h: 1080,
              x: "(iw-1920)/2",
              y: "(ih-1080)/2",
            },
            inputs: "bgScale",
            outputs: "bgCrop",
          },

          {
            filter: "boxblur",
            options: {
              luma_radius: 25,
              luma_power: 1,
            },
            inputs: "bgCrop",
            outputs: "blurBackground",
          },

          /*
 MAIN PHOTO
*/

          {
            filter: "scale",
            options: {
              w: 1720,
              h: 968,
              force_original_aspect_ratio: "decrease",
            },
            inputs: "foreground",
            outputs: "mainImage",
          },

          /*
 CAMERA MOVEMENT
*/

          {
            filter: "zoompan",
            options: {
              z: zoomExpression,

              x: xExpression,

              y: "ih/2-(ih/zoom/2)",

              d: Math.ceil(safeDuration * 24),

              s: "1720x968",

              fps: 24,
            },

            inputs: "mainImage",

            outputs: "animatedImage",
          },

          /*
 MERGE
*/

          {
            filter: "overlay",

            options: {
              x: "(W-w)/2",
              y: "(H-h)/2",
            },

            inputs: ["blurBackground", "animatedImage"],

            outputs: "composedScene",
          },

          // ============================
          // CINEMATIC CAPTION
          // ============================

          ...(captionText
            ? [
                {
                  filter: "drawtext",

                  options: {
                    text: safeCaptionText,

                    font: "Arial",

                    fontsize: 52,

                    fontcolor: "white",

                    borderw: 3,

                    bordercolor: "black",

                    shadowx: 2,

                    shadowy: 2,

                    x: "(w-text_w)/2",

                    y:
                      captionPosition === "top"
                        ? "120"
                        : captionPosition === "center"
                          ? "(h-text_h)/2"
                          : "h-text_h-140",
                  },

                  inputs: "composedScene",

                  outputs: "finalScene",
                },
              ]
            : [
                {
                  filter: "null",

                  inputs: "composedScene",

                  outputs: "finalScene",
                },
              ]),
        ],
        "finalScene",
      );
    }

    command
      .outputOptions([
        "-t",
        safeDuration.toString(),

        "-r",
        "24",

        "-c:v",
        "libx264",

        "-preset",
        "veryfast",

        "-crf",
        "20",

        "-pix_fmt",
        "yuv420p",

        "-movflags",
        "+faststart",
      ])

      .on("start", (cmd) => {
        console.log("\n🎬 SCENE FFMPEG COMMAND");

        console.log(cmd);
      })

      .on("progress", (progress) => {
        console.log("Scene Progress:", Math.floor(progress.percent || 0) + "%");
      })
      .on("end", () => {
        console.log("✅ Cinematic Photo Scene Created");

        if (!fs.existsSync(outputPath)) {
          return reject(
            new Error(`Scene output file was not created: ${outputPath}`),
          );
        }

        const stats = fs.statSync(outputPath);

        console.log("✅ Scene file created:", outputPath);
        console.log("📦 Scene file size:", stats.size, "bytes");

        if (stats.size < 10000) {
          return reject(
            new Error(`Scene output is invalid or empty: ${outputPath}`),
          );
        }

        resolve();
      })

      .on("error", (error, stdout, stderr) => {
        console.error("❌ SCENE FFMPEG ERROR");
        console.error("Message:", error.message);
        console.error("STDOUT:", stdout);
        console.error("STDERR:", stderr);

        reject(error);
      })

      .save(outputPath);
  });
};
// Process existing video scene
// Process existing video scene
const processVideoScene = (
  videoPath,
  outputPath,
  duration = 5,
  animation = {},
) => {
  return new Promise((resolve, reject) => {
    const safeDuration = Number(duration);

    if (!Number.isFinite(safeDuration) || safeDuration <= 0) {
      return reject(new Error(`Invalid video scene duration: ${duration}`));
    }

    if (safeDuration > 30) {
      return reject(
        new Error(
          `Video scene duration cannot exceed 30 seconds: ${safeDuration}`,
        ),
      );
    }
    if (!videoPath) {
      return reject(new Error("Video path is required."));
    }

    if (!fs.existsSync(videoPath)) {
      return reject(new Error(`Video file not found: ${videoPath}`));
    }

    if (!outputPath) {
      return reject(new Error("Output path is required."));
    }

    const allowedAnimations = ["slow_zoom_in", "slow_zoom_out"];

    const animationType = allowedAnimations.includes(animation?.type)
      ? animation.type
      : "slow_zoom_in";

    const allowedIntensities = ["low", "medium", "high"];

    const intensity = allowedIntensities.includes(animation?.intensity)
      ? animation.intensity
      : "medium";

    console.log("\n==============================");
    console.log("🎥 PROCESSING CINEMATIC VIDEO");
    console.log("==============================");

    console.log("Video:", videoPath);
    console.log("Duration:", duration);
    console.log("Animation:", animationType);
    console.log("Intensity:", intensity);
    console.log("Output:", outputPath);

    // Make sure output directory exists
    const outputDirectory = path.dirname(outputPath);

    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, {
        recursive: true,
      });
    }

    let zoomExpression;

    switch (animationType) {
      case "slow_zoom_out":
        zoomExpression =
          intensity === "high"
            ? "max(1.001,zoom-0.002)"
            : "max(1.001,zoom-0.001)";

        break;

      case "slow_zoom_in":

      default:
        zoomExpression =
          intensity === "high"
            ? "min(zoom+0.0015,1.08)"
            : "min(zoom+0.0008,1.05)";

        break;
    }

    ffmpeg(videoPath)
      .complexFilter(
        [
          // ============================
          // SPLIT VIDEO
          // ============================

          {
            filter: "split",
            options: 2,
            outputs: ["bg", "fg"],
          },

          // ============================
          // BACKGROUND
          // ============================

          {
            filter: "scale",
            options: {
              w: 1920,
              h: 1080,
              force_original_aspect_ratio: "increase",
            },
            inputs: "bg",
            outputs: "bgScale",
          },

          {
            filter: "crop",
            options: {
              w: 1920,
              h: 1080,
              x: "(iw-1920)/2",
              y: "(ih-1080)/2",
            },
            inputs: "bgScale",
            outputs: "bgCrop",
          },

          {
            filter: "boxblur",
            options: {
              luma_radius: 30,
              luma_power: 1,
            },
            inputs: "bgCrop",
            outputs: "blurBG",
          },

          // ============================
          // MAIN VIDEO
          // ============================

          {
            filter: "scale",
            options: {
              w: 1720,
              h: 968,
              force_original_aspect_ratio: "decrease",
            },
            inputs: "fg",
            outputs: "mainVideo",
          },

          // ============================
          // CINEMATIC CAMERA MOVEMENT
          // ============================

          {
            filter: "zoompan",
            options: {
              z: zoomExpression,
              d: Math.ceil(safeDuration * 24),
              s: "1720x968",
              fps: 24,
            },
            inputs: "mainVideo",
            outputs: "zoomVideo",
          },

          // ============================
          // COMBINE
          // ============================

          {
            filter: "overlay",
            options: {
              x: "(W-w)/2",
              y: "(H-h)/2",
            },
            inputs: ["blurBG", "zoomVideo"],
            outputs: "composedVideo",
          },
          {
            filter: "scale",
            options: {
              w: 1920,
              h: 1080,
              force_original_aspect_ratio: "decrease",
            },
            inputs: "composedVideo",
            outputs: "finalVideo",
          },
        ],

        // IMPORTANT:
        // This already maps [finalVideo].
        "finalVideo",
      )

      .outputOptions([
        // ❌ DO NOT ADD:
        // "-map",
        // "[finalVideo]",

        // Only map original audio

        "-map",
        "0:a?",

        "-t",
        safeDuration.toString(),

        "-r",
        "24",

        "-c:v",
        "libx264",

        "-preset",
        "medium",

        "-crf",
        "18",

        "-pix_fmt",
        "yuv420p",

        "-movflags",
        "+faststart",

        "-shortest",
      ])

      .on("start", (commandLine) => {
        console.log("\n🎥 VIDEO FFMPEG COMMAND:");

        console.log(commandLine);
      })

      .on("stderr", (stderrLine) => {
        console.log("FFmpeg STDERR:", stderrLine);
      })

      .on("progress", (progress) => {
        console.log("Video Progress:", Math.floor(progress.percent || 0) + "%");
      })

      .on("end", () => {
        console.log("✅ Cinematic Video Scene Created");

        console.log("Output:", outputPath);

        if (!fs.existsSync(outputPath)) {
          return reject(
            new Error(`Video scene output was not created: ${outputPath}`),
          );
        }

        const stats = fs.statSync(outputPath);

        console.log("📦 Video scene file size:", stats.size, "bytes");

        if (stats.size < 10000) {
          return reject(
            new Error(`Video scene output is invalid or empty: ${outputPath}`),
          );
        }

        resolve();
      })

      .on("error", (error, stdout, stderr) => {
        console.error("\n❌ VIDEO FFMPEG ERROR");

        console.error("Message:", error.message);

        console.error("STDOUT:", stdout);

        console.error("STDERR:", stderr);

        reject(error);
      })

      .save(outputPath);
  });
};
// Merge all scene videos
const mergeVideos = (files, outputPath) => {
  return new Promise((resolve, reject) => {
    if (!files.length) {
      return reject(new Error("No videos to merge"));
    }

    const listPath = path.join(TEMP_FOLDER, "merge.txt");

    const content = files
      .map((file) => `file '${file.replace(/\\/g, "/")}'`)
      .join("\n");

    fs.writeFileSync(listPath, content);

    console.log("🎞 MERGING SCENES");

    ffmpeg()
      .input(listPath)

      .inputOptions(["-f concat", "-safe 0"])

      .outputOptions([
        "-c:v",
        "libx264",

        "-c:a",
        "aac",

        "-preset",
        "medium",

        "-crf",
        "18",

        "-pix_fmt",
        "yuv420p",

        "-movflags",
        "+faststart",
      ])

      .on("start", (cmd) => {
        console.log("MERGE COMMAND", cmd);
      })

      .on("progress", (p) => {
        console.log("Merge:", Math.floor(p.percent || 0) + "%");
      })

      .on("end", () => {
        deleteFile(listPath);

        console.log("✅ MERGE COMPLETE");

        resolve();
      })

      .on("error", (err) => {
        console.log("❌ MERGE ERROR", err.message);

        reject(err);
      })

      .save(outputPath);
  });
};

// Add narration voice
const addVoice = async (videoPath, audioPath, outputPath) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("\n==============================");
      console.log("🎙 ADDING NARRATION VOICE");
      console.log("==============================");

      const videoDuration = await getMediaDuration(videoPath);
      const audioDuration = await getMediaDuration(audioPath);

      console.log("Video Duration:", videoDuration);
      console.log("Voice Duration:", audioDuration);

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

          "-b:a",
          "192k",

          "-t",
          videoDuration.toString(),

          "-movflags",
          "+faststart",
        ])

        .on("start", (command) => {
          console.log("\n🎙 VOICE COMMAND:");
          console.log(command);
        })

        .on("stderr", (stderrLine) => {
          console.log("Voice FFmpeg STDERR:", stderrLine);
        })

        .on("progress", (progress) => {
          console.log(
            "Voice Progress:",
            Math.floor(progress.percent || 0) + "%",
          );
        })

        .on("end", () => {
          console.log("✅ Narration Added Successfully");

          resolve();
        })

        .on("error", (error, stdout, stderr) => {
          console.error("\n❌ VOICE FFMPEG ERROR");

          console.error("Message:", error.message);

          console.error("STDOUT:", stdout);
          console.error("STDERR:", stderr);

          reject(error);
        })

        .save(outputPath);
    } catch (error) {
      reject(error);
    }
  });
};

// Add background music
const addMusic = async (videoPath, musicPath, outputPath) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("\n==============================");
      console.log("🎵 ADDING BACKGROUND MUSIC");
      console.log("==============================");

      const videoDuration = await getMediaDuration(videoPath);

      console.log("Video Duration:", videoDuration);

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
              dropout_transition: 2,
            },
            inputs: ["0:a", "music"],
            outputs: "mixedAudio",
          },
        ])

        .outputOptions([
          "-map",
          "0:v:0",

          "-map",
          "[mixedAudio]",

          "-c:v",
          "copy",

          "-c:a",
          "aac",

          "-b:a",
          "192k",

          "-t",
          videoDuration.toString(),

          "-movflags",
          "+faststart",
        ])

        .on("start", (command) => {
          console.log("\n🎵 MUSIC COMMAND:");
          console.log(command);
        })

        .on("stderr", (stderrLine) => {
          console.log("Music FFmpeg STDERR:", stderrLine);
        })

        .on("progress", (progress) => {
          console.log(
            "Music Progress:",
            Math.floor(progress.percent || 0) + "%",
          );
        })

        .on("end", () => {
          console.log("✅ Background Music Added");

          resolve();
        })

        .on("error", (error, stdout, stderr) => {
          console.error("\n❌ MUSIC FFMPEG ERROR");

          console.error("Message:", error.message);

          console.error("STDOUT:", stdout);
          console.error("STDERR:", stderr);

          reject(error);
        })

        .save(outputPath);
    } catch (error) {
      reject(error);
    }
  });
};

// Main movie renderer
const renderMovie = async ({ scenes, voicePath, musicPath, outputPath }) => {
  let renderFolder = null;
  try {
    console.log("\n\n================================");
    console.log("🎬 MOVIE RENDERING STARTED");
    console.log("================================");

    console.log("RENDER INPUT:", {
      scenes,
      voicePath,
      musicPath,
      outputPath,
    });

    if (!scenes || scenes.length === 0) {
      throw new Error("No scenes available for rendering.");
    }

    const sceneVideos = [];
    const renderedScenes = [];
    const renderId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    renderFolder = path.join(TEMP_FOLDER, renderId);

    createFolder(renderFolder);

    console.log("🎬 Render Folder:", renderFolder);

    for (let i = 0; i < scenes.length; i++) {
      const sceneDuration = normalizeDuration(scenes[i].duration);

      console.log("\n------------------------------");
      console.log(`🎬 Processing Scene ${i + 1}`);
      console.log("------------------------------");

      console.log("Scene:", scenes[i]);

      if (!scenes[i].media) {
        console.log(
          "⚠️ Skipping scene because media missing:",
          scenes[i].title,
        );

        continue;
      }

      const scenePath = path.join(renderFolder, `scene-${i}.mp4`);

      const mediaUrl = scenes[i].media.url;

      if (!mediaUrl) {
        console.log(
          "⚠️ Skipping scene because media URL missing:",
          scenes[i].title,
        );

        continue;
      }

      const mediaExtension = path.extname(new URL(mediaUrl).pathname) || ".bin";

      const localMediaPath = path.join(
        renderFolder,
        `media-${i}${mediaExtension}`,
      );

      await downloadMedia(mediaUrl, localMediaPath);

      console.log("📥 Local Media:", localMediaPath);

      createFolder(TEMP_FOLDER);
      console.log(`🎬 Processing Scene ${i + 1}`);
      console.log("------------------------------");

      console.log("Scene:", scenes[i]);
      if (!scenes[i].media) {
        console.log(
          "⚠️ Skipping scene because media missing:",
          scenes[i].title,
        );

        continue;
      }
      if (scenes[i].media.type === "photo" || scenes[i].media.type === "chat") {
        await createSceneVideo(
          localMediaPath,
          scenePath,
          sceneDuration,
          scenes[i].animation,
          scenes[i].caption,
        );
      } else if (scenes[i].media.type === "video") {
        await processVideoScene(
          localMediaPath,
          scenePath,
          sceneDuration,
          scenes[i].animation,
        );
      } else {
        console.log("⚠️ Unsupported media type:", scenes[i].media.type);

        continue;
      }

      sceneVideos.push({
        path: scenePath,
        sceneIndex: i,
        duration: sceneDuration,
      });
      renderedScenes.push(scenes[i]);
    }

    console.log("\n==============================");
    console.log("SCENE VIDEOS BEFORE MERGE:");
    console.log(sceneVideos);
    console.log("==============================");

    if (sceneVideos.length === 0) {
      throw new Error(
        "No scene videos were generated. Check scene media URLs and types.",
      );
    }

    let mergedPath = path.join(renderFolder, "merged.mp4");

await mergeVideos(
  sceneVideos.map((scene) => scene.path),
  mergedPath
);

    let finalPath = mergedPath;
    if (voicePath) {
      const voicePathOutput = path.join(renderFolder, "voice.mp4");

      await addVoice(finalPath, voicePath, voicePathOutput);

      finalPath = voicePathOutput;
    }

    if (musicPath) {
      const musicOutput = path.join(renderFolder, "final.mp4");

      await addMusic(finalPath, musicPath, musicOutput);

      finalPath = musicOutput;
    }

    fs.copyFileSync(finalPath, outputPath);

    console.log("\n================================");
    console.log("🎉 MOVIE COMPLETED");
    console.log("Output:", outputPath);
    console.log("================================");

    return outputPath;
  } catch (error) {
    console.error("\n================================");
    console.error("❌ MOVIE ENGINE ERROR");
    console.error("================================");
    console.error(error);
    console.error("Message:", error.message);

    throw error;
  } finally {
    if (renderFolder && fs.existsSync(renderFolder)) {
      console.log("🧹 Cleaning render folder...");
      deleteFolder(renderFolder);
      console.log("✅ Render temp files cleaned");
    }
  }
};

module.exports = {
  createSceneVideo,
  processVideoScene,
  mergeVideos,
  addVoice,
  addMusic,
  renderMovie,
  getMediaDuration,
};
