import { useConsent } from "../context/ConsentContext";

export default function CookieConsent() {
  const { decided, accept, reject } = useConsent();

  if (decided) return null;

  return (
    <div
      className="position-fixed bottom-0 start-0 end-0 p-3 p-md-4"
      style={{ zIndex: 1040 }}
    >
      <div
        className="lr-card p-3 p-md-4 mx-auto d-flex flex-column flex-md-row align-items-md-center gap-3 justify-content-between"
        style={{ maxWidth: 780, background: "white" }}
      >
        <p className="mb-0 small">
          We use cookies for essential site function, and — only if you accept — to show
          personalized ads via Google AdSense. See our{" "}
          <a href="/privacy">Privacy Policy</a> for details.
        </p>
        <div className="d-flex gap-2 flex-shrink-0">
          <button className="btn btn-sm btn-warm-outline" onClick={reject}>
            Necessary only
          </button>
          <button className="btn btn-sm btn-warm" onClick={accept}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
