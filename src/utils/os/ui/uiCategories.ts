export const UI_CATEGORY = {
  space: "space",
  shell: "shell",
  window: "window",
  flyout: "flyout",
  contextMenu: "context-menu",
  panel: "panel",
  background: "background",
  desktopIcon: "desktop-icon",
} as const;

export type UiCategory = (typeof UI_CATEGORY)[keyof typeof UI_CATEGORY];
