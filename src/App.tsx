import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";

// Lazy-load non-initial routes to reduce the initial JS bundle and improve LCP
const JogoDoDia = lazy(() => import("./pages/JogoDoDia"));
const ComoJogar = lazy(() => import("./pages/ComoJogar"));
const ConstruaSeuJogo = lazy(() => import("./pages/ConstruaSeuJogo"));
const HistoricoResultados = lazy(() => import("./pages/HistoricoResultados"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Defer AdMob to avoid pulling Capacitor SDK into the initial bundle.
// Only loads on native platforms; harmless no-op on web.
if (typeof window !== "undefined") {
  const initAdMob = () =>
    import("@capacitor-community/admob")
      .then(({ AdMob }) => AdMob.initialize())
      .catch(() => console.warn("AdMob init falhou, mas o app segue."));

  if ("requestIdleCallback" in window) {
    (window as Window & typeof globalThis).requestIdleCallback(initAdMob);
  } else {
    setTimeout(initAdMob, 2000);
  }
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/jogo-do-dia" element={<JogoDoDia />} />
            <Route path="/como-jogar" element={<ComoJogar />} />
            <Route path="/construa-seu-jogo" element={<ConstruaSeuJogo />} />
            <Route path="/desempenho" element={<HistoricoResultados />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
