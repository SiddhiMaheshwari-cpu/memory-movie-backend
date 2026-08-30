const scoreMediaForScene = (scene, item) => {
  let score = 0;

  if (scene.mediaId && item.id === scene.mediaId) score += 1000;
  
  if (scene.visual && item.type && scene.visual.toLowerCase().includes(item.type.toLowerCase())) score += 20;

  if (scene.emotion && item.emotion && scene.emotion.toLowerCase() === item.emotion.toLowerCase()) score += 30;

  if (scene.visual && item.description) {
    const sceneWords = scene.visual.toLowerCase().split(/\s+/).filter((word) => word.length > 3);
    const description = item.description.toLowerCase();
    for (const word of sceneWords) {
      if (description.includes(word)) score += 5;
    }
  }

  if (item.importance) score += Number(item.importance) * 10;
  score += Math.max(0, 5 - item.index * 0.1);

  return score;
};

const detectMediaType = (media) => {
  const url = media?.url || media?.secure_url || "";
  const cleanUrl = url.split("?")[0].toLowerCase();
  const extension = cleanUrl.includes(".") ? cleanUrl.split(".").pop() : "";

  if (["jpg", "jpeg", "png", "webp"].includes(extension)) return "photo";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(extension)) return "video";
  return "photo";
};

const normalizeDuration = (duration) => {
  const parsedDuration = Number(duration);
  if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) return 5;
  return Math.min(Math.max(parsedDuration, 3), 15);
};

const getDefaultAnimation = (emotion) => {
  switch (emotion?.toLowerCase()) {
    case "happy": return "slow_zoom_in";
    case "love": return "slow_zoom_in";
    case "sad": return "slow_zoom_out";
    case "nostalgic": return "slow_zoom_out";
    case "excited": return "pan_right";
    case "peaceful": return "pan_left";
    default: return "slow_zoom_in";
  }
};

const getDefaultAnimationIntensity = (emotion) => {
  switch (emotion?.toLowerCase()) {
    case "excited": return "high";
    default: return "low";
  }
};

const getDefaultTransition = (emotion) => {
  switch (emotion?.toLowerCase()) {
    case "sad": return "fade";
    case "nostalgic": return "fade";
    case "love": return "dissolve";
    case "happy": return "dissolve";
    case "excited": return "slideleft";
    default: return "fade";
  }
};

const selectMediaForScene = (scene, media, sceneIndex, usedMediaIds) => {
  if (!Array.isArray(media) || media.length === 0) return null;

  if (Number.isInteger(scene.mediaIndex) && scene.mediaIndex >= 0 && scene.mediaIndex < media.length) {
    return media[scene.mediaIndex];
  }

  if (scene.mediaId) {
    const exactMatch = media.find((item) => item.id === scene.mediaId);
    if (exactMatch) return exactMatch;
  }

  if (scene.emotion) {
    const emotionMatch = media.find((item) => item.emotion && item.emotion.toLowerCase() === scene.emotion.toLowerCase());
    if (emotionMatch) return emotionMatch;
  }

  const unusedMedia = media.filter((item) => !usedMediaIds.has(item.id));
  const candidates = unusedMedia.length > 0 ? unusedMedia : media;

  const scoredMedia = candidates.map((item) => ({
    item,
    score: scoreMediaForScene(scene, item),
  }));

  scoredMedia.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.item.index - b.item.index;
  });

  return scoredMedia[0] ? scoredMedia[0].item : media[sceneIndex % media.length];
};

const composeScenes = (screenplay, media = []) => {
  if (!screenplay || !Array.isArray(screenplay.scenes)) {
    throw new Error("Invalid screenplay: scenes array is required.");
  }
  if (!Array.isArray(media)) throw new Error("Media must be an array.");

  const normalizedMedia = media.filter((item) => item && item.url).map((item, index) => ({
    id: item.id || item._id || `media-${index + 1}`,
    url: item.url,
    type: item.type || detectMediaType(item),
    description: item.description || "",
    emotion: item.emotion || "neutral",
    publicId: item.publicId || null,
    importance: typeof item.importance === "number" ? item.importance : 0.5,
    index,
  }));

  const usedMediaIds = new Set();

  return screenplay.scenes.map((scene, index) => {
    const selectedMedia = selectMediaForScene(scene, normalizedMedia, index, usedMediaIds);
    if (selectedMedia) usedMediaIds.add(selectedMedia.id);

    return {
      sceneNumber: scene.sceneNumber || index + 1,
      title: scene.title || `Scene ${index + 1}`,
      visual: scene.visual || "",
      narration: scene.narration || "",
      emotion: scene.emotion || selectedMedia?.emotion || "neutral",
      duration: normalizeDuration(scene.duration),
      animation: {
        type: scene.animation?.type || getDefaultAnimation(scene.emotion),
        intensity: scene.animation?.intensity || getDefaultAnimationIntensity(scene.emotion),
      },
      transition: {
        type: index === 0 ? "fade" : scene.transition?.type || getDefaultTransition(scene.emotion),
        duration: index === 0 ? 0 : Number(scene.transition?.duration) || 0.8,
      },
      caption: {
        text: scene.caption?.text || "",
        position: scene.caption?.position || "bottom",
        style: scene.caption?.style || "cinematic",
      },
      importance: typeof scene.importance === "number" ? scene.importance : 0.5,
      backgroundMusic: scene.backgroundMusic || null,
      media: selectedMedia,
    };
  });
};

module.exports = { composeScenes };