
const { searchTrack } = require("./providers/jamendoProvider");

const getMusicTracks = async (musicRecommendation) => {
    try {

        const tracks = await searchTrack(musicRecommendation);

        const formattedTracks = tracks.map(track => ({
            trackId: String(track.id),
            title: track.name,
            artist: track.artist_name,
            album: track.album_name,
            duration: track.duration,
            audioUrl: track.audio,
            image: track.image
        }));

        console.log(
            "Tracks Found:",
            formattedTracks.length
        );

        return formattedTracks;

    } catch (error) {

        console.log(
            "Music Provider Service Error:",
            error.message
        );

        throw error;

    }
};

module.exports = {
    getMusicTracks
};