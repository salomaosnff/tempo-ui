import { createContext } from '../_shared/createContext'

export interface PopoverContext {
  popoverId: string
  anchorName: string
  initialAnchorName: string
  isOpen: boolean
  open(): void
  close(): void
  toggle(): void
}

export const { provide: providePopover, inject: usePopover } = createContext<PopoverContext>('Popover')
