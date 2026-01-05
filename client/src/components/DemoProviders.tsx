import { createContext, useContext, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DEMO_API_RESPONSES, DEMO_USER } from "@/lib/demoData";
import { useToast } from "@/hooks/use-toast";

interface DemoContextType {
  isDemo: boolean;
  demoUser: typeof DEMO_USER;
}

const DemoContext = createContext<DemoContextType>({
  isDemo: false,
  demoUser: DEMO_USER
});

export const useDemo = () => useContext(DemoContext);

const demoQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
      queryFn: async ({ queryKey }) => {
        const endpoint = queryKey[0] as string;
        
        if (DEMO_API_RESPONSES[endpoint] !== undefined) {
          return DEMO_API_RESPONSES[endpoint];
        }
        
        if (endpoint.startsWith("/api/customers/") && endpoint.includes("/")) {
          const customerId = endpoint.split("/").pop();
          const customer = DEMO_API_RESPONSES["/api/customers"]?.find(
            (c: any) => c.id === customerId
          );
          if (customer) return customer;
        }
        
        console.log("[Demo Mode] Unhandled endpoint:", endpoint);
        return null;
      }
    },
    mutations: {
      retry: false
    }
  }
});

interface DemoAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: typeof DEMO_USER | null;
  login: () => void;
  logout: () => void;
}

const DemoAuthContext = createContext<DemoAuthContextType>({
  isAuthenticated: true,
  isLoading: false,
  user: DEMO_USER,
  login: () => {},
  logout: () => {}
});

export const useDemoAuth = () => useContext(DemoAuthContext);

function DemoToastInterceptor({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function DemoProviders({ children }: { children: ReactNode }) {
  const authValue: DemoAuthContextType = {
    isAuthenticated: true,
    isLoading: false,
    user: DEMO_USER,
    login: () => {
      window.location.href = "/api/login";
    },
    logout: () => {
      window.location.href = "/";
    }
  };

  const demoValue: DemoContextType = {
    isDemo: true,
    demoUser: DEMO_USER
  };

  return (
    <DemoContext.Provider value={demoValue}>
      <DemoAuthContext.Provider value={authValue}>
        <QueryClientProvider client={demoQueryClient}>
          <DemoToastInterceptor>
            {children}
          </DemoToastInterceptor>
        </QueryClientProvider>
      </DemoAuthContext.Provider>
    </DemoContext.Provider>
  );
}

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
