const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    theme: {
      type: String,
      required: true,
    },
    owner: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
},

    photos: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          default: "",
        },
        emotion: {
          type: String,
          default: "",
        },
      },
    ],

    videos: [
      {
        url: {
          type: String,
          default: "",
        },

        publicId: {
          type: String,
          default: "",
        },

        description: {
          type: String,
          default: "",
        },

        emotion: {
          type: String,
          default: "",
        },
      },
    ],

    audio: [
      {
        url: {
          type: String,
          default: "",
        },

        publicId: {
          type: String,
          default: "",
        },

        transcript: {
          type: String,
          default: "",
        },
      },
    ],

    chatScreenshots: [
      {
        url: {
          type: String,
          default: "",
        },

        publicId: {
          type: String,
          default: "",
        },
      },
    ],

    aiSummary: {
      type: String,
      default: "",
    },

    emotion: {
      type: String,
      default: "",
    },

    backgroundMusic: {
      type: String,
      default: "",
    },

    // AI Recommended Tracks
    musicRecommendations: [
      {
        trackId: {
          type: String,
          default: "",
        },

        title: {
          type: String,
          default: "",
        },

        artist: {
          type: String,
          default: "",
        },

        album: {
          type: String,
          default: "",
        },

        duration: {
          type: Number,
          default: 0,
        },

        audioUrl: {
          type: String,
          default: "",
        },

        image: {
          type: String,
          default: "",
        },
      },
    ],

    // User Selected Track
    selectedMusic: {
      trackId: {
        type: String,
        default: "",
      },

      title: {
        type: String,
        default: "",
      },

      artist: {
        type: String,
        default: "",
      },

      album: {
        type: String,
        default: "",
      },

      duration: {
        type: Number,
        default: 0,
      },

      audioUrl: {
        type: String,
        default: "",
      },

      image: {
        type: String,
        default: "",
      },
    },

    poster: {
      type: String,
      default: "",
    },

    movieUrl: {
      type: String,
      default: "",
    },

    screenplay: {
      type: Object,
      default: {},
    },

    timeline: {
      type: [String],
      default: [],
    },

    posterPrompt: {
      type: String,
      default: "",
    },

    story: {
      type: String,
      default: "",
    },

    scenePlan: {
      type: Object,
      default: {},
    },

    voiceOver: {
      type: Object,
      default: {},
    },

    moviePublicId: {
      type: String,
      default: "",
    },

    errorMessage: {
      type: String,
      default: "",
    },

    renderJob: {
      status: {
        type: String,
        enum: ["idle", "queued", "processing", "completed", "failed"],
        default: "idle",
      },
      stage: {
        type: String,
        default: "",
      },
      progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      startedAt: Date,
      completedAt: Date,
    },

    duration: {
      type: Number,
      default: 0,
    },

    resolution: {
      type: String,
      default: "1920x1080",
    },

    status: {
      type: String,
      enum: [
        "created",
        "draft",
        "uploading",
        "uploaded",
        "analyzing",
        "screenplay_generating",
        "scene_planning",
        "rendering",
        "processing",
        "completed",
        "failed",
      ],
      default: "created",
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    stats: {
      views: {
        type: Number,
        default: 0,
      },
      downloads: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

movieSchema.index({ owner: 1, createdAt: -1 });
movieSchema.index({ status: 1 });

module.exports = mongoose.model("Movie", movieSchema);