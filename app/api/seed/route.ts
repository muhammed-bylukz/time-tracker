import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST() {
  try {
    await connectDB();

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@demo.com' });
    if (!adminExists) {
      const admin = new User({
        email: 'admin@demo.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
      });
      await admin.save();
    }

    // Create freelancer user
    const freelancerExists = await User.findOne({ email: 'freelancer@demo.com' });
    if (!freelancerExists) {
      const freelancer = new User({
        email: 'freelancer@demo.com',
        password: 'freelancer123',
        name: 'John Freelancer',
        role: 'freelancer',
        hourlyRate: 30,
        skills: ['React', 'Node.js', 'MongoDB'],
      });
      await freelancer.save();
    }

    return NextResponse.json({ message: 'Demo users created successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}