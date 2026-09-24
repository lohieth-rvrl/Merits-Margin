import { useEffect, useRef } from "react";
import { useConsent } from "../context/ConsentContext";

export default function AdSlot({ label = "Ad slot", height = 100, slotId = null }) {
  const { consent } = useConsent();
  const insRef = useRef(null);
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
  const canShowRealAd = consent === "accepted" && clientId && slotId;

  useEffect(() => {
    if (!canShowRealAd) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense script may not have finished loading yet -- harmless, the
      // slot just stays empty rather than throwing.
    }
  }, [canShowRealAd]);

  if (canShowRealAd) {
    return (
      <ins
        ref={insRef}
        className="adsbygoogle d-block my-4"
        style={{ minHeight: height }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    );
  }

  return (
    <div
      className="lr-ad-slot d-flex align-items-center justify-content-center small my-4"
      style={{ minHeight: height }}
    >
      {/* Once you have real AdSense slot IDs, pass slotId="..." to this
          component and it'll automatically switch to a live ad unit
          (only after the visitor has accepted cookies). */}
      {label}
    </div>
  );
}
