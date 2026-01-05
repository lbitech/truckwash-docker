import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Location, insertLocationSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { MapPin, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 20;

export default function LocationsPage() {
    const { toast } = useToast();
    const [showLocationForm, setShowLocationForm] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const [deletingLocation, setDeletingLocation] = useState<Location | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const { data: locations = [], isLoading } = useQuery<Location[]>({
        queryKey: ["/api/locations"],
    });

    const locationForm = useForm({
        resolver: zodResolver(insertLocationSchema),
        defaultValues: {
            name: "",
            motorway: "",
            area: "",
            postcode: "",
        },
    });

    const editForm = useForm({
        resolver: zodResolver(insertLocationSchema),
        defaultValues: {
            name: "",
            motorway: "",
            area: "",
            postcode: "",
        },
    });

    useEffect(() => {
        if (editingLocation) {
            editForm.reset({
                name: editingLocation.name,
                motorway: editingLocation.motorway,
                area: editingLocation.area,
                postcode: editingLocation.postcode,
            });
        }
    }, [editingLocation, editForm]);

    const filteredLocations = useMemo(() => {
        if (!searchQuery.trim()) return locations;
        const search = searchQuery.toLowerCase();
        return locations.filter((location) =>
            location.name.toLowerCase().includes(search) ||
            location.motorway.toLowerCase().includes(search) ||
            location.area.toLowerCase().includes(search) ||
            location.postcode.toLowerCase().includes(search)
        );
    }, [locations, searchQuery]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const totalPages = Math.ceil(filteredLocations.length / ITEMS_PER_PAGE);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const paginatedLocations = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredLocations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredLocations, currentPage]);

    const createLocationMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("POST", "/api/locations", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
            toast({
                title: "Success",
                description: "Location created successfully",
            });
            locationForm.reset();
            setShowLocationForm(false);
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to create location",
                variant: "destructive",
            });
        },
    });

    const updateLocationMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: any }) => {
            await apiRequest("PATCH", `/api/locations/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
            toast({
                title: "Success",
                description: "Location updated successfully",
            });
            setEditingLocation(null);
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to update location",
                variant: "destructive",
            });
        },
    });

    const deleteLocationMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/locations/${id}`, undefined);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
            toast({
                title: "Success",
                description: "Location deleted successfully",
            });
            setDeletingLocation(null);
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to delete location",
                variant: "destructive",
            });
        },
    });

    return (
        <div className="px-4 md:px-6 py-6 md:py-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Manage Locations</h1>
                <p className="text-muted-foreground mt-2 text-sm md:text-base">
                    Create and manage wash locations
                </p>
            </div>

            <Card>
                <CardHeader className="space-y-0 pb-2 gap-1 flex-wrap">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <CardTitle>Locations</CardTitle>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => setShowLocationForm(!showLocationForm)}
                            data-testid="button-toggle-location-form"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            New Location
                        </Button>
                    </div>
                    <CardDescription>
                        {filteredLocations.length} {filteredLocations.length === 1 ? "location" : "locations"} registered
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Input
                            type="text"
                            placeholder="Search locations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full"
                            data-testid="input-search-locations"
                        />
                    </div>

                    {showLocationForm && (
                        <Form {...locationForm}>
                            <form
                                onSubmit={locationForm.handleSubmit((data: any) =>
                                    createLocationMutation.mutate(data)
                                )}
                                className="space-y-3 p-4 border rounded-md bg-muted/50"
                                data-testid="form-create-location"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormField
                                        control={locationForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Location Name *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Services Name" data-testid="input-location-name" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={locationForm.control}
                                        name="motorway"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Motorway *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="M1" data-testid="input-motorway" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={locationForm.control}
                                        name="area"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Area *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="North" data-testid="input-area" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={locationForm.control}
                                        name="postcode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Postcode *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="AB12 3CD" data-testid="input-postcode" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        type="submit"
                                        disabled={createLocationMutation.isPending}
                                        data-testid="button-submit-location"
                                    >
                                        {createLocationMutation.isPending ? "Creating..." : "Create Location"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowLocationForm(false);
                                            locationForm.reset();
                                        }}
                                        data-testid="button-cancel-location"
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
                                    <TableHead>ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Motorway</TableHead>
                                    <TableHead>Area</TableHead>
                                    <TableHead>Postcode</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedLocations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            No locations yet
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedLocations.map((location) => (
                                        <TableRow key={location.locationId} data-testid={`row-location-${location.locationId}`}>
                                            <TableCell className="font-medium" data-testid={`text-id-${location.locationId}`}>
                                                {location.locationId}
                                            </TableCell>
                                            <TableCell data-testid={`text-name-${location.locationId}`}>
                                                {location.name}
                                            </TableCell>
                                            <TableCell data-testid={`text-motorway-${location.locationId}`}>
                                                {location.motorway}
                                            </TableCell>
                                            <TableCell data-testid={`text-area-${location.locationId}`}>
                                                {location.area}
                                            </TableCell>
                                            <TableCell data-testid={`text-postcode-${location.locationId}`}>
                                                {location.postcode}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => setEditingLocation(location)}
                                                        data-testid={`button-edit-location-${location.locationId}`}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => setDeletingLocation(location)}
                                                        data-testid={`button-delete-location-${location.locationId}`}
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

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Location Dialog */}
            <Dialog open={!!editingLocation} onOpenChange={(open) => !open && setEditingLocation(null)}>
                <DialogContent data-testid="dialog-edit-location">
                    <DialogHeader>
                        <DialogTitle>Edit Location</DialogTitle>
                        <DialogDescription>
                            Update location information
                        </DialogDescription>
                    </DialogHeader>
                    {editingLocation && (
                        <Form {...editForm}>
                            <form
                                onSubmit={editForm.handleSubmit((data) =>
                                    updateLocationMutation.mutate({ id: editingLocation.locationId, data })
                                )}
                                className="space-y-4"
                            >
                                <FormField
                                    control={editForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location Name *</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={editForm.control}
                                    name="motorway"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Motorway *</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={editForm.control}
                                    name="area"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Area *</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={editForm.control}
                                    name="postcode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Postcode *</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditingLocation(null)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={updateLocationMutation.isPending}>
                                        {updateLocationMutation.isPending ? "Updating..." : "Update Location"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Location Confirmation */}
            <AlertDialog open={!!deletingLocation} onOpenChange={(open) => !open && setDeletingLocation(null)}>
                <AlertDialogContent data-testid="dialog-delete-location">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Location</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {deletingLocation?.name}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel data-testid="button-cancel-delete-location">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingLocation && deleteLocationMutation.mutate(deletingLocation.locationId)}
                            className="bg-destructive hover-elevate"
                            data-testid="button-confirm-delete-location"
                        >
                            {deleteLocationMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
