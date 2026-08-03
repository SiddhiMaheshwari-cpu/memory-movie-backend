const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const path = require("path");
const fs = require("fs");

ffmpeg.setFfmpegPath(ffmpegPath);

const createMovie = async (movie) => {
  return new Promise((resolve, reject) => {
    try {
      console.log("Photos:", movie.photos.length);
      console.log("Videos:", movie.videos.length);

      const totalMedia = movie.photos.length + movie.videos.length;

      if (totalMedia === 0) {
        throw new Error("No media found for rendering");
      }

      const outputDir = path.join(__dirname, "..", "renderedMovies");

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const outputPath = path.join(outputDir, `movie-${movie._id}.mp4`);

      const command = ffmpeg();

      // Add Photos
      movie.photos.forEach((photo) => {
        if (photo.url) {
          command.input(photo.url).inputOptions(["-loop 1", "-t 5"]);
        }
      });

      // Add Videos
      movie.videos.forEach((video) => {
        if (video.url) {
          command.input(video.url);
        }
      });

      command
        .outputOptions(["-c:v libx264", "-pix_fmt yuv420p", "-r 25"])
        .on("start", (commandLine) => {
          console.log("FFmpeg started:");
          console.log(commandLine);
        })
        .on("end", () => {
          console.log("Movie created successfully");

          resolve(outputPath);
        })
        .on("error", (error) => {
          console.log("FFmpeg Error:", error);

          reject(error);
        })
        .save(outputPath);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createMovie,
};
