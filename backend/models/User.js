const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    moodHistory: {
      type: [
        {
          mood: { type: String, trim: true },
          source: { type: String, trim: true },
          score: { type: Number, min: 0, max: 10 },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    wellnessData: {
      habitsByDate: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
      copilotConversation: {
        type: [
          {
            role: {
              type: String,
              enum: ["user", "assistant"],
            },
            text: {
              type: String,
              trim: true,
            },
            createdAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        default: [],
      },
      moodTimeline: {
        type: [
          {
            mood: { type: String, trim: true },
            score: { type: Number, min: 0, max: 10 },
            createdAt: { type: Date, default: Date.now },
          },
        ],
        default: [],
      },
      musicData: {
        recommendationControls: {
          diversityTarget: {
            type: Number,
            min: 0,
            max: 100,
            default: 70,
          },
          dedupeArtist: {
            type: Boolean,
            default: true,
          },
          dedupeGenre: {
            type: Boolean,
            default: true,
          },
        },
        recentRecommendations: {
          type: [
            {
              type: { type: String, trim: true },
              stage: { type: Number },
              trackKey: { type: String, trim: true },
              createdAt: { type: Date, default: Date.now },
            },
          ],
          default: [],
        },
        playEvents: {
          type: [
            {
              id: { type: String, trim: true },
              title: { type: String, trim: true },
              artist: { type: String, trim: true },
              genre: { type: String, trim: true },
              moodBefore: { type: String, trim: true },
              hour: { type: Number, min: 0, max: 23 },
              feedback: { type: String, trim: true },
              feedbackDelta: { type: Number, min: -1, max: 1 },
              createdAt: { type: Date, default: Date.now },
              feedbackAt: { type: Date },
            },
          ],
          default: [],
        },
      },
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
