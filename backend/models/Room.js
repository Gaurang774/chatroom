import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  roomId: {
    type: String,
    unique: true,
    required: true
  },
  createdBy: {
    type: String,
    default: "system"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for fast room lookups
roomSchema.index({ roomId: 1 });

const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);

export default Room;