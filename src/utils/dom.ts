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

export function randomID(): string {
  return Math.round(Math.random() * 1000000).toString()
}

export type FileUploadResponse = {
  file: File
  fileReader: FileReader
}
export function uploadFile(): Promise<FileUploadResponse> {
  return new Promise((resolve, reject) => {
    const fileInput = document.createElement('input')
    fileInput.style.display = 'none'
    fileInput.type = 'file'
    fileInput.name = 'file'
    fileInput.onchange = () => {
      if (fileInput.files !== null) {
        const fileReader = new FileReader()
        fileReader.onload = () => {
          const file = fileInput.files![0] as File
          resolve({ file, fileReader })
        }
        fileReader.onerror = () => reject()
        fileReader.onabort = () => reject()
        fileReader.readAsText(fileInput.files[0])
      }
    }
    document.body.appendChild(fileInput)
    fileInput.click()
    document.body.removeChild(fileInput)
  })
}

export function mapToObj(map: Map<string, any>): any {
  return JSON.parse(JSON.stringify(Object.fromEntries(map)))
}
