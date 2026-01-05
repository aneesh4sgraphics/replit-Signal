import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";

interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: "admin" | "user" | "manager";
  status: "approved" | "pending" | "rejected";
  loginCount?: number;
  lastLoginDate?: string;
}

async function fetchAuthUser(): Promise<AuthUser | null> {
  const res = await fetch("/api/auth/user", {
    credentials: "include",
    headers: {
      "Accept": "application/json",
    },
  });

  if (res.status === 401) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Auth check failed: ${res.status}`);
  }

  return res.json();
}

async function pingSession(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/ping", {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function useAuth() {
  const [isInitializing, setIsInitializing] = useState(true);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const queryClient = useQueryClient();

  const wasJustAuthenticated = typeof window !== "undefined" && 
    sessionStorage.getItem("authComplete") === "true";

  const { data: user, isLoading, error, refetch } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchAuthUser,
    retry: wasJustAuthenticated ? 3 : 1,
    retryDelay: (attemptIndex) => Math.min(1000 * (attemptIndex + 1), 3000),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (user && !keepAliveRef.current) {
      keepAliveRef.current = setInterval(async () => {
        const success = await pingSession();
        if (!success) {
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        }
      }, 4 * 60 * 1000);
    }

    return () => {
      if (keepAliveRef.current) {
        clearInterval(keepAliveRef.current);
        keepAliveRef.current = null;
      }
    };
  }, [user, queryClient]);

  useEffect(() => {
    if (wasJustAuthenticated) {
      sessionStorage.removeItem("authComplete");
      
      const timer = setTimeout(() => {
        refetch();
      }, 500);
      
      // Remove authTimestamp after 10 seconds (allowing grace period to work for all queries)
      const cleanupTimer = setTimeout(() => {
        sessionStorage.removeItem("authTimestamp");
      }, 10000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(cleanupTimer);
      };
    }
  }, [wasJustAuthenticated, refetch]);

  useEffect(() => {
    if (!isLoading) {
      setIsInitializing(false);
    }
  }, [isLoading]);

  const isAuthenticated = !!user && !error;
  const isApproved = isAuthenticated && user?.status === "approved";
  const isAdmin = isAuthenticated && user?.role === "admin";

  return {
    user,
    isLoading: isLoading || isInitializing,
    isAuthenticated,
    isApproved,
    isAdmin,
    error,
    refetch,
  };
}
