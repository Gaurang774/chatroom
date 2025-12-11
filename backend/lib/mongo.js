import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    console.log("📦 Using existing MongoDB connection");
    return;
  }

  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not defined in environment variables");
    throw new Error("MONGODB_URI is required");
  }

  try {
    const db = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log("✅ MongoDB connected successfully");
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
}

export async function disconnectDB() {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log("✅ MongoDB disconnected");
  } catch (error) {
    console.error("❌ Error disconnecting from MongoDB:", error.message);
  }
}

export default { connectDB, disconnectDB };