import { FileText, Folder, HardDrive, Image } from "lucide-react";
import { ExplorerItem } from "../types";

export function getExplorerIcon(type: ExplorerItem["type"]) {
  if (type === "file") {
    return FileText;
  }

  if (type === "image") {
    return Image;
  }

  if (type === "system") {
    return HardDrive;
  }

  return Folder;
}
