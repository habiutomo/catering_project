import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href={user?.type === "merchant" ? "/merchant" : "/"}>
            <a className="text-xl font-bold hover:text-primary">Catering System</a>
          </Link>

          <nav className="flex items-center gap-4">
            {user?.type === "merchant" ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/merchant/menu">Menu</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/merchant/orders">Orders</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/">Browse</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/orders">My Orders</Link>
                </Button>
              </>
            )}

            <Button 
              variant="outline" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </nav>
        </div>
      </header>

      <main className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
    </div>
  );
}