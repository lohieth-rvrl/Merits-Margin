export function statusBadgeClass(status) {
  if (status === "draft") return "bg-secondary";
  if (status === "scheduled") return "bg-warning text-dark";
  return "bg-dark";
}

export function statusLabel(status, scheduledFor) {
  if (status === "draft") return "Draft";
  if (status === "scheduled") {
    if (!scheduledFor) return "Scheduled";
    const d = new Date(scheduledFor);
    return `Scheduled · ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  }
  return "Published";
}
