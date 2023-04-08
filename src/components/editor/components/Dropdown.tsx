import { useState } from 'react'
import NavButton from './NavButton'
import { DropdownOption, DropdownProps } from './types'

export default function Dropdown(props: DropdownProps) {
  const [expanded, setExpanded] = useState(false)
  const [selected, setSelected] = useState('')

  const list = expanded ? (
    <ul>
      {props.options.map((option: DropdownOption, index: number) => {
        return (
          <li className={selected === option.title ? 'selected' : ''} key={index}>
            {option.type === 'option' ? (
              <button
                onClick={() => {
                  if (props.onSelect !== undefined) props.onSelect(option.value)
                  // Toggle selectable
                  if (option.selectable) {
                    if (selected !== option.title) {
                      setSelected(option.title)
                    } else {
                      setSelected('')
                    }
                  }
                  setExpanded(false)
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
