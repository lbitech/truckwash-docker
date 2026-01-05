import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth"; // I'll check if this needs update
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useLocation } from "wouter";
import { Droplets } from "lucide-react";
import { useState } from "react";

const loginSchema = z.object({
    username: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});

export default function AuthPage() {
    const { loginMutation, user } = useAuth();
    const [, setLocation] = useLocation();
    const [error, setError] = useState("");

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    if (user) {
        setLocation("/records");
        return null;
    }

    async function onSubmit(values: z.infer<typeof loginSchema>) {
        try {
            setError("");
            await loginMutation.mutateAsync(values);
            setLocation("/records");
        } catch (e) {
            setError("Invalid email or password");
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="flex items-center justify-center p-8 bg-background">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2 mb-4">
                            <Droplets className="h-8 w-8 text-primary" />
                            <h1 className="text-2xl font-semibold">UK Truck Clean</h1>
                        </div>
                        <CardTitle className="text-2xl">Value-added Log In</CardTitle>
                        <CardDescription>
                            Enter your email and password to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="name@example.com" {...field} />
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
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {error && (
                                    <div className="text-sm text-destructive font-medium">
                                        {error}
                                    </div>
                                )}
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loginMutation.isPending}
                                >
                                    {loginMutation.isPending ? "Logging in..." : "Log In"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="hidden lg:block bg-muted relative">
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]" />
                <img
                    src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2940&auto=format&fit=crop"
                    alt="Truck being washed"
                    className="h-full w-full object-cover"
                />
                <div className="absolute bottom-8 left-8 right-8 text-white z-10">
                    <h2 className="text-3xl font-bold mb-2">Professional Fleet Cleaning</h2>
                    <p className="text-lg opacity-90">
                        Keep your fleet compliant and looking its best with our nationwide network of truck wash locations.
                    </p>
                </div>
            </div>
        </div>
    );
}
