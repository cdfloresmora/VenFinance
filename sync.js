// sync.js — No-op: Firestore handles sync automatically
// Kept for backward compatibility with any references
window.VF = window.VF || {};
VF.Sync = (() => {
  async function processPending() { /* no-op: Firestore auto-syncs */ }
  async function pullFromSheets() { /* no-op: Firestore auto-syncs */ }
  return { processPending, pullFromSheets };
})();
