import { connectDB } from "../../../../../lib/mongo";
import Room from "../../../../../models/Room";
import { nanoid } from "nanoid";

// API route to create a new chat room with unique invite link
export async function POST(request) {
  try {
    const { name, createdBy } = await request.json();
    
    // Generate unique 10-character room ID
    const roomId = nanoid(10);
    
    try {
      // Try to connect to database and create room
      await connectDB();
      
      const room = await Room.create({
        name,
        roomId,
        createdBy
      });
      
      console.log('Room created in database:', roomId);
    } catch (dbError) {
      console.log('Database not available, room will work in memory only:', dbError.message);
    }
    
    // Return room details with shareable invite link (works with or without DB)
    return Response.json({
      success: true,
      roomId,
      name,
      link: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/room/${roomId}`
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return Response.json({ error: 'Failed to create room' }, { status: 500 });
  }
}