import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import WorkSession from '@/lib/models/WorkSession';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    

    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }
    const decoded = getUserFromToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const freelancers = await User.find({ role: 'freelancer' }).select('-password');
    
    // Get work session stats for each freelancer
    const freelancersWithStats = await Promise.all(
      freelancers.map(async (freelancer) => {
        const sessions = await WorkSession.find({ freelancer: freelancer._id });
        const totalHours = sessions.reduce((sum, session) => sum + session.duration, 0);
        const totalEarnings = sessions.reduce((sum, session) => sum + session.earnings, 0);
        const activeSessions = sessions.filter(session => session.status === 'active').length;
        
        return {
          ...freelancer.toObject(),
          totalHoursWorked: totalHours,
          totalEarnings: totalEarnings,
          activeSessions,
        };
      })
    );

    return NextResponse.json(freelancersWithStats);
  } catch (error) {
    console.error('Get freelancers error:', error);
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
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { email, password, name, hourlyRate, skills } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    const user = new User({
      email,
      password,
      name,
      role: 'freelancer',
      hourlyRate: hourlyRate || 25,
      skills: skills || [],
    });

    await user.save();

    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      hourlyRate: user.hourlyRate,
      skills: user.skills,
      joinedAt: user.joinedAt,
      isActive: user.isActive,
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('Create freelancer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}