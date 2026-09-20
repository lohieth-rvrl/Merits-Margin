import { CATEGORIES } from "../categories";

const ICONS = {
  coin: (
    <>
      <circle cx="100" cy="90" r="46" fill="currentColor" opacity="0.18" />
      <circle cx="100" cy="90" r="46" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M100 68v44M86 78c0-6 6-10 14-10s14 4 14 9-6 9-14 9-14 4-14 9 6 9 14 9 14-4 14-10"
        fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="150" cy="130" r="20" fill="currentColor" opacity="0.14" />
      <circle cx="52" cy="132" r="14" fill="currentColor" opacity="0.14" />
    </>
  ),
  briefcase: (
    <>
      <rect x="58" y="86" width="84" height="58" rx="8" fill="currentColor" opacity="0.16" />
      <rect x="58" y="86" width="84" height="58" rx="8" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M82 86v-10a10 10 0 0 1 10-10h16a10 10 0 0 1 10 10v10"
        fill="none" stroke="currentColor" strokeWidth="4" />
      <line x1="58" y1="112" x2="142" y2="112" stroke="currentColor" strokeWidth="4" />
      <circle cx="152" cy="60" r="16" fill="currentColor" opacity="0.14" />
      <circle cx="46" cy="150" r="12" fill="currentColor" opacity="0.14" />
    </>
  ),
  compass: (
    <>
      <circle cx="100" cy="100" r="48" fill="currentColor" opacity="0.16" />
      <circle cx="100" cy="100" r="48" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M118 82l-12 30-30 12 12-30z" fill="currentColor" opacity="0.7" />
      <circle cx="100" cy="100" r="4" fill="currentColor" />
      <circle cx="150" cy="60" r="14" fill="currentColor" opacity="0.14" />
      <circle cx="52" cy="145" r="18" fill="currentColor" opacity="0.14" />
    </>
  ),
};

export default function CoverImage({ src, category, alt = "", className = "", style = {} }) {
  if (src) {
    return <img src={src} alt={alt} className={className} style={{ objectFit: "cover", ...style }} />;
  }

  const meta = CATEGORIES[category] || CATEGORIES.finance;

  return (
    <div
      className={`lr-cover-placeholder ${className}`}
      style={{ background: meta.colorSoft, color: meta.color, ...style }}
    >
      <svg viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-label={alt || meta.label}>
        {ICONS[meta.icon]}
      </svg>
    </div>
  );
}
