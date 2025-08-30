/**
 * CDN and asset optimization utilities
 */

const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || ''

/**
 * Get optimized image URL with CDN support
 */
export function getImageUrl(src: string, options?: {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpg' | 'png'
}): string {
  if (!src) return ''
  
  // If it's already a full URL, return as-is
  if (src.startsWith('http')) return src
  
  // Remove leading slash for consistency
  const cleanSrc = src.startsWith('/') ? src.slice(1) : src
  
  if (CDN_URL) {
    let url = `${CDN_URL}/${cleanSrc}`
    
    // Add optimization parameters if provided
    if (options) {
      const params = new URLSearchParams()
      
      if (options.width) params.set('w', options.width.toString())
      if (options.height) params.set('h', options.height.toString())
      if (options.quality) params.set('q', options.quality.toString())
      if (options.format) params.set('f', options.format)
      
      const queryString = params.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }
    
    return url
  }
  
  return `/${cleanSrc}`
}

/**
 * Get optimized static asset URL
 */
export function getAssetUrl(path: string): string {
  if (!path) return ''
  
  // If it's already a full URL, return as-is
  if (path.startsWith('http')) return path
  
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  if (CDN_URL) {
    return `${CDN_URL}/${cleanPath}`
  }
  
  return `/${cleanPath}`
}

/**
 * Preload critical resources
 */
export function preloadResource(href: string, as: string, type?: string): void {
  if (typeof window === 'undefined') return
  
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  
  if (type) {
    link.type = type
  }
  
  document.head.appendChild(link)
}

/**
 * Prefetch resources for better performance
 */
export function prefetchResource(href: string): void {
  if (typeof window === 'undefined') return
  
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  
  document.head.appendChild(link)
}

/**
 * Generate responsive image srcSet
 */
export function generateSrcSet(src: string, sizes: number[]): string {
  return sizes
    .map(size => `${getImageUrl(src, { width: size })} ${size}w`)
    .join(', ')
}

/**
 * Cache busting for static assets
 */
export function getCacheBustedUrl(path: string): string {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || Date.now().toString()
  const url = getAssetUrl(path)
  
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}v=${version}`
}
