import { connectDB } from "../../../../../lib/mongo";
import Room from "../../../../../models/Room";

// API route to fetch room information by roomId
export async function GET(request, { params }) {
  try {
    const { roomId } = await params;
    
    try {
      await connectDB();
      
      // Find room by roomId
      const room = await Room.findOne({ roomId }).lean();
      
      if (room) {
        // Return room details from database
        return Response.json({
          roomId: room.roomId,
          name: room.name,
          createdBy: room.createdBy,
          createdAt: room.createdAt.toISOString()
        });
      }
    } catch (dbError) {
      console.log('Database not available, using fallback room info:', dbError.message);
    }
    
    // Fallback: Allow any room ID to work (for testing without DB)
    return Response.json({
      roomId: roomId,
      name: `Room ${roomId}`,
      createdBy: 'Unknown',
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    return Response.json({ error: 'Failed to fetch room' }, { status: 500 });
  }
}