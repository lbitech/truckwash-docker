import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Location, WashType } from "@shared/schema";
import UKMotorwayMap from "@/components/UKMotorwayMap";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleLogin = () => {
    setLocation("/auth");
  };

  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const { data: washTypes = [], isLoading: washTypesLoading } = useQuery<WashType[]>({
    queryKey: ["/api/washtypes"],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-semibold">UK Truck Clean</h1>
          </div>
          <Button onClick={handleLogin} data-testid="button-login">
            Log In
          </Button>
        </div>
      </header>

      <main className="flex-1 px-6 py-16">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Professional Truck Cleaning
            </h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              {washTypesLoading ? (
                <div className="space-y-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
                    {washTypes.map((washType) => (
                      <div
                        key={washType.wtid}
                        className="flex items-center justify-between py-2 border-b"
                        data-testid={`pricing-item-${washType.wtid}`}
                      >
                        <span className="text-sm font-medium" data-testid={`pricing-description-${washType.wtid}`}>
                          {washType.description}
                        </span>
                        <span className="text-sm text-muted-foreground" data-testid={`pricing-price-${washType.wtid}`}>
                          £{washType.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-6 text-sm font-bold text-center" data-testid="text-pricing-note">
                    Phone Gary Taylor on 07970 842 423 to discuss special deals on large fleets
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Our Locations</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-0 divide-y">
                    {locations.map((location, index) => (
                      <div
                        key={location.locationId}
                        className="py-3 flex items-start gap-4"
                        data-testid={`location-item-${location.locationId}`}
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm" data-testid={`location-name-${location.locationId}`}>
                            {location.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {location.motorway} - {location.area}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {location.postcode}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle>Coverage Map</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)]">
                {isLoading ? (
                  <div className="h-full bg-muted animate-pulse rounded" />
                ) : (
                  <UKMotorwayMap locations={locations} />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="text-center space-y-4 pt-8">
            <p className="text-sm text-muted-foreground">
              UK Truck Clean Ltd, 4 Linden Close, Lymm, WA13 9PH - 07970 824 423
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
