// frontend/src/lib/utils.ts

/**
 * Utility functions for the ChaiYetu frontend application
 */

/**
 * Format a date string to a readable format
 * @param dateString - ISO date string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-KE', options).format(date);
}

/**
 * Format a date with time
 * @param dateString - ISO date string
 * @returns Formatted date with time
 */
export function formatDateTime(dateString: string): string {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format currency amount (KES)
 * @param amount - Amount in number
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  if (amount === null || amount === undefined) return 'KES 0';
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a standard number with commas
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-KE').format(num);
}

/**
 * Format weight with units
 * @param weight - Weight in kg
 * @returns Formatted weight string
 */
export function formatWeight(weight: number): string {
  if (weight === null || weight === undefined) return '0 kg';
  if (weight >= 1000) {
    return `${(weight / 1000).toFixed(1)} t`; // tonnes
  }
  return `${weight.toFixed(1)} kg`;
}

/**
 * Get quality label from quality value
 * @param quality - Quality string (grade1, grade2, grade3)
 * @returns Human-readable quality label
 */
export function getQualityLabel(quality: string): string {
  const qualityMap: Record<string, string> = {
    grade1: 'Grade 1',
    grade2: 'Grade 2',
    grade3: 'Grade 3',
  };
  return qualityMap[quality] || quality;
}

/**
 * Get quality color class
 * @param quality - Quality string
 * @returns Tailwind CSS color classes
 */
export function getQualityColor(quality: string): string {
  const colorMap: Record<string, string> = {
    grade1: 'bg-green-100 text-green-800 border-green-200',
    grade2: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    grade3: 'bg-orange-100 text-orange-800 border-orange-200',
  };
  return colorMap[quality] || 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Get status label from status value
 * @param status - Status string
 * @returns Human-readable status label
 */
export function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    verified: 'Verified',
    rejected: 'Rejected',
    paid: 'Paid',
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
    on_leave: 'On Leave',
  };
  return statusMap[status] || status;
}

/**
 * Get status color class
 * @param status - Status string
 * @returns Tailwind CSS color classes
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    paid: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800',
    on_leave: 'bg-purple-100 text-purple-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get role label from role value
 * @param role - Role string
 * @returns Human-readable role label
 */
export function getRoleLabel(role: string): string {
  const roleMap: Record<string, string> = {
    farmer: 'Farmer',
    collector: 'Collector',
    admin: 'Administrator',
    factory_manager: 'Factory Manager',
  };
  return roleMap[role] || role;
}

/**
 * Format phone number for display
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Kenyan phone numbers
  if (cleaned.startsWith('254')) {
    return `+${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }
  
  return phone;
}

/**
 * Generate a farmer ID display string
 * @param farmerId - Farmer ID string
 * @returns Formatted farmer ID
 */
export function formatFarmerId(farmerId: string): string {
  if (!farmerId) return '';
  return `F${farmerId.padStart(6, '0')}`;
}

/**
 * Generate a collector ID display string
 * @param collectorId - Collector ID string
 * @returns Formatted collector ID
 */
export function formatCollectorId(collectorId: string): string {
  if (!collectorId) return '';
  return `C${collectorId.padStart(6, '0')}`;
}

/**
 * Calculate total amount from weight and price
 * @param weight - Weight in kg
 * @param pricePerKg - Price per kg
 * @returns Total amount
 */
export function calculateTotalAmount(weight: number, pricePerKg: number): number {
  return weight * pricePerKg;
}

/**
 * Get price per kg based on quality
 * @param quality - Tea quality
 * @returns Price per kg
 */
export function getPricePerKg(quality: string): number {
  const priceMap: Record<string, number> = {
    grade1: 25, // KES per kg
    grade2: 20,
    grade3: 15,
  };
  return priceMap[quality] || 0;
}

/**
 * Debounce function to limit how often a function is called
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function to limit function execution rate
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Generate a random color for avatars
 * @param seed - Seed for consistent color generation
 * @returns Tailwind CSS background color class
 */
export function getAvatarColor(seed: string): string {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  
  // Simple hash function for consistent color assignment
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Get initials from name
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Initials string
 */
export function getInitials(firstName: string, lastName: string): string {
  const firstInitial = firstName ? firstName[0].toUpperCase() : '';
  const lastInitial = lastName ? lastName[0].toUpperCase() : '';
  return `${firstInitial}${lastInitial}`;
}

/**
 * Parse query parameters from URL
 * @param searchParams - URLSearchParams object
 * @returns Parsed query parameters object
 */
export function parseQueryParams(searchParams: URLSearchParams): Record<string, string> {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

/**
 * Convert object to query string
 * @param params - Object with query parameters
 * @returns Query string
 */
export function toQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
}

/**
 * Generate pagination range
 * @param currentPage - Current page number
 * @param totalPages - Total number of pages
 * @param delta - Number of pages to show around current page
 * @returns Array of page numbers to display
 */
export function generatePaginationRange(
  currentPage: number,
  totalPages: number,
  delta: number = 2
): (number | string)[] {
  const range = [];
  const rangeWithDots = [];
  
  for (
    let i = Math.max(2, currentPage - delta);
    i <= Math.min(totalPages - 1, currentPage + delta);
    i++
  ) {
    range.push(i);
  }
  
  if (currentPage - delta > 2) {
    rangeWithDots.push(1, '...');
  } else {
    rangeWithDots.push(1);
  }
  
  rangeWithDots.push(...range);
  
  if (currentPage + delta < totalPages - 1) {
    rangeWithDots.push('...', totalPages);
  } else if (totalPages > 1) {
    rangeWithDots.push(totalPages);
  }
  
  return rangeWithDots;
}

/**
 * Get file extension from filename
 * @param filename - File name
 * @returns File extension
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Get file size in human readable format
 * @param bytes - File size in bytes
 * @returns Human readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validate email format
 * @param email - Email address
 * @returns True if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (Kenyan)
 * @param phone - Phone number
 * @returns True if phone number is valid
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(?:254|\+254|0)?[7]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Calculate time ago from date
 * @param dateString - ISO date string
 * @returns Human readable time ago
 */
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? '1 year ago' : `${interval} years ago`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? '1 month ago' : `${interval} months ago`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? '1 day ago' : `${interval} days ago`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
  }
  
  return seconds < 10 ? 'just now' : `${seconds} seconds ago`;
}

/**
 * Generate a unique ID
 * @param prefix - Optional prefix for the ID
 * @returns Unique ID string
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}${timestamp}${random}`;
}

/**
 * Deep clone an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge two objects deeply
 * @param target - Target object
 * @param source - Source object
 * @returns Merged object
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key as keyof T] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

/**
 * Check if value is an object
 * @param item - Value to check
 * @returns True if value is an object
 */
export function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Group array of objects by key
 * @param array - Array to group
 * @param key - Key to group by
 * @returns Grouped object
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array of objects by key
 * @param array - Array to sort
 * @param key - Key to sort by
 * @param order - Sort order (asc or desc)
 * @returns Sorted array
 */
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    let aValue = a[key];
    let bValue = b[key];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Calculate statistics for an array of numbers
 * @param numbers - Array of numbers
 * @returns Statistics object
 */
export function calculateStats(numbers: number[]): {
  sum: number;
  average: number;
  min: number;
  max: number;
  count: number;
} {
  if (!numbers || numbers.length === 0) {
    return { sum: 0, average: 0, min: 0, max: 0, count: 0 };
  }
  
  const sum = numbers.reduce((a, b) => a + b, 0);
  const average = sum / numbers.length;
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  
  return { sum, average, min, max, count: numbers.length };
}

/**
 * Class name utility for conditional classes
 * @param classes - Array of class names or objects
 * @returns Combined class string
 */
export function cn(...classes: (string | boolean | undefined | null | Record<string, boolean>)[]): string {
  return classes
    .flatMap(cls => {
      if (!cls) return [];
      if (typeof cls === 'string') return [cls];
      if (typeof cls === 'object') {
        return Object.entries(cls)
          .filter(([, value]) => value)
          .map(([key]) => key);
      }
      return [];
    })
    .join(' ');
}

/**
 * Sleep function for async operations
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after ms
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get current season based on date
 * @param date - Date to check (defaults to now)
 * @returns Season string
 */
export function getCurrentSeason(date: Date = new Date()): string {
  const month = date.getMonth() + 1; // January = 1
  
  // Kenya seasons
  if (month >= 3 && month <= 5) return 'Long Rains';
  if (month >= 6 && month <= 8) return 'Cold Season';
  if (month >= 9 && month <= 11) return 'Short Rains';
  return 'Dry Season';
}

/**
 * Get prediction confidence color
 * @param confidence - Confidence score (0-1)
 * @returns Tailwind CSS color class
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-green-600';
  if (confidence >= 0.6) return 'text-yellow-600';
  if (confidence >= 0.4) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Get prediction confidence label
 * @param confidence - Confidence score (0-1)
 * @returns Confidence label
 */
export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.6) return 'Medium';
  if (confidence >= 0.4) return 'Low';
  return 'Very Low';
}

/**
 * Format coordinates for display
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Formatted coordinates string
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latDirection = lat >= 0 ? 'N' : 'S';
  const lngDirection = lng >= 0 ? 'E' : 'W';
  
  const latAbs = Math.abs(lat).toFixed(6);
  const lngAbs = Math.abs(lng).toFixed(6);
  
  return `${latAbs}°${latDirection}, ${lngAbs}°${lngDirection}`;
}

/**
 * Calculate distance between two coordinates in kilometers
 * @param lat1 - Latitude of point 1
 * @param lng1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lng2 - Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 * @param degree - Degree value
 * @returns Radian value
 */
function toRad(degree: number): number {
  return degree * (Math.PI / 180);
}

/**
 * Export all utilities
 */
export default {
  formatDate,
  formatDateTime,
  formatCurrency,
  formatNumber,
  formatWeight,
  getQualityLabel,
  getQualityColor,
  getStatusLabel,
  getStatusColor,
  getRoleLabel,
  formatPhoneNumber,
  formatFarmerId,
  formatCollectorId,
  calculateTotalAmount,
  getPricePerKg,
  debounce,
  throttle,
  truncateText,
  getAvatarColor,
  getInitials,
  parseQueryParams,
  toQueryString,
  generatePaginationRange,
  getFileExtension,
  formatFileSize,
  isValidEmail,
  isValidPhone,
  timeAgo,
  generateId,
  deepClone,
  deepMerge,
  isObject,
  groupBy,
  sortBy,
  calculateStats,
  cn,
  sleep,
  getCurrentSeason,
  getConfidenceColor,
  getConfidenceLabel,
  formatCoordinates,
  calculateDistance,
};