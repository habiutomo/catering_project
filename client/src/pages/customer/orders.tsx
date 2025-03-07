import { useQuery } from "@tanstack/react-query";
import { Order, OrderItem } from "@shared/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

type OrderWithItems = Order & {
  items: (OrderItem & { menuItem: { name: string } })[];
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};

export default function CustomerOrders() {
  const { data: orders, isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>

      <div className="space-y-4">
        {orders?.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span>Order #{order.id}</span>
                  <Badge className={statusColors[order.status]}>
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Badge>
                </div>
                <span>${order.totalAmount.toFixed(2)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p>{new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Delivery Date
                  </p>
                  <p>
                    {new Date(order.deliveryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <Accordion type="single" collapsible>
                <AccordionItem value="items">
                  <AccordionTrigger>Order Items</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium">
                              {item.menuItem.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <p>${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}

        {orders?.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No orders found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
