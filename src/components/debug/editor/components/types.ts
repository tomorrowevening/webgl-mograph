export type DropdownType = 'option' | 'dropdown' | 'draggable'

export interface DropdownOption {
  title: string
  value: any | Array<DropdownOption>
  type: DropdownType
  // Option
  onSelect?: (value: any) => void
  selectable?: boolean
  // Draggable
  onDragComplete?: (options: Array<string>) => void
}

export interface DropdownProps {
  title: string
  options: Array<DropdownOption>
  onSelect?: (value: any) => void
  subdropdown?: boolean
}

export interface DropdownItemProps {
  option: DropdownOption
  onSelect?: (value: any) => void
  // Draggable
  onDragComplete?: (options: Array<string>) => void
}

// Draggable

export interface DraggableItemProps {
  index: number
  title: string
  updateOrder: any
  updatePosition: (index: number, pos: number) => void
  onDragComplete: () => void
  onDelete: () => void
}

export interface DraggableProps {
  title: string
  options: Array<string>
  onDragComplete: (options: Array<string>) => void
  subdropdown?: boolean
}
