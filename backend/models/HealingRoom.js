const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    sender: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true, maxlength: 280 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const healingRoomSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 50 },
    ownerId: { type: String, required: true, trim: true, index: true },
    participants: { type: [participantSchema], default: [] },
    messages: { type: [messageSchema], default: [] },
    invitePath: { type: String, default: "" },
    lastActiveAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("HealingRoom", healingRoomSchema);
