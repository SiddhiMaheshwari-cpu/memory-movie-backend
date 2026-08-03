const collectMedia = (movie) => {

    const media = [];

    // Collect Photos
    movie.photos.forEach((photo, index) => {

        media.push({
            mediaId: photo._id,
            type: "photo",
            url: photo.url,
            publicId: photo.publicId,
            description: photo.description,
            emotion: photo.emotion,
            transcript: "",
            order: index + 1
        });

    });

    // Collect Videos
    movie.videos.forEach((video, index) => {

        media.push({
            mediaId: video._id,
            type: "video",
            url: video.url,
            publicId: video.publicId,
            description: video.description,
            emotion: video.emotion,
            transcript: "",
            order: media.length + 1
        });

    });

    // Collect Audio
    movie.audio.forEach((audio) => {

        media.push({
            mediaId: audio._id,
            type: "audio",
            url: audio.url,
            publicId: audio.publicId,
            description: "",
            emotion: "",
            transcript: audio.transcript,
            order: media.length + 1
        });

    });

    // Collect Chat Screenshots
    movie.chatScreenshots.forEach((chat) => {

        media.push({
            mediaId: chat._id,
            type: "chat",
            url: chat.url,
            publicId: chat.publicId,
            description: "",
            emotion: "",
            transcript: "",
            order: media.length + 1
        });

    });

    return media;

};

module.exports = {
    collectMedia
};