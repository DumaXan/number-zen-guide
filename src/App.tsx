import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import JogoDoDia from "./pages/JogoDoDia";
import ComoJogar from "./pages/ComoJogar";
import ConstruaSeuJogo from "./pages/ConstruaSeuJogo";
import SimularConcurso from "./pages/SimularConcurso";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/jogo-do-dia" element={<JogoDoDia />} />
          <Route path="/como-jogar" element={<ComoJogar />} />
          <Route path="/construa-seu-jogo" element={<ConstruaSeuJogo />} />
          <Route path="/simular-concurso" element={<SimularConcurso />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
