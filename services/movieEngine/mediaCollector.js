const cleanMediaUrl = (url) => {
  if (!url || typeof url !== "string") {
    return "";
  }

  const markdownMatch = url.match(/\]\((https?:\/\/[^)]+)\)/);

  if (markdownMatch) {
    return markdownMatch[1];
  }

  return url.trim();
};

const collectMedia = (movie) => {

    console.log("\n================================");
    console.log("🎞️ COLLECT MEDIA");
    console.log("================================");

    console.log("Movie ID:", movie?._id);

    const visualMedia = [];
    const audioMedia = [];

    // ==========================================
    // PHOTOS
    // ==========================================

    if (Array.isArray(movie?.photos)) {

        movie.photos.forEach((photo, index) => {

            if (!photo?.url) {
                console.log(
                    `⚠️ Skipping photo ${index + 1}: URL missing`
                );

                return;
            }

            visualMedia.push({

                mediaId: photo._id,

                type: "photo",

                url: cleanMediaUrl(photo.url),

                publicId: photo.publicId,

                description:
                    photo.description || "",

                emotion:
                    photo.emotion || "",

                transcript: "",

                order: visualMedia.length + 1

            });

        });

    }


    // ==========================================
    // VIDEOS
    // ==========================================

    if (Array.isArray(movie?.videos)) {

        movie.videos.forEach((video, index) => {

            if (!video?.url) {

                console.log(
                    `⚠️ Skipping video ${index + 1}: URL missing`
                );

                return;
            }

            visualMedia.push({

                mediaId: video._id,

                type: "video",

                url: cleanMediaUrl(video.url),

                publicId: video.publicId,

                description:
                    video.description || "",

                emotion:
                    video.emotion || "",

                transcript:
                    video.transcript || "",

                order: visualMedia.length + 1

            });

        });

    }


    // ==========================================
    // CHAT SCREENSHOTS
    // ==========================================

    if (Array.isArray(movie?.chatScreenshots)) {

        movie.chatScreenshots.forEach((chat, index) => {

            if (!chat?.url) {

                console.log(
                    `⚠️ Skipping chat ${index + 1}: URL missing`
                );

                return;
            }

            visualMedia.push({

                mediaId: chat._id,

                type: "chat",

                url: cleanMediaUrl(chat.url),

                publicId: chat.publicId,

                description:
                    chat.description || "",

                emotion:
                    chat.emotion || "",

                transcript:
                    chat.transcript || "",

                order: visualMedia.length + 1

            });

        });

    }


    // ==========================================
    // AUDIO
    // ==========================================

    if (Array.isArray(movie?.audio)) {

        movie.audio.forEach((audio, index) => {

            if (!audio?.url) {

                console.log(
                    `⚠️ Skipping audio ${index + 1}: URL missing`
                );

                return;
            }

            audioMedia.push({

                mediaId: audio._id,

                type: "audio",

                url: cleanMediaUrl(audio.url),

                publicId: audio.publicId,

                description:
                    audio.description || "",

                emotion:
                    audio.emotion || "",

                transcript:
                    audio.transcript || "",

                order: audioMedia.length + 1

            });

        });

    }


    // ==========================================
    // SORT VISUAL MEDIA
    // ==========================================

    visualMedia.sort(
        (a, b) => a.order - b.order
    );


    // ==========================================
    // DEBUG
    // ==========================================

    console.log("\n========== MEDIA SUMMARY ==========");

    console.log(
        "📸 Photos:",
        movie?.photos?.length || 0
    );

    console.log(
        "🎥 Videos:",
        movie?.videos?.length || 0
    );

    console.log(
        "💬 Chat Screenshots:",
        movie?.chatScreenshots?.length || 0
    );

    console.log(
        "🎵 Audio:",
        movie?.audio?.length || 0
    );

    console.log(
        "----------------------------------"
    );

    console.log(
        "🎬 Visual Media:",
        visualMedia.length
    );

    console.log(
        "🎙 Audio Media:",
        audioMedia.length
    );


    console.log("\n🎬 VISUAL MEDIA:");

    visualMedia.forEach((item, index) => {

        console.log(
            `${index + 1}.`,
            item.type,
            item.url
        );

    });


    console.log("\n🎙 AUDIO MEDIA:");

    audioMedia.forEach((item, index) => {

        console.log(
            `${index + 1}.`,
            item.url
        );

    });


    console.log(
        "\n================================\n"
    );


    // ==========================================
    // RETURN
    // ==========================================

    return {

        visualMedia,

        audioMedia

    };

};


module.exports = {
    collectMedia
};