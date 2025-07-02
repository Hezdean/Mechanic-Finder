import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import Home from "@/pages/home";
import Login from "@/pages/auth/login";
import DirectLogin from "@/pages/auth/direct-login";
import SimpleLogin from "@/pages/auth/simple-login";
import QuickLogin from "@/pages/quick-login";
import TestLogin from "@/pages/test-login";
import Register from "@/pages/auth/register";
import AdminDashboard from "@/pages/dashboard/admin";
import MechanicDashboard from "@/pages/dashboard/mechanic";
import UserDashboard from "@/pages/dashboard/user";
import UserManagement from "@/pages/admin/users";
import SystemAnalytics from "@/pages/admin/analytics";
import JobManagement from "@/pages/admin/jobs";
import SchedulingPage from "@/pages/scheduling/index";
import Jobs from "@/pages/jobs/index";
import PostJob from "@/pages/jobs/post";
import JobDetails from "@/pages/jobs/[id]";
import Mechanics from "@/pages/mechanics/index";
import MechanicProfile from "@/pages/mechanics/[id]";
import Messages from "@/pages/messages/index";
import TransactionHistory from "@/pages/transaction-history";
import VerificationPage from "@/pages/verification";
import DiagnosticsPage from "@/pages/diagnostics";
import EmergencyPage from "@/pages/emergency";
import BookingPage from "@/pages/booking";
import ServiceHistoryPage from "@/pages/service-history";
import Marketplace from "@/pages/marketplace/index";
import PartDetail from "@/pages/marketplace/part-detail";
import VendorProfile from "@/pages/marketplace/vendor-profile";
import Cart from "@/pages/marketplace/cart";
import Orders from "@/pages/marketplace/orders";
import VendorDashboard from "@/pages/vendor/dashboard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DashboardPage from "@/pages/dashboard";
import FloatingActionMenu from "@/components/ui/FloatingActionMenu";

function Router() {
  return (
    <>
      <Header />
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/login" component={Login} />
        <Route path="/direct-login" component={DirectLogin} />
        <Route path="/simple-login" component={SimpleLogin} />
        <Route path="/quick-login" component={QuickLogin} />
        <Route path="/test-login" component={TestLogin} />
        <Route path="/register" component={Register} />
        <Route path="/dashboard/admin" component={AdminDashboard} />
        <Route path="/dashboard/mechanic" component={MechanicDashboard} />
        <Route path="/dashboard/user" component={UserDashboard} />
        <Route path="/admin/users" component={UserManagement} />
        <Route path="/admin/analytics" component={SystemAnalytics} />
        <Route path="/admin/jobs" component={JobManagement} />
        <Route path="/scheduling" component={SchedulingPage} />
        <Route path="/home" component={Home} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/jobs/post" component={PostJob} />
        <Route path="/jobs/:id" component={JobDetails} />
        <Route path="/mechanics" component={Mechanics} />
        <Route path="/mechanics/:id" component={MechanicProfile} />
        <Route path="/messages" component={Messages} />
        <Route path="/transactions" component={TransactionHistory} />
        <Route path="/verification" component={VerificationPage} />
        <Route path="/diagnostics" component={DiagnosticsPage} />
        <Route path="/emergency" component={EmergencyPage} />
        <Route path="/booking" component={BookingPage} />
        <Route path="/service-history" component={ServiceHistoryPage} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/marketplace/part/:id" component={PartDetail} />
        <Route path="/marketplace/vendor/:id" component={VendorProfile} />
        <Route path="/marketplace/cart" component={Cart} />
        <Route path="/marketplace/orders" component={Orders} />
        <Route path="/vendor/dashboard" component={VendorDashboard} />
        <Route component={NotFound} />
      </Switch>
      <FloatingActionMenu />
      <Footer />
    </>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="mechanic-finder-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
