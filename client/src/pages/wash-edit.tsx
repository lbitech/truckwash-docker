import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type WashType, insertWashTypeSchema } from "@shared/schema";
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
import { Plus, Edit, Trash2, Droplets } from "lucide-react";

export default function WashEdit() {
    const { toast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [editingType, setEditingType] = useState<WashType | null>(null);
    const [deletingType, setDeletingType] = useState<WashType | null>(null);

    const { data: washTypes = [], isLoading } = useQuery<WashType[]>({
        queryKey: ["/api/washtypes"],
    });

    const form = useForm({
        resolver: zodResolver(insertWashTypeSchema),
        defaultValues: {
            description: "",
            price: 0,
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("POST", "/api/washtypes", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/washtypes"] });
            toast({
                title: "Success",
                description: "Wash type created successfully",
            });
            form.reset();
            setShowForm(false);
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to create wash type",
                variant: "destructive",
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: any }) => {
            await apiRequest("PATCH", `/api/washtypes/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/washtypes"] });
            toast({
                title: "Success",
                description: "Wash type updated successfully",
            });
            setEditingType(null);
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to update wash type",
                variant: "destructive",
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/washtypes/${id}`, undefined);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/washtypes"] });
            toast({
                title: "Success",
                description: "Wash type deleted successfully",
            });
            setDeletingType(null);
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to delete wash type",
                variant: "destructive",
            });
        },
    });

    return (
        <div className="px-4 md:px-6 py-6 md:py-8 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Wash Types</h1>
                    <p className="text-muted-foreground mt-2 text-sm md:text-base">
                        Manage wash types and pricing
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)} data-testid="button-new-washtype">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Wash Type
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-primary" />
                        <CardTitle>Wash Price List</CardTitle>
                    </div>
                    <CardDescription>
                        Current wash types and their associated costs
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {showForm && (
                        <div className="mb-6 p-4 border rounded-md bg-muted/50">
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
                                    className="space-y-4"
                                    data-testid="form-create-washtype"
                                >
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Standard Wash" {...field} data-testid="input-description" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Price (£)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            placeholder="0.00"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                                            data-testid="input-price"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setShowForm(false);
                                                form.reset();
                                            }}
                                            data-testid="button-cancel-create"
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-create">
                                            {createMutation.isPending ? "Creating..." : "Create"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    )}

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Price (£)</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : washTypes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                                            No wash types defined
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    washTypes.map((type) => (
                                        <TableRow key={type.wtid} data-testid={`row-washtype-${type.wtid}`}>
                                            <TableCell className="font-medium">{type.description}</TableCell>
                                            <TableCell>£{type.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => setEditingType(type)}
                                                        data-testid={`button-edit-${type.wtid}`}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => setDeletingType(type)}
                                                        data-testid={`button-delete-${type.wtid}`}
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
                </CardContent>
            </Card>

            <Dialog open={!!editingType} onOpenChange={(open) => !open && setEditingType(null)}>
                <DialogContent data-testid="dialog-edit">
                    <DialogHeader>
                        <DialogTitle>Edit Wash Type</DialogTitle>
                        <DialogDescription>Update wash type details</DialogDescription>
                    </DialogHeader>
                    {editingType && (
                        <EditWashTypeForm
                            washType={editingType}
                            onSubmit={(data) => updateMutation.mutate({ id: editingType.wtid, data })}
                            onCancel={() => setEditingType(null)}
                            isPending={updateMutation.isPending}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deletingType} onOpenChange={(open) => !open && setDeletingType(null)}>
                <AlertDialogContent data-testid="dialog-delete">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Wash Type</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{deletingType?.description}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingType && deleteMutation.mutate(deletingType.wtid)}
                            className="bg-destructive hover-elevate"
                            data-testid="button-confirm-delete"
                        >
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function EditWashTypeForm({
    washType,
    onSubmit,
    onCancel,
    isPending,
}: {
    washType: WashType;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isPending: boolean;
}) {
    const form = useForm({
        resolver: zodResolver(insertWashTypeSchema),
        defaultValues: {
            description: washType.description,
            price: washType.price,
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-edit">
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Input {...field} data-testid="input-edit-description" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price (£)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    data-testid="input-edit-price"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-edit">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isPending} data-testid="button-submit-edit">
                        {isPending ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}
