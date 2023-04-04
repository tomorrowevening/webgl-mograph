export function copyToClipboard(data: any): string {
  const content = JSON.stringify(data)
  navigator.clipboard.writeText(content)
  return content
}

export function delay(seconds: number): Promise<void> {
  return new Promise((resolve) => {
    let timer: any = setTimeout(() => {
      clearTimeout(timer)
      timer = undefined
      resolve()
    }, seconds * 1000)
  })
}

export function fileName(path: string): string {
  const slash = path.lastIndexOf('/') + 1
  const period = path.lastIndexOf('.')
  return path.substring(slash, period)
}
