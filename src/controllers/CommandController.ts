import { EventDispatcher } from 'three'

export type Command = {
  name: string
  code: Array<string>
}

/**
 * A controller that listens to keyboard events to dispatch when words or commands have been specified & called
 */
export class CommandController extends EventDispatcher {
  static COMMAND = 'CommandController::command'

  static KONAMI = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
  ]

  commands: Array<Command> = []
  private maxLength = -1
  private input: Array<string> = []
  private node: Node = document

  enable(element?: Node): void {
    if (element !== undefined) this.node = element
    // @ts-ignore
    this.node.addEventListener('keydown', this.onKey, false)
  }

  disable(): void {
    // @ts-ignore
    this.node.removeEventListener('keydown', this.onKey)
  }

  dispose(): void {
    this.disable()
    this.commands = []
  }

  // Add / remove

  add(name: string, keys: Array<string>): void {
    this.commands.push({ name: name, code: keys })
    this.checkMaxLength()
  }

  remove(name: string): void {
    const total = this.commands.length
    for (let i = 0; i < total; i++) {
      const command = this.commands[i]
      if (command.name === name) {
        this.commands.splice(i, 1)
        this.checkMaxLength()
        return
      }
    }
  }

  // Handlers

  private checkMaxLength(): void {
    this.maxLength = -1
    this.commands.forEach((command: Command) => {
      this.maxLength = Math.max(this.maxLength, command.code.length)
    })
  }

  private onKey = (evt: KeyboardEvent) => {
    const newInput = this.input
    newInput.push(evt.key)
    newInput.splice(-this.maxLength - 1, this.input.length - this.maxLength)
    this.input = newInput
    // Search commands
    const total = this.commands.length
    for (let i = 0; i < total; i++) {
      const command = this.commands[i]
      if (newInput.join('').includes(command.code.join(''))) {
        this.dispatchEvent({ type: CommandController.COMMAND, value: command.name })
        this.input = [] // reset for next command
        return
      }
    }
  }
}
