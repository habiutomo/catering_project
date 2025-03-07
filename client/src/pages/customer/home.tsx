import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Merchant } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2, Search } from "lucide-react";

export default function CustomerHome() {
  const [search, setSearch] = useState("");

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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Find Caterers</h1>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search caterers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMerchants?.map((merchant) => (
          <Card key={merchant.id}>
            <CardHeader>
              <CardTitle>{merchant.companyName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{merchant.description}</p>
              <p className="text-sm mb-4">{merchant.address}</p>
              <Button asChild className="w-full">
                <Link href={`/merchant/${merchant.id}`}>View Menu</Link>
              </Button>
            </CardContent>
          </Card>
        ))}

        {filteredMerchants?.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground">
            No caterers found
          </div>
        )}
      </div>
    </div>
  );
}
