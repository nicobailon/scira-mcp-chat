/**
 * JSON validation and size limiting utilities for the JSON viewer
 */

export interface JsonValidationResult {
  data: any;
  truncated: boolean;
  truncationInfo: {
    arrays: number;
    strings: number;
    objects: number;
    totalTruncated: number;
  };
  error?: string;
}

interface TruncationOptions {
  maxSize: number; // Max size in bytes
  maxArrayLength: number;
  maxStringLength: number;
  maxObjectDepth: number;
  maxObjectKeys: number;
}

const DEFAULT_OPTIONS: TruncationOptions = {
  maxSize: 5 * 1024 * 1024, // 5MB
  maxArrayLength: 1000,
  maxStringLength: 100 * 1024, // 100KB
  maxObjectDepth: 50,
  maxObjectKeys: 1000,
};

class TruncationTracker {
  arrays = 0;
  strings = 0;
  objects = 0;
  get totalTruncated() {
    return this.arrays + this.strings + this.objects;
  }
}

/**
 * Estimates the size of a JSON object in bytes
 */
function estimateSize(obj: any): number {
  try {
    return JSON.stringify(obj).length;
  } catch {
    // If we can't stringify (e.g., circular), estimate based on structure
    return roughSizeEstimate(obj);
  }
}

/**
 * Rough size estimate for objects that can't be stringified
 */
function roughSizeEstimate(obj: any, visited = new WeakSet()): number {
  if (obj === null || obj === undefined) return 4;
  if (typeof obj === 'string') return obj.length;
  if (typeof obj === 'number') return 8;
  if (typeof obj === 'boolean') return 5;
  
  if (visited.has(obj)) return 0; // Circular reference
  visited.add(obj);
  
  let size = 0;
  if (Array.isArray(obj)) {
    size += 2; // []
    for (const item of obj) {
      size += roughSizeEstimate(item, visited) + 1; // comma
    }
  } else if (typeof obj === 'object') {
    size += 2; // {}
    for (const [key, value] of Object.entries(obj)) {
      size += key.length + 3; // "key":
      size += roughSizeEstimate(value, visited) + 1; // comma
    }
  }
  
  return size;
}

/**
 * Creates a deep copy of an object while handling circular references
 */
function deepCloneWithCircularHandling(obj: any, cache = new WeakMap()): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (cache.has(obj)) {
    return '[Circular Reference]';
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags);
  }
  
  cache.set(obj, true);
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepCloneWithCircularHandling(item, cache));
  }
  
  const cloned: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepCloneWithCircularHandling(obj[key], cache);
    }
  }
  
  return cloned;
}

/**
 * Recursively truncates an object to stay within size limits
 */
export function truncateDeepObject(
  obj: any,
  options: TruncationOptions = DEFAULT_OPTIONS,
  tracker = new TruncationTracker(),
  depth = 0,
  currentSize = { value: 0 }
): any {
  // Check if we've exceeded max size
  if (currentSize.value > options.maxSize) {
    return undefined;
  }
  
  // Handle primitives
  if (obj === null || obj === undefined) {
    currentSize.value += 4;
    return obj;
  }
  
  if (typeof obj === 'string') {
    currentSize.value += obj.length;
    if (obj.length > options.maxStringLength) {
      tracker.strings++;
      const truncated = obj.substring(0, options.maxStringLength);
      return `${truncated}... [truncated ${obj.length - options.maxStringLength} characters]`;
    }
    return obj;
  }
  
  if (typeof obj !== 'object') {
    currentSize.value += 8; // Rough estimate for numbers, booleans, etc.
    return obj;
  }
  
  // Check depth
  if (depth > options.maxObjectDepth) {
    tracker.objects++;
    return '[Object too deep]';
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    const result: any[] = [];
    let truncatedCount = 0;
    
    for (let i = 0; i < obj.length && i < options.maxArrayLength; i++) {
      const truncated = truncateDeepObject(obj[i], options, tracker, depth + 1, currentSize);
      if (truncated !== undefined) {
        result.push(truncated);
      } else {
        truncatedCount = obj.length - i;
        break;
      }
    }
    
    if (obj.length > options.maxArrayLength) {
      truncatedCount = obj.length - options.maxArrayLength;
    }
    
    if (truncatedCount > 0) {
      tracker.arrays++;
      result.push(`[...truncated ${truncatedCount} items]`);
    }
    
    return result;
  }
  
  // Handle objects
  const result: any = {};
  const keys = Object.keys(obj);
  let truncatedKeys = 0;
  
  for (let i = 0; i < keys.length && i < options.maxObjectKeys; i++) {
    const key = keys[i];
    const truncated = truncateDeepObject(obj[key], options, tracker, depth + 1, currentSize);
    if (truncated !== undefined) {
      result[key] = truncated;
    } else {
      truncatedKeys = keys.length - i;
      break;
    }
  }
  
  if (keys.length > options.maxObjectKeys) {
    truncatedKeys = keys.length - options.maxObjectKeys;
  }
  
  if (truncatedKeys > 0) {
    tracker.objects++;
    result['...truncated'] = `${truncatedKeys} more keys`;
  }
  
  return result;
}

/**
 * Validates and size-limits JSON data for safe viewing
 */
export function validateJsonForViewer(
  input: any,
  options: Partial<TruncationOptions> = {}
): JsonValidationResult {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const tracker = new TruncationTracker();
  
  try {
    // Parse if string
    let data = input;
    if (typeof input === 'string') {
      try {
        data = JSON.parse(input);
      } catch (e) {
        return {
          data: null,
          truncated: false,
          truncationInfo: {
            arrays: 0,
            strings: 0,
            objects: 0,
            totalTruncated: 0,
          },
          error: 'Invalid JSON string',
        };
      }
    }
    
    // Clone to avoid modifying original and handle circular references
    const clonedData = deepCloneWithCircularHandling(data);
    
    // Check initial size
    const initialSize = estimateSize(clonedData);
    if (initialSize <= mergedOptions.maxSize) {
      return {
        data: clonedData,
        truncated: false,
        truncationInfo: {
          arrays: 0,
          strings: 0,
          objects: 0,
          totalTruncated: 0,
        },
      };
    }
    
    // Truncate if needed
    const truncatedData = truncateDeepObject(clonedData, mergedOptions, tracker);
    
    return {
      data: truncatedData,
      truncated: tracker.totalTruncated > 0,
      truncationInfo: {
        arrays: tracker.arrays,
        strings: tracker.strings,
        objects: tracker.objects,
        totalTruncated: tracker.totalTruncated,
      },
    };
  } catch (error) {
    return {
      data: null,
      truncated: false,
      truncationInfo: {
        arrays: 0,
        strings: 0,
        objects: 0,
        totalTruncated: 0,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Utility to check if a value might contain large JSON
 */
export function mightContainLargeJson(value: string): boolean {
  // Quick heuristics to avoid expensive parsing
  if (value.length < 1000) return false;
  
  // Check for JSON-like patterns
  const jsonPatterns = [
    /^\s*[{\[]/,  // Starts with { or [
    /[}\]]\s*$/,  // Ends with } or ]
    /"[^"]+"\s*:/,  // Has key-value pairs
  ];
  
  return jsonPatterns.some(pattern => pattern.test(value));
}

/**
 * Extract and validate JSON from a string that might contain mixed content
 */
export function extractJsonFromMixedContent(content: string): any[] {
  const results: any[] = [];
  
  // Pattern to find JSON-like structures
  const jsonPattern = /(\{[\s\S]*?\}|\[[\s\S]*?\])/g;
  const matches = content.match(jsonPattern);
  
  if (!matches) return results;
  
  for (const match of matches) {
    try {
      const parsed = JSON.parse(match);
      const validated = validateJsonForViewer(parsed);
      if (!validated.error) {
        results.push(validated);
      }
    } catch {
      // Not valid JSON, skip
    }
  }
  
  return results;
}