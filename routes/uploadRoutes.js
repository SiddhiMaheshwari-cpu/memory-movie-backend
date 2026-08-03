const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");
const {
  uploadFile,
  uploadPhotoToMovie,
  deletePhoto,
  uploadVideoToMovie,
    deleteVideo,
    uploadAudioToMovie,
    deleteAudio,
    uploadChatScreenshotToMovie,deleteChatScreenshot
} = require("../controllers/uploadController");

router.post("/upload", upload.single("file"), uploadFile);
router.post("/movies/:id/photos", upload.single("file"), uploadPhotoToMovie);
router.delete("/movies/:movieId/photos/:photoId", deletePhoto);
router.post("/movies/:id/videos", upload.single("file"), uploadVideoToMovie);
router.delete("/movies/:movieId/videos/:videoId", deleteVideo);
router.post("/movies/:id/audio", upload.single("file"), uploadAudioToMovie);
router.delete("/movies/:movieId/audio/:audioId", deleteAudio);
router.post("/movies/:id/chat-screenshots", upload.single("file"), uploadChatScreenshotToMovie);
router.delete("/movies/:movieId/chat-screenshots/:screenshotId", deleteChatScreenshot);
module.exports = router;
