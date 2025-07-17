'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Clock, 
  DollarSign, 
  Activity, 
  Plus, 
  Edit2, 
  Trash2,
  PlayCircle,
  StopCircle,
  TrendingUp,
  User,
  Mail,
  Calendar
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Freelancer {
  _id: string;
  name: string;
  email: string;
  hourlyRate: number;
  skills: string[];
  totalHoursWorked: number;
  totalEarnings: number;
  activeSessions: number;
  joinedAt: string;
  isActive: boolean;
}

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
  freelancerBreakdown: Array<{
    _id: string;
    name: string;
    email: string;
    hourlyRate: number;
    totalHours: number;
    totalEarnings: number;
    sessions: number;
  }>;
  recentSessions: WorkSession[];
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [workSessions, setWorkSessions] = useState<WorkSession[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddFreelancerOpen, setIsAddFreelancerOpen] = useState(false);
  const [newFreelancer, setNewFreelancer] = useState({
    name: '',
    email: '',
    password: '',
    hourlyRate: 25,
    skills: ''
  });

  useEffect(() => {
    fetchFreelancers();
    fetchWorkSessions();
    fetchAnalytics();
  }, []);

  const fetchFreelancers = async () => {
    try {
      const response = await fetch('/api/freelancers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setFreelancers(data);
    } catch (error) {
      console.error('Error fetching freelancers:', error);
    }
  };

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
      const response = await fetch('/api/analytics?period=7d', {
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

  const handleAddFreelancer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/freelancers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...newFreelancer,
          skills: newFreelancer.skills.split(',').map(skill => skill.trim()),
        }),
      });

      if (response.ok) {
        setIsAddFreelancerOpen(false);
        setNewFreelancer({
          name: '',
          email: '',
          password: '',
          hourlyRate: 25,
          skills: ''
        });
        fetchFreelancers();
      }
    } catch (error) {
      console.error('Error adding freelancer:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Welcome back, {user?.name}</p>
            </div>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="freelancers">Freelancers</TabsTrigger>
            <TabsTrigger value="sessions">Work Sessions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {analytics && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.summary.totalHours.toFixed(1)}h</div>
                      <p className="text-xs text-muted-foreground">Last 7 days</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(analytics.summary.totalEarnings)}</div>
                      <p className="text-xs text-muted-foreground">Last 7 days</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.summary.activeSessions}</div>
                      <p className="text-xs text-muted-foreground">Currently working</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Freelancers</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{freelancers.length}</div>
                      <p className="text-xs text-muted-foreground">Active freelancers</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Daily Activity</CardTitle>
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
              </>
            )}
          </TabsContent>

          <TabsContent value="freelancers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Freelancer Management</h2>
              <Dialog open={isAddFreelancerOpen} onOpenChange={setIsAddFreelancerOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Freelancer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Freelancer</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddFreelancer} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newFreelancer.name}
                        onChange={(e) => setNewFreelancer({...newFreelancer, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newFreelancer.email}
                        onChange={(e) => setNewFreelancer({...newFreelancer, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newFreelancer.password}
                        onChange={(e) => setNewFreelancer({...newFreelancer, password: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        value={newFreelancer.hourlyRate}
                        onChange={(e) => setNewFreelancer({...newFreelancer, hourlyRate: Number(e.target.value)})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="skills">Skills (comma-separated)</Label>
                      <Input
                        id="skills"
                        value={newFreelancer.skills}
                        onChange={(e) => setNewFreelancer({...newFreelancer, skills: e.target.value})}
                        placeholder="React, Node.js, MongoDB"
                      />
                    </div>
                    <Button type="submit" className="w-full">Add Freelancer</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {freelancers.map((freelancer) => (
                <Card key={freelancer._id}>
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>{freelancer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{freelancer.name}</CardTitle>
                        <CardDescription>{freelancer.email}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Hourly Rate</span>
                        <span className="font-medium">{formatCurrency(freelancer.hourlyRate)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Hours</span>
                        <span className="font-medium">{formatDuration(freelancer.totalHoursWorked)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Earnings</span>
                        <span className="font-medium">{formatCurrency(freelancer.totalEarnings)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Active Sessions</span>
                        <Badge variant={freelancer.activeSessions > 0 ? "default" : "secondary"}>
                          {freelancer.activeSessions}
                        </Badge>
                      </div>
                      {freelancer.skills && freelancer.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {freelancer.skills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <h2 className="text-2xl font-bold">Work Sessions</h2>
            <div className="space-y-4">
              {workSessions.map((session) => (
                <Card key={session._id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{session.freelancer.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{session.freelancer.name}</p>
                            <p className="text-sm text-gray-600">{session.freelancer.email}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-gray-600">Task</p>
                            <p className="font-medium">{session.task}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Module</p>
                            <p className="font-medium">{session.module}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="font-medium">{formatDuration(session.duration)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Earnings</p>
                            <p className="font-medium">{formatCurrency(session.earnings)}</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm text-gray-600">Started</p>
                          <p className="font-medium">{new Date(session.startTime).toLocaleString()}</p>
                        </div>
                        {session.description && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">Description</p>
                            <p className="text-sm">{session.description}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                          {session.status}
                        </Badge>
                        {session.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => stopSession(session._id)}
                          >
                            <StopCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics & Reports</h2>
            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Freelancer Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.freelancerBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="totalHours" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Earnings Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.freelancerBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="totalEarnings" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}