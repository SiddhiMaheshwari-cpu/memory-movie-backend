const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const path = require("path");
const fs = require("fs");

ffmpeg.setFfmpegPath(ffmpegPath);



const createMovie = async (scenes = [], voicePath, musicPath) => {

    return new Promise((resolve, reject)=>{

        try {


            console.log("🎬 Movie Rendering Started");

            const outputDir = path.join(
                __dirname,
                "renderedMovies"
            );


            if(!fs.existsSync(outputDir)){
                fs.mkdirSync(outputDir,{
                    recursive:true
                });
            }


            const outputPath = path.join(
                outputDir,
                `movie-${Date.now()}.mp4`
            );



            const validScenes = scenes.filter(
                scene => scene.media && scene.media.url
            );



            console.log(
                "Valid Scenes:",
                validScenes.length
            );



            if(validScenes.length === 0){

                throw new Error(
                    "No media available for rendering"
                );

            }



            const command = ffmpeg();



            validScenes.forEach((scene)=>{


                const media = scene.media;


                console.log(
                    "Adding media:",
                    media.url
                );


                if(media.type === "photo"){


                    command
                    .input(media.url)
                    .inputOptions([
                        "-loop 1",
                        `-t ${scene.duration || 5}`
                    ]);

                }


                else if(media.type === "video"){


                    command
                    .input(media.url);

                }


            });





            command
            .complexFilter([
                {
                    filter:"scale",
                    options:{
                        w:1280,
                        h:720,
                        force_original_aspect_ratio:"decrease"
                    }
                }
            ])

            .outputOptions([
                "-c:v libx264",
                "-pix_fmt yuv420p",
                "-r 25"
            ]);





            // Add Voice

            if(voicePath && fs.existsSync(voicePath)){


                console.log(
                    "Adding voice"
                );


                command.input(voicePath);


                command.outputOptions([
                    "-map 0:v",
                    `-map ${validScenes.length}:a?`
                ]);

            }





            // Add Background Music

            if(musicPath){


                console.log(
                    "Adding background music"
                );


                command.input(musicPath);


            }






            command

            .on(
                "start",
                cmd=>{
                    console.log(
                        "FFMPEG COMMAND:"
                    );
                    console.log(cmd);
                }
            )


            .on(
                "progress",
                progress=>{
                    console.log(
                        "Rendering:",
                        progress.percent
                    );
                }
            )


            .on(
                "end",
                ()=>{

                    console.log(
                        "✅ Movie Render Complete"
                    );


                    resolve(outputPath);

                }
            )


            .on(
                "error",
                err=>{

                    console.log(
                        "❌ FFmpeg Error:",
                        err.message
                    );

                    reject(err);

                }
            )


            .save(outputPath);



        }

        catch(error){

            console.log(
                "Renderer Error:",
                error
            );

            reject(error);

        }

    });

};





module.exports={
    createMovie
};