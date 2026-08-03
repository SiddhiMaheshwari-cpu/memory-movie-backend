const axios = require("axios");

const searchTrack = async (recommendation) => {
    try {

        console.log("===== JAMENDO DEBUG START =====");

        console.log(
            "Recommendation Received:",
            recommendation
        );

        console.log(
            "Jamendo Client ID:",
            process.env.JAMENDO_CLIENT_ID
        );


        const queryParts = [
            recommendation.musicStyle,
            recommendation.instrument || recommendation.instruments,
            recommendation.mood
        ].filter(Boolean);


        const baseQuery = queryParts.join(" ");

        const searchQueries = [
            baseQuery,
            recommendation.musicStyle,
            recommendation.mood,
            "cinematic",
            "piano",
            "ambient",
            "acoustic"
        ].filter(Boolean);


        console.log(
            "Search Queries:",
            searchQueries
        );


        for (const currentQuery of searchQueries) {


            console.log(
                "Trying Query:",
                currentQuery
            );


            const response = await axios.get(
                "https://api.jamendo.com/v3.0/tracks/",
                {
                    params: {
                        client_id: process.env.JAMENDO_CLIENT_ID,
                        format: "json",
                        limit: 5,
                        search: currentQuery,
                        include: "musicinfo",
                        audioformat: "mp32"
                    }
                }
            );


            console.log(
                "Full Jamendo Response:",
                JSON.stringify(response.data, null, 2)
            );


            console.log(
                "Tracks Found:",
                response.data.results?.length || 0
            );


            if (
                response.data.results &&
                response.data.results.length > 0
            ) {

                console.log(
                    "SUCCESS Track Found"
                );

                return response.data.results;

            }

        }


        throw new Error(
            "No tracks found from Jamendo"
        );


    } catch(error) {


        console.log(
            "===== JAMENDO ERROR ====="
        );


        console.log(
            error.response?.data || error.message
        );


        throw error;

    }
};


module.exports = {
    searchTrack
};