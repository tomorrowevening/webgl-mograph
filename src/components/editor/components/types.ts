export type DropdownType = 'option' | 'dropdown'

export interface DropdownOption {
  title: string
  value: any | Array<DropdownOption>
  type: DropdownType
  onSelect?: (value: any) => void
  selectable?: boolean
}

export interface DropdownProps {
  title: string
  options: Array<DropdownOption>
  onSelect?: (value: any) => void
  subdropdown?: boolean
}
