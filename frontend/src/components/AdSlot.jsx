export default function AdSlot({ label = "Ad slot", height = 100 }) {
  return (
    <div
      className="lr-ad-slot d-flex align-items-center justify-content-center small my-4"
      style={{ minHeight: height }}
    >
      {/* AdSense slot -- replace this div's contents with your <ins class="adsbygoogle"> unit */}
      {label}
    </div>
  );
}
