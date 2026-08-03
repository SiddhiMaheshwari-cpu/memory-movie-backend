const musicMap = {
  Happy: "Happy Acoustic",
  Sad: "Soft Piano",
  Romantic: "Romantic Guitar",
  Travel: "Adventure Cinematic",
  Friendship: "Feel Good Pop",
  Family: "Warm Memories",
  Celebration: "Upbeat Party",
  Emotional: "Emotional Orchestra",
  Default: "Cinematic Ambient",
};

const applyBackgroundMusic = (scenes, movieTheme) => {
  const updatedScenes = [];

  for (const scene of scenes) {
    const updatedScene = {
      ...scene,
    };

    const emotion =
      scene.emotion?.charAt(0).toUpperCase() + scene.emotion?.slice(1);

    const selectedMusic = musicMap[emotion] || musicMap.Default;
    updatedScene.backgroundMusic = selectedMusic;

    updatedScenes.push(updatedScene);
  }

  return updatedScenes;
};

module.exports = {
  applyBackgroundMusic,
};
