import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Company, type Vehicle, insertVehicleSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Truck, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 20;

export default function Manage() {
  const { toast } = useToast();
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [vehiclePage, setVehiclePage] = useState(1);

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const getCompanyName = (coId: number) => {
    const company = companies.find((c) => c.coId === coId);
    return company?.name || `Unknown (${coId})`;
  };

  const filteredVehicles = useMemo(() => {
    if (!vehicleSearch.trim()) return vehicles;
    const search = vehicleSearch.toLowerCase();
    return vehicles.filter((vehicle) => {
      const companyName = getCompanyName(vehicle.coId).toLowerCase();
      return vehicle.vreg.toLowerCase().includes(search) ||
        companyName.includes(search);
    });
  }, [vehicles, vehicleSearch, companies]);

  useEffect(() => {
    setVehiclePage(1);
  }, [vehicleSearch]);

  const vehicleTotalPages = Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (vehiclePage > vehicleTotalPages && vehicleTotalPages > 0) {
      setVehiclePage(vehicleTotalPages);
    }
  }, [vehicleTotalPages, vehiclePage]);

  const paginatedVehicles = useMemo(() => {
    const startIndex = (vehiclePage - 1) * ITEMS_PER_PAGE;
    return filteredVehicles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredVehicles, vehiclePage]);

  const vehicleFormSchema = insertVehicleSchema.pick({ vreg: true, coId: true }).extend({
    vreg: insertVehicleSchema.shape.vreg.min(1, "Vehicle registration is required"),
    coId: insertVehicleSchema.shape.coId.refine((val) => val > 0, {
      message: "Please select a company",
    }),
  });

  const vehicleForm = useForm({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      vreg: "",
      coId: undefined as any,
    },
  });

  const editForm = useForm({
    resolver: zodResolver(vehicleFormSchema.partial()),
    defaultValues: {
      coId: undefined as any,
    },
  });

  useEffect(() => {
    if (editingVehicle) {
      editForm.reset({
        coId: editingVehicle.coId,
      });
    }
  }, [editingVehicle, editForm]);

  const createVehicleMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/vehicles", {
        vreg: data.vreg,
        coId: data.coId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/washes"] });
      toast({
        title: "Success",
        description: "Vehicle created successfully",
      });
      vehicleForm.reset();
      setShowVehicleForm(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create vehicle",
        variant: "destructive",
      });
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: async ({ vreg, data }: { vreg: string; data: any }) => {
      await apiRequest("PATCH", `/api/vehicles/${vreg}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/washes"] });
      toast({
        title: "Success",
        description: "Vehicle updated successfully",
      });
      setEditingVehicle(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update vehicle",
        variant: "destructive",
      });
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: async (vreg: string) => {
      await apiRequest("DELETE", `/api/vehicles/${vreg}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      });
      setDeletingVehicle(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete vehicle",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="px-4 md:px-6 py-6 md:py-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Manage Fleet</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Create and manage vehicles
        </p>
      </div>

      <Card>
        <CardHeader className="space-y-0 pb-2 gap-1 flex-wrap">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <CardTitle>Vehicles</CardTitle>
            </div>
            <Button
              size="sm"
              onClick={() => setShowVehicleForm(!showVehicleForm)}
              data-testid="button-toggle-vehicle-form"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Vehicle
            </Button>
          </div>
          <CardDescription>
            {filteredVehicles.length} {filteredVehicles.length === 1 ? "vehicle" : "vehicles"} registered
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Search vehicles..."
              value={vehicleSearch}
              onChange={(e) => setVehicleSearch(e.target.value)}
              className="w-full"
              data-testid="input-search-vehicles"
            />
          </div>

          {showVehicleForm && (
            <Form {...vehicleForm}>
              <form
                onSubmit={vehicleForm.handleSubmit((data: any) =>
                  createVehicleMutation.mutate(data)
                )}
                className="space-y-3 p-4 border rounded-md bg-muted/50"
                data-testid="form-create-vehicle"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={vehicleForm.control}
                    name="vreg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Registration *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="ABC123"
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            data-testid="input-vehicle-vreg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={vehicleForm.control}
                    name="coId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company *</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-vehicle-company">
                              <SelectValue placeholder="Select a company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {companies.map((company) => (
                              <SelectItem key={company.coId} value={company.coId.toString()}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={createVehicleMutation.isPending}
                    data-testid="button-submit-vehicle"
                  >
                    {createVehicleMutation.isPending ? "Creating..." : "Create Vehicle"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowVehicleForm(false);
                      vehicleForm.reset();
                    }}
                    data-testid="button-cancel-vehicle"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehiclesLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : paginatedVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No vehicles yet
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedVehicles.map((vehicle) => (
                    <TableRow key={vehicle.vreg} data-testid={`row-vehicle-${vehicle.vreg}`}>
                      <TableCell className="font-medium" data-testid={`text-vreg-${vehicle.vreg}`}>
                        {vehicle.vreg}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground" data-testid={`text-company-${vehicle.vreg}`}>
                        {getCompanyName(vehicle.coId)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingVehicle(vehicle)}
                            data-testid={`button-edit-vehicle-${vehicle.vreg}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeletingVehicle(vehicle)}
                            data-testid={`button-delete-vehicle-${vehicle.vreg}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {vehicleTotalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {vehiclePage} of {vehicleTotalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVehiclePage(vehiclePage - 1)}
                  disabled={vehiclePage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVehiclePage(vehiclePage + 1)}
                  disabled={vehiclePage === vehicleTotalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Vehicle Dialog */}
      <Dialog open={!!editingVehicle} onOpenChange={(open) => !open && setEditingVehicle(null)}>
        <DialogContent data-testid="dialog-edit-vehicle">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>
              Update vehicle information
            </DialogDescription>
          </DialogHeader>
          {editingVehicle && (
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit((data) =>
                  updateVehicleMutation.mutate({ vreg: editingVehicle.vreg, data })
                )}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle Registration</label>
                  <Input value={editingVehicle.vreg} disabled className="bg-muted" />
                </div>
                <FormField
                  control={editForm.control}
                  name="coId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.coId} value={company.coId.toString()}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingVehicle(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateVehicleMutation.isPending}>
                    {updateVehicleMutation.isPending ? "Updating..." : "Update Vehicle"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Vehicle Confirmation */}
      <AlertDialog open={!!deletingVehicle} onOpenChange={(open) => !open && setDeletingVehicle(null)}>
        <AlertDialogContent data-testid="dialog-delete-vehicle">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete vehicle {deletingVehicle?.vreg}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-vehicle">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingVehicle && deleteVehicleMutation.mutate(deletingVehicle.vreg)}
              className="bg-destructive hover-elevate"
              data-testid="button-confirm-delete-vehicle"
            >
              {deleteVehicleMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
