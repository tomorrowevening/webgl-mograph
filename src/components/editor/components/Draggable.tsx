// Libs
import { useState } from 'react'
import { motion } from 'framer-motion'
// Views
import NavButton from '../components/NavButton'
// Utils
import useMeasurePosition from '../hooks/useMeasurePosition'
import { usePositionReorder } from '../hooks/usePositionReorder'

const DragIcon = (
  <svg width="14" height="14" fill="#666666" stroke="none">
    <path d="M10.43,4H3.57C3.26,4,3,4.22,3,4.5v1C3,5.78,3.26,6,3.57,6h6.86C10.74,6,11,5.78,11,5.5v-1
C11,4.22,10.74,4,10.43,4z M10.43,8H3.57C3.26,8,3,8.22,3,8.5v1C3,9.78,3.26,10,3.57,10h6.86C10.74,10,11,9.78,11,9.5v-1
C11,8.22,10.74,8,10.43,8z"/>
  </svg>
)

export type DraggableItemProps = {
  index: number
  title: string
  updateOrder: any
  updatePosition: (index: number, pos: number) => void
  onDragComplete: () => void
}

export function DraggableItem(props: DraggableItemProps) {
  const [dragging, setDragging] = useState(false)
  const itemRef = useMeasurePosition((pos) => props.updatePosition(props.index, pos))

  return (
    <li>
      <motion.button
        style={{
          zIndex: dragging ? 2 : 1,
        }}
        dragConstraints={{
          top: 0,
          bottom: 0,
        }}
        dragElastic={1}
        layout
        ref={itemRef}
        onDragStart={() => setDragging(true)}
        onDragEnd={() => {
          setDragging(false)
          props.onDragComplete()
        }}
        animate={{
          scale: dragging ? 1.05 : 1,
        }}
        onViewportBoxUpdate={(_, delta) => {
          dragging && props.updateOrder(props.index, delta.y.translate)
        }}
        drag="y"
      >
        {DragIcon}
        <span>{props.title}</span>
      </motion.button>
    </li>
  )
}

export type DraggableProps = {
  title: string
  list: Array<string>
  onDragComplete: (list: Array<string>) => void
  subdropdown?: boolean
}

export default function Draggable(props: DraggableProps) {
  const [expanded, setExpanded] = useState(false)
  const [updatedList, updatePosition, updateOrder] = usePositionReorder(props.list)

  const onDragComplete = () => {
    props.onDragComplete(updatedList)
  }

  const list: Array<any> = []
  {updatedList.map((name: string, index: number) => (
    list.push(
      <DraggableItem
        key={name}
        index={index}
        title={name}
        updateOrder={updateOrder}
        updatePosition={updatePosition}
        onDragComplete={onDragComplete}
      />
    )
  ))}

  let ddClassName = 'dropdown draggable'
  if (props.subdropdown) ddClassName += ' subdropdown'

  return (
    <div className={ddClassName} onMouseEnter={() => setExpanded(true)} onMouseLeave={() => setExpanded(false)}>
      <NavButton title={props.title} />
      <ul style={{ visibility: expanded ? 'visible' : 'hidden' }}>{list}</ul>
    </div>
  )
}
