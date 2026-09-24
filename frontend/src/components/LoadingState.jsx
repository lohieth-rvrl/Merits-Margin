import { useEffect, useState } from "react";

// Render's free tier puts the backend to sleep after inactivity, so the
// very first request after a while can take 30-60+ seconds to wake it back
// up. A bare spinner makes that feel broken; this explains what's actually
// happening once it's taking a while.
export default function LoadingState() {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center">
      <div className="lr-spinner mb-3" />
      {showHint && (
        <p className="text-secondary small" style={{ maxWidth: 320 }}>
          Waking up the server — if this is the first visit in a while, it can
          take up to a minute on a free hosting tier.
        </p>
      )}
    </div>
  );
}
