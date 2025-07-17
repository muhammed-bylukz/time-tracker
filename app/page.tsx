'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
import LoginForm from '@/components/LoginForm';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // const handleGetStarted = async () => {
  //   // Initialize demo data
  //   await fetch('/api/seed', { method: 'POST' });
  //   router.push('/login');
  // };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    // <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    //   <div className="container mx-auto px-4 py-16">
    //     <div className="text-center mb-16">
    //       <div className="flex justify-center mb-6">
    //         <div className="p-4 bg-blue-600 rounded-full">
    //           <Clock className="h-12 w-12 text-white" />
    //         </div>
    //       </div>
    //       <h1 className="text-5xl font-bold text-gray-900 mb-6">
    //         FreelanceTracker
    //       </h1>
    //       <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
    //         Professional time tracking and management system for freelancers and project managers. 
    //         Monitor work hours, calculate payments, and boost productivity.
    //       </p>
    //       <Button onClick={handleGetStarted} size="lg" className="text-lg px-8 py-3">
    //         Get Started <ArrowRight className="ml-2 h-5 w-5" />
    //       </Button>
    //     </div>

    //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
    //       <Card className="text-center">
    //         <CardHeader>
    //           <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
    //           <CardTitle>Time Tracking</CardTitle>
    //         </CardHeader>
    //         <CardContent>
    //           <CardDescription>
    //             Real-time work session tracking with start/stop functionality and automatic time calculations.
    //           </CardDescription>
    //         </CardContent>
    //       </Card>

    //       <Card className="text-center">
    //         <CardHeader>
    //           <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
    //           <CardTitle>Team Management</CardTitle>
    //         </CardHeader>
    //         <CardContent>
    //           <CardDescription>
    //             Manage multiple freelancers, set hourly rates, and monitor team performance in real-time.
    //           </CardDescription>
    //         </CardContent>
    //       </Card>

    //       <Card className="text-center">
    //         <CardHeader>
    //           <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
    //           <CardTitle>Payment Tracking</CardTitle>
    //         </CardHeader>
    //         <CardContent>
    //           <CardDescription>
    //             Automatic payment calculations, earnings tracking, and payment status management.
    //           </CardDescription>
    //         </CardContent>
    //       </Card>

    //       <Card className="text-center">
    //         <CardHeader>
    //           <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
    //           <CardTitle>Analytics</CardTitle>
    //         </CardHeader>
    //         <CardContent>
    //           <CardDescription>
    //             Comprehensive analytics, charts, and reports to track productivity and project progress.
    //           </CardDescription>
    //         </CardContent>
    //       </Card>
    //     </div>

    //     <div className="max-w-4xl mx-auto">
    //       <Card>
    //         <CardHeader>
    //           <CardTitle className="text-2xl text-center">Key Features</CardTitle>
    //         </CardHeader>
    //         <CardContent>
    //           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    //             <div className="space-y-4">
    //               <h3 className="font-semibold text-lg">For Administrators</h3>
    //               <ul className="space-y-2 text-gray-600">
    //                 <li>• Add and manage freelancer profiles</li>
    //                 <li>• Monitor real-time work sessions</li>
    //                 <li>• Set and update hourly rates</li>
    //                 <li>• Generate payment reports</li>
    //                 <li>• Track project progress</li>
    //                 <li>• View comprehensive analytics</li>
    //               </ul>
    //             </div>
    //             <div className="space-y-4">
    //               <h3 className="font-semibold text-lg">For Freelancers</h3>
    //               <ul className="space-y-2 text-gray-600">
    //                 <li>• One-click time tracking</li>
    //                 <li>• Live session monitoring</li>
    //                 <li>• Work history and timesheets</li>
    //                 <li>• Earnings calculator</li>
    //                 <li>• Task and module tracking</li>
    //                 <li>• Personal analytics dashboard</li>
    //               </ul>
    //             </div>
    //           </div>
    //         </CardContent>
    //       </Card>
    //     </div>
    //   </div>
    // </div>
    <>
    <LoginForm/>
    </>
  );
}