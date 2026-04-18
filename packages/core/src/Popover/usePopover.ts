import { createContext } from "../_shared/createContext";

export interface PopoverContext {
  contentId: string;
  initialAnchorName: string;
  currentAnchor: string;
  isOpen: boolean;
  customAnchor(anchorName?: string | null): void;
  open(): void;
  close(): void;
  toggle(): void;
}

export const { provide: providePopover, inject: usePopover } =
  createContext<PopoverContext>("Popover");
