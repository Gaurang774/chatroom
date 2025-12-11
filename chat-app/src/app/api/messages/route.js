import { connectDB } from "../../../../lib/mongo";
import Message from "../../../../models/Message";

// API route to fetch recent messages with pagination support
// Returns the most recent messages (default limit 50) for initial chat load
// Supports room filtering for multi-room functionality
export async function GET(request) {
  try {
    await connectDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 50;
    const roomId = searchParams.get('roomId');
    
    // Build query - filter by roomId if provided, otherwise get global messages
    const query = roomId ? { roomId } : { $or: [{ roomId: 'global' }, { roomId: { $exists: false } }] };
    
    // Fetch most recent messages, sorted newest first, then reverse for chronological order
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    // Transform the data to match the frontend format and return oldest → newest order
    const formattedMessages = messages.reverse().map(msg => ({
      id: msg._id.toString(),
      username: msg.user,
      message: msg.text,
      timestamp: msg.createdAt.toISOString(),
      createdAt: msg.createdAt.toISOString() // Include for pagination
    }));
    
    return Response.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    // Return empty array if database is not available
    return Response.json([]);
  }
}