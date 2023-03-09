export function copyToClipboard(data: any): string {
  const content = JSON.stringify(data)
  navigator.clipboard.writeText(content)
  return content
}
