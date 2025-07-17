'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Clock, 
  DollarSign, 
  PlayCircle, 
  StopCircle, 
  Calendar,
  TrendingUp,
  Activity,
  Timer,
  User,
  Mail,
  Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WorkSession {
  _id: string;
  freelancer: {
    _id: string;
    name: string;
    email: string;
    hourlyRate: number;
  };
  startTime: string;
  endTime?: string;
  duration: number;
  task: string;
  module: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  earnings: number;
  createdAt: string;
}

interface Analytics {
  summary: {
    totalHours: number;
    totalEarnings: number;
    activeSessions: number;
    completedSessions: number;
    totalSessions: number;
  };
  dailyBreakdown: Array<{
    date: string;
    hours: number;
    earnings: number;
    sessions: number;
  }>;
  recentSessions: WorkSession[];
}

export default function FreelancerDashboard() {
  const { user, logout } = useAuth();
  const [workSessions, setWorkSessions] = useState<WorkSession[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeSession, setActiveSession] = useState<WorkSession | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [newSession, setNewSession] = useState({
    task: 'General Development',
    module: 'Bylukz',
    description: ''
  });

  useEffect(() => {
    fetchWorkSessions();
    fetchAnalytics();
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const active = workSessions.find(session => session.status === 'active');
    setActiveSession(active || null);
  }, [workSessions]);

  const fetchWorkSessions = async () => {
    try {
      const response = await fetch('/api/work-sessions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setWorkSessions(data);
    } catch (error) {
      console.error('Error fetching work sessions:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics?period=30d', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const startSession = async () => {
    try {
      const response = await fetch('/api/work-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newSession),
      });

      if (response.ok) {
        fetchWorkSessions();
        fetchAnalytics();
        setNewSession({
          task: 'General Development',
          module: 'Bylukz',
          description: ''
        });
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const stopSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/work-sessions/${sessionId}/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        fetchWorkSessions();
        fetchAnalytics();
      }
    } catch (error) {
      console.error('Error stopping session:', error);
    }
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${hours.toFixed(1)}h`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getSessionDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours;
  };

  const formatTimeDisplay = (hours: number) => {
    const totalMinutes = Math.floor(hours * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Time Tracking Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Timer className="h-5 w-5" />
                  <span>Time Tracking</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeSession ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {formatTimeDisplay(getSessionDuration(activeSession.startTime))}
                      </div>
                      <p className="text-gray-600">Current session duration</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Task</p>
                          <p className="font-medium">{activeSession.task}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Module</p>
                          <p className="font-medium">{activeSession.module}</p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">Started at</p>
                        <p className="font-medium">{new Date(activeSession.startTime).toLocaleString()}</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">Estimated earnings</p>
                        <p className="font-medium text-green-600">
                          {formatCurrency(getSessionDuration(activeSession.startTime) * (user?.hourlyRate || 25))}
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => stopSession(activeSession._id)}
                      className="w-full"
                      size="lg"
                    >
                      <StopCircle className="h-5 w-5 mr-2" />
                      Stop Session
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <Clock className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to start working?</h3>
                      <p className="text-gray-600 mb-6">Track your time and get paid for your work</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="task">Task</Label>
                        <Input
                          id="task"
                          value={newSession.task}
                          onChange={(e) => setNewSession({...newSession, task: e.target.value})}
                          placeholder="What are you working on?"
                        />
                      </div>
                      <div>
                        <Label htmlFor="module">Module</Label>
                        <Input
                          id="module"
                          value={newSession.module}
                          onChange={(e) => setNewSession({...newSession, module: e.target.value})}
                          placeholder="Which module/area?"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description (optional)</Label>
                      <Textarea
                        id="description"
                        value={newSession.description}
                        onChange={(e) => setNewSession({...newSession, description: e.target.value})}
                        placeholder="Brief description of your work"
                        rows={2}
                      />
                    </div>
                    <Button 
                      onClick={startSession}
                      className="w-full"
                      size="lg"
                    >
                      <PlayCircle className="h-5 w-5 mr-2" />
                      Start Session
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analytics Chart */}
            {analytics && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Work Activity (Last 7 Days)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.dailyBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {/* Summary Cards */}
            {analytics && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.summary.totalHours.toFixed(1)}h</div>
                    <p className="text-xs text-muted-foreground">Last 30 days</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(analytics.summary.totalEarnings)}</div>
                    <p className="text-xs text-muted-foreground">Last 30 days</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Hourly Rate</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(user?.hourlyRate || 25)}</div>
                    <p className="text-xs text-muted-foreground">Per hour</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Sessions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workSessions.slice(0, 5).map((session) => (
                    <div key={session._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{session.task}</p>
                        <p className="text-xs text-gray-600">{session.module}</p>
                        <p className="text-xs text-gray-500">{new Date(session.startTime).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatDuration(session.duration)}</p>
                        <p className="text-xs text-green-600">{formatCurrency(session.earnings)}</p>
                        <Badge variant={session.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {session.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}