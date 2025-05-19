/**
 * Parse text into a JSON object with error handling
 */
export function parseJSON<T>(text: string): {
  data: T | null;
  error: string | null;
} {
  try {
    // Try to extract JSON from text
    let jsonText = text;

    // Check for code blocks
    const jsonMatch =
      text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/) ||
      text.match(/```([\s\S]*?)```/);

    if (jsonMatch && jsonMatch[1]) {
      jsonText = jsonMatch[1];
    }

    // Parse JSON
    const data = JSON.parse(jsonText) as T;
    return { data, error: null };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error parsing JSON';
    return { data: null, error: errorMessage };
  }
}

/**
 * Estimate token count for a string
 */
export function estimateTokenCount(text: string): number {
  // A rough estimate based on tokenization rules (1 token ≈ 4 characters)
  return Math.ceil(text.length / 4);
}

/**
 * Format as number with units
 */
export function formatWithUnits(
  value: number,
  unit: string,
  precision = 2
): string {
  return `${value.toFixed(precision)} ${unit}`;
}

/**
 * Convert between unit systems
 */
export function convertUnits(
  value: number,
  fromUnit: 'mm' | 'cm' | 'm' | 'in' | 'ft',
  toUnit: 'mm' | 'cm' | 'm' | 'in' | 'ft'
): number {
  // Convert to mm first (common intermediate unit)
  let inMm: number;

  switch (fromUnit) {
    case 'mm':
      inMm = value;
      break;
    case 'cm':
      inMm = value * 10;
      break;
    case 'm':
      inMm = value * 1000;
      break;
    case 'in':
      inMm = value * 25.4;
      break;
    case 'ft':
      inMm = value * 304.8;
      break;
    default:
      throw new Error(`Unsupported unit: ${fromUnit}`);
  }

  // Convert from mm to target unit
  switch (toUnit) {
    case 'mm':
      return inMm;
    case 'cm':
      return inMm / 10;
    case 'm':
      return inMm / 1000;
    case 'in':
      return inMm / 25.4;
    case 'ft':
      return inMm / 304.8;
    default:
      throw new Error(`Unsupported unit: ${toUnit}`);
  }
}

/**
 * Truncate a string to a maximum length
 */
export function truncateString(
  str: string,
  maxLength: number,
  suffix = '...'
): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Sanitize a string for safe use in filenames
 */
export function sanitizeFilename(filename: string): string {
  // Replace invalid characters with underscores
  return filename.replace(/[/\\?%*:|"<>]/g, '_');
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Generate a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

/**
 * Format a date as a string
 */
export function formatDate(
  date: Date,
  format: 'short' | 'medium' | 'long' = 'medium'
): string {
  switch (format) {
    case 'short':
      return date.toLocaleDateString();
    case 'medium':
      return date.toLocaleString();
    case 'long':
      return date.toLocaleString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    default:
      return date.toLocaleString();
  }
}

/**
 * Debounce a function to limit how often it can run
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle a function to limit how often it can run
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function (...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Detect the current browser
 */
export function detectBrowser(): string {
  if (typeof window === 'undefined') {
    return 'unknown';
  }

  const userAgent = window.navigator.userAgent;

  if (userAgent.indexOf('Chrome') > -1) {
    return 'Chrome';
  } else if (userAgent.indexOf('Firefox') > -1) {
    return 'Firefox';
  } else if (userAgent.indexOf('Safari') > -1) {
    return 'Safari';
  } else if (userAgent.indexOf('Edge') > -1 || userAgent.indexOf('Edg') > -1) {
    return 'Edge';
  } else if (
    userAgent.indexOf('MSIE') > -1 ||
    userAgent.indexOf('Trident') > -1
  ) {
    return 'Internet Explorer';
  } else {
    return 'unknown';
  }
}

/**
 * Generate a unique ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
}
