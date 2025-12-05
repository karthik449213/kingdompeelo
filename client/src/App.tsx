import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

// Lazy load route components for code-splitting
const Menu = lazy(() => import("@/pages/Menu"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Invoice = lazy(() => import("@/pages/Invoice"));
const About = lazy(() => import("@/pages/About"));
const VisitUs = lazy(() => import("@/pages/VisitUs"));
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminLogin = lazy(() => import("@/pages/admin/Login"));
const AdminMenuManagement = lazy(() => import("@/pages/admin/MenuManagement"));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/menu">
        {() => (
          <Suspense fallback={<LoadingFallback />}>
            <Menu />
          </Suspense>
        )}
      </Route>
      <Route path="/about">
        {() => (
          <Suspense fallback={<LoadingFallback />}>
            <About />
          </Suspense>
        )}
      </Route>
      <Route path="/visit-us">
        {() => (
          <Suspense fallback={<LoadingFallback />}>
            <VisitUs />
          </Suspense>
        )}
      </Route>
      <Route path="/checkout">
        {() => (
          <Suspense fallback={<LoadingFallback />}>
            <Checkout />
          </Suspense>
        )}
      </Route>
      <Route path="/invoice">
        {() => (
          <Suspense fallback={<LoadingFallback />}>
            <Invoice />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/login">
        {() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminLogin />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/dashboard">
        {() => (
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        )}
      </Route>
      <Route path="/admin/menu">
        {() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminMenuManagement />
          </Suspense>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ScrollToTop />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
