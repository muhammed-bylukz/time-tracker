import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import WorkSession from '@/lib/models/WorkSession';
import User from '@/lib/models/User';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }
    const decoded = getUserFromToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const freelancerId = searchParams.get('freelancer');
    const status = searchParams.get('status');

    let query: any = {};
    
    if (decoded.role === 'freelancer') {
      query.freelancer = decoded.userId;
    } else if (freelancerId) {
      query.freelancer = freelancerId;
    }

    if (status) {
      query.status = status;
    }

    const sessions = await WorkSession.find(query)
      .populate('freelancer', 'name email hourlyRate')
      .sort({ createdAt: -1 });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Get work sessions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }
    const decoded = getUserFromToken(token);
    
    if (!decoded || decoded.role !== 'freelancer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if freelancer already has an active session
    const activeSession = await WorkSession.findOne({
      freelancer: decoded.userId,
      status: 'active'
    });

    if (activeSession) {
      return NextResponse.json(
        { error: 'Active session already exists' },
        { status: 409 }
      );
    }

    const { task, module, description } = await request.json();

    const session = new WorkSession({
      freelancer: decoded.userId,
      startTime: new Date(),
      task: task || 'General Development',
      module: module || 'Bylukz',
      description: description || '',
      status: 'active',
    });

    await session.save();
    await session.populate('freelancer', 'name email hourlyRate');

    return NextResponse.json(session);
  } catch (error) {
    console.error('Create work session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}