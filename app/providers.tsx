"use client";

import { ReactNode, useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/constants";
import { MCPProvider } from "@/lib/context/mcp-context";
import { MCPUIProvider } from "@/lib/context/mcp-ui-context";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
    },
  },
});

// Hydration-safe sidebar wrapper
function HydrationSafeSidebarProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useLocalStorage<boolean>(
    STORAGE_KEYS.SIDEBAR_STATE,
    true
  );
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // During SSR and initial render, use default values to prevent hydration mismatch
  if (!isHydrated) {
    return (
      <SidebarProvider defaultOpen={true}>
        {children}
      </SidebarProvider>
    );
  }

  // After hydration, use the actual localStorage values
  return (
    <SidebarProvider defaultOpen={sidebarOpen} open={sidebarOpen} onOpenChange={setSidebarOpen}>
      {children}
    </SidebarProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem={true}
        disableTransitionOnChange
        themes={["light", "dark", "sunset", "black"]}
      >
        <MCPProvider>
          <MCPUIProvider>
            <HydrationSafeSidebarProvider>
              {children}
              <Toaster position="top-center" richColors />
            </HydrationSafeSidebarProvider>
          </MCPUIProvider>
        </MCPProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
} 