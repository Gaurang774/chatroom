import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  user: { type: String, required: true },
  text: { type: String, required: true },
  roomId: { type: String, required: true } // Room isolation for multi-room support
}, { timestamps: true });

// Index for fast sorting & pagination - essential for performance with large message volumes
MessageSchema.index({ createdAt: -1 });

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);