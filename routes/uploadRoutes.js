/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Media upload APIs
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a file to Cloudinary
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 */

/**
 * @swagger
 * /movies/{id}/photos:
 *   post:
 *     summary: Upload photo to movie
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
 */

/**
 * @swagger
 * /movies/{movieId}/photos/{photoId}:
 *   delete:
 *     summary: Delete photo from movie
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Photo deleted successfully
 */

/**
 * @swagger
 * /movies/{id}/videos:
 *   post:
 *     summary: Upload video to movie
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Video uploaded successfully
 */

/**
 * @swagger
 * /movies/{movieId}/videos/{videoId}:
 *   delete:
 *     summary: Delete video from movie
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video deleted successfully
 */

/**
 * @swagger
 * /movies/{id}/audio:
 *   post:
 *     summary: Upload audio to movie
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Audio uploaded successfully
 */

/**
 * @swagger
 * /movies/{movieId}/audio/{audioId}:
 *   delete:
 *     summary: Delete audio from movie
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: audioId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audio deleted successfully
 */

/**
 * @swagger
 * /movies/{id}/chat-screenshots:
 *   post:
 *     summary: Upload chat screenshot
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Chat screenshot uploaded successfully
 */

/**
 * @swagger
 * /movies/{movieId}/chat-screenshots/{screenshotId}:
 *   delete:
 *     summary: Delete chat screenshot
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: screenshotId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat screenshot deleted successfully
 */
const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const { protect } = require("../middleware/auth.middleware");
const cloudinary = require("../config/cloudinary");

const {
  
  uploadPhotoToMovie,
  deletePhoto,
  uploadVideoToMovie,
    deleteVideo,
    uploadAudioToMovie,
    deleteAudio,
    uploadChatScreenshotToMovie,deleteChatScreenshot
} = require("../controllers/uploadController");

router.post("/movies/:id/photos", upload.array("file",40), protect, uploadPhotoToMovie);
router.delete("/movies/:movieId/photos/:photoId", protect, deletePhoto);
router.post("/movies/:id/videos", upload.array("file",40), protect, uploadVideoToMovie);
router.delete("/movies/:movieId/videos/:videoId", protect, deleteVideo);
router.post("/movies/:id/audio", upload.array("file",40), protect, uploadAudioToMovie);
router.delete("/movies/:movieId/audio/:audioId", protect, deleteAudio);
router.post("/movies/:id/chat-screenshots", upload.array("file",40), protect, uploadChatScreenshotToMovie);
router.delete("/movies/:movieId/chat-screenshots/:screenshotId", protect, deleteChatScreenshot);
module.exports = router;
