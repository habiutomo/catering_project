
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Loader2, ChefHat, ClipboardList, DollarSign, TrendingUp, Clock, Users, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function MerchantDashboard() {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const pendingOrders = orders?.filter((order) => order.status === "pending") || [];
  const completedOrders = orders?.filter((order) => order.status === "completed") || [];
  
  // Calculate some stats for the dashboard
  const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
  const ordersToday = orders?.filter(order => {
    const orderDate = new Date(order.createdAt || Date.now());
    const today = new Date();
    return orderDate.getDate() === today.getDate() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear() === today.getFullYear();
  }).length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Hero section with greeting and summary */}
      <div className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, {user?.companyName}</h1>
            <p className="text-muted-foreground">Here's what's happening with your catering business today</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button asChild>
              <Link href="/merchant/orders">View All Orders</Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</p>
                <h3 className="text-2xl font-bold">Rp {(totalRevenue * 15000).toLocaleString('id-ID')}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Completed Orders</p>
                <h3 className="text-2xl font-bold">{completedOrders.length}</h3>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Pending Orders</p>
                <h3 className="text-2xl font-bold">{pendingOrders.length}</h3>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Orders Today</p>
                <h3 className="text-2xl font-bold">{ordersToday}</h3>
              </div>
              <div className="p-2 bg-amber-100 rounded-full">
                <Calendar className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>Manage your catering business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start">
              <Link href="/merchant/menu">
                <ChefHat className="mr-2 h-5 w-5" />
                Manage Menu
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/merchant/orders">
                <ClipboardList className="mr-2 h-5 w-5" />
                View All Orders
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-5 w-5" />
              Customer Management
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <DollarSign className="mr-2 h-5 w-5" />
              Financial Reports
            </Button>
          </CardContent>
        </Card>
        
        {/* Pending Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Pending Orders</CardTitle>
            <CardDescription>Orders requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingOrders.length === 0 ? (
              <div className="text-center py-6 bg-muted/20 rounded-lg">
                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium mb-1">No pending orders</h3>
                <p className="text-sm text-muted-foreground">New orders will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
                    <div>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-sm text-muted-foreground">Order #{order.id}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">${order.total?.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.createdAt || Date.now()).toLocaleString()}
                        </div>
                      </div>
                      <Button size="sm">Process</Button>
                    </div>
                  </div>
                ))}
                {pendingOrders.length > 5 && (
                  <Button variant="ghost" className="w-full text-primary" asChild>
                    <Link href="/merchant/orders">View All {pendingOrders.length} Pending Orders</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Performance Overview */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Performance Overview</CardTitle>
            <CardDescription>Track your business growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <div className="text-sm font-medium">Customer Satisfaction</div>
                  <div className="text-sm font-medium">85%</div>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <div className="text-sm font-medium">Order Completion Rate</div>
                  <div className="text-sm font-medium">92%</div>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <div className="text-sm font-medium">Menu Item Popularity</div>
                  <div className="text-sm font-medium">78%</div>
                </div>
                <Progress value={78} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
