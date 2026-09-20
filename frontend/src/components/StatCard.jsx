import { useCountUp } from "../hooks/useCountUp";

export default function StatCard({ label, value, accent = "var(--rust)", suffix = "" }) {
  const animated = useCountUp(value);
  return (
    <div className="lr-card p-3 p-md-4 h-100">
      <div className="text-secondary small fw-semibold text-uppercase mb-1">{label}</div>
      <div className="display-6 fw-bold" style={{ color: accent, fontFamily: "var(--font-display)" }}>
        {animated.toLocaleString()}
        {suffix}
      </div>
    </div>
  );
}
