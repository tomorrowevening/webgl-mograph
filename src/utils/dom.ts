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
