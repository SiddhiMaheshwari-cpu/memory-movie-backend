const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


const generateScenePlan = async (movie) => {

  const prompt = `
You are a professional movie editor.

Create a cinematic scene plan for a memory movie.

Movie Details:

Title:
${movie.title}

Theme:
${movie.theme}

Story:
${movie.story}

Timeline:
${movie.timeline.join(", ")}

Available Media:

Photos:
${movie.photos.length}

Videos:
${movie.videos.length}

Audio:
${movie.audio.length}

Chat Screenshots:
${movie.chatScreenshots.length}


Create scenes by deciding:
- which media should appear
- scene duration
- transition style


Return ONLY valid JSON.

Format:

{
 "scenes":[
   {
    "sceneNumber":1,
    "mediaType":"",
    "description":"",
    "duration":5,
    "transition":"fade"
   }
 ]
}


Rules:
- Create 5-8 scenes.
- Keep it cinematic.
- Return JSON only.
`;



const completion = await groq.chat.completions.create({

model:"llama-3.1-8b-instant",

messages:[
 {
  role:"user",
  content:prompt
 }
],

response_format:{
 type:"json_object"
}

});


return completion.choices[0].message.content;

};



module.exports = {
 generateScenePlan
};