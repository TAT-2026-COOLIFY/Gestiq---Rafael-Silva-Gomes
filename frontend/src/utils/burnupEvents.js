export const BURNUP_CHANGED_EVENT = "burnup:changed";

export function notifyBurnupChanged(projectId) {
  window.dispatchEvent(
    new CustomEvent(BURNUP_CHANGED_EVENT, {
      detail: { projectId: String(projectId) },
    }),
  );
}
