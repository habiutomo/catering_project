import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { Layout } from "@/components/layout";

// Pages
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import MerchantDashboard from "@/pages/merchant/dashboard";
import MerchantMenu from "@/pages/merchant/menu";
import MerchantOrders from "@/pages/merchant/orders";
import CustomerHome from "@/pages/customer/home";
import CustomerMerchant from "@/pages/customer/merchant";
import CustomerOrders from "@/pages/customer/orders";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />

      {/* Merchant Routes */}
      <ProtectedRoute 
        path="/merchant" 
        component={() => (
          <Layout>
            <MerchantDashboard />
          </Layout>
        )} 
        role="merchant" 
      />
      <ProtectedRoute 
        path="/merchant/menu" 
        component={() => (
          <Layout>
            <MerchantMenu />
          </Layout>
        )} 
        role="merchant" 
      />
      <ProtectedRoute 
        path="/merchant/orders" 
        component={() => (
          <Layout>
            <MerchantOrders />
          </Layout>
        )} 
        role="merchant" 
      />

      {/* Customer Routes */}
      <ProtectedRoute 
        path="/" 
        component={() => (
          <Layout>
            <CustomerHome />
          </Layout>
        )} 
        role="customer" 
      />
      <ProtectedRoute 
        path="/merchant/:id" 
        component={() => (
          <Layout>
            <CustomerMerchant />
          </Layout>
        )} 
        role="customer" 
      />
      <ProtectedRoute 
        path="/orders" 
        component={() => (
          <Layout>
            <CustomerOrders />
          </Layout>
        )} 
        role="customer" 
      />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;