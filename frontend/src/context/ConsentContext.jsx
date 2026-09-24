import { createContext, useContext, useEffect, useState } from "react";

const ConsentContext = createContext(null);
const STORAGE_KEY = "lr-cookie-consent"; // "accepted" | "rejected"

export function ConsentProvider({ children }) {
  const [consent, setConsent] = useState(() => localStorage.getItem(STORAGE_KEY));

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setConsent("accepted");
  }

  function reject() {
    localStorage.setItem(STORAGE_KEY, "rejected");
    setConsent("rejected");
  }

  return (
    <ConsentContext.Provider value={{ consent, accept, reject, decided: consent !== null }}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  return useContext(ConsentContext);
}

// Loads Google's AdSense account script exactly once, and only once the
// visitor has actually accepted non-essential cookies. Renders nothing.
export function AdSenseLoader() {
  const { consent } = useConsent();
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (consent !== "accepted" || !clientId) return;
    if (document.querySelector('script[data-adsense-loader="true"]')) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.crossOrigin = "anonymous";
    script.dataset.adsenseLoader = "true";
    document.head.appendChild(script);
  }, [consent, clientId]);

  return null;
}
