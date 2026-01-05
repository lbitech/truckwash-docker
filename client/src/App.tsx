import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import WashEntry from "@/pages/wash-entry";
import WashRecords from "@/pages/wash-records";
import Manage from "@/pages/manage";
import WashEdit from "@/pages/wash-edit";
import WashListManage from "@/pages/wash-list-manage";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth-page";
import Users from "@/pages/users";
import Permissions from "@/pages/permissions";
import Locations from "@/pages/locations";
import Companies from "@/pages/companies";
import { LogOut, Menu, Droplets, ShieldAlert, Shield } from "lucide-react";
import { useState, useMemo } from "react";
import { type PagePermission, SYSTEM_PAGES } from "@shared/schema";

function Navigation({ canAccess }: { canAccess: (route: string) => boolean }) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  const handleLogout = () => {
    logoutMutation.mutate();
    // window.location.href = "/api/logout"; // Moved to mutation
  };

  const NavLink = ({ href, children, testId }: { href: string; children: React.ReactNode; testId: string }) => (
    <Link href={href}>
      <span
        className={`px-4 py-2 rounded-md font-medium transition-colors hover-elevate cursor-pointer block ${isActive(href)
          ? "bg-primary text-primary-foreground"
          : "text-foreground"
          }`}
        data-testid={testId}
        onClick={() => setMobileMenuOpen(false)}
      >
        {children}
      </span>
    </Link>
  );

  return (
    <header className="border-b bg-background">
      <div className="flex items-center justify-between h-16 px-4 md:px-8 gap-4">
        <div className="flex items-center gap-2">
          <Droplets className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">UK Truck Clean</h1>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <nav className="flex gap-2">
            {canAccess("/") && <NavLink href="/" testId="link-wash-entry">Record Wash</NavLink>}
            {canAccess("/records") && <NavLink href="/records" testId="link-wash-records">Wash Records</NavLink>}
            {canAccess("/manage-wash") && <NavLink href="/manage-wash" testId="link-wash-list-manage">Manage Wash</NavLink>}
            {canAccess("/manage") && <NavLink href="/manage" testId="link-manage">Manage Fleet</NavLink>}
            {canAccess("/companies") && <NavLink href="/companies" testId="link-companies">Manage Companies</NavLink>}
            {canAccess("/wash-edit") && <NavLink href="/wash-edit" testId="link-wash-edit">Wash Edit</NavLink>}
            {canAccess("/locations") && <NavLink href="/locations" testId="link-locations">Locations</NavLink>}
            {canAccess("/users") && <NavLink href="/users" testId="link-users">Users</NavLink>}
            {canAccess("/permissions") && <NavLink href="/permissions" testId="link-permissions">Page Permissions</NavLink>}
          </nav>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-muted-foreground hidden lg:inline" data-testid="text-user-email">
                {user.email}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            data-testid="button-logout-mobile"
          >
            <LogOut className="h-4 w-4" />
          </Button>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-6">
                {canAccess("/") && <NavLink href="/" testId="link-wash-entry-mobile">Record Wash</NavLink>}
                {canAccess("/records") && <NavLink href="/records" testId="link-wash-records-mobile">Wash Records</NavLink>}
                {canAccess("/manage-wash") && <NavLink href="/manage-wash" testId="link-wash-list-manage-mobile">Manage Wash</NavLink>}
                {canAccess("/manage") && <NavLink href="/manage" testId="link-manage-mobile">Manage Fleet</NavLink>}
                {canAccess("/companies") && <NavLink href="/companies" testId="link-companies-mobile">Manage Companies</NavLink>}
                {canAccess("/wash-edit") && <NavLink href="/wash-edit" testId="link-wash-edit-mobile">Wash Edit</NavLink>}
                {canAccess("/locations") && <NavLink href="/locations" testId="link-locations-mobile">Locations</NavLink>}
                {canAccess("/users") && <NavLink href="/users" testId="link-users-mobile">Users</NavLink>}
                {canAccess("/permissions") && <NavLink href="/permissions" testId="link-permissions-mobile">Page Permissions</NavLink>}
              </nav>
              {user && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground" data-testid="text-user-email-mobile">
                    {user.email}
                  </p>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function Router({ canAccess }: { canAccess: (route: string) => boolean }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/" component={Landing} />
        <Route>
          <AuthPage />
        </Route>
      </Switch>
    )
  }

  // Check access for current location
  const isAllowed = canAccess(location);

  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          You do not have permission to view this page. Please contact your administrator if you believe this is an error.
        </p>
        <Link href="/">
          <Button variant="outline">Return to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={WashEntry} />
      <Route path="/records" component={WashRecords} />
      <Route path="/manage-wash" component={WashListManage} />
      <Route path="/manage" component={Manage} />
      <Route path="/companies" component={Companies} />
      <Route path="/wash-edit" component={WashEdit} />
      <Route path="/locations" component={Locations} />
      <Route path="/users" component={Users} />
      <Route path="/permissions" component={Permissions} />
      <Route path="/auth">
        <WashEntry />
      </Route>
      <Route>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The page you're looking for doesn't exist.
            </p>
            <Link href="/">
              <a className="text-primary hover:underline">Go to Record Wash</a>
            </Link>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: permissions = [] } = useQuery<PagePermission[]>({
    queryKey: ["/api/permissions"],
    enabled: isAuthenticated,
  });

  const canAccess = useMemo(() => {
    return (route: string) => {
      if (!user) return false;

      const perm = permissions.find((p: PagePermission) => p.role === user.role && p.pageRoute === route);
      if (perm) return perm.isAllowed === 1;

      // Default logic if no permission record yet
      if (user.role === "superAdmin" || user.role === "admin") return true;

      // Default allowed for wash operatives: just record wash
      if (user.role === "washOperative") return route === "/";

      return false;
    };
  }, [user, permissions]);

  return (
    <div className="min-h-screen bg-background">
      {!isLoading && isAuthenticated && <Navigation canAccess={canAccess} />}
      <Router canAccess={canAccess} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
