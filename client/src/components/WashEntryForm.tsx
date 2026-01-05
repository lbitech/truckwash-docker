import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";
import type { WashType, Vehicle, Location, Company } from "@shared/schema";

const washFormSchema = z.object({
  vreg: z.string().min(1, "Vehicle registration is required").max(10),
  washType: z.number({ required_error: "Wash type is required" }),
  location: z.string().min(1, "Location is required").max(30),
  companyId: z.number().optional(),
  driverName: z.string().max(50).optional(),
});

type WashFormData = z.infer<typeof washFormSchema>;

type VehicleWithCompany = Vehicle & { companyName: string };

const UNKNOWN_COMPANY_ID = 999999;

export default function WashEntryForm() {
  const { toast } = useToast();
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [vehicleData, setVehicleData] = useState<VehicleWithCompany | null>(null);
  const [isNewVehicle, setIsNewVehicle] = useState(false);
  const [isVehicleLookupDone, setIsVehicleLookupDone] = useState(false);

  const form = useForm<WashFormData>({
    resolver: zodResolver(washFormSchema),
    defaultValues: {
      vreg: "",
      washType: undefined,
      location: "",
      companyId: UNKNOWN_COMPANY_ID,
      driverName: "",
    },
  });

  const { data: washTypes = [], isLoading: washTypesLoading } = useQuery<WashType[]>({
    queryKey: ["/api/washtypes"],
  });

  const { data: locations = [], isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const { data: companies = [], isLoading: companiesLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const lookupVehicleMutation = useMutation({
    mutationFn: async (vreg: string) => {
      const response = await fetch(`/api/vehicles/${vreg.toUpperCase()}`);
      if (response.status === 404) {
        return null; // Signals new vehicle
      }
      if (!response.ok) {
        throw new Error("Failed to lookup vehicle");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setVehicleData(data);
      setIsVehicleLookupDone(true);

      if (data) {
        // Vehicle found
        setIsNewVehicle(false);
        form.setValue("companyId", data.coId); // Pre-select company for existing vehicles
        toast({
          title: "Vehicle found",
          description: `Company: ${data.companyName} (ID: ${data.coId})`,
        });
      } else {
        // Vehicle NOT found (New)
        setIsNewVehicle(true);
        form.setValue("companyId", UNKNOWN_COMPANY_ID); // Default to "To be confirmed"
        toast({
          title: "New vehicle",
          description: "Vehicle not found. Please select a company or keep 'To be confirmed'.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to lookup vehicle",
        variant: "destructive",
      });
    },
  });

  const createWashMutation = useMutation({
    mutationFn: async (data: WashFormData) => {
      // companyId is now set for both new and existing vehicles
      const finalCoId = data.companyId || UNKNOWN_COMPANY_ID;

      return await apiRequest("POST", "/api/washes", {
        vreg: data.vreg.toUpperCase(),
        washType: data.washType,
        location: data.location,
        driverName: data.driverName || null,
        coId: finalCoId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/washes"] });
      toast({
        title: "Wash recorded",
        description: "The wash has been successfully recorded.",
      });
      form.reset({
        vreg: "",
        washType: undefined,
        location: "",
        companyId: UNKNOWN_COMPANY_ID,
        driverName: "",
      });
      setVehicleData(null);
      setVehicleSearch("");
      setIsNewVehicle(false);
      setIsVehicleLookupDone(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record wash",
        variant: "destructive",
      });
    },
  });

  const handleVehicleLookup = () => {
    const vreg = form.getValues("vreg");
    if (!vreg) {
      toast({
        title: "Error",
        description: "Please enter a vehicle registration",
        variant: "destructive",
      });
      return;
    }
    setVehicleSearch(vreg);
    lookupVehicleMutation.mutate(vreg);
  };

  const onSubmit = (data: WashFormData) => {
    if (!isVehicleLookupDone) {
      toast({
        title: "Error",
        description: "Please lookup the vehicle first",
        variant: "destructive",
      });
      return;
    }
    createWashMutation.mutate(data);
  };

  return (
    <div className="flex justify-center px-6 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Record Wash</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="vreg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Vehicle Registration <span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            placeholder="e.g., ABC123"
                            maxLength={10}
                            data-testid="input-vreg"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setIsVehicleLookupDone(false);
                              setIsNewVehicle(false);
                              setVehicleData(null);
                            }}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleVehicleLookup}
                          disabled={lookupVehicleMutation.isPending || !field.value}
                          data-testid="button-lookup"
                        >
                          {lookupVehicleMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isVehicleLookupDone && !isNewVehicle && vehicleData && (
                  <div className="rounded-md border p-4 bg-muted/50" data-testid="vehicle-info">
                    <div className="text-sm">
                      {/* Company displayed in dropdown below */}
                    </div>
                    {vehicleData.lastWashDate && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Next wash: {new Date(vehicleData.lastWashDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}

                {isVehicleLookupDone && (
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Company <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-company">
                              <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={UNKNOWN_COMPANY_ID.toString()}>
                              To be confirmed
                            </SelectItem>
                            {companiesLoading ? (
                              <div className="p-2 text-center text-sm text-muted-foreground">
                                Loading...
                              </div>
                            ) : (
                              companies.map((company) => (
                                <SelectItem
                                  key={company.coId}
                                  value={company.coId.toString()}
                                  data-testid={`company-${company.coId}`}
                                >
                                  {company.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="driverName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Driver Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional driver name" {...field} data-testid="input-driver-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="washType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Wash Type <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                      disabled={!isVehicleLookupDone}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-washtype">
                          <SelectValue placeholder="Select wash type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {washTypesLoading ? (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            Loading...
                          </div>
                        ) : (
                          washTypes.map((type) => (
                            <SelectItem
                              key={type.wtid}
                              value={type.wtid.toString()}
                              data-testid={`washtype-${type.wtid}`}
                            >
                              {type.description} - £{type.price}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Location <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!isVehicleLookupDone}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full" data-testid="select-location">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locationsLoading ? (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            Loading...
                          </div>
                        ) : (
                          locations.map((location) => (
                            <SelectItem
                              key={location.locationId}
                              value={location.name}
                              data-testid={`location-${location.locationId}`}
                            >
                              {location.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={createWashMutation.isPending || !isVehicleLookupDone}
                data-testid="button-submit"
              >
                {createWashMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {createWashMutation.isPending ? "Recording..." : "Record Wash"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
