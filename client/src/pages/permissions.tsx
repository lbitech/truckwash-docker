import { useQuery, useMutation } from "@tanstack/react-query";
import { type UserRole, type PagePermission, USER_ROLES, SYSTEM_PAGES } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Permissions() {
    const { toast } = useToast();

    const { data: permissions = [], isLoading } = useQuery<PagePermission[]>({
        queryKey: ["/api/permissions"],
    });

    const updatePermissionMutation = useMutation({
        mutationFn: async (data: { role: UserRole; pageRoute: string; isAllowed: number }) => {
            await apiRequest("POST", "/api/permissions", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/permissions"] });
            toast({
                title: "Permission Updated",
                description: "The page access has been updated successfully.",
            });
        },
        onError: (error) => {
            toast({
                title: "Failed to update permission",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const getPermission = (role: UserRole, route: string) => {
        const perm = permissions.find((p) => p.role === role && p.pageRoute === route);
        // Default: superAdmin and admin have access (1), others don't (0) until set
        if (!perm) {
            return (role === "superAdmin" || role === "admin") ? 1 : 0;
        }
        return perm.isAllowed;
    };

    const handleToggle = (role: UserRole, route: string, current: number) => {
        updatePermissionMutation.mutate({
            role,
            pageRoute: route,
            isAllowed: current === 1 ? 0 : 1,
        });
    };

    if (isLoading) {
        return <div className="p-8">Loading permissions...</div>;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Shield className="h-6 w-6 text-primary" />
                        <div>
                            <CardTitle>Page Permissions</CardTitle>
                            <CardDescription>
                                Control which user roles can access specific pages in the system.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-[200px] font-bold">Page / Route</TableHead>
                                    {USER_ROLES.map((role) => (
                                        <TableHead key={role} className="text-center font-bold capitalize">
                                            {role.replace(/([A-Z])/g, " $1")}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {SYSTEM_PAGES.map((page) => (
                                    <TableRow key={page.route} className="hover:bg-muted/30">
                                        <TableCell className="font-medium">
                                            <div>{page.label}</div>
                                            <code className="text-[10px] text-muted-foreground">{page.route}</code>
                                        </TableCell>
                                        {USER_ROLES.map((role) => {
                                            const isAllowed = getPermission(role, page.route);
                                            return (
                                                <TableCell key={role} className="text-center">
                                                    <Checkbox
                                                        checked={isAllowed === 1}
                                                        onCheckedChange={() => handleToggle(role, page.route, isAllowed)}
                                                        disabled={updatePermissionMutation.isPending &&
                                                            updatePermissionMutation.variables?.role === role &&
                                                            updatePermissionMutation.variables?.pageRoute === page.route}
                                                    />
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
