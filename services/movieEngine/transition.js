
const ffmpeg = require("fluent-ffmpeg");

const ALLOWED_TRANSITIONS = [
  "fade",
  "fadeblack",
  "fadewhite",
  "dissolve",
  "wipeleft",
  "wiperight",
  "slideleft",
  "slideright",
  "circleopen",
  "circleclose",
];

const normalizeTransition = (type) => {
  if (!ALLOWED_TRANSITIONS.includes(type)) {
    return "fade";
  }

  return type;
};

const applyTransitions = (
  video1,
  video2,
  outputPath,
  duration = 0.8,
  transitionType = "fade",
  offset = 0
) => {
  return new Promise((resolve, reject) => {
    transitionType = normalizeTransition(transitionType);

    duration = Math.min(
      Math.max(Number(duration) || 0.8, 0.2),
      1.5
    );

    offset = Math.max(Number(offset) || 0.1, duration);

    console.log("\n==============================");
    console.log("🎬 APPLYING CINEMATIC TRANSITION");
    console.log("==============================");

    console.log("Video 1:", video1);
    console.log("Video 2:", video2);
    console.log("Transition:", transitionType);
    console.log("Duration:", duration);
    console.log("Offset:", offset);

    ffmpeg()
      .input(video1)
      .input(video2)

      .complexFilter([
        // ---------------------------------------
        // NORMALIZE FIRST VIDEO
        // ---------------------------------------

        {
          filter: "scale",
          options: {
            w: 1920,
            h: 1080,
            force_original_aspect_ratio: "decrease",
          },
          inputs: "0:v",
          outputs: "v0scaled",
        },

        {
          filter: "pad",
          options: {
            w: 1920,
            h: 1080,
            x: "(ow-iw)/2",
            y: "(oh-ih)/2",
            color: "black",
          },
          inputs: "v0scaled",
          outputs: "v0padded",
        },

        {
          filter: "fps",
          options: {
            fps: 24,
          },
          inputs: "v0padded",
          outputs: "v0fps",
        },

        {
          filter: "format",
          options: "yuv420p",
          inputs: "v0fps",
          outputs: "v0",
        },

        // ---------------------------------------
        // NORMALIZE SECOND VIDEO
        // ---------------------------------------

        {
          filter: "scale",
          options: {
            w: 1920,
            h: 1080,
            force_original_aspect_ratio: "decrease",
          },
          inputs: "1:v",
          outputs: "v1scaled",
        },

        {
          filter: "pad",
          options: {
            w: 1920,
            h: 1080,
            x: "(ow-iw)/2",
            y: "(oh-ih)/2",
            color: "black",
          },
          inputs: "v1scaled",
          outputs: "v1padded",
        },

        {
          filter: "fps",
          options: {
            fps: 24,
          },
          inputs: "v1padded",
          outputs: "v1fps",
        },

        {
          filter: "format",
          options: "yuv420p",
          inputs: "v1fps",
          outputs: "v1",
        },

        // ---------------------------------------
        // TRANSITION
        // ---------------------------------------

        {
          filter: "xfade",
          options: {
            transition: transitionType,
            duration: duration,
            offset: offset,
          },
          inputs: ["v0", "v1"],
          outputs: "transitioned",
        },

        {
          filter: "format",
          options: "yuv420p",
          inputs: "transitioned",
          outputs: "final",
        },
      ])

      .outputOptions([
        "-map",
        "[final]",

        "-an",

        "-c:v",
        "libx264",

        "-preset",
        "veryfast",

        "-crf",
        "20",

        "-pix_fmt",
        "yuv420p",

        "-r",
        "24",

        "-movflags",
        "+faststart",
      ])

      .on("start", (cmd) => {
        console.log("\n🎬 TRANSITION FFMPEG COMMAND:");
        console.log(cmd);
      })

      .on("stderr", (line) => {
        console.log("Transition FFmpeg:", line);
      })

      .on("progress", (progress) => {
        console.log(
          "Transition:",
          Math.floor(progress.percent || 0) + "%"
        );
      })

      .on("end", () => {
        console.log("✅ Transition Completed");

        if (!require("fs").existsSync(outputPath)) {
          return reject(
            new Error(
              `Transition output was not created: ${outputPath}`
            )
          );
        }

        resolve();
      })

      .on("error", (error, stdout, stderr) => {
        console.error("\n❌ TRANSITION ERROR");
        console.error("Message:", error.message);
        console.error("STDOUT:", stdout);
        console.error("STDERR:", stderr);

        reject(error);
      })

      .save(outputPath);
  });
};

module.exports = {
  applyTransitions,
};

