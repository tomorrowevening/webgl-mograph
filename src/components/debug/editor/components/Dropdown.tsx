// Libs
import { useState } from 'react'
// Views
import NavButton from './NavButton'
import Draggable from './Draggable'
import { DropdownItemProps, DropdownOption, DropdownProps } from './types'
// Utils
import { randomID } from '@/utils/dom'

function DropdownItem(props: DropdownItemProps) {
  const { option } = props
  const [selected, setSelected] = useState('')

  let element = null
  switch (option.type) {
    case 'draggable':
      element = (
        <Draggable
          title={option.title}
          options={option.value as Array<string>}
          onDragComplete={(options: string[]) => {
            if (option.onDragComplete !== undefined) option.onDragComplete(options)
          }}
          subdropdown={true}
        />
      )
      break
    case 'dropdown':
      element = (
        <Dropdown
          title={option.title}
          options={option.value as Array<DropdownOption>}
          onSelect={option.onSelect}
          subdropdown={true}
        />
      )
      break
    case 'option':
      element = (
        <button
          onClick={() => {
            if (option.onSelect !== undefined) option.onSelect(option.value)
            // Toggle selectable
            if (option.selectable) {
              if (selected !== option.title) {
                setSelected(option.title)
              } else {
                setSelected('')
              }
            }
          }}
        >
          {option.title}
        </button>
      )
      break
  }

  return (
    <li className={selected === option.title ? 'selected' : ''} key={randomID()}>
      {element}
    </li>
  )
}

export default function Dropdown(props: DropdownProps) {
  const [expanded, setExpanded] = useState(false)

  const list: Array<any> = []
  {
    props.options.map((option: DropdownOption, index: number) => {
      if (props.onSelect !== undefined) {
        option.onSelect = props.onSelect
      }
      list.push(<DropdownItem option={option} key={index} />)
    })
  }

  let ddClassName = 'dropdown'
  if (props.subdropdown) ddClassName += ' subdropdown'

  return (
    <div className={ddClassName} onMouseEnter={() => setExpanded(true)} onMouseLeave={() => setExpanded(false)}>
      <NavButton title={props.title} />
      <ul style={{ visibility: expanded ? 'visible' : 'hidden' }}>{list}</ul>
    </div>
  )
}
