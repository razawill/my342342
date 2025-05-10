import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import GamePage from "@/pages/GamePage";
import HistoryPage from "@/pages/HistoryPage";
import WalletPage from "@/pages/WalletPage";
import SettingsPage from "@/pages/SettingsPage";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import { WebSocketProvider } from "@/hooks/useWebSocket";
import { GameStateProvider } from "@/hooks/useGameState";

function Router() {
  return (
    <Switch>
      <Route path="/" component={GamePage} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/wallet" component={WalletPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        <GameStateProvider>
          <TooltipProvider>
            <div className="min-h-screen flex flex-col bg-dark">
              <Header />
              <div className="flex-1 overflow-auto pb-16">
                <Router />
              </div>
              <Navigation />
              <Toaster />
            </div>
          </TooltipProvider>
        </GameStateProvider>
      </WebSocketProvider>
    </QueryClientProvider>
  );
}

export default App;
