
// ======================================================
// SCENE COMPOSER SERVICE
// ======================================================

const scoreMediaForScene = (scene, item) => {
  let score = 0;

  // --------------------------------------------------
  // Exact AI media ID match
  // --------------------------------------------------
  if (scene.mediaId && item.id === scene.mediaId) {
    score += 1000;
  }

  // --------------------------------------------------
  // Media type match
  // --------------------------------------------------
  if (
    scene.visual &&
    item.type &&
    scene.visual.toLowerCase().includes(item.type.toLowerCase())
  ) {
    score += 20;
  }

  // --------------------------------------------------
  // Emotion match
  // --------------------------------------------------
  if (
    scene.emotion &&
    item.emotion &&
    scene.emotion.toLowerCase() === item.emotion.toLowerCase()
  ) {
    score += 30;
  }

  // --------------------------------------------------
  // Description similarity
  // --------------------------------------------------
  if (scene.visual && item.description) {
    const sceneWords = scene.visual
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3);

    const description = item.description.toLowerCase();

    for (const word of sceneWords) {
      if (description.includes(word)) {
        score += 5;
      }
    }
  }

  // --------------------------------------------------
  // Importance
  // --------------------------------------------------
  if (item.importance) {
    score += Number(item.importance) * 10;
  }

  // --------------------------------------------------
  // Slight preference for earlier media
  // --------------------------------------------------
  score += Math.max(0, 5 - item.index * 0.1);

  return score;
};


// ======================================================
// COMPOSE SCENES
// ======================================================

const composeScenes = (screenplay, media = []) => {
  console.log("\n==============================");
  console.log("🎬 SCENE COMPOSER");
  console.log("==============================");

  if (!screenplay || !Array.isArray(screenplay.scenes)) {
    throw new Error("Invalid screenplay: scenes array is required.");
  }

  if (!Array.isArray(media)) {
    throw new Error("Media must be an array.");
  }

  console.log("Total screenplay scenes:", screenplay.scenes.length);
  console.log("Total media files:", media.length);

  // --------------------------------------------------
  // Normalize media
  // --------------------------------------------------

  const normalizedMedia = media
    .filter((item) => item && item.url)
    .map((item, index) => ({
      id: item.id || item._id || `media-${index + 1}`,

      url: item.url,

      type: item.type || detectMediaType(item),

      description: item.description || "",

      emotion: item.emotion || "neutral",

      publicId: item.publicId || null,

      importance:
        typeof item.importance === "number"
          ? item.importance
          : 0.5,

      index,
    }));

  console.log("\nNORMALIZED MEDIA:");
  console.log(normalizedMedia);

  // --------------------------------------------------
  // Track already-used media
  // --------------------------------------------------

  const usedMediaIds = new Set();

  // --------------------------------------------------
  // Build scenes
  // --------------------------------------------------

  return screenplay.scenes.map((scene, index) => {
    const selectedMedia = selectMediaForScene(
      scene,
      normalizedMedia,
      index,
      usedMediaIds
    );

    if (selectedMedia) {
      usedMediaIds.add(selectedMedia.id);
    }

    console.log("\n🎬 SCENE MEDIA SELECTION");

    console.log({
      scene: index + 1,
      title: scene.title,
      emotion: scene.emotion,
      mediaIdFromAI: scene.mediaId || null,
      selectedMediaId: selectedMedia?.id || null,
      selectedMediaUrl: selectedMedia?.url || null,
      selectedMediaType: selectedMedia?.type || null,
    });

    // --------------------------------------------------
    // Duration
    // --------------------------------------------------

    const duration = normalizeDuration(scene.duration);

    // --------------------------------------------------
    // Animation
    // --------------------------------------------------

    const animation = {
      type:
        scene.animation?.type ||
        getDefaultAnimation(scene.emotion),

      intensity:
        scene.animation?.intensity ||
        getDefaultAnimationIntensity(scene.emotion),
    };

    // --------------------------------------------------
    // Transition
    // --------------------------------------------------

    const transition = {
      type:
        index === 0
          ? "fade"
          : scene.transition?.type ||
            getDefaultTransition(scene.emotion),

      duration:
        index === 0
          ? 0
          : Number(scene.transition?.duration) || 0.8,
    };

    // --------------------------------------------------
    // Caption
    // --------------------------------------------------

    const caption = {
      text: scene.caption?.text || "",

      position:
        scene.caption?.position || "bottom",

      style:
        scene.caption?.style || "cinematic",
    };

    return {
      sceneNumber: scene.sceneNumber || index + 1,

      title: scene.title || `Scene ${index + 1}`,

      visual: scene.visual || "",

      narration: scene.narration || "",

      emotion:
        scene.emotion ||
        selectedMedia?.emotion ||
        "neutral",

      duration,

      animation,

      transition,

      caption,

      importance:
        typeof scene.importance === "number"
          ? scene.importance
          : 0.5,

      backgroundMusic:
        scene.backgroundMusic || null,

      media: selectedMedia,
    };
  });
};


// ======================================================
// MEDIA SELECTION
// ======================================================

const selectMediaForScene = (
  scene,
  media,
  sceneIndex,
  usedMediaIds
) => {
  if (!Array.isArray(media) || media.length === 0) {
    return null;
  }

  // --------------------------------------------------
  // 1. Exact AI-selected media
  // --------------------------------------------------

  // 1. AI-selected mediaIndex — SOURCE OF TRUTH
if (
  Number.isInteger(scene.mediaIndex) &&
  scene.mediaIndex >= 0 &&
  scene.mediaIndex < media.length
) {
  return media[scene.mediaIndex];
}

// 2. AI-selected mediaId fallback
if (scene.mediaId) {
  const exactMatch = media.find(
    (item) => item.id === scene.mediaId
  );

  if (exactMatch) {
    return exactMatch;
  }
}

// 3. Emotion fallback
if (scene.emotion) {
  const emotionMatch = media.find(
    (item) =>
      item.emotion &&
      item.emotion.toLowerCase() === scene.emotion.toLowerCase()
  );

  if (emotionMatch) {
    return emotionMatch;
  }
}

// 4. Sequential fallback
return media[sceneIndex % media.length];

  // --------------------------------------------------
  // 2. Score ALL unused media
  // --------------------------------------------------

  const unusedMedia = media.filter(
    (item) => !usedMediaIds.has(item.id)
  );

  const candidates =
    unusedMedia.length > 0
      ? unusedMedia
      : media;

  const scoredMedia = candidates.map((item) => ({
    item,
    score: scoreMediaForScene(scene, item),
  }));

  // Highest score first
  scoredMedia.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.item.index - b.item.index;
  });

  const best = scoredMedia[0];

  if (best) {
    console.log("📊 MEDIA SCORE:", {
      scene: sceneIndex + 1,
      mediaId: best.item.id,
      score: best.score,
    });

    return best.item;
  }

  // --------------------------------------------------
  // 3. Final sequential fallback
  // --------------------------------------------------

  return media[sceneIndex % media.length];
};


// ======================================================
// MEDIA TYPE DETECTION
// ======================================================

const detectMediaType = (media) => {
  const url = media?.url || media?.secure_url || "";

  const cleanUrl = url
    .split("?")[0]
    .toLowerCase();

  const extension = cleanUrl.includes(".")
    ? cleanUrl.split(".").pop()
    : "";

  if (
    ["jpg", "jpeg", "png", "webp"].includes(extension)
  ) {
    return "photo";
  }

  if (
    ["mp4", "mov", "avi", "mkv", "webm"].includes(extension)
  ) {
    return "video";
  }

  return "photo";
};


// ======================================================
// DURATION
// ======================================================

const normalizeDuration = (duration) => {
  const parsedDuration = Number(duration);

  if (
    !Number.isFinite(parsedDuration) ||
    parsedDuration <= 0
  ) {
    return 5;
  }

  return Math.min(Math.max(parsedDuration, 3), 15);
};


// ======================================================
// DEFAULT ANIMATION
// ======================================================

const getDefaultAnimation = (emotion) => {
  switch (emotion?.toLowerCase()) {
    case "happy":
      return "slow_zoom_in";

    case "love":
      return "slow_zoom_in";

    case "sad":
      return "slow_zoom_out";

    case "nostalgic":
      return "slow_zoom_out";

    case "excited":
      return "pan_right";

    case "peaceful":
      return "pan_left";

    default:
      return "slow_zoom_in";
  }
};


// ======================================================
// ANIMATION INTENSITY
// ======================================================

const getDefaultAnimationIntensity = (emotion) => {
  switch (emotion?.toLowerCase()) {
    case "excited":
      return "high";

    case "happy":
      return "low";

    case "love":
      return "low";

    case "sad":
      return "low";

    case "nostalgic":
      return "low";

    case "peaceful":
      return "low";

    default:
      return "low";
  }
};


// ======================================================
// DEFAULT TRANSITION
// ======================================================

const getDefaultTransition = (emotion) => {
  switch (emotion?.toLowerCase()) {
    case "sad":
      return "fade";

    case "nostalgic":
      return "fade";

    case "love":
      return "dissolve";

    case "happy":
      return "dissolve";

    case "excited":
      return "slideleft";

    default:
      return "fade";
  }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  composeScenes,
};

