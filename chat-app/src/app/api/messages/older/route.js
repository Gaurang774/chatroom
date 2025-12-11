import { connectDB } from "../../../../../lib/mongo";
import Message from "../../../../../models/Message";

// API route to fetch older messages before a given timestamp for infinite scroll
// This enables users to load message history by scrolling up in the chat
// Supports room filtering for multi-room functionality
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const before = searchParams.get('before');
    const limit = Number(searchParams.get('limit')) || 50;
    const roomId = searchParams.get('roomId');
    
    // Validate required 'before' parameter
    if (!before) {
      return Response.json({ error: "Missing ?before timestamp" }, { status: 400 });
    }
    
    // Build query - filter by roomId and timestamp
    const query = {
      createdAt: { $lt: new Date(before) }
    };
    
    if (roomId) {
      query.roomId = roomId;
    } else {
      // For global messages, include both 'global' roomId and messages without roomId (backward compatibility)
      query.$or = [{ roomId: 'global' }, { roomId: { $exists: false } }];
    }
    
    // Fetch messages older than the given timestamp
    const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
    
    // Transform and return in chronological order (oldest → newest)
    const formattedMessages = messages.reverse().map(msg => ({
      id: msg._id.toString(),
      username: msg.user,
      message: msg.text,
      timestamp: msg.createdAt.toISOString(),
      createdAt: msg.createdAt.toISOString() // Include for pagination
    }));
    
    return Response.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching older messages:', error);
    return Response.json({ error: 'Failed to fetch older messages' }, { status: 500 });
  }
}