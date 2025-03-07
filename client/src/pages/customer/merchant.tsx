import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MenuItem, Order } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type CartItem = {
  menuItem: MenuItem;
  quantity: number;
};

type Merchant = {
  id: number;
  companyName: string;
  description: string;
  // ... other properties
}

export default function MerchantPage() {
  const [, params] = useRoute("/merchant/:id");
  const merchantId = parseInt(params?.id || "0");
  const { user } = useAuth();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedDate, setSelectedDate] = useState("");

  const { data: merchant } = useQuery<Merchant>({
    queryKey: ["/api/merchants", merchantId],
    queryFn: async () => {
      const res = await fetch(`/api/merchants/${merchantId}`);
      if (!res.ok) throw new Error("Failed to fetch merchant");
      return res.json();
    },
  });

  const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: [`/api/merchants/${merchantId}/menu`],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: { order: any; items: any[] }) => {
      const res = await apiRequest("POST", "/api/orders", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setCart([]);
      toast({
        title: "Order placed successfully",
        description: "You can track your order in the Orders page",
      });
    },
  });

  const addToCart = (menuItem: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map((item) =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  };

  const updateQuantity = (menuItemId: number, quantity: number) => {
    if (quantity === 0) {
      setCart((prev) =>
        prev.filter((item) => item.menuItem.id !== menuItemId)
      );
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.menuItem.id === menuItemId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const placeOrder = async () => {
    if (!selectedDate) {
      toast({
        title: "Please select a delivery date",
        variant: "destructive",
      });
      return;
    }

    const total = cart.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    );

    const orderData = {
      order: {
        customerId: user!.id,
        merchantId,
        deliveryDate: selectedDate,
        status: "pending",
        totalAmount: total,
      },
      items: cart.map((item) => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        price: item.menuItem.price,
      })),
    };

    await createOrderMutation.mutateAsync(orderData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{merchant?.companyName}</h1>
          <p className="text-muted-foreground">{merchant?.description}</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Your Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.menuItem.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{item.menuItem.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${item.menuItem.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateQuantity(item.menuItem.id, item.quantity - 1)
                      }
                    >
                      -
                    </Button>
                    <span>{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateQuantity(item.menuItem.id, item.quantity + 1)
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t">
                <p className="font-medium">
                  Total: $
                  {cart
                    .reduce(
                      (sum, item) =>
                        sum + item.menuItem.price * item.quantity,
                      0
                    )
                    .toFixed(2)}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Delivery Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={placeOrder}
                disabled={cart.length === 0 || createOrderMutation.isPending}
              >
                {createOrderMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Place Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems?.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <p className="text-muted-foreground">{item.description}</p>
              <p className="text-lg font-bold mt-2">
                ${item.price.toFixed(2)}
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => addToCart(item)}>
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}