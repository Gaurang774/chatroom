import mongoose from "mongoose";

// Room model for managing chat rooms with unique invite links
const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roomId: { type: String, unique: true, required: true },
  createdBy: String
}, { timestamps: true });

export default mongoose.models.Room || mongoose.model("Room", RoomSchema);