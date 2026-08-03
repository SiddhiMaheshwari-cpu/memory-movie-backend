const applyTransitions = (scenes) => {
  const updatedScenes = [];
  for (let i = 0; i < scenes.length; i++) {
    const currentScene = scenes[i];
    const nextScene = scenes[i + 1];
   
    const updatedScene = { ...currentScene };
    if(nextScene){
        updatedScene.transition = currentScene.transition || "fade";
    } else {
        updatedScene.transition = "none";
  }
  updatedScenes.push(updatedScene);
  
};
return updatedScenes;
};

module.exports = {applyTransitions};
