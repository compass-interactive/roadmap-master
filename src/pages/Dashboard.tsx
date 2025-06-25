import React from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Activity, DollarSign, ArrowRight, Star, Zap } from 'lucide-react';

const stats = [
  { title: 'Total Users', value: '2,847', change: '+12%', icon: Users, trend: 'up' },
  { title: 'Revenue', value: '$45,231', change: '+8%', icon: DollarSign, trend: 'up' },
  { title: 'Active Sessions', value: '1,423', change: '+23%', icon: Activity, trend: 'up' },
  { title: 'Growth Rate', value: '34.2%', change: '+5%', icon: TrendingUp, trend: 'up' },
];

const Dashboard: React.FC = () => (
  <div className="min-h-screen flex w-full bg-background">
    <AppSidebar />
    <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1 p-6 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to your Dashboard
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your application today.
          </p>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-green-600 bg-green-50">
                    {stat.change}
                  </Badge>
                  <span>from last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full transform translate-x-16 -translate-y-16" />
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-500" />
                <CardTitle>Quick Actions</CardTitle>
              </div>
              <CardDescription>
                Get started with common tasks and workflows.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-between" variant="outline">
                Create New Project
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button className="w-full justify-between" variant="outline">
                Invite Team Members
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button className="w-full justify-between" variant="outline">
                View Analytics
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full transform translate-x-16 -translate-y-16" />
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <CardTitle>Recent Activity</CardTitle>
              </div>
              <CardDescription>
                Latest updates and notifications from your team.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New user registered</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Project updated</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-yellow-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">System maintenance</p>
                  <p className="text-xs text-muted-foreground">3 hours ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Getting Started Section */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Complete these steps to set up your application and start building amazing features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-green-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Set up your profile</p>
                  <p className="text-sm text-muted-foreground">Complete your account information</p>
                </div>
                <Badge variant="secondary">Complete</Badge>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Connect your integrations</p>
                  <p className="text-sm text-muted-foreground">Link your favorite tools and services</p>
                </div>
                <Button size="sm">
                  Set up
                </Button>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Invite your team</p>
                  <p className="text-sm text-muted-foreground">Collaborate with your colleagues</p>
                </div>
                <Button size="sm" variant="outline">
                  Invite
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  </div>
);

export default Dashboard; 