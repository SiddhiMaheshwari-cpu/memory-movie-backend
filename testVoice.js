const { generateVoice } = require("./services/voiceService");


const test = async () => {

    const audioPath =
        await generateVoice(
            "This is a beautiful memory that will always stay in our hearts."
        );


    console.log(
        "Audio created:",
        audioPath
    );

};


test();