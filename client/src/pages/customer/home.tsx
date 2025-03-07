
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Merchant } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2, Search, Store, MapPin, Clock, Star, Coffee, ChefHat, ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function CustomerHome() {
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  const { data: merchants, isLoading } = useQuery<Merchant[]>({
    queryKey: ["/api/merchants"],
  });

  const filteredMerchants = merchants?.filter((merchant) =>
    merchant.companyName.toLowerCase().includes(search.toLowerCase()) ||
    merchant.description.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Categories for quick filters
  const categories = [
    { name: "All", icon: <Store className="h-5 w-5" /> },
    { name: "Asian", icon: <ChefHat className="h-5 w-5" /> },
    { name: "Desserts", icon: <Coffee className="h-5 w-5" /> },
    { name: "Healthy", icon: <Star className="h-5 w-5" /> },
    { name: "Fast Food", icon: <ShoppingBag className="h-5 w-5" /> },
  ];

  // Mock recent orders for demo
  const recentOrders = [
    { id: 1, merchant: "Delicious Catering", status: "Delivered", date: "Today at 12:30 PM" },
    { id: 2, merchant: "Fresh Bites Co.", status: "Scheduled", date: "Tomorrow at 11:00 AM" },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || "Office Manager"}!</h1>
          <p className="text-muted-foreground mb-6">Find the perfect catering for your office needs</p>
          
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search caterers, cuisines, or dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 py-6 text-lg"
            />
          </div>
        </div>
        
        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <div className="flex overflow-x-auto pb-2 gap-3">
            {categories.map((category, index) => (
              <Button 
                key={index} 
                variant={index === 0 ? "default" : "outline"} 
                className="flex items-center gap-2 px-4 py-2"
              >
                {category.icon}
                <span>{category.name}</span>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Recent Orders */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            <Link href="/orders">
              <Button variant="ghost" className="text-primary">View All</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentOrders.map((order) => (
              <Card key={order.id} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="flex justify-between mb-2">
                    <div className="font-medium">{order.merchant}</div>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      order.status === "Delivered" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {order.status}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    {order.date}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Available Caterers */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Caterers</h2>
          
          {filteredMerchants?.length === 0 ? (
            <div className="text-center p-8 bg-muted rounded-lg">
              <p className="text-muted-foreground">No caterers found matching "{search}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMerchants?.map((merchant) => (
                <Link key={merchant.id} href={`/merchant/${merchant.id}`}>
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="h-48 bg-gradient-to-r from-primary/30 to-primary/5 flex items-center justify-center">
                      <Store className="h-16 w-16 text-primary/70" />
                    </div>
                    <CardHeader>
                      <CardTitle>{merchant.companyName}</CardTitle>
                      <CardDescription className="line-clamp-2">{merchant.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="mr-1 h-4 w-4" />
                        <span>2.5 miles away</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>Delivery in 45-60 min</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < 4 ? "text-yellow-400" : "text-gray-300"}`} fill={i < 4 ? "currentColor" : "none"} />
                        ))}
                        <span className="text-xs ml-2 text-muted-foreground">(24 reviews)</span>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
  