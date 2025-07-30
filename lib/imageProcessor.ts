import sharp from 'sharp'

export async function getImageMetadata(input: Buffer | string) {
  try {
    const metadata = await sharp(input).metadata()
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
    }
  } catch (error) {
    console.error('Error getting image metadata:', error)
    return { width: 0, height: 0 }
  }
}