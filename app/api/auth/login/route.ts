import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/auth';

export const dynamic = 'force-dynamic'; // 👈 add this

export async function POST(request: NextRequest) {
  try {
    await connectDB();


    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    let user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = generateToken(user);

    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      hourlyRate: user.hourlyRate,
      profileImage: user.profileImage,
      skills: user.skills,
      totalHoursWorked: user.totalHoursWorked,
      totalEarnings: user.totalEarnings,
    };

    return NextResponse.json({
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
