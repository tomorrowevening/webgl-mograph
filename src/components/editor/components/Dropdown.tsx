import { useState } from 'react'
import NavButton from './NavButton'
import { DropdownItemProps, DropdownOption, DropdownProps } from './types'
import { randomID } from '@/utils/dom'

function DropdownItem(props: DropdownItemProps) {
  const { option } = props
  const [selected, setSelected] = useState('')
  return (
    <li className={selected === option.title ? 'selected' : ''} key={randomID()}>
      {option.type === 'option' ? (
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
      ) : (
        <Dropdown
          title={option.title}
          options={option.value as Array<DropdownOption>}
          onSelect={option.onSelect}
          subdropdown={true}
        />
      )}
    </li>
  )
}

export default function Dropdown(props: DropdownProps) {
  const [expanded, setExpanded] = useState(false)

  const list = expanded ? (
    <ul>
      {props.options.map((option: DropdownOption, index: number) => {
        return <DropdownItem option={option} key={index} />
      })}
    </ul>
  ) : null

  const ddClassName = `dropdown${props.subdropdown === true ? ' subdropdown' : ''}`

  return (
    <div className={ddClassName} onMouseEnter={() => setExpanded(true)} onMouseLeave={() => setExpanded(false)}>
      <NavButton title={props.title} />
      {list}
    </div>
  )
}
