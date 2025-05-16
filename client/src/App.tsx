import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import Home from "@/pages/home";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import AdminDashboard from "@/pages/dashboard/admin";
import MechanicDashboard from "@/pages/dashboard/mechanic";
import UserDashboard from "@/pages/dashboard/user";
import Jobs from "@/pages/jobs/index";
import PostJob from "@/pages/jobs/post";
import JobDetails from "@/pages/jobs/[id]";
import Mechanics from "@/pages/mechanics/index";
import MechanicProfile from "@/pages/mechanics/[id]";
import Messages from "@/pages/messages/index";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

function Router() {
  return (
    <>
      <Header />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/dashboard/admin" component={AdminDashboard} />
        <Route path="/dashboard/mechanic" component={MechanicDashboard} />
        <Route path="/dashboard/user" component={UserDashboard} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/jobs/post" component={PostJob} />
        <Route path="/jobs/:id" component={JobDetails} />
        <Route path="/mechanics" component={Mechanics} />
        <Route path="/mechanics/:id" component={MechanicProfile} />
        <Route path="/messages" component={Messages} />
        <Route component={NotFound} />
      </Switch>
      <Footer />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
