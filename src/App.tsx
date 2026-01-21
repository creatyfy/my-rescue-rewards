import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Store from "./pages/Store";
import Scan from "./pages/Scan";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import ProfileNotifications from "./pages/ProfileNotifications";
import ProfileSecurity from "./pages/ProfileSecurity";
import ProfilePayments from "./pages/ProfilePayments";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Help from "./pages/Help";
import Settings from "./pages/Settings";
import AuthGuard from "./components/auth/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            }
          />
          <Route
            path="/admin"
            element={
              <AuthGuard>
                <Admin />
              </AuthGuard>
            }
          />
          <Route
            path="/store"
            element={
              <AuthGuard>
                <Store />
              </AuthGuard>
            }
          />
          <Route
            path="/scan"
            element={
              <AuthGuard>
                <Scan />
              </AuthGuard>
            }
          />
          <Route
            path="/profile"
            element={
              <AuthGuard>
                <Profile />
              </AuthGuard>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <AuthGuard>
                <ProfileEdit />
              </AuthGuard>
            }
          />
          <Route
            path="/profile/notifications"
            element={
              <AuthGuard>
                <ProfileNotifications />
              </AuthGuard>
            }
          />
          <Route
            path="/profile/security"
            element={
              <AuthGuard>
                <ProfileSecurity />
              </AuthGuard>
            }
          />
          <Route
            path="/profile/payments"
            element={
              <AuthGuard>
                <ProfilePayments />
              </AuthGuard>
            }
          />
          <Route
            path="/history"
            element={
              <AuthGuard>
                <History />
              </AuthGuard>
            }
          />
          <Route
            path="/help"
            element={
              <AuthGuard>
                <Help />
              </AuthGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthGuard>
                <Settings />
              </AuthGuard>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
