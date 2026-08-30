const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

const ALLOWED_TRANSITIONS = [
  "fade", "fadeblack", "fadewhite", "dissolve", "wipeleft", 
  "wiperight", "slideleft", "slideright", "circleopen", "circleclose"
];

const normalizeTransition = (type) => {
  return ALLOWED_TRANSITIONS.includes(type) ? type : "fade";
};

const applyTransitions = (video1, video2, outputPath, duration = 0.8, transitionType = "fade", offset = 0) => {
  return new Promise((resolve, reject) => {
    transitionType = normalizeTransition(transitionType);
    duration = Math.min(Math.max(Number(duration) || 0.8, 0.2), 1.5);
    offset = Math.max(Number(offset) || 0.1, duration);

    ffmpeg()
      .input(video1)
      .input(video2)
      .complexFilter([
        // NORMALIZE V1
        { filter: "scale", options: "1920:1080:force_original_aspect_ratio=decrease", inputs: "0:v", outputs: "v0scaled" },
        { filter: "pad", options: "1920:1080:(ow-iw)/2:(oh-ih)/2:black", inputs: "v0scaled", outputs: "v0padded" },
        { filter: "fps", options: { fps: 24 }, inputs: "v0padded", outputs: "v0fps" },
        { filter: "format", options: "yuv420p", inputs: "v0fps", outputs: "v0" },

        // NORMALIZE V2
        { filter: "scale", options: "1920:1080:force_original_aspect_ratio=decrease", inputs: "1:v", outputs: "v1scaled" },
        { filter: "pad", options: "1920:1080:(ow-iw)/2:(oh-ih)/2:black", inputs: "v1scaled", outputs: "v1padded" },
        { filter: "fps", options: { fps: 24 }, inputs: "v1padded", outputs: "v1fps" },
        { filter: "format", options: "yuv420p", inputs: "v1fps", outputs: "v1" },

        // XFADE TRANSITION
        { filter: "xfade", options: { transition: transitionType, duration: duration, offset: offset }, inputs: ["v0", "v1"], outputs: "transitioned" },
        { filter: "format", options: "yuv420p", inputs: "transitioned", outputs: "final" }
      ])
      .outputOptions([
        "-map", "[final]", "-an", "-c:v", "libx264", "-preset", "veryfast",
        "-crf", "20", "-pix_fmt", "yuv420p", "-r", "24", "-movflags", "+faststart"
      ])
      .on("end", () => {
        if (!fs.existsSync(outputPath)) {
          return reject(new Error(`Transition output was not created: ${outputPath}`));
        }
        resolve();
      })
      .on("error", (err) => reject(err))
      .save(outputPath);
  });
};

module.exports = { applyTransitions };