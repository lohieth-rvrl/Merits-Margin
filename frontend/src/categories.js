export const CATEGORIES = {
  finance: {
    label: "Finance",
    badgeClass: "badge-finance",
    color: "#5C7A5A",
    colorSoft: "#E7EFE6",
    icon: "coin",
  },
  career: {
    label: "Careers",
    badgeClass: "badge-career",
    color: "#B9822A",
    colorSoft: "#F7ECD6",
    icon: "briefcase",
  },
  news: {
    label: "Money News",
    badgeClass: "badge-news",
    color: "#B5502F",
    colorSoft: "#F5E1D8",
    icon: "compass",
  },
};

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
