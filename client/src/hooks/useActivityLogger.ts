import { useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface LogActivityData {
  action: string;
  description: string;
}

export function useActivityLogger() {
  // Track already logged page views to prevent duplicates
  const loggedPages = useRef<Set<string>>(new Set());
  
  const logActivityMutation = useMutation({
    mutationFn: async (data: LogActivityData) => {
      return await apiRequest("POST", "/api/log-activity", data);
    },
    onError: (error) => {
      console.warn("Failed to log activity:", error);
    },
  });

  const logActivity = useCallback((action: string, description: string) => {
    logActivityMutation.mutate({ action, description });
  }, []);

  const logLogin = useCallback(() => logActivity("LOGIN", "User logged in"), [logActivity]);
  const logLogout = useCallback(() => logActivity("LOGOUT", "User logged out"), [logActivity]);
  
  // logPageView now prevents duplicate calls for the same page
  const logPageView = useCallback((page: string) => {
    if (loggedPages.current.has(page)) return;
    loggedPages.current.add(page);
    logActivity("PAGE_VIEW", `Visited ${page} page`);
  }, [logActivity]);
  
  const logQuoteGeneration = useCallback((quoteNumber: string, customerName?: string) => 
    logActivity("QUOTE_GENERATED", `Generated quote ${quoteNumber}${customerName ? ` for ${customerName}` : ''}`),
    [logActivity]);
  
  const logQuoteEmail = useCallback((quoteNumber: string, customerEmail?: string) =>
    logActivity("QUOTE_EMAILED", `Emailed quote ${quoteNumber}${customerEmail ? ` to ${customerEmail}` : ''}`),
    [logActivity]);
  
  const logQuoteDownload = useCallback((quoteNumber: string, format: string = 'PDF') =>
    logActivity("QUOTE_DOWNLOADED", `Downloaded quote ${quoteNumber} as ${format}`),
    [logActivity]);
  
  const logPriceListGenerated = useCallback((category?: string, customer?: string) =>
    logActivity("PRICE_LIST_GENERATED", `Generated price list${category ? ` for ${category}` : ''}${customer ? ` for ${customer}` : ''}`),
    [logActivity]);
  
  const logPriceListDownload = useCallback((format: string = 'PDF', category?: string) =>
    logActivity("PRICE_LIST_DOWNLOADED", `Downloaded price list as ${format}${category ? ` for ${category}` : ''}`),
    [logActivity]);
  
  const logDataUpload = useCallback((fileType: string, recordCount?: number) =>
    logActivity("DATA_UPLOAD", `Uploaded ${fileType} data${recordCount ? ` (${recordCount} records)` : ''}`),
    [logActivity]);
  
  const logDataExport = useCallback((dataType: string, format: string = 'CSV') =>
    logActivity("DATA_EXPORT", `Exported ${dataType} data as ${format}`),
    [logActivity]);
  
  const logUserAction = useCallback((action: string, target?: string) =>
    logActivity("USER_ACTION", `${action}${target ? ` ${target}` : ''}`),
    [logActivity]);
  
  const logSystemAction = useCallback((action: string, details?: string) =>
    logActivity("SYSTEM_ACTION", `${action}${details ? `: ${details}` : ''}`),
    [logActivity]);
  
  const logError = useCallback((error: string, context?: string) =>
    logActivity("ERROR", `${error}${context ? ` in ${context}` : ''}`),
    [logActivity]);

  return {
    logActivity,
    logLogin,
    logLogout,
    logPageView,
    logQuoteGeneration,
    logQuoteEmail,
    logQuoteDownload,
    logPriceListGenerated,
    logPriceListDownload,
    logDataUpload,
    logDataExport,
    logUserAction,
    logSystemAction,
    logError,
    isLogging: logActivityMutation.isPending
  };
}
