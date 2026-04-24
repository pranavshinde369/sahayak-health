import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Triage from "./pages/Triage.tsx";
import Pratibimb from "./pages/Pratibimb.tsx";
import Patients from "./pages/Patients.tsx";
import PatientDetail from "./pages/PatientDetail.tsx";
import Referral from "./pages/Referral.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Nadi from "./pages/Nadi.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/triage" element={<PageTransition><Triage /></PageTransition>} />
        <Route path="/pratibimb" element={<PageTransition><Pratibimb /></PageTransition>} />
        <Route path="/patients" element={<PageTransition><Patients /></PageTransition>} />
        <Route path="/patients/:id" element={<PageTransition><PatientDetail /></PageTransition>} />
        <Route path="/patients/:id/referral" element={<PageTransition><Referral /></PageTransition>} />
        <Route path="/referral" element={<PageTransition><Referral /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/nadi" element={<PageTransition><Nadi /></PageTransition>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
