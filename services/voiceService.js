const gTTS = require("gtts");
const path = require("path");


const generateVoice = async (text) => {

    return new Promise((resolve, reject)=>{

        try {

            console.log("Generating Voice...");


            const fileName =
                `voice-${Date.now()}.mp3`;


            const filePath =
                path.join(
                    __dirname,
                    fileName
                );



            const gtts =
                new gTTS(
                    text,
                    "en"
                );



            gtts.save(
                filePath,
                function(error){

                    if(error){

                        console.log(
                            "Voice Error:",
                            error
                        );

                        reject(error);

                    }
                    else{

                        console.log(
                            "Voice Generated:",
                            filePath
                        );

                        resolve(filePath);

                    }

                }
            );


        }
        catch(error){

            reject(error);

        }

    });

};



module.exports = {
    generateVoice
};