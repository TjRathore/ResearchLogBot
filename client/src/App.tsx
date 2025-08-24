import { Switch, Route } from "wouter";
// import { queryClient } from "./lib/queryClient"; // Temporarily disabled
// import { QueryClientProvider } from "@tanstack/react-query"; // Temporarily disabled
// import { Toaster } from "@/components/ui/toaster"; // Temporarily disabled
// import { TooltipProvider } from "@/components/ui/tooltip"; // Temporarily disabled due to React hook error
import Sidebar from "@/components/sidebar";
import Dashboard from "@/pages/simple-dashboard";
// import KnowledgePairsNew from "@/pages/knowledge-pairs-new";
// import QualityDashboard from "@/pages/quality-dashboard";
import Messages from "@/pages/messages";
import Search from "@/pages/search";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/messages" component={Messages} />
      <Route path="/search" component={Search} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar />
      <Router />
    </div>
  );
}

export default App;
