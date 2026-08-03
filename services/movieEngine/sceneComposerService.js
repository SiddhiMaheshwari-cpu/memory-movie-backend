const composeScenes = (screenplay, media) => {

    const scenes = screenplay.scenes.map((scene, index) => {

        let selectedMedia = null;


        // Try matching by order
        if(media[index]){
            selectedMedia = media[index];
        }


        // If no media available
        else {
            selectedMedia = media[0];
        }


        return {

            sceneNumber: scene.sceneNumber,

            title: scene.title,

            visual: scene.visual,

            narration: scene.narration,

            duration: scene.duration,

            transition: scene.transition,

            backgroundMusic: null,

            media: selectedMedia

        };

    });


    return scenes;

};


module.exports = {
    composeScenes
};