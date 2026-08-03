const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});



const recommendMusic = async (scene) => {

    try {

        const prompt = `
        You are an AI music supervisor for cinematic movies.

Analyze the movie scene.

Recommend background music that best matches the scene.

Return ONLY valid JSON.

{
   "mood":"",
    "musicStyle":"",
    "instrument":"",
    "energyLevel":""
}

Rules:

- searchQuery should be short (2-5 words)
- searchQuery should be directly searchable on Jamendo.
- Examples:
"cinematic piano"
"emotional orchestral"
"soft acoustic"
"happy ukulele"
"sad piano"

No markdown.
Only JSON.

`;



        const response =
            await groq.chat.completions.create({

                messages:[
                    {
                        role:"user",
                        content:prompt
                    }
                ],

                model:"llama-3.1-8b-instant",

                temperature:0.3

            });



        let result =
            response.choices[0]
            .message
            .content;



        // Remove accidental markdown
        result = result
        .replace(/```json/g,"")
        .replace(/```/g,"")
        .trim();



        const musicRecommendation =
            JSON.parse(result);



        console.log(
            "AI Music Recommendation:",
            musicRecommendation
        );


        return musicRecommendation;



    }
    catch(error){

        console.log(
            "Music Recommendation Error:",
            error
        );


        return {

            mood:"cinematic",

            musicStyle:"soft emotional background music",

            instruments:"piano",

            energyLevel:"low"

        };

    }

};



module.exports = {
    recommendMusic
};