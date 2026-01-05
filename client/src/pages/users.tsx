import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, USER_ROLES, UserRole, insertUserSchema, InsertUser, type Company } from "@shared/schema";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Key, Shield, Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function UsersPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [resetPasswordResult, setResetPasswordResult] = useState<{
        email: string;
        newPassword: string;
    } | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const form = useForm<InsertUser>({
        resolver: zodResolver(insertUserSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            role: "washOperative",
            coId: undefined,
        },
    });

    const { data: users, isLoading } = useQuery<User[]>({
        queryKey: ["/api/admin/users"],
    });

    const { data: companies = [] } = useQuery<Company[]>({
        queryKey: ["/api/companies"],
    });

    const getCompanyName = (coId: number | null | undefined) => {
        if (!coId) return "—";
        const company = companies.find((c) => c.coId === coId);
        return company?.name || "Unknown";
    };

    const updateRoleMutation = useMutation({
        mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {
            const res = await apiRequest("PATCH", `/api/admin/users/${id}`, { role });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            toast({
                title: "Role updated",
                description: "User role has been successfully updated.",
            });
        },
    });

    const resetPasswordMutation = useMutation({
        mutationFn: async ({ id, email }: { id: string; email: string }) => {
            const res = await apiRequest("POST", `/api/admin/users/${id}/reset-password`);
            const { newPassword } = await res.json();
            return { email, newPassword };
        },
        onSuccess: (data) => {
            setResetPasswordResult(data);
            toast({
                title: "Password reset",
                description: `New password generated for ${data.email}`,
            });
        },
    });

    const createUserMutation = useMutation({
        mutationFn: async (data: InsertUser) => {
            const res = await apiRequest("POST", "/api/admin/users", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            toast({
                title: "User created",
                description: "New user has been successfully registered.",
            });
            setIsCreateDialogOpen(false);
            form.reset();
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to create user",
            });
        },
    });

    const getRoleBadgeColor = (role: UserRole) => {
        switch (role) {
            case "superAdmin":
                return "bg-red-500 hover:bg-red-600";
            case "admin":
                return "bg-orange-500 hover:bg-orange-600";
            case "washOperative":
                return "bg-blue-500 hover:bg-blue-600";
            default:
                return "bg-slate-500 hover:bg-slate-600";
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <Shield className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">User Management</h1>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create User
                </Button>
            </div>

            <div className="bg-card rounded-lg border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users?.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">
                                    {user.firstName} {user.lastName}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {getCompanyName(user.coId)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Select
                                            defaultValue={user.role || "washOperative"}
                                            onValueChange={(value) =>
                                                updateRoleMutation.mutate({ id: user.id, role: value as UserRole })
                                            }
                                            disabled={updateRoleMutation.isPending}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {USER_ROLES.map((role) => (
                                                    <SelectItem key={role} value={role}>
                                                        {role}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => resetPasswordMutation.mutate({ id: user.id, email: user.email! })}
                                        disabled={resetPasswordMutation.isPending}
                                    >
                                        <Key className="h-4 w-4 mr-2" />
                                        Reset Password
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                        <DialogDescription>
                            Register a new user and assign them a role. They can use these credentials to log in.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit((data) => createUserMutation.mutate(data))} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value || "washOperative"}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {USER_ROLES.map((role) => (
                                                    <SelectItem key={role} value={role}>
                                                        {role}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="coId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company (Optional)</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))}
                                            value={field.value?.toString() || "none"}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a company" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
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
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createUserMutation.isPending}>
                                    {createUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create User
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!resetPasswordResult} onOpenChange={() => setResetPasswordResult(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Temporary Password Generated</DialogTitle>
                        <DialogDescription>
                            Please provide this temporary password to <strong>{resetPasswordResult?.email}</strong>.
                            They should change it after logging in.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-muted p-4 rounded-md font-mono text-center text-2xl tracking-wider select-all">
                        {resetPasswordResult?.newPassword}
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={() => setResetPasswordResult(null)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
