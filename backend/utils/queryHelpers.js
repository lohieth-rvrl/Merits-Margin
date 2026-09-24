// Shared visibility rule: an article is visible to the public if it's
// published, OR if it's scheduled and its scheduled time has already passed.
// Centralized here so every route that needs this check stays consistent.
function visibleStatusOr() {
  return {
    $or: [
      { status: "published" },
      { status: "scheduled", scheduledFor: { $lte: new Date() } },
    ],
  };
}

module.exports = { visibleStatusOr };
