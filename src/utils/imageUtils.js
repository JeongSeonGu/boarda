/**
 * utils/imageUtils.js
 * 이미지 리사이즈 유틸 (canvas 기반, 최대 1024×768)
 */

const MAX_W = 1024
const MAX_H = 768
const QUALITY = 0.85

/**
 * File → 리사이즈된 Blob (1024×768 이하)
 */
export async function resizeImage(file, maxW = MAX_W, maxH = MAX_H) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img
      /* 비율 유지 축소 */
      if (width > maxW || height > maxH) {
        const ratio = Math.min(maxW / width, maxH / height)
        width  = Math.round(width  * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width  = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('리사이즈 실패')),
        'image/jpeg',
        QUALITY
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('이미지 로드 실패')) }
    img.src = url
  })
}

/**
 * 이미지 파일 여부 확인
 */
export function isImageFile(file) {
  return file?.type?.startsWith('image/')
}
