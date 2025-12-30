import { useMemo, useEffect, useState } from "react";

interface ShopifyAppBridgeProviderProps {
  children: React.ReactNode;
}

function getShopifyParams() {
  if (typeof window === 'undefined') return null;
  
  const params = new URLSearchParams(window.location.search);
  const shop = params.get('shop');
  const host = params.get('host');
  const embedded = params.get('embedded') === 'true';
  
  if (!shop) return null;
  
  return { shop, host, embedded };
}

export function useShopifyEmbedded() {
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [shop, setShop] = useState<string | null>(null);
  
  useEffect(() => {
    const params = getShopifyParams();
    if (params?.embedded) {
      setIsEmbedded(true);
      setShop(params.shop);
    }
  }, []);
  
  return { isEmbedded, shop };
}

export function ShopifyAppBridgeProvider({ children }: ShopifyAppBridgeProviderProps) {
  const shopifyParams = useMemo(() => getShopifyParams(), []);
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    if (!shopifyParams?.embedded || !shopifyParams.shop) {
      return;
    }
    
    const apiKey = import.meta.env.VITE_SHOPIFY_API_KEY;
    
    if (!apiKey) {
      console.warn("VITE_SHOPIFY_API_KEY not set, App Bridge disabled");
      return;
    }
    
    if (document.querySelector('script[src*="app-bridge.js"]')) {
      setInitialized(true);
      return;
    }
    
    const meta = document.createElement('meta');
    meta.name = 'shopify-api-key';
    meta.content = apiKey;
    document.head.appendChild(meta);
    
    const script = document.createElement('script');
    script.src = 'https://cdn.shopify.com/shopifycloud/app-bridge.js';
    script.async = true;
    script.onload = () => {
      console.log("Shopify App Bridge script loaded");
      setInitialized(true);
    };
    document.head.appendChild(script);
    
    return () => {
    };
  }, [shopifyParams]);
  
  return <>{children}</>;
}

export function ShopifyEmbeddedWrapper({ children }: { children: React.ReactNode }) {
  const { isEmbedded } = useShopifyEmbedded();
  
  useEffect(() => {
    if (isEmbedded && typeof window !== 'undefined' && (window as any).shopify) {
      console.log("Shopify App Bridge available via window.shopify");
    }
  }, [isEmbedded]);
  
  return <>{children}</>;
}

export default ShopifyAppBridgeProvider;
