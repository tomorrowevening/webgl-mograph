// Models
import { Events, threeDispatcher } from '@/models/constants'
// Components
import './welcome.scss'

export default function Welcome() {
  return (
    <div className="welcome absoluteCenter">
      <h1>Welcome</h1>
      <p>Description</p>
      <button
        onClick={() => {
          threeDispatcher.dispatchEvent({ type: Events.START_APP })
        }}
      >
        Enter
      </button>
    </div>
  )
}
