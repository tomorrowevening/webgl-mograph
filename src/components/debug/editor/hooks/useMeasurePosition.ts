import { useEffect, useRef } from 'react'

/**
 * Draggability created here:
 * https://github.com/Augani/react-draggable-list
 */

export default function useMeasurePosition(update: (props: any) => void) {
  // We'll use a `ref` to access the DOM element that the `motion.li` produces.
  // This will allow us to measure its height and position, which will be useful to
  // decide when a dragging element should switch places with its siblings.
  const ref = useRef(null)

  // Update the measured position of the item so we can calculate when we should rearrange.
  useEffect(() => {
    update({
      // @ts-ignore
      height: ref.current?.offsetHeight,
      // @ts-ignore
      top: ref.current?.offsetTop,
    })
  })

  return ref
}
