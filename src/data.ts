import { ExplorerItem } from "./types";

export const accentColors = ["#2563eb", "#0f766e", "#a16207", "#be123c"];

export const fileSystem: Record<string, ExplorerItem[]> = {
  Desktop: [
    {
      id: "projects",
      name: "Projects",
      type: "folder",
      modified: "Heute, 21:44",
      path: "Desktop/Projects",
    },
    {
      id: "pictures",
      name: "Pictures",
      type: "folder",
      modified: "Gestern, 19:12",
      path: "Desktop/Pictures",
    },
    {
      id: "readme",
      name: "Readme.txt",
      type: "file",
      size: "2 KB",
      modified: "Heute, 22:58",
      preview: "DesktopSim\nA tiny simulated desktop environment.",
    },
    {
      id: "system32",
      name: "System32",
      type: "system",
      modified: "04.06.2026",
      path: "Desktop/System32",
    },
    {
      id: "invoices",
      name: "Invoices",
      type: "folder",
      modified: "01.06.2026",
      path: "Desktop/Invoices",
    },
    {
      id: "notes",
      name: "Design Notes",
      type: "file",
      size: "8 KB",
      modified: "Heute, 23:07",
      preview: "Frontend pass: compact controls, usable windows, live settings.",
    },
  ],
  "Desktop/Projects": [
    {
      id: "desktop-sim",
      name: "DesktopSim",
      type: "folder",
      modified: "Heute, 23:31",
      path: "Desktop/Projects/DesktopSim",
    },
    {
      id: "archive",
      name: "Archive",
      type: "folder",
      modified: "30.05.2026",
      path: "Desktop/Projects/Archive",
    },
  ],
  "Desktop/Projects/DesktopSim": [
    {
      id: "src",
      name: "src",
      type: "folder",
      modified: "Heute, 23:31",
      path: "Desktop/Projects/DesktopSim/src",
    },
    {
      id: "package",
      name: "package.json",
      type: "file",
      size: "590 B",
      modified: "Heute, 22:36",
      preview: '{ "name": "desktop-sim", "type": "module" }',
    },
    {
      id: "readme-project",
      name: "README.md",
      type: "file",
      size: "12 B",
      modified: "Heute, 22:58",
      preview: "# DesktopSim",
    },
  ],
  "Desktop/Projects/DesktopSim/src": [
    {
      id: "app",
      name: "App.tsx",
      type: "file",
      size: "18 KB",
      modified: "Gerade eben",
      preview: "export function App() { ... }",
    },
    {
      id: "styles",
      name: "styles.css",
      type: "file",
      size: "9 KB",
      modified: "Gerade eben",
      preview: ".desktop { position: relative; }",
    },
  ],
  "Desktop/Pictures": [
    {
      id: "wallpaper",
      name: "wallpaper.png",
      type: "image",
      size: "1.4 MB",
      modified: "Gestern, 19:12",
      preview: "Generated desktop wallpaper preview",
    },
    {
      id: "mockup",
      name: "window-mockup.jpg",
      type: "image",
      size: "842 KB",
      modified: "02.06.2026",
      preview: "Window layout reference",
    },
  ],
  "Desktop/System32": [
    {
      id: "shell",
      name: "shell.dll",
      type: "system",
      size: "96 KB",
      modified: "04.06.2026",
      preview: "Protected system component",
    },
    {
      id: "drivers",
      name: "drivers",
      type: "folder",
      modified: "04.06.2026",
      path: "Desktop/System32/drivers",
    },
  ],
  "Desktop/System32/drivers": [
    {
      id: "keyboard",
      name: "keyboard.sys",
      type: "system",
      size: "24 KB",
      modified: "04.06.2026",
      preview: "Keyboard driver placeholder",
    },
  ],
  "Desktop/Invoices": [
    {
      id: "june",
      name: "June.pdf",
      type: "file",
      size: "112 KB",
      modified: "01.06.2026",
      preview: "Invoice summary for June.",
    },
  ],
  "Desktop/Projects/Archive": [],
};
