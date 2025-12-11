import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  socketId: {
    type: String,
    required: true,
    unique: true
  },
  roomId: {
    type: String,
    default: "global"
  },
  isOnline: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for fast user lookups
userSchema.index({ socketId: 1 });
userSchema.index({ roomId: 1, isOnline: 1 });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;