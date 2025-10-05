import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Transcripts from "./pages/Transcripts";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Calls from "./pages/Calls";
import Assistants from "./pages/Assistants";
import PhoneNumbers from "./pages/PhoneNumbers";
import Records from "./pages/Appointments";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/transcripts" element={
              <ProtectedRoute>
                <Transcripts />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/calls" element={
              <ProtectedRoute>
                <Calls />
              </ProtectedRoute>
            } />
            <Route path="/assistants" element={
              <ProtectedRoute>
                <Assistants />
              </ProtectedRoute>
            } />
            <Route path="/phone-numbers" element={
              <ProtectedRoute>
                <PhoneNumbers />
              </ProtectedRoute>
            } />
            <Route path="/records" element={
              <ProtectedRoute>
                <Records />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
