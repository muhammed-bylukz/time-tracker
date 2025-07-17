import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import WorkSession from '@/lib/models/WorkSession';
import User from '@/lib/models/User';
import { getUserFromToken } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const token = request.headers.get('authorization');
    const decoded = getUserFromToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const session = await WorkSession.findById(id);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if user owns this session or is admin
    if (decoded.role !== 'admin' && session.freelancer.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.status !== 'active') {
      return NextResponse.json(
        { error: 'Session is not active' },
        { status: 400 }
      );
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000 / 60 / 60); // in hours

    // Get freelancer's hourly rate
    const freelancer = await User.findById(session.freelancer);
    const earnings = duration * (freelancer?.hourlyRate || 25);

    session.endTime = endTime;
    session.duration = duration;
    session.earnings = earnings;
    session.status = 'completed';

    await session.save();
    await session.populate('freelancer', 'name email hourlyRate');

    return NextResponse.json(session);
  } catch (error) {
    console.error('Stop work session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}