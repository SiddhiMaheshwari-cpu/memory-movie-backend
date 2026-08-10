const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


const generateScenePlan = async (movie) => {

try {


console.log("Generating Scene Plan...");


// Prepare available media

const availableMedia = [

...(movie.photos || []).map((photo,index)=>({
    index,
    type:"photo",
    url:photo.url,
    description:photo.description || "",
    emotion:photo.emotion || ""
})),

...(movie.videos || []).map((video,index)=>({
    index:index + (movie.photos?.length || 0),
    type:"video",
    url:video.url,
    description:video.description || "",
    emotion:video.emotion || ""
})),

...(movie.audio || []).map((audio,index)=>({
    index:index + 
    (movie.photos?.length || 0) +
    (movie.videos?.length || 0),

    type:"audio",
    url:audio.url,
    description:"",
    emotion:""
}))

];



const prompt = `

You are a professional cinematic movie editor.

Create a scene plan for a memory movie.

Movie Details:

Title:
${movie.title}

Theme:
${movie.theme}

Story:
${movie.story}

Timeline:

${(movie.timeline || []).join(", ")}



AVAILABLE MEDIA:

${JSON.stringify(
availableMedia,
null,
2
)}



IMPORTANT RULES:

1. Every scene MUST use available media.
2. Every scene MUST contain mediaIndex.
3. Never create empty scenes.
4. Never create blank screens.
5. Never create imaginary visuals.
6. Use only given media URLs.
7. If less media exists, reuse media creatively.
8. Make emotional cinematic scenes.



Return ONLY valid JSON.



Format:

{
 "scenes":[

 {
  "sceneNumber":1,
  "mediaIndex":0,
  "mediaType":"photo",
  "title":"",
  "description":"",
  "duration":5,
  "transition":"fade"
 }

 ]

}



Create 5-8 cinematic scenes.

`;





const completion = await groq.chat.completions.create({

model:"llama-3.1-8b-instant",


messages:[
{
role:"user",
content:prompt
}
],


temperature:0.3,


response_format:{
type:"json_object"
}


});




let result =
completion
.choices[0]
.message
.content;



console.log(
"SCENE PLAN RESPONSE:"
);

console.log(result);



result =
result
.replace(/```json/g,"")
.replace(/```/g,"")
.trim();



const scenePlan =
JSON.parse(result);



return scenePlan;



}

catch(error){


console.log(
"Scene Plan Generation Error:",
error
);


throw error;


}

};



module.exports = {
generateScenePlan
};