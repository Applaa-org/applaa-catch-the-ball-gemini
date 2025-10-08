import * as React from 'react'
import { 
  createRouter, 
  RouterProvider, 
  createRootRoute, 
  createRoute as createTanStackRoute, 
  Outlet 
} from '@tanstack/react-router'
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Game from "./pages/Game"; // Renamed from Index
import NotFound from "./pages/NotFound"; // Import NotFound page

const queryClient = new QueryClient();

// Create root route
const rootRoute = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Outlet /> {/* Outlet for nested routes */}
      </TooltipProvider>
    </QueryClientProvider>
  ),
  notFoundComponent: NotFound, // Add NotFound component to root route
})

// Create game route
const gameRoute = createTanStackRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Game,
})

// Create route tree
const routeTree = rootRoute.addChildren([gameRoute])

// Create router with proper TypeScript configuration
const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent' as const,
  defaultPreloadStaleTime: 0,
})

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const App = () => <RouterProvider router={router} />

export default App;