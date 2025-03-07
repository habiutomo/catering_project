import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertMerchantSchema, insertCustomerSchema } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Store, Building2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [userType, setUserType] = useState<"merchant" | "customer">("customer");
  const [mode, setMode] = useState<"login" | "register">("login");

  useEffect(() => {
    if (user) {
      setLocation(user.type === "merchant" ? "/merchant" : "/");
    }
  }, [user, setLocation]);

  const schema = mode === "register" 
    ? (userType === "merchant" ? insertMerchantSchema : insertCustomerSchema)
    : insertCustomerSchema.pick({ username: true, password: true });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
      companyName: "",
      address: "",
      phone: "",
      description: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      if (mode === "login") {
        await loginMutation.mutateAsync({
          type: userType,
          username: data.username,
          password: data.password,
        });
      } else {
        await registerMutation.mutateAsync({
          type: userType,
          ...data,
        });
        // After successful registration, switch to login mode
        setMode("login");
        form.reset();
        toast({
          title: "Registration successful",
          description: "Please login with your new account",
        });
      }
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 p-4">
      <Card className="w-full max-w-5xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Online Catering Management System
          </CardTitle>
          <p className="text-muted-foreground">
            Streamline your catering business or find the perfect caterer for your needs
          </p>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8 p-6">
          <div className="space-y-6">
            <Tabs value={userType} onValueChange={(v) => {
              setUserType(v as "merchant" | "customer");
              form.reset();
            }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="customer" className="space-x-2">
                  <Building2 className="w-4 h-4" />
                  <span>Office</span>
                </TabsTrigger>
                <TabsTrigger value="merchant" className="space-x-2">
                  <Store className="w-4 h-4" />
                  <span>Caterer</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div>
              <Tabs value={mode} onValueChange={(v) => {
                setMode(v as "login" | "register");
                form.reset();
              }}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {mode === "register" && (
                  <>
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {userType === "merchant" && (
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </>
                )}

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === "login" ? "Login" : "Register"}
                </Button>
              </form>
            </Form>
          </div>

          <div className="hidden md:block">
            <div className="h-full flex flex-col justify-center space-y-6 p-6 bg-primary/5 rounded-lg">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">
                  {userType === "merchant" ? (
                    <>
                      <Store className="w-6 h-6 inline-block mr-2 text-primary" />
                      Grow Your Catering Business
                    </>
                  ) : (
                    <>
                      <Users className="w-6 h-6 inline-block mr-2 text-primary" />
                      Order Office Catering Made Easy
                    </>
                  )}
                </h2>
                <p className="text-muted-foreground">
                  {userType === "merchant"
                    ? "Manage your menu, track orders, and grow your catering business with our platform."
                    : "Find and order from the best caterers in your area for your office needs."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="font-semibold mb-2">
                    {userType === "merchant" ? "Track Orders" : "Easy Ordering"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {userType === "merchant"
                      ? "Monitor and manage all your catering orders in one place."
                      : "Browse menus and place orders with just a few clicks."}
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="font-semibold mb-2">
                    {userType === "merchant" ? "Manage Menu" : "Track Deliveries"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {userType === "merchant"
                      ? "Create and update your menu items easily."
                      : "Know exactly when your food will arrive."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}