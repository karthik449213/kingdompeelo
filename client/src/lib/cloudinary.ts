/**
 * Utility functions for optimizing Cloudinary image URLs
 * PERFORMANCE: Reduces image size by 50-80% using transformations
 */

/**
 * Optimize Cloudinary URL with automatic quality and format selection
 * @param url - Original Cloudinary URL
 * @param width - Optional width in pixels
 * @param height - Optional height in pixels
 * @returns Optimized URL with transformations
 */
export function optimizeImageUrl(url: string, width?: number, height?: number): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  // Extract base URL and public ID
  const parts = url.split('/upload/');
  if (parts.length !== 2) {
    return url;
  }

  const baseUrl = parts[0];
  const publicId = parts[1];

  // Build transformation parameters
  const transformations: string[] = [];

  // Add width/height if specified
  if (width && height) {
    transformations.push(`w_${width},h_${height},c_fill`);
  } else if (width) {
    transformations.push(`w_${width}`);
  } else if (height) {
    transformations.push(`h_${height}`);
  }

  // Add quality and format optimizations
  transformations.push('q_auto'); // Auto quality based on device
  transformations.push('f_auto'); // Auto format (WebP for modern browsers)

  // Construct optimized URL
  const transformString = transformations.join(',');
  return `${baseUrl}/upload/${transformString}/${publicId}`;
}

/**
 * Optimize image for ItemCard (product thumbnail)
 */
export function optimizeItemImage(url: string): string {
  return optimizeImageUrl(url, 300, 300);
}

/**
 * Optimize image for Category card
 */
export function optimizeCategoryImage(url: string): string {
  return optimizeImageUrl(url, 400, 300);
}

/**
 * Optimize image for Home page Hero
 */
export function optimizeHeroImage(url: string): string {
  return optimizeImageUrl(url, 1200, 600);
}
