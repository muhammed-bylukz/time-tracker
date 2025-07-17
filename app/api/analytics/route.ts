import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import WorkSession from '@/lib/models/WorkSession';
import User from '@/lib/models/User';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';

    let dateFilter = new Date();
    switch (period) {
      case '1d':
        dateFilter.setDate(dateFilter.getDate() - 1);
        break;
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
      case '90d':
        dateFilter.setDate(dateFilter.getDate() - 90);
        break;
      default:
        dateFilter.setDate(dateFilter.getDate() - 7);
    }

    let query: any = {
      createdAt: { $gte: dateFilter }
    };

    if (decoded.role === 'freelancer') {
      query.freelancer = decoded.userId;
    }

    const sessions = await WorkSession.find(query)
      .populate('freelancer', 'name email hourlyRate')
      .sort({ createdAt: -1 });

    const totalHours = sessions.reduce((sum, session) => sum + session.duration, 0);
    const totalEarnings = sessions.reduce((sum, session) => sum + session.earnings, 0);
    const activeSessions = sessions.filter(session => session.status === 'active').length;
    const completedSessions = sessions.filter(session => session.status === 'completed').length;

    // Daily breakdown
    const dailyBreakdown = sessions.reduce((acc, session) => {
      const date = session.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          hours: 0,
          earnings: 0,
          sessions: 0
        };
      }
      acc[date].hours += session.duration;
      acc[date].earnings += session.earnings;
      acc[date].sessions += 1;
      return acc;
    }, {} as any);

    // Freelancer breakdown (admin only)
    let freelancerBreakdown = [];
    if (decoded.role === 'admin') {
      const freelancers = await User.find({ role: 'freelancer' });
      freelancerBreakdown = freelancers.map(freelancer => {
        const freelancerSessions = sessions.filter(s => s.freelancer._id.toString() === freelancer._id.toString());
        const hours = freelancerSessions.reduce((sum, session) => sum + session.duration, 0);
        const earnings = freelancerSessions.reduce((sum, session) => sum + session.earnings, 0);
        
        return {
          _id: freelancer._id,
          name: freelancer.name,
          email: freelancer.email,
          hourlyRate: freelancer.hourlyRate,
          totalHours: hours,
          totalEarnings: earnings,
          sessions: freelancerSessions.length
        };
      });
    }

    return NextResponse.json({
      summary: {
        totalHours,
        totalEarnings,
        activeSessions,
        completedSessions,
        totalSessions: sessions.length
      },
      dailyBreakdown: Object.values(dailyBreakdown),
      freelancerBreakdown,
      recentSessions: sessions.slice(0, 10)
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}