import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Company, insertCompanySchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Building2, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 20;

export default function CompaniesPage() {
    const { toast } = useToast();
    const [showCompanyForm, setShowCompanyForm] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const { data: companies = [], isLoading: companiesLoading } = useQuery<Company[]>({
        queryKey: ["/api/companies"],
    });

    const companyForm = useForm({
        resolver: zodResolver(insertCompanySchema),
        defaultValues: {
            name: "",
            transportManager: "",
            transportManagerEmail: "",
            transportManagerPhone: "",
            poContact: "",
            poContactEmail: "",
            poContactPhone: "",
            plContact: "",
            plContactEmail: "",
            plContactPhone: "",
        },
    });

    const editForm = useForm({
        resolver: zodResolver(insertCompanySchema),
        defaultValues: {
            name: "",
            transportManager: "",
            transportManagerEmail: "",
            transportManagerPhone: "",
            poContact: "",
            poContactEmail: "",
            poContactPhone: "",
            plContact: "",
            plContactEmail: "",
            plContactPhone: "",
        },
    });

    useEffect(() => {
        if (editingCompany) {
            editForm.reset({
                name: editingCompany.name,
                transportManager: editingCompany.transportManager || "",
                transportManagerEmail: editingCompany.transportManagerEmail || "",
                transportManagerPhone: editingCompany.transportManagerPhone || "",
                poContact: editingCompany.poContact || "",
                poContactEmail: editingCompany.poContactEmail || "",
                poContactPhone: editingCompany.poContactPhone || "",
                plContact: editingCompany.plContact || "",
                plContactEmail: editingCompany.plContactEmail || "",
                plContactPhone: editingCompany.plContactPhone || "",
            });
        }
    }, [editingCompany, editForm]);

    const filteredCompanies = useMemo(() => {
        if (!searchQuery.trim()) return companies;
        const search = searchQuery.toLowerCase();
        return companies.filter((company) =>
            company.name.toLowerCase().includes(search) ||
            company.transportManager?.toLowerCase().includes(search) ||
            company.transportManagerEmail?.toLowerCase().includes(search) ||
            company.transportManagerPhone?.toLowerCase().includes(search)
        );
    }, [companies, searchQuery]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const paginatedCompanies = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCompanies.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredCompanies, currentPage]);

    const createCompanyMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("POST", "/api/companies", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
            toast({
                title: "Success",
                description: "Company created successfully",
            });
            companyForm.reset();
            setShowCompanyForm(false);
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to create company",
                variant: "destructive",
            });
        },
    });

    const updateCompanyMutation = useMutation({
        mutationFn: async ({ coId, data }: { coId: number; data: any }) => {
            await apiRequest("PATCH", `/api/companies/${coId}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
            toast({
                title: "Success",
                description: "Company updated successfully",
            });
            setEditingCompany(null);
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to update company",
                variant: "destructive",
            });
        },
    });

    const deleteCompanyMutation = useMutation({
        mutationFn: async (coId: number) => {
            await apiRequest("DELETE", `/api/companies/${coId}`, undefined);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
            toast({
                title: "Success",
                description: "Company deleted successfully",
            });
            setDeletingCompany(null);
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to delete company",
                variant: "destructive",
            });
        },
    });

    return (
        <div className="px-4 md:px-6 py-6 md:py-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Manage Companies</h1>
                <p className="text-muted-foreground mt-2 text-sm md:text-base">
                    Create and manage company records and contact details
                </p>
            </div>

            <Card>
                <CardHeader className="space-y-0 pb-2 gap-1 flex-wrap">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            <CardTitle>Companies</CardTitle>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => setShowCompanyForm(!showCompanyForm)}
                            data-testid="button-toggle-company-form"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            New Company
                        </Button>
                    </div>
                    <CardDescription>
                        {filteredCompanies.length} {filteredCompanies.length === 1 ? "company" : "companies"} registered
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Input
                            type="text"
                            placeholder="Search companies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full"
                            data-testid="input-search-companies"
                        />
                    </div>

                    {showCompanyForm && (
                        <Form {...companyForm}>
                            <form
                                onSubmit={companyForm.handleSubmit((data: any) =>
                                    createCompanyMutation.mutate(data)
                                )}
                                className="space-y-3 p-4 border rounded-md bg-muted/50"
                                data-testid="form-create-company"
                            >
                                <FormField
                                    control={companyForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company Name *</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Fleet Transport Ltd" data-testid="input-company-name" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Tabs defaultValue="tm" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="tm">TM</TabsTrigger>
                                        <TabsTrigger value="po">PO</TabsTrigger>
                                        <TabsTrigger value="pl">PL</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="tm" className="space-y-3 pt-3">
                                        <FormField
                                            control={companyForm.control}
                                            name="transportManager"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Transport Manager</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value ?? ""} placeholder="John Smith" data-testid="input-transport-manager" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={companyForm.control}
                                            name="transportManagerEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>TM Email</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value ?? ""} type="email" placeholder="contact@company.co.uk" data-testid="input-tm-email" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={companyForm.control}
                                            name="transportManagerPhone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>TM Phone</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value ?? ""} placeholder="01234567890" data-testid="input-tm-phone" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>
                                    <TabsContent value="po" className="space-y-3 pt-3">
                                        <FormField
                                            control={companyForm.control}
                                            name="poContact"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>PO Contact</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value ?? ""} placeholder="Jane Doe" data-testid="input-po-contact" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={companyForm.control}
                                            name="poContactEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>PO Email</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value ?? ""} type="email" placeholder="jane@company.co.uk" data-testid="input-po-email" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={companyForm.control}
                                            name="poContactPhone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>PO Phone</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value ?? ""} placeholder="01234567891" data-testid="input-po-phone" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>
                                    <TabsContent value="pl" className="space-y-3 pt-3">
                                        <FormField
                                            control={companyForm.control}
                                            name="plContact"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>PL Contact</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value ?? ""} placeholder="Bob Miller" data-testid="input-pl-contact" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={companyForm.control}
                                            name="plContactEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>PL Email</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value ?? ""} type="email" placeholder="bob@company.co.uk" data-testid="input-pl-email" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={companyForm.control}
                                            name="plContactPhone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>PL Phone</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value ?? ""} placeholder="01234567892" data-testid="input-pl-phone" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>
                                </Tabs>
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        type="submit"
                                        disabled={createCompanyMutation.isPending}
                                        data-testid="button-submit-company"
                                    >
                                        {createCompanyMutation.isPending ? "Creating..." : "Create Company"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowCompanyForm(false);
                                            companyForm.reset();
                                        }}
                                        data-testid="button-cancel-company"
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
                                    <TableHead>Contact</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {companiesLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedCompanies.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No companies yet
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedCompanies.map((company) => (
                                        <TableRow key={company.coId} data-testid={`row-company-${company.coId}`}>
                                            <TableCell className="font-medium" data-testid={`text-coid-${company.coId}`}>
                                                {company.coId}
                                            </TableCell>
                                            <TableCell data-testid={`text-name-${company.coId}`}>
                                                {company.name}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground" data-testid={`text-contact-${company.coId}`}>
                                                {company.transportManager || "—"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => setEditingCompany(company)}
                                                        data-testid={`button-edit-company-${company.coId}`}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => setDeletingCompany(company)}
                                                        data-testid={`button-delete-company-${company.coId}`}
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

            {/* Edit Company Dialog */}
            <Dialog open={!!editingCompany} onOpenChange={(open) => !open && setEditingCompany(null)}>
                <DialogContent data-testid="dialog-edit-company">
                    <DialogHeader>
                        <DialogTitle>Edit Company</DialogTitle>
                        <DialogDescription>
                            Update company information and contact details
                        </DialogDescription>
                    </DialogHeader>
                    {editingCompany && (
                        <Form {...editForm}>
                            <form
                                onSubmit={editForm.handleSubmit((data) =>
                                    updateCompanyMutation.mutate({ coId: editingCompany.coId, data })
                                )}
                                className="space-y-4"
                            >
                                <FormField
                                    control={editForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company Name *</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Tabs defaultValue="tm" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="tm">TM</TabsTrigger>
                                        <TabsTrigger value="po">PO</TabsTrigger>
                                        <TabsTrigger value="pl">PL</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="tm" className="space-y-3 pt-3">
                                        <FormField
                                            control={editForm.control}
                                            name="transportManager"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Transport Manager</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value ?? ""} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={editForm.control}
                                            name="transportManagerEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>TM Email</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value ?? ""} type="email" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={editForm.control}
                                            name="transportManagerPhone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>TM Phone</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value ?? ""} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>
                                    <TabsContent value="po" className="space-y-3 pt-3">
                                        <FormField
                                            control={editForm.control}
                                            name="poContact"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>PO Contact</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value ?? ""} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={editForm.control}
                                            name="poContactEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>PO Email</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value ?? ""} type="email" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={editForm.control}
                                            name="poContactPhone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>PO Phone</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value ?? ""} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>
                                    <TabsContent value="pl" className="space-y-3 pt-3">
                                        <FormField
                                            control={editForm.control}
                                            name="plContact"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>PL Contact</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value ?? ""} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={editForm.control}
                                            name="plContactEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>PL Email</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value ?? ""} type="email" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={editForm.control}
                                            name="plContactPhone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>PL Phone</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value ?? ""} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>
                                </Tabs>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditingCompany(null)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={updateCompanyMutation.isPending}>
                                        {updateCompanyMutation.isPending ? "Updating..." : "Update Company"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Company Confirmation */}
            <AlertDialog open={!!deletingCompany} onOpenChange={(open) => !open && setDeletingCompany(null)}>
                <AlertDialogContent data-testid="dialog-delete-company">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Company</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {deletingCompany?.name}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel data-testid="button-cancel-delete-company">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingCompany && deleteCompanyMutation.mutate(deletingCompany.coId)}
                            className="bg-destructive hover-elevate"
                            data-testid="button-confirm-delete-company"
                        >
                            {deleteCompanyMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
